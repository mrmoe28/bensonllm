import { useState, useEffect, useRef } from 'react';
import { getModels, streamChat, checkOllamaStatus, type Message, type Model } from '../lib/ollama-client';
import { addChatToHistory } from '../lib/storage';
import { addToStreamingBuffer, finishStreaming, resetStreamingBuffer, loadAudioSettings } from '../lib/audio';
import type { ViewType, ChatHistory, LiveArtifact } from '../types/app';
import MessageList from './MessageList';
import InputBox from './InputBox';
import Sidebar from './Sidebar';
import WelcomeScreen from './WelcomeScreen';
import ProjectsView from './ProjectsView';
import ArtifactsView from './ArtifactsView';
import CodeView from './CodeView';
import SettingsView from './SettingsView';
import ProfileView from './ProfileView';
import ArtifactPreviewPanel from './ArtifactPreviewPanel';
import { createSystemPromptWithContext } from '../lib/context-builder';
import { createMemoryFromChat } from '../lib/memory';
import { loadIntegrationSettings, buildCapabilitiesPrompt } from '../lib/integrations';
import { buildConversationState, buildConversationalPrompt, DEFAULT_PERSONA } from '../lib/persona';
import { getRelevantSkills } from '../lib/storage';
import { parseToolCalls, executeToolCalls, hasToolCalls } from '../lib/tool-calling';
import { exportChatAsJSON, exportChatAsMarkdown, exportChatAsText } from '../lib/export';
import { extractLatestArtifact } from '../lib/artifact-detector';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOllamaRunning, setIsOllamaRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('chats');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [useKnowledgeBase] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentArtifact, setCurrentArtifact] = useState<LiveArtifact | null>(null);
  const [panelWidth, setPanelWidth] = useState(40); // Percentage - chat takes 40%, preview takes 60%
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check Ollama status and load models on mount
  useEffect(() => {
    async function init() {
      // Load Ollama models
      const status = await checkOllamaStatus();
      setIsOllamaRunning(status);

      if (status) {
        try {
          const ollamaModels = await getModels();
          setModels(ollamaModels);

          // Select default model - prefer qwen2.5:1.5b
          if (ollamaModels.length > 0) {
            const qwen1_5b = ollamaModels.find(m =>
              m.name.toLowerCase() === 'qwen2.5:1.5b'
            );
            const anyQwen = ollamaModels.find(m =>
              m.name.toLowerCase().includes('qwen') ||
              m.name.toLowerCase().includes('quinn')
            );

            if (qwen1_5b) {
              setSelectedModel(qwen1_5b.name);
            } else if (anyQwen) {
              setSelectedModel(anyQwen.name);
            } else {
              setSelectedModel(ollamaModels[0].name);
            }
          }
        } catch (err) {
          console.error('Failed to load Ollama models:', err);
          setError('Failed to load models from Ollama.');
        }
      } else {
        setError('Ollama is not running. Please start Ollama on http://localhost:11434');
      }
    }

    init();
  }, []);

  // Handle panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 30% and 70%
      if (newWidth >= 30 && newWidth <= 70) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleSendMessage = async (content: string, images?: string[]) => {
    if (!content.trim() || !selectedModel) return;

    const userMessage: Message = {
      role: 'user',
      content,
      images: images
    };

    // Create a new chat ID if this is the first message
    if (!currentChatId) {
      setCurrentChatId(Date.now().toString());
    }

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const assistantMessage: Message = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      // Build conversational state and intelligent prompt
      const integrationSettings = loadIntegrationSettings();
      const capabilitiesInfo = buildCapabilitiesPrompt(integrationSettings);

      // Analyze conversation for intelligence
      const conversationState = buildConversationState([...messages, userMessage]);
      const conversationalPrompt = buildConversationalPrompt(conversationState, DEFAULT_PERSONA);

      // Get relevant skills knowledge
      const relevantSkills = getRelevantSkills(content, 2);
      const skillsContext = relevantSkills.length > 0
        ? `\n\n### Skills Knowledge\n${relevantSkills.map(s => `**${s.name}**: ${s.content.substring(0, 300)}`).join('\n\n')}`
        : '';

      const basePrompt = `${conversationalPrompt}

## Core Expertise
You excel at:
- Writing clean, production-ready code (React, Node.js, TypeScript, Python, etc.)
- Building full-stack applications from scratch
- Debugging and fixing code issues
- Explaining complex technical concepts clearly
- Following best practices and modern patterns

${capabilitiesInfo}${skillsContext}`;

      const systemPrompt = useKnowledgeBase
        ? createSystemPromptWithContext(basePrompt, content, {
            includeKnowledge: true,
            includeMemory: true,
            maxKnowledgeDocs: 3,
            maxMemories: 2,
            maxContextLength: 4000,
          })
        : { role: 'system' as const, content: basePrompt };

      const messagesWithSystem = messages.length === 0
        ? [systemPrompt, userMessage]
        : [...messages, userMessage];

      // Reset streaming buffer and get audio settings
      const audioSettings = loadAudioSettings();
      resetStreamingBuffer();

      // Stream the response from Ollama
      let fullResponse = '';
      for await (const chunk of streamChat(selectedModel, messagesWithSystem)) {
        fullResponse += chunk;

        // Add chunk to TTS streaming buffer
        addToStreamingBuffer(chunk, audioSettings);

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + chunk
            };
          }
          return newMessages;
        });

        // Check for artifacts in real-time during streaming
        const artifact = extractLatestArtifact(fullResponse);
        if (artifact) {
          setCurrentArtifact(artifact);
        }
      }

      // Finish streaming and speak any remaining text
      finishStreaming(audioSettings);

      // Check for tool calls in the response
      if (hasToolCalls(fullResponse)) {
        const toolCalls = parseToolCalls(fullResponse);

        // Show that we're executing tools
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + '\n\n_Executing tools..._'
            };
          }
          return newMessages;
        });

        // Execute tool calls
        const toolResults = await executeToolCalls(toolCalls);

        // Build follow-up prompt with tool results
        const toolResultsText = toolResults.map(result =>
          `\n\n**Tool Result for "${result.toolCall.query}":**\n${result.result}`
        ).join('\n');

        const followUpMessage: Message = {
          role: 'user',
          content: `Here are the results from the tools you requested:${toolResultsText}\n\nPlease use these results to answer my original question.`
        };

        // Add tool results as a system message
        setMessages(prev => [...prev, followUpMessage]);

        // Get follow-up response from LLM
        const followUpAssistant: Message = { role: 'assistant', content: '' };
        setMessages(prev => [...prev, followUpAssistant]);

        const followUpMessages = [...messages, userMessage, { role: 'assistant' as const, content: fullResponse }, followUpMessage];

        // Reset streaming buffer for follow-up response
        resetStreamingBuffer();

        let followUpResponse = '';
        for await (const chunk of streamChat(selectedModel, [...messagesWithSystem.slice(0, -1), ...followUpMessages])) {
          followUpResponse += chunk;

          // Add chunk to TTS streaming buffer
          addToStreamingBuffer(chunk, audioSettings);

          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              newMessages[newMessages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + chunk
              };
            }
            return newMessages;
          });

          // Check for artifacts in follow-up response
          const followUpArtifact = extractLatestArtifact(followUpResponse);
          if (followUpArtifact) {
            setCurrentArtifact(followUpArtifact);
          }
        }

        // Finish streaming for follow-up response
        finishStreaming(audioSettings);
      }
    } catch (err) {
      setError('Failed to get response from Ollama. Check console for details.');
      console.error('Chat error:', err);
      // Remove the empty assistant message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    // Save current chat before clearing if it has messages
    if (messages.length > 0) {
      saveCurrentChat();
    }
    setMessages([]);
    setError(null);
    setCurrentChatId(null);
    setCurrentProjectId(null);
    setCurrentFolderId(null);
    setCurrentView('chats');
    setCurrentArtifact(null);
  };

  const handleCloseArtifact = () => {
    setCurrentArtifact(null);
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const saveCurrentChat = async () => {
    if (messages.length === 0) return;

    const chatTitle = messages[0]?.content.slice(0, 50) || 'New Chat';
    const chatId = currentChatId || Date.now().toString();

    const chat: ChatHistory = {
      id: chatId,
      title: chatTitle,
      timestamp: Date.now(),
      messages: messages,
      projectId: currentProjectId || undefined,
      folderId: currentFolderId || undefined,
    };

    addChatToHistory(chat);

    // Create memory from this conversation
    if (messages.length >= 2) {
      await createMemoryFromChat(chat);
    }
  };

  const handleProjectCreated = (projectId: string) => {
    // Save current chat if it exists
    if (messages.length > 0) {
      saveCurrentChat();
    }

    // Clear current chat and start a new one for the project
    setMessages([]);
    setCurrentChatId(Date.now().toString());
    setCurrentProjectId(projectId);
    setCurrentFolderId(null);
    setCurrentView('chats');
    setError(null);
  };

  const handleLoadChat = (chat: ChatHistory) => {
    // Save current chat if it exists and has messages
    if (messages.length > 0 && currentChatId !== chat.id) {
      saveCurrentChat();
    }

    setMessages(chat.messages as Message[]);
    setCurrentChatId(chat.id);
    setCurrentProjectId(chat.projectId || null);
    setCurrentFolderId(chat.folderId || null);
    setCurrentView('chats');
  };

  const handleViewChange = (view: ViewType) => {
    // Save chat before switching views
    if (currentView === 'chats' && messages.length > 0) {
      saveCurrentChat();
    }
    setCurrentView(view);
  };

  const handleExportChat = (format: 'json' | 'markdown' | 'text') => {
    if (messages.length === 0) {
      alert('No messages to export');
      return;
    }

    const chat: ChatHistory = {
      id: currentChatId || Date.now().toString(),
      title: messages[0]?.content.slice(0, 50) || 'Exported Chat',
      timestamp: Date.now(),
      messages: messages,
      projectId: currentProjectId || undefined,
      folderId: currentFolderId || undefined,
    };

    switch (format) {
      case 'json':
        exportChatAsJSON(chat);
        break;
      case 'markdown':
        exportChatAsMarkdown(chat);
        break;
      case 'text':
        exportChatAsText(chat);
        break;
    }

    setShowExportMenu(false);
  };

  // Save chat when messages change (auto-save)
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const timeoutId = setTimeout(() => {
        saveCurrentChat();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [messages, isLoading]);

  // Only show error if Ollama is not running
  if (!isOllamaRunning) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <div className="text-center p-8 bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-[#e8e8e8]">Ollama Not Running</h2>
          <p className="text-[#8a8a8a] mb-4">Please start Ollama to use local models.</p>
          <div className="text-left space-y-3 text-sm">
            <div className="p-3 bg-[#1a1a1a] rounded-lg">
              <p className="text-[#e8e8e8] font-medium mb-1">Start Ollama</p>
              <p className="text-[#6a6a6a]">Run Ollama on http://localhost:11434</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1a1a1a] overflow-hidden" style={{ minWidth: '800px' }}>
      <Sidebar
        onNewChat={handleClearChat}
        currentView={currentView}
        onViewChange={handleViewChange}
        onLoadChat={handleLoadChat}
      />

      <div className="flex-1 flex flex-col">
        {/* Error message */}
        {error && currentView === 'chats' && (
          <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Main content area */}
        {currentView === 'chats' ? (
          <div ref={containerRef} className="flex-1 flex overflow-hidden">
            {/* Chat panel */}
            <div
              className="flex flex-col relative h-full"
              style={{ width: currentArtifact ? `${panelWidth}%` : '100%' }}
            >
              {/* Export button - floating */}
              {messages.length > 0 && (
                <div className="absolute top-4 right-4 z-10">
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="p-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#e8e8e8] rounded-lg border border-[#3a3a3a] transition-all flex items-center gap-2"
                    title="Export conversation"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>

                  {/* Export menu dropdown */}
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-lg overflow-hidden">
                      <button
                        onClick={() => handleExportChat('markdown')}
                        className="w-full px-4 py-2 text-left text-sm text-[#e8e8e8] hover:bg-[#3a3a3a] transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export as Markdown
                      </button>
                      <button
                        onClick={() => handleExportChat('json')}
                        className="w-full px-4 py-2 text-left text-sm text-[#e8e8e8] hover:bg-[#3a3a3a] transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Export as JSON
                      </button>
                      <button
                        onClick={() => handleExportChat('text')}
                        className="w-full px-4 py-2 text-left text-sm text-[#e8e8e8] hover:bg-[#3a3a3a] transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export as Text
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-hidden flex flex-col">
              {messages.length === 0 ? (
                <WelcomeScreen onSelectAction={handleQuickAction} />
              ) : (
                <MessageList messages={messages} isLoading={isLoading} />
              )}
            </div>

              {/* Input area - fixed at bottom for chat view */}
              <InputBox
                onSend={handleSendMessage}
                disabled={isLoading || !selectedModel}
                models={models}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
              />
            </div>

            {/* Resizer */}
            {currentArtifact && (
              <div
                className="w-1 h-full bg-[#3a3a3a] hover:bg-accent-orange cursor-col-resize transition-colors flex-shrink-0"
                onMouseDown={() => setIsResizing(true)}
              />
            )}

            {/* Artifact Preview Panel */}
            {currentArtifact && (
              <div className="flex flex-col h-full" style={{ width: `${100 - panelWidth}%` }}>
                <ArtifactPreviewPanel
                  artifact={currentArtifact}
                  onClose={handleCloseArtifact}
                />
              </div>
            )}
          </div>
        ) : currentView === 'projects' ? (
          <ProjectsView onProjectCreated={handleProjectCreated} />
        ) : currentView === 'artifacts' ? (
          <ArtifactsView />
        ) : currentView === 'code' ? (
          <CodeView />
        ) : currentView === 'settings' ? (
          <SettingsView />
        ) : currentView === 'profile' ? (
          <ProfileView />
        ) : null}
      </div>
    </div>
  );
}
