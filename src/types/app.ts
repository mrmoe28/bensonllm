export interface ChatHistory {
  id: string;
  title: string;
  timestamp: number;
  messages: Array<{ role: string; content: string }>;
  starred?: boolean;
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

export type ViewType = 'chats' | 'projects' | 'artifacts' | 'code';
