import { useState, useEffect } from 'react';
import { getArtifacts, addArtifact, saveArtifacts } from '../lib/storage';
import type { Artifact } from '../types/app';

export default function ArtifactsView() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newArtifact, setNewArtifact] = useState({
    name: '',
    type: 'document' as Artifact['type'],
    content: '',
  });

  useEffect(() => {
    loadArtifacts();
  }, []);

  const loadArtifacts = () => {
    setArtifacts(getArtifacts());
  };

  const handleCreate = () => {
    if (!newArtifact.name.trim() || !newArtifact.content.trim()) return;

    const artifact: Artifact = {
      id: Date.now().toString(),
      name: newArtifact.name,
      type: newArtifact.type,
      content: newArtifact.content,
      createdAt: Date.now(),
    };

    addArtifact(artifact);
    setNewArtifact({ name: '', type: 'document', content: '' });
    setShowNewForm(false);
    loadArtifacts();
  };

  const handleDelete = (id: string) => {
    const updated = artifacts.filter(a => a.id !== id);
    saveArtifacts(updated);
    loadArtifacts();
  };

  const getTypeIcon = (type: Artifact['type']) => {
    switch (type) {
      case 'code':
        return 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4';
      case 'document':
        return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      case 'image':
        return 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z';
      default:
        return 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#e8e8e8] mb-2">Artifacts</h1>
            <p className="text-[#8a8a8a]">Save and manage generated content</p>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2 bg-accent-orange hover-accent-orange text-white rounded-lg transition-all duration-150 flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Artifact
          </button>
        </div>

        {/* New Artifact Form */}
        {showNewForm && (
          <div className="mb-6 p-6 bg-[#2a2a2a] rounded-xl border border-[#3a3a3a]">
            <h3 className="text-lg font-medium text-[#e8e8e8] mb-4">Create New Artifact</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8a8a8a] mb-2">Name</label>
                <input
                  type="text"
                  value={newArtifact.name}
                  onChange={(e) => setNewArtifact({ ...newArtifact, name: e.target.value })}
                  placeholder="Enter artifact name..."
                  className="w-full bg-[#1a1a1a] text-[#e8e8e8] placeholder-[#6a6a6a] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a8a] mb-2">Type</label>
                <select
                  value={newArtifact.type}
                  onChange={(e) => setNewArtifact({ ...newArtifact, type: e.target.value as Artifact['type'] })}
                  className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                >
                  <option value="document">Document</option>
                  <option value="code">Code</option>
                  <option value="image">Image</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8a8a8a] mb-2">Content</label>
                <textarea
                  value={newArtifact.content}
                  onChange={(e) => setNewArtifact({ ...newArtifact, content: e.target.value })}
                  placeholder="Enter content..."
                  rows={10}
                  className="w-full bg-[#1a1a1a] text-[#e8e8e8] placeholder-[#6a6a6a] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors resize-none font-mono text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-accent-orange hover-accent-orange text-white rounded-lg transition-all duration-150 font-medium"
                >
                  Create Artifact
                </button>
                <button
                  onClick={() => {
                    setShowNewForm(false);
                    setNewArtifact({ name: '', type: 'document', content: '' });
                  }}
                  className="px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e8e8e8] rounded-lg transition-all duration-150"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Artifacts List */}
        {artifacts.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-[#4a4a4a] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-[#6a6a6a] text-lg">No artifacts yet</p>
            <p className="text-[#6a6a6a] text-sm mt-2">Save generated content as artifacts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {artifacts.map((artifact) => (
              <div
                key={artifact.id}
                className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6 hover:border-[#4a4a4a] transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#3a3a3a] flex items-center justify-center">
                      <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getTypeIcon(artifact.type)} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-[#e8e8e8]">{artifact.name}</h3>
                      <p className="text-sm text-[#6a6a6a] capitalize">{artifact.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(artifact.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[#3a3a3a] rounded"
                  >
                    <svg className="w-4 h-4 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4">
                  <pre className="text-sm text-[#e8e8e8] whitespace-pre-wrap font-mono overflow-x-auto custom-scrollbar">
                    {artifact.content}
                  </pre>
                </div>
                <div className="text-xs text-[#6a6a6a]">
                  Created {new Date(artifact.createdAt).toLocaleDateString()} at {new Date(artifact.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
