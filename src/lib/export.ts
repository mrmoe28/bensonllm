/**
 * Export functionality for conversations and knowledge base
 */

import type { ChatHistory, KnowledgeDocument } from '../types/app';

/**
 * Export chat history as JSON
 */
export function exportChatAsJSON(chat: ChatHistory): void {
  const dataStr = JSON.stringify(chat, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `chat-${chat.id}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export chat history as Markdown
 */
export function exportChatAsMarkdown(chat: ChatHistory): void {
  const lines: string[] = [];

  lines.push(`# ${chat.title}`);
  lines.push('');
  lines.push(`**Date:** ${new Date(chat.timestamp).toLocaleString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  chat.messages.forEach((message, index) => {
    const role = message.role === 'user' ? '👤 User' : '🤖 Assistant';
    lines.push(`## ${role}`);
    lines.push('');
    lines.push(message.content);
    lines.push('');

    if (index < chat.messages.length - 1) {
      lines.push('---');
      lines.push('');
    }
  });

  const markdown = lines.join('\n');
  const dataBlob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `chat-${chat.id}-${Date.now()}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export chat history as plain text
 */
export function exportChatAsText(chat: ChatHistory): void {
  const lines: string[] = [];

  lines.push(chat.title);
  lines.push('='.repeat(chat.title.length));
  lines.push('');
  lines.push(`Date: ${new Date(chat.timestamp).toLocaleString()}`);
  lines.push('');
  lines.push('─'.repeat(50));
  lines.push('');

  chat.messages.forEach((message, index) => {
    const role = message.role === 'user' ? 'USER' : 'ASSISTANT';
    lines.push(`[${role}]`);
    lines.push('');
    lines.push(message.content);
    lines.push('');

    if (index < chat.messages.length - 1) {
      lines.push('─'.repeat(50));
      lines.push('');
    }
  });

  const text = lines.join('\n');
  const dataBlob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `chat-${chat.id}-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export all chats as JSON
 */
export function exportAllChatsAsJSON(chats: ChatHistory[]): void {
  const dataStr = JSON.stringify({ chats, exportedAt: Date.now() }, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `all-chats-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Import chats from JSON
 */
export async function importChatsFromJSON(file: File): Promise<ChatHistory[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        // Handle both single chat and multi-chat formats
        if (data.chats && Array.isArray(data.chats)) {
          resolve(data.chats);
        } else if (data.messages && data.id) {
          resolve([data]);
        } else {
          reject(new Error('Invalid chat file format'));
        }
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Export knowledge document
 */
export function exportKnowledgeDocument(doc: KnowledgeDocument): void {
  const dataStr = JSON.stringify(doc, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `knowledge-${doc.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export all knowledge documents
 */
export function exportAllKnowledge(documents: KnowledgeDocument[]): void {
  const dataStr = JSON.stringify({ documents, exportedAt: Date.now() }, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `knowledge-base-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
