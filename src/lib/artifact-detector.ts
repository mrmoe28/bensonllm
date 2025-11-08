import type { LiveArtifact, ArtifactLanguage } from '../types/app';

/**
 * Detects code blocks in markdown-formatted messages
 * Handles both complete and incomplete (streaming) code blocks
 */
export function detectCodeBlocks(content: string): Array<{ language: string; code: string; startIndex: number }> {
  const blocks: Array<{ language: string; code: string; startIndex: number }> = [];

  // Complete code blocks (closed with ```)
  const completeRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  while ((match = completeRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim(),
      startIndex: match.index
    });
  }

  // Incomplete code blocks (not yet closed - for streaming)
  if (blocks.length === 0 || content.lastIndexOf('```') > content.lastIndexOf('```', content.length - 4)) {
    const incompleteRegex = /```(\w+)?\n([\s\S]*)$/;
    const incompleteMatch = content.match(incompleteRegex);
    if (incompleteMatch && incompleteMatch[2]) {
      blocks.push({
        language: incompleteMatch[1] || 'text',
        code: incompleteMatch[2].trim(),
        startIndex: content.indexOf(incompleteMatch[0])
      });
    }
  }

  return blocks;
}

/**
 * Determines if a code block should be rendered as an interactive artifact
 */
export function isRenderableArtifact(language: string, code: string): boolean {
  const renderableLanguages = ['html', 'svg', 'react', 'jsx', 'tsx', 'vue', 'svelte', 'javascript', 'js'];
  const lang = language.toLowerCase();

  // Check if language is renderable
  if (renderableLanguages.includes(lang)) {
    return true;
  }

  // Check if HTML-like content even without language tag
  if (lang === 'xml' || lang === 'markup') {
    return true;
  }

  // Check for HTML patterns in unmarked code blocks
  if (!language || language === 'text') {
    const htmlPattern = /<(!DOCTYPE|html|div|span|p|h[1-6]|svg|body|head|button|input|canvas)/i;
    return htmlPattern.test(code);
  }

  return false;
}

/**
 * Normalizes language identifier to standard ArtifactLanguage type
 */
export function normalizeLanguage(language: string): ArtifactLanguage {
  const lang = language.toLowerCase();

  switch (lang) {
    case 'html':
    case 'htm':
      return 'html';
    case 'react':
    case 'jsx':
    case 'tsx':
      return 'react';
    case 'svg':
    case 'xml':
      return 'svg';
    case 'javascript':
    case 'js':
      return 'javascript';
    case 'typescript':
    case 'ts':
      return 'typescript';
    case 'css':
    case 'scss':
    case 'sass':
      return 'css';
    case 'python':
    case 'py':
      return 'python';
    default:
      return 'other';
  }
}

/**
 * Generates a title for the artifact based on content
 */
export function generateArtifactTitle(code: string, language: ArtifactLanguage): string {
  // Try to extract title from HTML title tag
  const titleMatch = code.match(/<title>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }

  // Try to extract from h1
  const h1Match = code.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    const cleanTitle = h1Match[1].replace(/<[^>]*>/g, '').trim();
    if (cleanTitle.length > 0) {
      return cleanTitle;
    }
  }

  // Try to extract from SVG title
  const svgTitleMatch = code.match(/<title[^>]*>(.*?)<\/title>/i);
  if (svgTitleMatch && svgTitleMatch[1]) {
    return svgTitleMatch[1].trim();
  }

  // Default based on language
  switch (language) {
    case 'html':
      return 'HTML Document';
    case 'react':
      return 'React Component';
    case 'svg':
      return 'SVG Graphic';
    case 'javascript':
      return 'JavaScript Code';
    case 'css':
      return 'CSS Styles';
    default:
      return 'Code Artifact';
  }
}

/**
 * Wraps React/JSX code in a full HTML document for preview
 */
export function wrapReactCode(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}

    // Auto-render if there's a default export or App component
    const root = ReactDOM.createRoot(document.getElementById('root'));
    if (typeof App !== 'undefined') {
      root.render(<App />);
    }
  </script>
</body>
</html>`;
}

/**
 * Wraps SVG code in a full HTML document for preview
 */
export function wrapSVGCode(code: string): string {
  // If already a complete SVG, wrap in basic HTML
  if (code.trim().startsWith('<svg')) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SVG Preview</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
    }
    svg {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;
  }

  return code;
}

/**
 * Wraps JavaScript code in a full HTML document with common libraries
 */
export function wrapJavaScriptCode(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JavaScript Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    ${code}
  </script>
</body>
</html>`;
}

/**
 * Prepares code for rendering in iframe based on language
 */
export function prepareCodeForRendering(code: string, language: ArtifactLanguage): string {
  switch (language) {
    case 'react':
      return wrapReactCode(code);
    case 'svg':
      return wrapSVGCode(code);
    case 'javascript':
      return wrapJavaScriptCode(code);
    case 'html':
      // If it's a complete HTML document, return as-is
      if (code.trim().toLowerCase().startsWith('<!doctype') ||
          code.trim().toLowerCase().startsWith('<html')) {
        return code;
      }
      // Otherwise, wrap in basic HTML structure with Tailwind CSS
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
    }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;
    default:
      return code;
  }
}

/**
 * Creates a LiveArtifact from detected code block
 */
export function createLiveArtifact(code: string, language: string): LiveArtifact {
  const normalizedLang = normalizeLanguage(language);
  const isRenderable = isRenderableArtifact(language, code);
  const title = generateArtifactTitle(code, normalizedLang);
  const timestamp = Date.now();

  return {
    id: `artifact-${timestamp}`,
    title,
    language: normalizedLang,
    content: code,
    createdAt: timestamp,
    updatedAt: timestamp,
    versions: [{
      id: `version-${timestamp}`,
      content: code,
      timestamp,
      language: normalizedLang
    }],
    currentVersionIndex: 0,
    isRenderable
  };
}

/**
 * Extracts the most recent renderable artifact from a message
 */
export function extractLatestArtifact(messageContent: string): LiveArtifact | null {
  const codeBlocks = detectCodeBlocks(messageContent);

  // Find the last renderable code block
  for (let i = codeBlocks.length - 1; i >= 0; i--) {
    const block = codeBlocks[i];
    if (isRenderableArtifact(block.language, block.code)) {
      return createLiveArtifact(block.code, block.language);
    }
  }

  return null;
}
