// Ollama API Client
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[]; // Base64-encoded images for vision models
}

export interface ChatRequest {
  model: string;
  messages: Message[];
  stream?: boolean;
}

export interface ChatResponse {
  model: string;
  created_at: string;
  message: Message;
  done: boolean;
}

export interface Model {
  name: string;
  modified_at: string;
  size: number;
}

export interface ModelsResponse {
  models: Model[];
}

// Get list of available models
export async function getModels(): Promise<Model[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    const data: ModelsResponse = await response.json();
    return data.models;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

// Typing delay in milliseconds (slower = more realistic typing)
const TYPING_DELAY_MS = 30;

// Helper function to add typing delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Send chat message with streaming support
export async function* streamChat(
  model: string,
  messages: Message[]
): AsyncGenerator<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data: ChatResponse = JSON.parse(line);
            if (data.message?.content) {
              // Add typing delay for more realistic effect
              await delay(TYPING_DELAY_MS);
              yield data.message.content;
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in streamChat:', error);
    throw error;
  }
}

// Non-streaming chat (for simpler use cases)
export async function sendChat(
  model: string,
  messages: Message[]
): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.statusText}`);
    }

    const data: ChatResponse = await response.json();
    return data.message.content;
  } catch (error) {
    console.error('Error in sendChat:', error);
    throw error;
  }
}

// Check if Ollama is running
export async function checkOllamaStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return response.ok;
  } catch (error) {
    return false;
  }
}
