import type { KnowledgeDocument } from '../types/app';
import type { Message } from './ollama-client';
import { getRelevantDocuments } from './storage';
import { findRelevantMemories } from './memory';

export interface ContextConfig {
  includeKnowledge: boolean;
  includeMemory: boolean;
  maxKnowledgeDocs: number;
  maxMemories: number;
  maxContextLength: number;
}

export const DEFAULT_CONTEXT_CONFIG: ContextConfig = {
  includeKnowledge: true,
  includeMemory: true,
  maxKnowledgeDocs: 3,
  maxMemories: 2,
  maxContextLength: 4000,
};

export function buildEnhancedContext(
  userMessage: string,
  config: ContextConfig = DEFAULT_CONTEXT_CONFIG
): string {
  const contextParts: string[] = [];

  if (config.includeKnowledge) {
    const relevantDocs = getRelevantDocuments(userMessage, config.maxKnowledgeDocs);
    if (relevantDocs.length > 0) {
      const knowledgeContext = buildKnowledgeContext(relevantDocs);
      contextParts.push(knowledgeContext);
    }
  }

  if (config.includeMemory) {
    const relevantMemories = findRelevantMemories(userMessage, config.maxMemories);
    if (relevantMemories.length > 0) {
      const memoryContext = buildMemoryContext(relevantMemories);
      contextParts.push(memoryContext);
    }
  }

  let fullContext = contextParts.join('\n\n');

  if (fullContext.length > config.maxContextLength) {
    fullContext = fullContext.substring(0, config.maxContextLength) + '... [context truncated]';
  }

  return fullContext;
}

function buildKnowledgeContext(documents: KnowledgeDocument[]): string {
  if (documents.length === 0) return '';

  const docSummaries = documents.map((doc, index) => {
    const preview = doc.content.substring(0, 500);
    return `[Knowledge Source ${index + 1}: ${doc.name}]\n${preview}${doc.content.length > 500 ? '...' : ''}`;
  });

  return `### Available Knowledge\nYou have access to the following information that may help answer the user's question:\n\n${docSummaries.join('\n\n')}`;
}

function buildMemoryContext(memories: any[]): string {
  if (memories.length === 0) return '';

  const memorySummaries = memories.map((mem, index) => {
    return `${index + 1}. ${mem.summary} (Topics: ${mem.keyTopics.slice(0, 3).join(', ')})`;
  });

  return `### Conversation History\nRelevant previous discussions:\n${memorySummaries.join('\n')}`;
}

export function createSystemPromptWithContext(
  basePrompt: string,
  userMessage: string,
  config: ContextConfig = DEFAULT_CONTEXT_CONFIG
): Message {
  const context = buildEnhancedContext(userMessage, config);

  let systemContent = basePrompt;

  if (context) {
    systemContent += `\n\n${context}\n\nPlease use this context to provide more informed and relevant responses. Reference the knowledge sources when applicable.`;
  }

  return {
    role: 'system',
    content: systemContent,
  };
}

export function getActiveKnowledgeSummary(userMessage: string, maxDocs: number = 3): Array<{id: string, name: string}> {
  const docs = getRelevantDocuments(userMessage, maxDocs);
  return docs.map(doc => ({ id: doc.id, name: doc.name }));
}

export function formatContextForDisplay(context: string): string {
  if (!context) return 'No additional context';

  const lines = context.split('\n');
  const preview = lines.slice(0, 5).join('\n');

  return preview + (lines.length > 5 ? '\n...' : '');
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

export function canAddContext(currentMessages: Message[], newContext: string, maxTokens: number = 4096): boolean {
  const currentText = currentMessages.map(m => m.content).join(' ');
  const currentTokens = estimateTokenCount(currentText);
  const contextTokens = estimateTokenCount(newContext);

  return (currentTokens + contextTokens) < maxTokens * 0.8;
}
