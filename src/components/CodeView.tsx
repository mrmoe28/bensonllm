import { useState, useEffect } from 'react';
import { getCodeSnippets, addCodeSnippet, saveCodeSnippets } from '../lib/storage';
import type { CodeSnippet } from '../types/app';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css', 'sql', 'bash', 'other'
];

export default function CodeView() {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    name: '',
    language: 'javascript',
    code: '',
  });

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = () => {
    setSnippets(getCodeSnippets());
  };

  const handleCreate = () => {
    if (!newSnippet.name.trim() || !newSnippet.code.trim()) return;

    const snippet: CodeSnippet = {
      id: Date.now().toString(),
      name: newSnippet.name,
      language: newSnippet.language,
      code: newSnippet.code,
      createdAt: Date.now(),
    };

    addCodeSnippet(snippet);
    setNewSnippet({ name: '', language: 'javascript', code: '' });
    setShowNewForm(false);
    loadSnippets();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this code snippet?')) {
      const updated = snippets.filter(s => s.id !== id);
      saveCodeSnippets(updated);
      loadSnippets();
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#e8e8e8] mb-2">Code Snippets</h1>
            <p className="text-[#8a8a8a]">Save and organize your code</p>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2 bg-accent-orange hover-accent-orange text-white rounded-lg transition-all duration-150 flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Snippet
          </button>
        </div>

        {/* New Snippet Form */}
        {showNewForm && (
          <div className="mb-6 p-6 bg-[#2a2a2a] rounded-xl border border-[#3a3a3a]">
            <h3 className="text-lg font-medium text-[#e8e8e8] mb-4">Create New Code Snippet</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8a8a8a] mb-2">Name</label>
                <input
                  type="text"
                  value={newSnippet.name}
                  onChange={(e) => setNewSnippet({ ...newSnippet, name: e.target.value })}
                  placeholder="Enter snippet name..."
                  className="w-full bg-[#1a1a1a] text-[#e8e8e8] placeholder-[#6a6a6a] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a8a] mb-2">Language</label>
                <select
                  value={newSnippet.language}
                  onChange={(e) => setNewSnippet({ ...newSnippet, language: e.target.value })}
                  className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors capitalize"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang} className="capitalize">{lang}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8a8a8a] mb-2">Code</label>
                <textarea
                  value={newSnippet.code}
                  onChange={(e) => setNewSnippet({ ...newSnippet, code: e.target.value })}
                  placeholder="Paste your code here..."
                  rows={15}
                  className="w-full bg-[#1a1a1a] text-[#e8e8e8] placeholder-[#6a6a6a] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors resize-none font-mono text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-accent-orange hover-accent-orange text-white rounded-lg transition-all duration-150 font-medium"
                >
                  Save Snippet
                </button>
                <button
                  onClick={() => {
                    setShowNewForm(false);
                    setNewSnippet({ name: '', language: 'javascript', code: '' });
                  }}
                  className="px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e8e8e8] rounded-lg transition-all duration-150"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Snippets List */}
        {snippets.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-[#4a4a4a] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <p className="text-[#6a6a6a] text-lg">No code snippets yet</p>
            <p className="text-[#6a6a6a] text-sm mt-2">Save your favorite code snippets for quick access</p>
          </div>
        ) : (
          <div className="space-y-4">
            {snippets.map((snippet) => (
              <div
                key={snippet.id}
                className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6 hover:border-[#4a4a4a] transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-[#e8e8e8] mb-1">{snippet.name}</h3>
                    <p className="text-sm text-[#6a6a6a] capitalize">{snippet.language}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(snippet.code)}
                      className="p-2 hover:bg-[#3a3a3a] rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-4 h-4 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(snippet.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[#3a3a3a] rounded"
                    >
                      <svg className="w-4 h-4 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4 overflow-x-auto custom-scrollbar">
                  <pre className="text-sm text-[#e8e8e8] font-mono">
                    <code>{snippet.code}</code>
                  </pre>
                </div>
                <div className="text-xs text-[#6a6a6a]">
                  Created {new Date(snippet.createdAt).toLocaleDateString()} at {new Date(snippet.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
