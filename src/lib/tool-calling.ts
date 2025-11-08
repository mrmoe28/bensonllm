import { performWebSearch, formatSearchResultsForLLM } from './search';
import { loadIntegrationSettings } from './integrations';

export interface ToolCall {
  type: 'search' | 'code' | 'unknown';
  query: string;
  rawMatch: string;
}

export interface ToolResult {
  toolCall: ToolCall;
  result: string;
  success: boolean;
}

/**
 * Parse LLM response for tool calls
 * Supports multiple formats:
 * 1. [SEARCH: query]
 * 2. <tool>search</tool><query>query text</query>
 * 3. SEARCH(query text)
 */
export function parseToolCalls(text: string): ToolCall[] {
  const toolCalls: ToolCall[] = [];

  // Pattern 1: [SEARCH: query]
  const bracketPattern = /\[SEARCH:\s*([^\]]+)\]/gi;
  let match;

  while ((match = bracketPattern.exec(text)) !== null) {
    toolCalls.push({
      type: 'search',
      query: match[1].trim(),
      rawMatch: match[0],
    });
  }

  // Pattern 2: <tool>search</tool><query>query text</query>
  const xmlPattern = /<tool>search<\/tool>\s*<query>([^<]+)<\/query>/gi;
  while ((match = xmlPattern.exec(text)) !== null) {
    toolCalls.push({
      type: 'search',
      query: match[1].trim(),
      rawMatch: match[0],
    });
  }

  // Pattern 3: SEARCH(query text)
  const functionPattern = /SEARCH\(([^)]+)\)/gi;
  while ((match = functionPattern.exec(text)) !== null) {
    toolCalls.push({
      type: 'search',
      query: match[1].trim(),
      rawMatch: match[0],
    });
  }

  return toolCalls;
}

/**
 * Execute a tool call
 */
export async function executeToolCall(toolCall: ToolCall): Promise<ToolResult> {
  const settings = loadIntegrationSettings();

  switch (toolCall.type) {
    case 'search':
      if (!settings.webSearch.enabled) {
        return {
          toolCall,
          result: 'Web search is currently disabled. Please enable it in Settings > Integrations.',
          success: false,
        };
      }

      try {
        const searchResponse = await performWebSearch(toolCall.query, settings.webSearch.provider);
        const formattedResults = formatSearchResultsForLLM(searchResponse);

        return {
          toolCall,
          result: formattedResults,
          success: true,
        };
      } catch (error) {
        return {
          toolCall,
          result: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          success: false,
        };
      }

    default:
      return {
        toolCall,
        result: `Unknown tool type: ${toolCall.type}`,
        success: false,
      };
  }
}

/**
 * Execute multiple tool calls in sequence
 */
export async function executeToolCalls(toolCalls: ToolCall[]): Promise<ToolResult[]> {
  const results: ToolResult[] = [];

  for (const toolCall of toolCalls) {
    const result = await executeToolCall(toolCall);
    results.push(result);
  }

  return results;
}

/**
 * Replace tool calls in text with their results
 */
export function replaceToolCallsWithResults(text: string, toolResults: ToolResult[]): string {
  let result = text;

  for (const toolResult of toolResults) {
    // Replace the tool call with a placeholder showing the search happened
    const replacement = `\n\n---\n**🔍 Web Search Executed**\n${toolResult.result}\n---\n\n`;
    result = result.replace(toolResult.toolCall.rawMatch, replacement);
  }

  return result;
}

/**
 * Check if text contains any tool calls
 */
export function hasToolCalls(text: string): boolean {
  return parseToolCalls(text).length > 0;
}

/**
 * Build tool calling instructions for system prompt
 */
export function buildToolInstructions(): string {
  const settings = loadIntegrationSettings();
  const instructions: string[] = [];

  if (settings.webSearch.enabled) {
    instructions.push(`
**Web Search Tool**
When you need to search for current information, news, or facts from the internet, use:
[SEARCH: your search query here]

Example: "To find the latest information, [SEARCH: latest AI developments 2024]"

The search results will be provided to you, and you should use them to answer the user's question.`);
  }

  if (settings.codeExecution.enabled) {
    instructions.push(`
**Code Execution Tool** (coming soon)
You can execute code snippets in: ${settings.codeExecution.allowedLanguages.join(', ')}`);
  }

  if (instructions.length === 0) {
    return '';
  }

  return `\n\n## 🛠️ Available Tools\n\nYou have access to the following tools. Use them when appropriate:\n${instructions.join('\n')}`;
}
