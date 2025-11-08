import type { ConversationMemory, ChatHistory } from '../types/app';
import type { Message } from './ollama-client';
import { addConversationMemory, getConversationMemories, searchMemories } from './storage';

let currentSessionId: string | null = null;

export function getCurrentSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  return currentSessionId;
}

export function startNewSession(): string {
  currentSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return currentSessionId;
}

export async function createMemoryFromChat(chat: ChatHistory): Promise<ConversationMemory> {
  const summary = await generateSummary(chat.messages);
  const keyTopics = extractTopics(chat.messages);
  const entities = extractEntities(chat.messages);

  const memory: ConversationMemory = {
    id: `memory-${chat.id}`,
    sessionId: getCurrentSessionId(),
    chatId: chat.id,
    summary,
    keyTopics,
    entities,
    timestamp: chat.timestamp,
    messageCount: chat.messages.length,
  };

  addConversationMemory(memory);
  return memory;
}

async function generateSummary(messages: Message[]): Promise<string> {
  if (messages.length === 0) return 'Empty conversation';

  const firstUserMessage = messages.find(m => m.role === 'user')?.content || '';
  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop()?.content || '';

  const summary = `User asked: "${firstUserMessage.slice(0, 100)}${firstUserMessage.length > 100 ? '...' : ''}". ${
    lastAssistantMessage ? `Assistant discussed: "${lastAssistantMessage.slice(0, 100)}${lastAssistantMessage.length > 100 ? '...' : ''}"` : ''
  }`;

  return summary;
}

function extractTopics(messages: Message[]): string[] {
  const allText = messages.map(m => m.content).join(' ').toLowerCase();

  const topics = new Set<string>();

  const keywords = [
    'code', 'programming', 'debug', 'error', 'api', 'database', 'frontend', 'backend',
    'react', 'typescript', 'javascript', 'python', 'design', 'ui', 'ux', 'authentication',
    'deployment', 'testing', 'performance', 'security', 'optimization', 'algorithm',
    'data', 'machine learning', 'ai', 'server', 'client', 'web', 'mobile', 'documentation'
  ];

  keywords.forEach(keyword => {
    if (allText.includes(keyword)) {
      topics.add(keyword);
    }
  });

  return Array.from(topics).slice(0, 10);
}

function extractEntities(messages: Message[]): string[] {
  const allText = messages.map(m => m.content).join(' ');

  const entities = new Set<string>();

  const capitalizedWords = allText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  capitalizedWords.forEach(word => {
    if (word.length > 2 && word !== 'User' && word !== 'Assistant') {
      entities.add(word);
    }
  });

  const technicalTerms = allText.match(/\b[A-Z]{2,}\b/g) || [];
  technicalTerms.forEach(term => {
    if (term.length > 1) {
      entities.add(term);
    }
  });

  return Array.from(entities).slice(0, 15);
}

export function findRelevantMemories(query: string, limit: number = 5): ConversationMemory[] {
  const memories = searchMemories(query);

  const scoredMemories = memories.map(memory => {
    let score = 0;

    const queryLower = query.toLowerCase();
    if (memory.summary.toLowerCase().includes(queryLower)) score += 10;

    memory.keyTopics.forEach(topic => {
      if (queryLower.includes(topic.toLowerCase())) score += 5;
    });

    memory.entities.forEach(entity => {
      if (queryLower.includes(entity.toLowerCase())) score += 3;
    });

    const daysSince = (Date.now() - memory.timestamp) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 5 - daysSince);

    return { memory, score };
  });

  scoredMemories.sort((a, b) => b.score - a.score);

  return scoredMemories.slice(0, limit).map(item => item.memory);
}

export function getAllMemories(): ConversationMemory[] {
  return getConversationMemories();
}

export function getMemoryStats(): {
  totalConversations: number;
  totalTopics: number;
  totalEntities: number;
  oldestMemory: number | null;
  newestMemory: number | null;
} {
  const memories = getConversationMemories();

  const allTopics = new Set<string>();
  const allEntities = new Set<string>();

  memories.forEach(m => {
    m.keyTopics.forEach(t => allTopics.add(t));
    m.entities.forEach(e => allEntities.add(e));
  });

  const timestamps = memories.map(m => m.timestamp);

  return {
    totalConversations: memories.length,
    totalTopics: allTopics.size,
    totalEntities: allEntities.size,
    oldestMemory: timestamps.length > 0 ? Math.min(...timestamps) : null,
    newestMemory: timestamps.length > 0 ? Math.max(...timestamps) : null,
  };
}
