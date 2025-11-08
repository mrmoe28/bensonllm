import { useState, useRef, useEffect } from 'react';
import type { LiveArtifact, PreviewMode } from '../types/app';
import { prepareCodeForRendering } from '../lib/artifact-detector';

interface ArtifactPreviewPanelProps {
  artifact: LiveArtifact | null;
  onClose: () => void;
}

export default function ArtifactPreviewPanel({ artifact, onClose }: ArtifactPreviewPanelProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update current version when artifact changes
  useEffect(() => {
    if (artifact) {
      setCurrentVersionIndex(artifact.currentVersionIndex);
    }
  }, [artifact]);

  if (!artifact) {
    return null;
  }

  const currentVersion = artifact.versions[currentVersionIndex];
  const canShowPreview = artifact.isRenderable && previewMode === 'preview';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentVersion.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentVersion.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreviousVersion = () => {
    if (currentVersionIndex > 0) {
      setCurrentVersionIndex(currentVersionIndex - 1);
    }
  };

  const handleNextVersion = () => {
    if (currentVersionIndex < artifact.versions.length - 1) {
      setCurrentVersionIndex(currentVersionIndex + 1);
    }
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`${
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
      } flex flex-col bg-[#1a1a1a] border-l border-[#3a3a3a] transition-all duration-300`}
      style={{ width: isFullscreen ? '100vw' : '100%' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#3a3a3a] bg-[#2a2a2a]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-[#e8e8e8] truncate">{artifact.title}</h3>
            <p className="text-xs text-[#6a6a6a] capitalize">{currentVersion.language}</p>
          </div>
        </div>

        {/* Version Navigation */}
        {artifact.versions.length > 1 && (
          <div className="flex items-center gap-2 mx-4">
            <button
              onClick={handlePreviousVersion}
              disabled={currentVersionIndex === 0}
              className="p-1 hover:bg-[#3a3a3a] rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous version"
            >
              <svg className="w-4 h-4 text-[#e8e8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs text-[#8a8a8a] min-w-[60px] text-center">
              {currentVersionIndex + 1} / {artifact.versions.length}
            </span>
            <button
              onClick={handleNextVersion}
              disabled={currentVersionIndex === artifact.versions.length - 1}
              className="p-1 hover:bg-[#3a3a3a] rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next version"
            >
              <svg className="w-4 h-4 text-[#e8e8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[#3a3a3a] rounded transition-colors flex-shrink-0"
          title="Close preview"
        >
          <svg className="w-4 h-4 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mode Toggle & Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#3a3a3a] bg-[#1a1a1a]">
        {/* Preview/Code Toggle */}
        <div className="flex items-center gap-1 bg-[#2a2a2a] rounded-lg p-1">
          <button
            onClick={() => setPreviewMode('preview')}
            disabled={!artifact.isRenderable}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              previewMode === 'preview'
                ? 'bg-accent-orange text-white'
                : 'text-[#8a8a8a] hover:text-[#e8e8e8]'
            } ${!artifact.isRenderable ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            Preview
          </button>
          <button
            onClick={() => setPreviewMode('code')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
              previewMode === 'code'
                ? 'bg-accent-orange text-white'
                : 'text-[#8a8a8a] hover:text-[#e8e8e8]'
            }`}
          >
            Code
          </button>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-[#2a2a2a] rounded transition-colors group relative"
            title="Copy code"
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[#8a8a8a] group-hover:text-[#e8e8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="p-2 hover:bg-[#2a2a2a] rounded transition-colors group"
            title="Download"
          >
            <svg className="w-4 h-4 text-[#8a8a8a] group-hover:text-[#e8e8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="p-2 hover:bg-[#2a2a2a] rounded transition-colors group"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4 text-[#8a8a8a] group-hover:text-[#e8e8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[#8a8a8a] group-hover:text-[#e8e8e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {canShowPreview ? (
          <iframe
            ref={iframeRef}
            srcDoc={prepareCodeForRendering(currentVersion.content, currentVersion.language)}
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full bg-white border-0"
            title="Artifact Preview"
          />
        ) : (
          <div className="h-full overflow-auto custom-scrollbar bg-[#1a1a1a] p-4">
            <pre className="text-sm text-[#e8e8e8] font-mono whitespace-pre-wrap break-words">
              <code>{currentVersion.content}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Info Bar */}
      <div className="px-4 py-2 border-t border-[#3a3a3a] bg-[#2a2a2a]">
        <div className="flex items-center justify-between text-xs text-[#6a6a6a]">
          <span>
            Updated {new Date(currentVersion.timestamp).toLocaleTimeString()}
          </span>
          <span>
            {currentVersion.content.length} characters
          </span>
        </div>
      </div>
    </div>
  );
}
