import { useState, useEffect, useRef } from 'react';
import { getModels, streamChat, checkOllamaStatus, type Message, type Model } from '../lib/ollama-client';
import { addChatToHistory } from '../lib/storage';
import type { ViewType, ChatHistory } from '../types/app';
import MessageList from './MessageList';
import InputBox from './InputBox';
import Sidebar from './Sidebar';
import WelcomeScreen from './WelcomeScreen';
import ProjectsView from './ProjectsView';
import ArtifactsView from './ArtifactsView';
import CodeView from './CodeView';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOllamaRunning, setIsOllamaRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('chats');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check Ollama status and load models on mount
  useEffect(() => {
    async function init() {
      const status = await checkOllamaStatus();
      setIsOllamaRunning(status);

      if (status) {
        try {
          const availableModels = await getModels();
          setModels(availableModels);

          // Set qwen2.5:1.5b as default if available, otherwise any qwen, otherwise first model
          const qwen1_5b = availableModels.find(m =>
            m.name.toLowerCase() === 'qwen2.5:1.5b'
          );
          const anyQwen = availableModels.find(m =>
            m.name.toLowerCase().includes('qwen') ||
            m.name.toLowerCase().includes('quinn')
          );

          if (qwen1_5b) {
            setSelectedModel(qwen1_5b.name);
          } else if (anyQwen) {
            setSelectedModel(anyQwen.name);
          } else if (availableModels.length > 0) {
            setSelectedModel(availableModels[0].name);
          }
        } catch (err) {
          setError('Failed to load models. Make sure Ollama is running.');
        }
      } else {
        setError('Ollama is not running. Please start Ollama first.');
      }
    }

    init();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !selectedModel) return;

    const userMessage: Message = { role: 'user', content };

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

      // Stream the response
      for await (const chunk of streamChat(selectedModel, [...messages, userMessage])) {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content += chunk;
          }
          return newMessages;
        });
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
    setCurrentView('chats');
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const saveCurrentChat = () => {
    if (messages.length === 0) return;

    const chatTitle = messages[0]?.content.slice(0, 50) || 'New Chat';
    const chatId = currentChatId || Date.now().toString();

    const chat: ChatHistory = {
      id: chatId,
      title: chatTitle,
      timestamp: Date.now(),
      messages: messages,
    };

    addChatToHistory(chat);
  };

  const handleLoadChat = (chat: ChatHistory) => {
    // Save current chat if it exists and has messages
    if (messages.length > 0 && currentChatId !== chat.id) {
      saveCurrentChat();
    }

    setMessages(chat.messages);
    setCurrentChatId(chat.id);
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

  if (!isOllamaRunning) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <div className="text-center p-8 bg-[#2a2a2a] rounded-xl border border-[#3a3a3a]">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-[#e8e8e8]">Ollama Not Running</h2>
          <p className="text-[#8a8a8a] mb-4">Please start Ollama to use this chat interface.</p>
          <p className="text-sm text-[#6a6a6a]">Make sure Ollama is running on http://localhost:11434</p>
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
                <>
                  <MessageList messages={messages} isLoading={isLoading} />
                  <div ref={messagesEndRef} />
                </>
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
          <ProjectsView />
        ) : currentView === 'artifacts' ? (
          <ArtifactsView />
        ) : currentView === 'code' ? (
          <CodeView />
        ) : null}
      </div>
    </div>
  );
}
