import type { ChatHistory, Project, Artifact, CodeSnippet, KnowledgeDocument, ConversationMemory } from '../types/app';

const STORAGE_KEYS = {
  CHATS: 'ollama-chat-history',
  PROJECTS: 'ollama-projects',
  ARTIFACTS: 'ollama-artifacts',
  CODE: 'ollama-code-snippets',
  KNOWLEDGE: 'ollama-knowledge-base',
  MEMORY: 'ollama-conversation-memory',
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

export const getChatsByProject = (projectId: string): ChatHistory[] => {
  return getChatHistory().filter(chat => chat.projectId === projectId);
};

export const getChatsByFolder = (folderId: string): ChatHistory[] => {
  return getChatHistory().filter(chat => chat.folderId === folderId);
};

export const getChatsWithoutProject = (): ChatHistory[] => {
  return getChatHistory().filter(chat => !chat.projectId);
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

// Knowledge Base Functions
export const getKnowledgeDocuments = (): KnowledgeDocument[] => {
  const data = localStorage.getItem(STORAGE_KEYS.KNOWLEDGE);
  return data ? JSON.parse(data) : [];
};

export const saveKnowledgeDocuments = (documents: KnowledgeDocument[]): void => {
  localStorage.setItem(STORAGE_KEYS.KNOWLEDGE, JSON.stringify(documents));
};

export const addKnowledgeDocument = (document: KnowledgeDocument): void => {
  const documents = getKnowledgeDocuments();
  documents.push(document);
  saveKnowledgeDocuments(documents);
};

export const updateKnowledgeDocument = (id: string, updates: Partial<KnowledgeDocument>): void => {
  const documents = getKnowledgeDocuments().map(doc =>
    doc.id === id ? { ...doc, ...updates, metadata: { ...doc.metadata, updatedAt: Date.now() } } : doc
  );
  saveKnowledgeDocuments(documents);
};

export const deleteKnowledgeDocument = (id: string): void => {
  const documents = getKnowledgeDocuments().filter(doc => doc.id !== id);
  saveKnowledgeDocuments(documents);
};

export const searchKnowledgeBase = (query: string): KnowledgeDocument[] => {
  const documents = getKnowledgeDocuments();
  const lowerQuery = query.toLowerCase();

  return documents.filter(doc =>
    doc.name.toLowerCase().includes(lowerQuery) ||
    doc.content.toLowerCase().includes(lowerQuery) ||
    doc.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getRelevantDocuments = (query: string, limit: number = 5): KnowledgeDocument[] => {
  const documents = searchKnowledgeBase(query);
  return documents.slice(0, limit);
};

export const getTotalKnowledgeSize = (): number => {
  const documents = getKnowledgeDocuments();
  return documents.reduce((total, doc) => total + doc.metadata.size, 0);
};

// Skills Knowledge Functions - Fast retrieval for AI capabilities
export const getSkillsKnowledge = (): KnowledgeDocument[] => {
  return getKnowledgeDocuments().filter(doc => doc.category === 'skills');
};

export const getKnowledgeByCategory = (category: KnowledgeDocument['category']): KnowledgeDocument[] => {
  return getKnowledgeDocuments().filter(doc => doc.category === category);
};

export const getHighPriorityKnowledge = (): KnowledgeDocument[] => {
  return getKnowledgeDocuments()
    .filter(doc => doc.priority === 'high')
    .sort((a, b) => b.metadata.createdAt - a.metadata.createdAt);
};

export const getRelevantSkills = (query: string, limit: number = 3): KnowledgeDocument[] => {
  const skills = getSkillsKnowledge();
  const lowerQuery = query.toLowerCase();

  // Score each skill by relevance
  const scored = skills.map(skill => {
    let score = 0;

    // Match in name (highest priority)
    if (skill.name.toLowerCase().includes(lowerQuery)) score += 10;

    // Match in tags
    skill.metadata.tags.forEach(tag => {
      if (lowerQuery.includes(tag.toLowerCase())) score += 5;
    });

    // Match in content
    if (skill.content.toLowerCase().includes(lowerQuery)) score += 2;

    // Boost for high priority
    if (skill.priority === 'high') score += 3;

    return { skill, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.skill);
};

// Conversation Memory Functions
export const getConversationMemories = (): ConversationMemory[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MEMORY);
  return data ? JSON.parse(data) : [];
};

export const saveConversationMemories = (memories: ConversationMemory[]): void => {
  localStorage.setItem(STORAGE_KEYS.MEMORY, JSON.stringify(memories));
};

export const addConversationMemory = (memory: ConversationMemory): void => {
  const memories = getConversationMemories();
  memories.push(memory);
  saveConversationMemories(memories);
};

export const getMemoriesBySession = (sessionId: string): ConversationMemory[] => {
  return getConversationMemories().filter(m => m.sessionId === sessionId);
};

export const getMemoriesByTopic = (topic: string): ConversationMemory[] => {
  const lowerTopic = topic.toLowerCase();
  return getConversationMemories().filter(m =>
    m.keyTopics.some(t => t.toLowerCase().includes(lowerTopic))
  );
};

export const searchMemories = (query: string): ConversationMemory[] => {
  const lowerQuery = query.toLowerCase();
  return getConversationMemories().filter(m =>
    m.summary.toLowerCase().includes(lowerQuery) ||
    m.keyTopics.some(t => t.toLowerCase().includes(lowerQuery)) ||
    m.entities.some(e => e.toLowerCase().includes(lowerQuery))
  );
};
