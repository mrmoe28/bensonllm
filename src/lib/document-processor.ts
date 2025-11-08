import type { KnowledgeDocument } from '../types/app';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function processPDF(file: File): Promise<KnowledgeDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    const pageCount = pdf.numPages;

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return {
      id: generateId(),
      name: file.name,
      type: 'pdf',
      content: fullText.trim(),
      rawContent: fullText.trim(),
      metadata: {
        size: file.size,
        pageCount: pageCount,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [],
      },
    };
  } catch (error) {
    throw new Error(`Failed to process PDF: ${error}`);
  }
}

export async function processImage(file: File): Promise<KnowledgeDocument> {
  try {
    const worker = await createWorker('eng');

    const imageUrl = URL.createObjectURL(file);
    const { data: { text } } = await worker.recognize(imageUrl);

    await worker.terminate();
    URL.revokeObjectURL(imageUrl);

    return {
      id: generateId(),
      name: file.name,
      type: 'image',
      content: text.trim(),
      rawContent: text.trim(),
      metadata: {
        size: file.size,
        ocrProcessed: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [],
      },
    };
  } catch (error) {
    throw new Error(`Failed to process image: ${error}`);
  }
}

export async function processTextFile(file: File): Promise<KnowledgeDocument> {
  try {
    const text = await file.text();
    const isMarkdown = file.name.endsWith('.md') || file.name.endsWith('.markdown');

    return {
      id: generateId(),
      name: file.name,
      type: isMarkdown ? 'markdown' : 'text',
      content: text.trim(),
      rawContent: text.trim(),
      metadata: {
        size: file.size,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [],
      },
    };
  } catch (error) {
    throw new Error(`Failed to process text file: ${error}`);
  }
}

export async function processDocx(file: File): Promise<KnowledgeDocument> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    return {
      id: generateId(),
      name: file.name,
      type: 'docx',
      content: result.value.trim(),
      rawContent: result.value.trim(),
      metadata: {
        size: file.size,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [],
      },
    };
  } catch (error) {
    throw new Error(`Failed to process DOCX: ${error}`);
  }
}

export async function processURL(url: string): Promise<KnowledgeDocument> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const cheerio = await import('cheerio');
    const $ = cheerio.load(html);

    $('script, style, nav, footer, iframe').remove();

    const title = $('title').text() || new URL(url).hostname;
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

    const content = `# ${title}\n\nSource: ${url}\n\n${bodyText}`;

    return {
      id: generateId(),
      name: title,
      type: 'url',
      content: content,
      rawContent: html,
      url: url,
      metadata: {
        size: content.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [],
      },
    };
  } catch (error) {
    throw new Error(`Failed to process URL: ${error}`);
  }
}

export async function processFile(file: File): Promise<KnowledgeDocument> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return processPDF(file);
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'bmp':
    case 'tiff':
      return processImage(file);
    case 'docx':
      return processDocx(file);
    case 'txt':
    case 'md':
    case 'markdown':
      return processTextFile(file);
    default:
      return processTextFile(file);
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function validateFileType(file: File): boolean {
  const validExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'txt', 'md', 'markdown', 'docx'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension ? validExtensions.includes(extension) : false;
}

export function getFileTypeIcon(type: KnowledgeDocument['type']): string {
  switch (type) {
    case 'pdf':
      return '📄';
    case 'image':
      return '🖼️';
    case 'text':
    case 'markdown':
      return '📝';
    case 'docx':
      return '📘';
    case 'url':
      return '🌐';
    default:
      return '📎';
  }
}
