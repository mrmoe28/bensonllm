/**
 * Conversational Persona System
 * Provides natural speech patterns, conversational awareness, and personality
 */

export interface ConversationState {
  messageCount: number;
  lastUserTone: 'casual' | 'formal' | 'frustrated' | 'curious' | 'urgent';
  topicsDiscussed: string[];
  codeLanguagesUsed: string[];
  userExpertiseLevel: 'beginner' | 'intermediate' | 'expert' | 'unknown';
  conversationStyle: 'teaching' | 'collaborating' | 'troubleshooting' | 'exploring';
}

export interface PersonaConfig {
  personality: 'professional' | 'friendly' | 'casual' | 'adaptive';
  verbosity: 'concise' | 'balanced' | 'detailed';
  useTechnicalJargon: boolean;
  useEmojis: boolean;
  includeEncouragement: boolean;
}

export const DEFAULT_PERSONA: PersonaConfig = {
  personality: 'adaptive',
  verbosity: 'balanced',
  useTechnicalJargon: true,
  useEmojis: false,
  includeEncouragement: true,
};

/**
 * Natural speech pattern templates for different contexts
 */
const SPEECH_PATTERNS = {
  greeting: [
    "Hey! I can help you with that.",
    "Sure thing! Let me assist you with this.",
    "Got it! I'm here to help.",
    "Absolutely! Let's tackle this together.",
  ],

  acknowledgment: [
    "I understand.",
    "I see what you're working on.",
    "Got it!",
    "Makes sense.",
  ],

  transition: [
    "Let me break this down for you:",
    "Here's how we can approach this:",
    "Let's look at this step by step:",
    "I'll walk you through this:",
  ],

  clarification: [
    "Just to make sure I understand correctly,",
    "Let me clarify:",
    "To be clear,",
    "If I'm understanding right,",
  ],

  encouragement: [
    "You're on the right track!",
    "Great question!",
    "This is a common challenge.",
    "Good thinking!",
  ],

  completion: [
    "There you go!",
    "That should do it!",
    "And we're all set!",
    "Perfect!",
  ],
};

/**
 * Analyzes user message to determine tone and intent
 */
export function analyzeUserTone(message: string): ConversationState['lastUserTone'] {
  const lower = message.toLowerCase();

  // Frustrated indicators
  if (lower.includes('not working') || lower.includes('error') ||
      lower.includes('broken') || lower.includes('issue') ||
      lower.includes('problem') || lower.match(/why (is|does|won't)/)) {
    return 'frustrated';
  }

  // Urgent indicators
  if (lower.includes('urgent') || lower.includes('asap') ||
      lower.includes('immediately') || lower.includes('critical')) {
    return 'urgent';
  }

  // Curious/learning indicators
  if (lower.includes('how') || lower.includes('what') ||
      lower.includes('why') || lower.includes('explain') ||
      lower.includes('learn') || lower.includes('understand')) {
    return 'curious';
  }

  // Formal indicators
  if (lower.includes('please') || lower.includes('kindly') ||
      lower.includes('would you') || lower.length > 200) {
    return 'formal';
  }

  return 'casual';
}

/**
 * Detects expertise level from message patterns
 */
export function detectExpertiseLevel(messages: string[]): ConversationState['userExpertiseLevel'] {
  const allText = messages.join(' ').toLowerCase();

  const beginnerIndicators = [
    'what is', 'how do i', 'i\'m new', 'beginner', 'tutorial',
    'basic', 'simple', 'easy way', 'for dummies'
  ];

  const expertIndicators = [
    'optimize', 'performance', 'architecture', 'scalability',
    'algorithm complexity', 'design pattern', 'refactor',
    'asynchronous', 'concurrency', 'middleware', 'protocol'
  ];

  const beginnerScore = beginnerIndicators.filter(ind => allText.includes(ind)).length;
  const expertScore = expertIndicators.filter(ind => allText.includes(ind)).length;

  if (expertScore > 2) return 'expert';
  if (beginnerScore > 2) return 'beginner';
  if (messages.length > 5) return 'intermediate';

  return 'unknown';
}

/**
 * Detects conversation style
 */
export function detectConversationStyle(messages: string[]): ConversationState['conversationStyle'] {
  const recentText = messages.slice(-3).join(' ').toLowerCase();

  if (recentText.includes('error') || recentText.includes('fix') ||
      recentText.includes('debug') || recentText.includes('issue')) {
    return 'troubleshooting';
  }

  if (recentText.includes('how') || recentText.includes('explain') ||
      recentText.includes('what is') || recentText.includes('why')) {
    return 'teaching';
  }

  if (recentText.includes('let\'s') || recentText.includes('we should') ||
      recentText.includes('together') || recentText.includes('build')) {
    return 'collaborating';
  }

  return 'exploring';
}

/**
 * Extract code languages mentioned
 */
export function extractCodeLanguages(text: string): string[] {
  const languages = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
    'php', 'ruby', 'swift', 'kotlin', 'react', 'vue', 'angular', 'node',
    'sql', 'html', 'css', 'bash', 'shell'
  ];

  const found = new Set<string>();
  const lower = text.toLowerCase();

  languages.forEach(lang => {
    if (lower.includes(lang)) {
      found.add(lang);
    }
  });

  return Array.from(found);
}

/**
 * Extract topics from text
 */
export function extractTopics(text: string): string[] {
  const topics = [
    'authentication', 'database', 'api', 'frontend', 'backend',
    'testing', 'deployment', 'security', 'performance', 'ui/ux',
    'debugging', 'optimization', 'architecture', 'design patterns',
    'async', 'state management', 'routing', 'forms', 'validation'
  ];

  const found = new Set<string>();
  const lower = text.toLowerCase();

  topics.forEach(topic => {
    if (lower.includes(topic.replace('/', ' '))) {
      found.add(topic);
    }
  });

  return Array.from(found);
}

/**
 * Build conversation state from message history
 */
export function buildConversationState(messages: Array<{role: string, content: string}>): ConversationState {
  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
  const lastUserMessage = userMessages[userMessages.length - 1] || '';

  const allText = messages.map(m => m.content).join(' ');

  return {
    messageCount: messages.length,
    lastUserTone: analyzeUserTone(lastUserMessage),
    topicsDiscussed: extractTopics(allText),
    codeLanguagesUsed: extractCodeLanguages(allText),
    userExpertiseLevel: detectExpertiseLevel(userMessages),
    conversationStyle: detectConversationStyle(userMessages),
  };
}

/**
 * Get random speech pattern for context
 */
export function getRandomPattern(context: keyof typeof SPEECH_PATTERNS): string {
  const patterns = SPEECH_PATTERNS[context];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

/**
 * Build conversational system prompt with personality and awareness
 */
export function buildConversationalPrompt(
  state: ConversationState,
  persona: PersonaConfig = DEFAULT_PERSONA
): string {
  const parts: string[] = [];

  // Base personality
  parts.push('You are a highly intelligent AI assistant with deep expertise in software development and technology.');

  // Conversational awareness
  if (state.messageCount > 5) {
    parts.push('We\'ve been having an ongoing conversation, so maintain context and continuity.');
  }

  // Adapt to user tone
  switch (state.lastUserTone) {
    case 'frustrated':
      parts.push('The user seems frustrated. Be patient, empathetic, and focus on solving their problem quickly.');
      break;
    case 'urgent':
      parts.push('This seems urgent. Provide direct, actionable solutions without unnecessary explanation.');
      break;
    case 'curious':
      parts.push('The user wants to learn. Explain concepts clearly with examples.');
      break;
    case 'formal':
      parts.push('Maintain a professional and thorough approach.');
      break;
    case 'casual':
      parts.push('Keep the tone friendly and conversational.');
      break;
  }

  // Adapt to expertise level
  switch (state.userExpertiseLevel) {
    case 'beginner':
      parts.push('The user appears to be learning. Explain things clearly, avoid jargon, and include helpful context.');
      break;
    case 'expert':
      parts.push('The user is experienced. You can use technical terminology and focus on advanced concepts.');
      break;
    case 'intermediate':
      parts.push('The user has some experience. Balance explanations with technical accuracy.');
      break;
  }

  // Adapt to conversation style
  switch (state.conversationStyle) {
    case 'troubleshooting':
      parts.push('Focus on debugging: identify the problem, explain the cause, provide a fix.');
      break;
    case 'teaching':
      parts.push('Take a teaching approach: explain concepts, show examples, encourage understanding.');
      break;
    case 'collaborating':
      parts.push('Work collaboratively: suggest ideas, discuss trade-offs, build together.');
      break;
    case 'exploring':
      parts.push('Explore possibilities: share options, discuss approaches, think creatively.');
      break;
  }

  // Context awareness
  if (state.topicsDiscussed.length > 0) {
    parts.push(`We've been discussing: ${state.topicsDiscussed.slice(0, 3).join(', ')}.`);
  }

  if (state.codeLanguagesUsed.length > 0) {
    parts.push(`Working with: ${state.codeLanguagesUsed.join(', ')}.`);
  }

  // Natural speech guidelines
  parts.push('\nConversational Guidelines:');
  parts.push('- Speak naturally, like you would to a colleague');
  parts.push('- Use contractions (I\'ll, you\'re, it\'s)');
  parts.push('- Vary sentence structure and length');
  parts.push('- Acknowledge their question before diving into the answer');
  parts.push('- Use transitional phrases (Let me show you, Here\'s how, etc.)');

  if (persona.includeEncouragement) {
    parts.push('- Offer encouragement when appropriate');
  }

  // Code quality guidelines
  parts.push('\nWhen writing code:');
  parts.push('- Provide complete, working examples');
  parts.push('- Include brief explanatory comments');
  parts.push('- Use modern best practices');
  parts.push('- Explain your approach concisely');

  return parts.join('\n');
}

/**
 * Add natural speech openings based on context
 */
export function addNaturalOpening(state: ConversationState): string {
  // First message
  if (state.messageCount <= 2) {
    return getRandomPattern('greeting');
  }

  // Troubleshooting
  if (state.conversationStyle === 'troubleshooting') {
    if (state.lastUserTone === 'frustrated') {
      return "I see the issue. Let's get this fixed.";
    }
    return "Let's debug this together.";
  }

  // Learning
  if (state.conversationStyle === 'teaching') {
    if (state.userExpertiseLevel === 'beginner') {
      return "Great question! Let me explain this clearly.";
    }
    return getRandomPattern('acknowledgment');
  }

  // Default
  return '';
}
