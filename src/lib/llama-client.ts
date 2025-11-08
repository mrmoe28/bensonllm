// Llama API Client (OpenAI-compatible)
// Supports: Together AI, Groq, OpenRouter, Fireworks AI, etc.

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{type: 'text' | 'image_url'; text?: string; image_url?: {url: string}}>;
  images?: string[]; // For compatibility with Ollama format
}

export interface Model {
  name: string;
  provider: string;
  contextLength?: number;
}

export interface LlamaAPIConfig {
  apiKey: string;
  baseUrl?: string;
  provider?: 'together' | 'groq' | 'openrouter' | 'fireworks';
}

// Provider configurations
const PROVIDERS = {
  together: {
    baseUrl: 'https://api.together.xyz/v1',
    models: [
      { name: 'meta-llama/Llama-3-70b-chat-hf', provider: 'together', contextLength: 8192 },
      { name: 'meta-llama/Llama-3-8b-chat-hf', provider: 'together', contextLength: 8192 },
      { name: 'meta-llama/Llama-2-70b-chat-hf', provider: 'together', contextLength: 4096 },
      { name: 'meta-llama/Llama-2-13b-chat-hf', provider: 'together', contextLength: 4096 },
    ],
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    models: [
      { name: 'llama-3.1-70b-versatile', provider: 'groq', contextLength: 131072 },
      { name: 'llama-3.1-8b-instant', provider: 'groq', contextLength: 131072 },
      { name: 'llama3-70b-8192', provider: 'groq', contextLength: 8192 },
      { name: 'llama3-8b-8192', provider: 'groq', contextLength: 8192 },
    ],
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    models: [
      { name: 'meta-llama/llama-3.1-70b-instruct', provider: 'openrouter', contextLength: 131072 },
      { name: 'meta-llama/llama-3.1-8b-instruct', provider: 'openrouter', contextLength: 131072 },
      { name: 'meta-llama/llama-3-70b-instruct', provider: 'openrouter', contextLength: 8192 },
      { name: 'meta-llama/llama-3-8b-instruct', provider: 'openrouter', contextLength: 8192 },
    ],
  },
  fireworks: {
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    models: [
      { name: 'accounts/fireworks/models/llama-v3p1-70b-instruct', provider: 'fireworks', contextLength: 131072 },
      { name: 'accounts/fireworks/models/llama-v3p1-8b-instruct', provider: 'fireworks', contextLength: 131072 },
      { name: 'accounts/fireworks/models/llama-v3-70b-instruct', provider: 'fireworks', contextLength: 8192 },
    ],
  },
};

// Get API configuration from environment
function getConfig(): LlamaAPIConfig {
  const apiKey = import.meta.env.VITE_LLAMA_API_KEY || '';
  const provider = (import.meta.env.VITE_LLAMA_PROVIDER || 'groq') as LlamaAPIConfig['provider'];

  const providerConfig = provider ? PROVIDERS[provider] : PROVIDERS.groq;

  return {
    apiKey,
    baseUrl: providerConfig.baseUrl,
    provider,
  };
}

// Get available models for the configured provider
export function getLlamaModels(): Model[] {
  const config = getConfig();
  if (!config.provider) return PROVIDERS.groq.models;
  return PROVIDERS[config.provider].models;
}

// Stream chat with Llama API
export async function* streamLlamaChat(
  model: string,
  messages: Message[]
): AsyncGenerator<string> {
  const config = getConfig();

  if (!config.apiKey || config.apiKey === 'your-api-key-here') {
    throw new Error('Llama API key not configured. Please add VITE_LLAMA_API_KEY to your .env file');
  }

  try {
    // Convert messages to OpenAI format (handle images if present)
    const formattedMessages = messages.map(msg => {
      if (msg.images && msg.images.length > 0) {
        // Convert Ollama format (images array) to OpenAI format (content array)
        return {
          role: msg.role,
          content: [
            { type: 'text' as const, text: typeof msg.content === 'string' ? msg.content : '' },
            ...msg.images.map(img => ({
              type: 'image_url' as const,
              image_url: { url: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}` }
            }))
          ]
        };
      }
      return msg;
    });

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        ...(config.provider === 'openrouter' && {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Ollama Custom Chat',
        }),
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Llama API request failed: ${response.statusText}. ${errorData.error?.message || ''}`
      );
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
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

        if (trimmedLine.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmedLine.slice(6));
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in streamLlamaChat:', error);
    throw error;
  }
}

// Check if Llama API is configured
export function isLlamaConfigured(): boolean {
  const apiKey = import.meta.env.VITE_LLAMA_API_KEY;
  return !!(apiKey && apiKey !== 'your-api-key-here');
}

// Get provider name
export function getLlamaProvider(): string {
  const provider = import.meta.env.VITE_LLAMA_PROVIDER || 'groq';
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}
