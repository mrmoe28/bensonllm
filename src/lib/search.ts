export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  timestamp: number;
}

/**
 * Search the web using DuckDuckGo HTML endpoint
 */
export async function searchDuckDuckGo(query: string, maxResults: number = 5): Promise<SearchResponse> {
  try {
    // Use DuckDuckGo HTML endpoint with CORS proxy
    const proxyUrl = 'https://corsproxy.io/?';
    const searchUrl = `${proxyUrl}${encodeURIComponent(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`)}`;

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const html = await response.text();
    const results = parseSearchResults(html, maxResults);

    return {
      query,
      results,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('DuckDuckGo search failed:', error);
    // Fallback to a simpler method or return empty results
    return {
      query,
      results: [],
      timestamp: Date.now(),
    };
  }
}

/**
 * Parse search results from DuckDuckGo HTML
 */
function parseSearchResults(html: string, maxResults: number): SearchResult[] {
  const results: SearchResult[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // DuckDuckGo HTML result selectors
  const resultElements = doc.querySelectorAll('.result');

  for (let i = 0; i < Math.min(resultElements.length, maxResults); i++) {
    const element = resultElements[i];

    const titleElement = element.querySelector('.result__a');
    const snippetElement = element.querySelector('.result__snippet');
    const urlElement = element.querySelector('.result__url');

    if (titleElement && snippetElement) {
      results.push({
        title: titleElement.textContent?.trim() || '',
        url: urlElement?.textContent?.trim() || titleElement.getAttribute('href') || '',
        snippet: snippetElement.textContent?.trim() || '',
      });
    }
  }

  return results;
}

/**
 * Alternative: Use DuckDuckGo Instant Answer API (simpler but less comprehensive)
 */
export async function searchDuckDuckGoInstant(query: string): Promise<SearchResponse> {
  try {
    const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();

    const results: SearchResult[] = [];

    // Abstract (direct answer)
    if (data.Abstract) {
      results.push({
        title: data.Heading || 'Direct Answer',
        url: data.AbstractURL || '',
        snippet: data.Abstract,
      });
    }

    // Related Topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, 4).forEach((topic: any) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 60),
            url: topic.FirstURL,
            snippet: topic.Text,
          });
        }
      });
    }

    return {
      query,
      results,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('DuckDuckGo Instant API failed:', error);
    return {
      query,
      results: [],
      timestamp: Date.now(),
    };
  }
}

/**
 * Unified search function that tries multiple methods
 */
export async function performWebSearch(
  query: string,
  provider: 'duckduckgo' | 'google' | 'bing' | 'brave' = 'duckduckgo'
): Promise<SearchResponse> {
  // For now, only DuckDuckGo is implemented
  // Try Instant API first (faster, no CORS issues)
  let response = await searchDuckDuckGoInstant(query);

  // If no results, try HTML scraping
  if (response.results.length === 0) {
    response = await searchDuckDuckGo(query);
  }

  return response;
}

/**
 * Format search results for LLM consumption
 */
export function formatSearchResultsForLLM(searchResponse: SearchResponse): string {
  if (searchResponse.results.length === 0) {
    return `No search results found for: "${searchResponse.query}"`;
  }

  const formattedResults = searchResponse.results
    .map((result, index) => {
      return `[${index + 1}] ${result.title}\n   ${result.snippet}\n   Source: ${result.url}`;
    })
    .join('\n\n');

  return `Web Search Results for: "${searchResponse.query}"\n\n${formattedResults}`;
}
