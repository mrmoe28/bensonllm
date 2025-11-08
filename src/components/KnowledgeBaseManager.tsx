import { useState, useEffect, useRef } from 'react';
import type { KnowledgeDocument } from '../types/app';
import {
  getKnowledgeDocuments,
  deleteKnowledgeDocument,
  updateKnowledgeDocument,
  getTotalKnowledgeSize,
  getKnowledgeByCategory,
  getSkillsKnowledge,
} from '../lib/storage';
import { processFile, processURL, validateFileType, getFileTypeIcon } from '../lib/document-processor';

type KnowledgeFilter = 'all' | 'skills' | 'reference' | 'examples' | 'general';

export default function KnowledgeBaseManager() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [activeFilter, setActiveFilter] = useState<KnowledgeFilter>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    setDocuments(getKnowledgeDocuments());
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!validateFileType(file)) {
        alert(`File type not supported: ${file.name}`);
        continue;
      }

      try {
        setProcessingMessage(`Processing ${file.name}...`);
        const document = await processFile(file);
        const { addKnowledgeDocument } = await import('../lib/storage');
        addKnowledgeDocument(document);
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        alert(`Failed to process ${file.name}: ${error}`);
      }
    }

    setIsProcessing(false);
    setProcessingMessage('');
    loadDocuments();

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleURLSubmit = async () => {
    if (!urlInput.trim()) return;

    setIsProcessing(true);
    setProcessingMessage('Fetching URL content...');

    try {
      const document = await processURL(urlInput);
      const { addKnowledgeDocument } = await import('../lib/storage');
      addKnowledgeDocument(document);
      setUrlInput('');
      loadDocuments();
    } catch (error) {
      console.error('Failed to process URL:', error);
      alert(`Failed to process URL: ${error}`);
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleDelete = (id: string) => {
    deleteKnowledgeDocument(id);
    loadDocuments();
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
    }
  };

  const handleAddTag = (id: string, tag: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc && tag.trim()) {
      const newTags = [...doc.metadata.tags, tag.trim()];
      updateKnowledgeDocument(id, {
        metadata: { ...doc.metadata, tags: newTags }
      });
      loadDocuments();
    }
  };

  // Apply category filter first
  let filteredByCategory = documents;
  if (activeFilter !== 'all') {
    filteredByCategory = documents.filter(doc => doc.category === activeFilter);
  }

  // Then apply search query
  const filteredDocuments = filteredByCategory.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCategoryChange = (id: string, category: KnowledgeDocument['category']) => {
    updateKnowledgeDocument(id, { category });
    loadDocuments();
  };

  const handlePriorityChange = (id: string, priority: KnowledgeDocument['priority']) => {
    updateKnowledgeDocument(id, { priority });
    loadDocuments();
  };

  const getCategoryIcon = (category?: KnowledgeDocument['category']) => {
    switch (category) {
      case 'skills':
        return '🎯';
      case 'reference':
        return '📚';
      case 'examples':
        return '💡';
      default:
        return '📄';
    }
  };

  const getCategoryColor = (category?: KnowledgeDocument['category']) => {
    switch (category) {
      case 'skills':
        return 'bg-accent-orange/20 text-accent-orange border-accent-orange/30';
      case 'reference':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'examples':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-[#3a3a3a] text-[#8a8a8a] border-[#3a3a3a]';
    }
  };

  const skillsCount = documents.filter(d => d.category === 'skills').length;
  const referenceCount = documents.filter(d => d.category === 'reference').length;
  const examplesCount = documents.filter(d => d.category === 'examples').length;

  const totalSize = getTotalKnowledgeSize();
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#e8e8e8]">Knowledge Base</h3>
          <p className="text-sm text-[#8a8a8a]">
            {documents.length} document{documents.length !== 1 ? 's' : ''} • {formatBytes(totalSize)}
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-4">
          <label className="block text-sm text-[#e8e8e8] mb-2">Upload Files</label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            accept=".pdf,.png,.jpg,.jpeg,.txt,.md,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full px-4 py-2 bg-accent-orange hover-accent-orange text-white rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Files
          </button>
          <p className="text-xs text-[#6a6a6a] mt-2">PDF, Images, Text, Markdown, DOCX</p>
        </div>

        <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-4">
          <label className="block text-sm text-[#e8e8e8] mb-2">Add from URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleURLSubmit()}
              placeholder="https://example.com/article"
              disabled={isProcessing}
              className="flex-1 bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-3 py-2 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors text-sm"
            />
            <button
              onClick={handleURLSubmit}
              disabled={isProcessing || !urlInput.trim()}
              className="px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e8e8e8] rounded-lg transition-all disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-blue-400 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {processingMessage}
        </div>
      )}

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all text-sm font-medium border ${
            activeFilter === 'all'
              ? 'bg-accent-orange text-white border-accent-orange'
              : 'bg-[#2a2a2a] text-[#8a8a8a] border-[#3a3a3a] hover:border-[#4a4a4a]'
          }`}
        >
          All ({documents.length})
        </button>
        <button
          onClick={() => setActiveFilter('skills')}
          className={`px-4 py-2 rounded-lg transition-all text-sm font-medium border flex items-center gap-2 ${
            activeFilter === 'skills'
              ? 'bg-accent-orange text-white border-accent-orange'
              : 'bg-[#2a2a2a] text-[#8a8a8a] border-[#3a3a3a] hover:border-accent-orange/50'
          }`}
        >
          <span>🎯</span> Skills ({skillsCount})
        </button>
        <button
          onClick={() => setActiveFilter('reference')}
          className={`px-4 py-2 rounded-lg transition-all text-sm font-medium border flex items-center gap-2 ${
            activeFilter === 'reference'
              ? 'bg-accent-orange text-white border-accent-orange'
              : 'bg-[#2a2a2a] text-[#8a8a8a] border-[#3a3a3a] hover:border-blue-500/50'
          }`}
        >
          <span>📚</span> Reference ({referenceCount})
        </button>
        <button
          onClick={() => setActiveFilter('examples')}
          className={`px-4 py-2 rounded-lg transition-all text-sm font-medium border flex items-center gap-2 ${
            activeFilter === 'examples'
              ? 'bg-accent-orange text-white border-accent-orange'
              : 'bg-[#2a2a2a] text-[#8a8a8a] border-[#3a3a3a] hover:border-green-500/50'
          }`}
        >
          <span>💡</span> Examples ({examplesCount})
        </button>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents..."
          className="w-full bg-[#2a2a2a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
        />
      </div>

      {/* Documents List */}
      <div className="space-y-2">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12 text-[#6a6a6a]">
            {searchQuery ? 'No documents match your search' : 'No documents yet. Upload files or add URLs to get started.'}
          </div>
        ) : (
          filteredDocuments.map(doc => (
            <div
              key={doc.id}
              className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-4 hover:border-[#4a4a4a] transition-all cursor-pointer"
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getFileTypeIcon(doc.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[#e8e8e8] font-medium">{doc.name}</h4>
                        <span className="text-lg">{getCategoryIcon(doc.category)}</span>
                      </div>
                      <p className="text-xs text-[#6a6a6a]">
                        {doc.type.toUpperCase()} • {formatBytes(doc.metadata.size)}
                        {doc.metadata.pageCount && ` • ${doc.metadata.pageCount} pages`}
                        {doc.metadata.ocrProcessed && ' • OCR Processed'}
                      </p>
                    </div>
                  </div>

                  {/* Category and Priority Controls */}
                  <div className="flex items-center gap-2 mb-2">
                    <select
                      value={doc.category || 'general'}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCategoryChange(doc.id, e.target.value as KnowledgeDocument['category']);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-xs px-2 py-1 rounded border ${getCategoryColor(doc.category)}`}
                    >
                      <option value="general">General</option>
                      <option value="skills">Skills</option>
                      <option value="reference">Reference</option>
                      <option value="examples">Examples</option>
                    </select>
                    <select
                      value={doc.priority || 'medium'}
                      onChange={(e) => {
                        e.stopPropagation();
                        handlePriorityChange(doc.id, e.target.value as KnowledgeDocument['priority']);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-2 py-1 rounded bg-[#3a3a3a] text-[#e8e8e8] border border-[#4a4a4a]"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <p className="text-sm text-[#8a8a8a] line-clamp-2">
                    {doc.content.substring(0, 150)}...
                  </p>
                  {doc.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.metadata.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-[#3a3a3a] text-xs text-[#e8e8e8] rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc.id);
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDoc(null)}>
          <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] max-w-4xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[#3a3a3a] flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#e8e8e8]">{selectedDoc.name}</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-[#8a8a8a] hover:text-[#e8e8e8] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <pre className="whitespace-pre-wrap text-sm text-[#e8e8e8] font-mono">{selectedDoc.content}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
