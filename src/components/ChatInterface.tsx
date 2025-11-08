import { useState, useEffect } from 'react';
import { getModels, streamChat, checkOllamaStatus, type Message, type Model } from '../lib/ollama-client';
import { addChatToHistory, getProjects } from '../lib/storage';
import type { ViewType, ChatHistory } from '../types/app';
import MessageList from './MessageList';
import InputBox from './InputBox';
import Sidebar from './Sidebar';
import WelcomeScreen from './WelcomeScreen';
import ProjectsView from './ProjectsView';
import ArtifactsView from './ArtifactsView';
import CodeView from './CodeView';
import SettingsView from './SettingsView';
import ProfileView from './ProfileView';
import { createSystemPromptWithContext, getActiveKnowledgeSummary } from '../lib/context-builder';
import { createMemoryFromChat } from '../lib/memory';
import { loadIntegrationSettings, buildCapabilitiesPrompt } from '../lib/integrations';
import { buildConversationState, buildConversationalPrompt, DEFAULT_PERSONA } from '../lib/persona';
import { getRelevantSkills } from '../lib/storage';
import { parseToolCalls, executeToolCalls, hasToolCalls } from '../lib/tool-calling';

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
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true);
  const [activeKnowledge, setActiveKnowledge] = useState<Array<{id: string, name: string}>>([]);

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

    // Get active knowledge for this query
    if (useKnowledgeBase) {
      const knowledge = getActiveKnowledgeSummary(content, 3);
      setActiveKnowledge(knowledge);
    }

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

      // Stream the response from Ollama
      let fullResponse = '';
      for await (const chunk of streamChat(selectedModel, messagesWithSystem)) {
        fullResponse += chunk;
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
      }

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

        const followUpMessages = [...messages, userMessage, { role: 'assistant', content: fullResponse }, followUpMessage];

        for await (const chunk of streamChat(selectedModel, [...messagesWithSystem.slice(0, -1), ...followUpMessages])) {
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
        }
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
          <>

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
          </>
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
