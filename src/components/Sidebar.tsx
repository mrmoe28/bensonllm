import { useState, useEffect } from 'react';
import { getChatHistory, toggleChatStar, deleteChatFromHistory, getProjects, getChatsWithoutProject, getChatsByProject, deleteProject } from '../lib/storage';
import type { ChatHistory, ViewType, Project } from '../types/app';

interface SidebarProps {
  onNewChat: () => void;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLoadChat?: (chat: ChatHistory) => void;
}

export default function Sidebar({ onNewChat, onViewChange, onLoadChat }: SidebarProps) {
  const [isChatsOpen, setIsChatsOpen] = useState(true);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isArtifactsOpen, setIsArtifactsOpen] = useState(false);
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [isStarredOpen, setIsStarredOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    loadData();

    // Refresh data every 3 seconds to catch new chats/projects
    const interval = setInterval(() => {
      loadData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setChatHistory(getChatHistory());
    setProjects(getProjects());
  };

  const toggleProjectExpanded = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const standaloneChats = getChatsWithoutProject();
  const starredChats = chatHistory.filter(chat => chat.starred && !chat.projectId);
  const recentStandaloneChats = standaloneChats.filter(chat => !chat.starred).slice(0, 20);

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleChatStar(id);
    loadData();
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChatFromHistory(id);
    loadData();
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="w-60 bg-[#0d0d0d] border-r border-[#2a2a2a] flex flex-col h-screen">
      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-orange hover-accent-orange text-white rounded-lg transition-all duration-150 font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Main Navigation Sections */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Chats Section */}
        <div className="px-2 mt-2">
          <button
            onClick={() => {
              setIsChatsOpen(!isChatsOpen);
              if (!isChatsOpen) onViewChange('chats');
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#8a8a8a] hover:text-[#e8e8e8] transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="font-semibold uppercase tracking-wider">Chats</span>
            </div>
            <svg
              className={`w-3 h-3 transition-transform ${isChatsOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {isChatsOpen && (
            <div className="mt-2 space-y-4">
              {/* Starred Subsection */}
              <div>
                <button
                  onClick={() => setIsStarredOpen(!isStarredOpen)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#6a6a6a] hover:text-[#8a8a8a] transition-colors"
                >
                  <span className="font-medium uppercase tracking-wider">Starred</span>
                  <svg
                    className={`w-3 h-3 transition-transform ${isStarredOpen ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {isStarredOpen && (
                  <div className="mt-1 space-y-0.5">
                    {starredChats.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-[#6a6a6a]">No starred chats</div>
                    ) : (
                      starredChats.map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => onLoadChat?.(chat)}
                          className="w-full flex items-start justify-between px-3 py-2 rounded-md text-sm text-[#8a8a8a] hover:bg-[#1f1f1f] hover:text-[#e8e8e8] transition-all duration-150 group"
                        >
                          <div className="flex-1 text-left truncate">
                            <div className="truncate">{chat.title}</div>
                            <div className="text-xs text-[#6a6a6a] mt-0.5">{getTimeAgo(chat.timestamp)}</div>
                          </div>
                          <button
                            onClick={(e) => handleToggleStar(chat.id, e)}
                            className="flex-shrink-0 ml-2 opacity-100 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </button>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Projects with Chats */}
              {projects.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs text-[#6a6a6a] font-medium uppercase tracking-wider">
                    Projects
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {projects.map((project) => {
                      const projectChats = getChatsByProject(project.id);
                      return (
                        <div key={project.id}>
                          <button
                            onClick={() => toggleProjectExpanded(project.id)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-[#8a8a8a] hover:bg-[#1f1f1f] hover:text-[#e8e8e8] transition-all duration-150"
                          >
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              <span className="truncate">{project.name}</span>
                              <span className="text-xs text-[#6a6a6a]">({projectChats.length})</span>
                            </div>
                            <svg
                              className={`w-3 h-3 transition-transform ${expandedProjects.has(project.id) ? 'rotate-90' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          {expandedProjects.has(project.id) && (
                            <div className="ml-4 space-y-0.5 mt-1">
                              {projectChats.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-[#6a6a6a]">No chats</div>
                              ) : (
                                projectChats.map((chat) => (
                                  <button
                                    key={chat.id}
                                    onClick={() => onLoadChat?.(chat)}
                                    className="w-full flex items-start justify-between px-3 py-2 rounded-md text-sm text-[#8a8a8a] hover:bg-[#1f1f1f] hover:text-[#e8e8e8] transition-all duration-150 group"
                                  >
                                    <div className="flex-1 text-left truncate">
                                      <div className="truncate">{chat.title}</div>
                                      <div className="text-xs text-[#6a6a6a] mt-0.5">{getTimeAgo(chat.timestamp)}</div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                      <button
                                        onClick={(e) => handleToggleStar(chat.id, e)}
                                        className="p-1 hover:bg-[#2a2a2a] rounded"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={(e) => handleDeleteChat(chat.id, e)}
                                        className="p-1 hover:bg-[#2a2a2a] rounded"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Standalone Chats */}
              <div>
                <div className="px-3 py-1.5 text-xs text-[#6a6a6a] font-medium uppercase tracking-wider">
                  Recent
                </div>
                <div className="mt-1 space-y-0.5">
                  {recentStandaloneChats.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-[#6a6a6a]">No recent chats</div>
                  ) : (
                    recentStandaloneChats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => onLoadChat?.(chat)}
                        className="w-full flex items-start justify-between px-3 py-2 rounded-md text-sm text-[#8a8a8a] hover:bg-[#1f1f1f] hover:text-[#e8e8e8] transition-all duration-150 group"
                      >
                        <div className="flex-1 text-left truncate">
                          <div className="truncate">{chat.title}</div>
                          <div className="text-xs text-[#6a6a6a] mt-0.5">{getTimeAgo(chat.timestamp)}</div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                          <button
                            onClick={(e) => handleToggleStar(chat.id, e)}
                            className="p-1 hover:bg-[#2a2a2a] rounded"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            className="p-1 hover:bg-[#2a2a2a] rounded"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className="px-2 mt-4">
          <div className="flex items-center justify-between px-3 py-1.5">
            <button
              onClick={() => {
                setIsProjectsOpen(!isProjectsOpen);
                if (!isProjectsOpen) onViewChange('projects');
              }}
              className="flex items-center gap-2 text-xs text-[#8a8a8a] hover:text-[#e8e8e8] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="font-semibold uppercase tracking-wider">Projects</span>
              <svg
                className={`w-3 h-3 transition-transform ${isProjectsOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => onViewChange('projects')}
              className="p-1 hover:bg-[#2a2a2a] rounded transition-colors"
              title="New Project"
            >
              <svg className="w-4 h-4 text-[#8a8a8a] hover:text-accent-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          {isProjectsOpen && projects.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {projects.map((project) => (
                <div key={project.id} className="relative group">
                  <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#1f1f1f] transition-all">
                    <button
                      onClick={() => onViewChange('projects')}
                      className="flex-1 flex items-center gap-2 text-sm text-[#8a8a8a] hover:text-[#e8e8e8]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="truncate">{project.name}</span>
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectMenuOpen(projectMenuOpen === project.id ? null : project.id);
                        }}
                        className="p-1 hover:bg-[#2a2a2a] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                      {projectMenuOpen === project.id && (
                        <div className="absolute right-0 top-full mt-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl overflow-hidden z-50 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(project.id);
                              loadData();
                              setProjectMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#3a3a3a] transition-colors text-left text-sm text-red-400"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {isProjectsOpen && projects.length === 0 && (
            <div className="mt-1 px-3 py-2 text-sm text-[#6a6a6a]">
              No projects yet
            </div>
          )}
        </div>

        {/* Artifacts Section */}
        <div className="px-2 mt-4">
          <button
            onClick={() => {
              setIsArtifactsOpen(!isArtifactsOpen);
              if (!isArtifactsOpen) onViewChange('artifacts');
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#8a8a8a] hover:text-[#e8e8e8] transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="font-semibold uppercase tracking-wider">Artifacts</span>
            </div>
            <svg
              className={`w-3 h-3 transition-transform ${isArtifactsOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {isArtifactsOpen && (
            <div className="mt-1 px-3 py-2 text-sm text-[#6a6a6a]">
              No artifacts yet
            </div>
          )}
        </div>

        {/* Code Section */}
        <div className="px-2 mt-4">
          <button
            onClick={() => {
              setIsCodeOpen(!isCodeOpen);
              if (!isCodeOpen) onViewChange('code');
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#8a8a8a] hover:text-[#e8e8e8] transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="font-semibold uppercase tracking-wider">Code</span>
            </div>
            <svg
              className={`w-3 h-3 transition-transform ${isCodeOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {isCodeOpen && (
            <div className="mt-1 px-3 py-2 text-sm text-[#6a6a6a]">
              No code snippets yet
            </div>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t border-[#2a2a2a] p-3 relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1f1f1f] transition-all duration-150 group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
            U
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-[#e8e8e8]">User</div>
          </div>
          <svg
            className={`w-4 h-4 text-[#6a6a6a] transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl overflow-hidden">
            <button
              onClick={() => {
                onViewChange('settings');
                setShowUserMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#3a3a3a] transition-colors text-left"
            >
              <svg className="w-4 h-4 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-[#e8e8e8]">Settings</span>
            </button>
            <button
              onClick={() => {
                onViewChange('profile');
                setShowUserMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#3a3a3a] transition-colors text-left"
            >
              <svg className="w-4 h-4 text-[#8a8a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm text-[#e8e8e8]">Profile</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
