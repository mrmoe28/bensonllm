import type { ChatHistory, Project, Artifact, CodeSnippet } from '../types/app';

const STORAGE_KEYS = {
  CHATS: 'ollama-chat-history',
  PROJECTS: 'ollama-projects',
  ARTIFACTS: 'ollama-artifacts',
  CODE: 'ollama-code-snippets',
};

// Chat History Functions
export const getChatHistory = (): ChatHistory[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CHATS);
  return data ? JSON.parse(data) : [];
};

export const saveChatHistory = (chats: ChatHistory[]): void => {
  localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
};

export const addChatToHistory = (chat: ChatHistory): void => {
  const chats = getChatHistory();
  const existingIndex = chats.findIndex(c => c.id === chat.id);

  if (existingIndex >= 0) {
    // Update existing chat
    chats[existingIndex] = chat;
  } else {
    // Add new chat at the beginning
    chats.unshift(chat);
  }

  saveChatHistory(chats);
};

export const deleteChatFromHistory = (id: string): void => {
  const chats = getChatHistory().filter(chat => chat.id !== id);
  saveChatHistory(chats);
};

export const toggleChatStar = (id: string): void => {
  const chats = getChatHistory().map(chat =>
    chat.id === id ? { ...chat, starred: !chat.starred } : chat
  );
  saveChatHistory(chats);
};

// Project Functions
export const getProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : [];
};

export const saveProjects = (projects: Project[]): void => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const addProject = (project: Project): void => {
  const projects = getProjects();
  projects.push(project);
  saveProjects(projects);
};

export const deleteProject = (id: string): void => {
  const projects = getProjects().filter(p => p.id !== id);
  saveProjects(projects);
};

export const updateProject = (id: string, updates: Partial<Project>): void => {
  const projects = getProjects().map(p =>
    p.id === id ? { ...p, ...updates } : p
  );
  saveProjects(projects);
};

// Artifact Functions
export const getArtifacts = (): Artifact[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ARTIFACTS);
  return data ? JSON.parse(data) : [];
};

export const saveArtifacts = (artifacts: Artifact[]): void => {
  localStorage.setItem(STORAGE_KEYS.ARTIFACTS, JSON.stringify(artifacts));
};

export const addArtifact = (artifact: Artifact): void => {
  const artifacts = getArtifacts();
  artifacts.push(artifact);
  saveArtifacts(artifacts);
};

// Code Snippet Functions
export const getCodeSnippets = (): CodeSnippet[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CODE);
  return data ? JSON.parse(data) : [];
};

export const saveCodeSnippets = (snippets: CodeSnippet[]): void => {
  localStorage.setItem(STORAGE_KEYS.CODE, JSON.stringify(snippets));
};

export const addCodeSnippet = (snippet: CodeSnippet): void => {
  const snippets = getCodeSnippets();
  snippets.push(snippet);
  saveCodeSnippets(snippets);
};
