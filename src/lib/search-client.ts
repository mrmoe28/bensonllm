// Brave Search API Client
// Free tier: 2000 queries/month

export interface SearchResult {
  title: string;
  url: string;
  description: string;
  content?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  timestamp: number;
}

// Get search API key from environment
function getSearchConfig() {
  const apiKey = import.meta.env.VITE_BRAVE_SEARCH_KEY || '';
  return { apiKey };
}

// Check if search is configured
export function isSearchConfigured(): boolean {
  const { apiKey } = getSearchConfig();
  return !!(apiKey && apiKey !== 'your-api-key-here');
}

// Search the web using Brave Search API
export async function searchWeb(query: string, maxResults: number = 5): Promise<SearchResponse> {
  const { apiKey } = getSearchConfig();

  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('Brave Search API key not configured. Please add VITE_BRAVE_SEARCH_KEY to your .env file');
  }

  try {
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brave Search API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Parse Brave Search response
    const results: SearchResult[] = (data.web?.results || []).map((result: any) => ({
      title: result.title || 'Untitled',
      url: result.url || '',
      description: result.description || '',
    }));

    return {
      query,
      results,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

// Fetch and extract content from a URL
export async function fetchUrlContent(url: string): Promise<string> {
  try {
    // Use a CORS proxy for client-side fetching
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const data = await response.json();
    const html = data.contents;

    // Basic text extraction (remove HTML tags)
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit to first 2000 characters
    return text.substring(0, 2000);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return '';
  }
}

// Search and fetch content from top results
export async function searchAndFetchContent(
  query: string,
  numResults: number = 5,
  fetchContent: boolean = false
): Promise<SearchResponse> {
  const searchResponse = await searchWeb(query, numResults);

  if (fetchContent) {
    // Fetch content from top results in parallel
    const contentPromises = searchResponse.results.slice(0, 3).map(async (result) => {
      try {
        const content = await fetchUrlContent(result.url);
        return { ...result, content };
      } catch {
        return result;
      }
    });

    const resultsWithContent = await Promise.all(contentPromises);

    // Merge with remaining results
    searchResponse.results = [
      ...resultsWithContent,
      ...searchResponse.results.slice(3),
    ];
  }

  return searchResponse;
}

// Format search results for LLM context
export function formatSearchResultsForLLM(searchResponse: SearchResponse): string {
  const { query, results } = searchResponse;

  let formatted = `# Web Search Results for: "${query}"\n\n`;
  formatted += `Found ${results.length} sources:\n\n`;

  results.forEach((result, index) => {
    formatted += `## Source ${index + 1}: ${result.title}\n`;
    formatted += `URL: ${result.url}\n`;
    formatted += `Summary: ${result.description}\n`;

    if (result.content) {
      formatted += `\nContent Preview:\n${result.content}\n`;
    }

    formatted += '\n---\n\n';
  });

  return formatted;
}
