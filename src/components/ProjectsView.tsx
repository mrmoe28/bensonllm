import { useState, useEffect } from 'react';
import { getProjects, addProject, deleteProject, updateProject } from '../lib/storage';
import type { Project, Folder } from '../types/app';

interface ProjectsViewProps {
  onProjectCreated?: (projectId: string) => void;
}

export default function ProjectsView({ onProjectCreated }: ProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showNewFolderForm, setShowNewFolderForm] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [newFolder, setNewFolder] = useState({ name: '' });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    setProjects(getProjects());
  };

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      createdAt: Date.now(),
      folders: [],
    };

    addProject(project);
    setNewProject({ name: '', description: '' });
    setShowNewProjectForm(false);
    loadProjects();

    // Notify parent that project was created and start a new chat for it
    if (onProjectCreated) {
      onProjectCreated(project.id);
    }
  };

  const handleCreateFolder = (projectId: string) => {
    if (!newFolder.name.trim()) return;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const folder: Folder = {
      id: Date.now().toString(),
      name: newFolder.name,
      projectId,
      createdAt: Date.now(),
    };

    const updatedFolders = [...project.folders, folder];
    updateProject(projectId, { folders: updatedFolders });
    setNewFolder({ name: '' });
    setShowNewFolderForm(null);
    loadProjects();
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    loadProjects();
  };

  const handleDeleteFolder = (projectId: string, folderId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedFolders = project.folders.filter(f => f.id !== folderId);
    updateProject(projectId, { folders: updatedFolders });
    loadProjects();
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#e8e8e8] mb-2">Projects</h1>
            <p className="text-[#8a8a8a]">Organize your work into projects and folders</p>
          </div>
          <button
            onClick={() => setShowNewProjectForm(true)}
            className="px-4 py-2 bg-accent-orange hover-accent-orange text-white rounded-lg transition-all duration-150 flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {/* New Project Form */}
        {showNewProjectForm && (
          <div className="mb-6 p-6 bg-[#2a2a2a] rounded-xl border border-[#3a3a3a]">
            <h3 className="text-lg font-medium text-[#e8e8e8] mb-4">Create New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8a8a8a] mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Enter project name..."
                  className="w-full bg-[#1a1a1a] text-[#e8e8e8] placeholder-[#6a6a6a] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a8a] mb-2">Description (optional)</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Enter project description..."
                  rows={3}
                  className="w-full bg-[#1a1a1a] text-[#e8e8e8] placeholder-[#6a6a6a] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateProject}
                  className="px-4 py-2 bg-accent-orange hover-accent-orange text-white rounded-lg transition-all duration-150 font-medium"
                >
                  Create Project
                </button>
                <button
                  onClick={() => {
                    setShowNewProjectForm(false);
                    setNewProject({ name: '', description: '' });
                  }}
                  className="px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e8e8e8] rounded-lg transition-all duration-150"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-[#4a4a4a] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-[#6a6a6a] text-lg">No projects yet</p>
            <p className="text-[#6a6a6a] text-sm mt-2">Create your first project to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6 hover:border-[#4a4a4a] transition-colors group"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-[#e8e8e8] mb-1">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-[#8a8a8a] line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#3a3a3a] rounded"
                  >
                    <svg className="w-4 h-4 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Folders */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6a6a6a] uppercase tracking-wider">Folders ({project.folders.length})</span>
                    <button
                      onClick={() => setShowNewFolderForm(project.id)}
                      className="text-xs text-accent-orange hover:text-[#ff7d52] transition-colors"
                    >
                      + Add Folder
                    </button>
                  </div>

                  {showNewFolderForm === project.id && (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newFolder.name}
                        onChange={(e) => setNewFolder({ name: e.target.value })}
                        placeholder="Folder name..."
                        className="flex-1 bg-[#1a1a1a] text-[#e8e8e8] placeholder-[#6a6a6a] rounded px-3 py-1.5 text-sm border border-[#3a3a3a] focus:outline-none focus:border-accent-orange"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateFolder(project.id);
                          if (e.key === 'Escape') {
                            setShowNewFolderForm(null);
                            setNewFolder({ name: '' });
                          }
                        }}
                      />
                      <button
                        onClick={() => handleCreateFolder(project.id)}
                        className="px-3 py-1.5 bg-accent-orange hover-accent-orange text-white rounded text-sm"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {project.folders.length === 0 ? (
                    <p className="text-sm text-[#6a6a6a] py-2">No folders yet</p>
                  ) : (
                    <div className="space-y-1">
                      {project.folders.map((folder) => (
                        <div
                          key={folder.id}
                          className="flex items-center justify-between px-3 py-2 bg-[#1a1a1a] rounded group/folder hover:bg-[#222] transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <span className="text-sm text-[#e8e8e8]">{folder.name}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteFolder(project.id, folder.id)}
                            className="opacity-0 group-hover/folder:opacity-100 transition-opacity"
                          >
                            <svg className="w-3.5 h-3.5 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Project Meta */}
                <div className="text-xs text-[#6a6a6a] pt-4 border-t border-[#3a3a3a]">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
