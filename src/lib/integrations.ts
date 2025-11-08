import type { IntegrationSettings } from '../types/app';

const INTEGRATION_SETTINGS_KEY = 'ollama-integrations';

export const DEFAULT_INTEGRATION_SETTINGS: IntegrationSettings = {
  webSearch: {
    enabled: true,
    provider: 'duckduckgo',
  },
  codeExecution: {
    enabled: false,
    allowedLanguages: ['python', 'javascript', 'typescript', 'bash', 'sql'],
  },
  fileUpload: {
    enabled: true,
    allowedTypes: ['.txt', '.md', '.pdf', '.jpg', '.png', '.docx'],
  },
  github: {
    connected: false,
  },
};

export function loadIntegrationSettings(): IntegrationSettings {
  try {
    const stored = localStorage.getItem(INTEGRATION_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_INTEGRATION_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load integration settings:', error);
  }
  return DEFAULT_INTEGRATION_SETTINGS;
}

export function saveIntegrationSettings(settings: IntegrationSettings): void {
  try {
    localStorage.setItem(INTEGRATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save integration settings:', error);
  }
}

export function buildCapabilitiesPrompt(settings: IntegrationSettings): string {
  const capabilities: string[] = [];
  const toolInstructions: string[] = [];

  if (settings.webSearch.enabled) {
    capabilities.push(`- **Web Search**: I can search the internet using ${settings.webSearch.provider} to find current information, news, documentation, and answers to questions.`);
    toolInstructions.push(`
**🔍 Web Search**
When you need current information from the internet, use this format:
[SEARCH: your search query]

Example: "Let me find the latest information. [SEARCH: latest JavaScript features 2024]"

I will execute the search and provide you with results.`);
  }

  if (settings.codeExecution.enabled) {
    capabilities.push(`- **Code Execution**: I can write and execute code in the following languages: ${settings.codeExecution.allowedLanguages.join(', ')}. I can help debug, test, and run code snippets in a sandboxed environment.`);
  }

  if (settings.fileUpload.enabled) {
    capabilities.push(`- **File Processing**: I can read and analyze files including: ${settings.fileUpload.allowedTypes.join(', ')}. Upload files to have me analyze their contents.`);
  }

  if (settings.github.connected) {
    capabilities.push(`- **GitHub Integration**: I'm connected to your GitHub account (${settings.github.username || 'connected'}). I can help you with repositories, issues, pull requests, and code reviews.`);
  }

  if (capabilities.length === 0) {
    return '';
  }

  let prompt = `\n\n## My Available Tools & Capabilities\n\n${capabilities.join('\n')}`;

  if (toolInstructions.length > 0) {
    prompt += `\n\n## 🛠️ How to Use Tools\n${toolInstructions.join('\n')}`;
  }

  return prompt;
}
