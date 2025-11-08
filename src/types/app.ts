export interface ChatHistory {
  id: string;
  title: string;
  timestamp: number;
  messages: Array<{ role: string; content: string }>;
  starred?: boolean;
  projectId?: string;
  folderId?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  folders: Folder[];
}

export interface Folder {
  id: string;
  name: string;
  projectId: string;
  createdAt: number;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'code' | 'document' | 'image' | 'other';
  content: string;
  createdAt: number;
}

export interface CodeSnippet {
  id: string;
  name: string;
  language: string;
  code: string;
  createdAt: number;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'markdown' | 'url' | 'image' | 'docx';
  content: string;
  rawContent?: string;
  url?: string;
  metadata: {
    size: number;
    pageCount?: number;
    ocrProcessed?: boolean;
    createdAt: number;
    updatedAt: number;
    tags: string[];
  };
}

export interface ConversationMemory {
  id: string;
  sessionId: string;
  chatId: string;
  summary: string;
  keyTopics: string[];
  entities: string[];
  timestamp: number;
  messageCount: number;
}

export interface AudioSettings {
  enabled: boolean;
  voice: string;
  speed: number;
  autoPlay: boolean;
  piperPath: string;
}

export type ViewType = 'chats' | 'projects' | 'artifacts' | 'code' | 'settings' | 'profile' | 'knowledge';
