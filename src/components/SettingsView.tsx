import { useState, useEffect } from 'react';
import type { AudioSettings, IntegrationSettings } from '../types/app';
import { loadAudioSettings, saveAudioSettings as saveAudioSettingsToStorage } from '../lib/audio';
import { loadIntegrationSettings, saveIntegrationSettings } from '../lib/integrations';
import { getAvailableVoices } from '../utils/piper-helper';
import KnowledgeBaseManager from './KnowledgeBaseManager';

interface Settings {
  ollamaUrl: string;
  defaultModel: string;
  autoSaveInterval: number;
  messagesFontSize: number;
  showTimestamps: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  ollamaUrl: 'http://localhost:11434',
  defaultModel: 'qwen2.5:1.5b',
  autoSaveInterval: 2000,
  messagesFontSize: 15,
  showTimestamps: true,
};

type SettingsTab = 'connections' | 'integrations' | 'settings' | 'knowledge' | 'audio';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('settings');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(loadAudioSettings());
  const [integrations, setIntegrations] = useState<IntegrationSettings>(loadIntegrationSettings());
  const [saved, setSaved] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [githubUsername, setGithubUsername] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('ollama-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = () => {
    localStorage.setItem('ollama-settings', JSON.stringify(settings));
    saveAudioSettingsToStorage(audioSettings);
    saveIntegrationSettings(integrations);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('ollama-settings');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearAllData = () => {
    localStorage.clear();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      window.location.reload();
    }, 1000);
  };

  const handleGithubConnect = () => {
    if (githubToken && githubUsername) {
      setIntegrations({
        ...integrations,
        github: {
          connected: true,
          token: githubToken,
          username: githubUsername,
        }
      });
      setShowGithubModal(false);
      setGithubToken('');
      setGithubUsername('');
      saveSettings();
    }
  };

  const handleGithubDisconnect = () => {
    setIntegrations({
      ...integrations,
      github: {
        connected: false,
      }
    });
    saveSettings();
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-[1000px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#e8e8e8] mb-2">Settings</h1>
          <p className="text-[#8a8a8a]">Configure your Ollama chat interface</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#3a3a3a] overflow-x-auto">
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-6 py-3 font-medium transition-all duration-150 border-b-2 whitespace-nowrap ${
              activeTab === 'connections'
                ? 'border-accent-orange text-accent-orange'
                : 'border-transparent text-[#8a8a8a] hover:text-[#e8e8e8]'
            }`}
          >
            Connections
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-6 py-3 font-medium transition-all duration-150 border-b-2 whitespace-nowrap ${
              activeTab === 'knowledge'
                ? 'border-accent-orange text-accent-orange'
                : 'border-transparent text-[#8a8a8a] hover:text-[#e8e8e8]'
            }`}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-6 py-3 font-medium transition-all duration-150 border-b-2 whitespace-nowrap ${
              activeTab === 'audio'
                ? 'border-accent-orange text-accent-orange'
                : 'border-transparent text-[#8a8a8a] hover:text-[#e8e8e8]'
            }`}
          >
            Audio
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-6 py-3 font-medium transition-all duration-150 border-b-2 whitespace-nowrap ${
              activeTab === 'integrations'
                ? 'border-accent-orange text-accent-orange'
                : 'border-transparent text-[#8a8a8a] hover:text-[#e8e8e8]'
            }`}
          >
            Integrations
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium transition-all duration-150 border-b-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-accent-orange text-accent-orange'
                : 'border-transparent text-[#8a8a8a] hover:text-[#e8e8e8]'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Save Notification */}
        {saved && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Settings saved successfully
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Knowledge Base Tab */}
          {activeTab === 'knowledge' && (
            <KnowledgeBaseManager />
          )}

          {/* Audio Tab */}
          {activeTab === 'audio' && (
            <>
              {/* Audio Response Settings */}
              <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
                <h2 className="text-xl font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a5 5 0 012.828 0" />
                  </svg>
                  Text-to-Speech
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm text-[#e8e8e8] mb-1">Enable Audio Responses</label>
                      <p className="text-xs text-[#6a6a6a]">Hear AI responses using Piper TTS</p>
                    </div>
                    <button
                      onClick={() => setAudioSettings({ ...audioSettings, enabled: !audioSettings.enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        audioSettings.enabled ? 'bg-accent-orange' : 'bg-[#3a3a3a]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          audioSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm text-[#8a8a8a] mb-2">Voice</label>
                    <select
                      value={audioSettings.voice}
                      onChange={(e) => setAudioSettings({ ...audioSettings, voice: e.target.value })}
                      className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                    >
                      {getAvailableVoices().map(voice => (
                        <option key={voice.id} value={voice.id}>{voice.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-[#8a8a8a] mb-2">Speech Speed</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={audioSettings.speed}
                        onChange={(e) => setAudioSettings({ ...audioSettings, speed: parseFloat(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-[#e8e8e8] min-w-[3rem] text-right">{audioSettings.speed.toFixed(1)}x</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm text-[#e8e8e8] mb-1">Auto-play Responses</label>
                      <p className="text-xs text-[#6a6a6a]">Automatically play audio when response completes</p>
                    </div>
                    <button
                      onClick={() => setAudioSettings({ ...audioSettings, autoPlay: !audioSettings.autoPlay })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        audioSettings.autoPlay ? 'bg-accent-orange' : 'bg-[#3a3a3a]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          audioSettings.autoPlay ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {audioSettings.autoPlay && (
                    <div>
                      <label className="block text-sm text-[#8a8a8a] mb-2">Auto-play Max Length (characters)</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="100"
                          max="1000"
                          step="50"
                          value={audioSettings.autoPlayMaxLength}
                          onChange={(e) => setAudioSettings({ ...audioSettings, autoPlayMaxLength: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="text-[#e8e8e8] min-w-[4rem] text-right">{audioSettings.autoPlayMaxLength}</span>
                      </div>
                      <p className="text-xs text-[#6a6a6a] mt-1">Only auto-play responses shorter than this (300 ≈ 2-3 sentences)</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-[#8a8a8a] mb-2">Piper Path (Optional)</label>
                    <input
                      type="text"
                      value={audioSettings.piperPath}
                      onChange={(e) => setAudioSettings({ ...audioSettings, piperPath: e.target.value })}
                      placeholder="piper (or full path)"
                      className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                    />
                    <p className="text-xs text-[#6a6a6a] mt-1">Path to Piper executable. Leave as 'piper' if it's in your PATH</p>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-400 mb-2">TTS Server Required</p>
                    <p className="text-xs text-[#8a8a8a]">
                      Run <code className="px-2 py-1 bg-[#1a1a1a] rounded">npm run tts-server</code> in a separate terminal to enable audio responses.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <>
              {/* Ollama Connection */}
              <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
                <h2 className="text-xl font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  Ollama Server
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#8a8a8a] mb-2">Server URL</label>
                    <input
                      type="text"
                      value={settings.ollamaUrl}
                      onChange={(e) => setSettings({ ...settings, ollamaUrl: e.target.value })}
                      className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                      placeholder="http://localhost:11434"
                    />
                    <p className="text-xs text-[#6a6a6a] mt-1">The URL where your Ollama instance is running</p>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-[#1a1a1a] rounded-lg border border-[#3a3a3a]">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-[#e8e8e8]">Connected to Ollama</span>
                  </div>
                </div>
              </div>

              {/* API Keys */}
              <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
                <h2 className="text-xl font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  API Keys
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#8a8a8a] mb-2">OpenAI API Key (Optional)</label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                    />
                    <p className="text-xs text-[#6a6a6a] mt-1">For using OpenAI models alongside Ollama</p>
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a8a] mb-2">Anthropic API Key (Optional)</label>
                    <input
                      type="password"
                      placeholder="sk-ant-..."
                      className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                    />
                    <p className="text-xs text-[#6a6a6a] mt-1">For using Claude models alongside Ollama</p>
                  </div>
                </div>
              </div>

              {/* Remote Server */}
              <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
                <h2 className="text-xl font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Remote Connections
                </h2>
                <p className="text-sm text-[#8a8a8a] mb-4">Connect to remote Ollama instances or cloud services</p>
                <button className="px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e8e8e8] rounded-lg transition-all duration-150 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Remote Connection
                </button>
              </div>
            </>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <>
              {/* Web Search */}
              <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
                <h2 className="text-xl font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Web Search
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm text-[#e8e8e8] mb-1">Enable Web Search</label>
                      <p className="text-xs text-[#6a6a6a]">Allow AI to search the web for information</p>
                    </div>
                    <button
                      onClick={() => setIntegrations({
                        ...integrations,
                        webSearch: { ...integrations.webSearch, enabled: !integrations.webSearch.enabled }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        integrations.webSearch.enabled ? 'bg-accent-orange' : 'bg-[#3a3a3a]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          integrations.webSearch.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a8a] mb-2">Search Provider</label>
                    <select
                      value={integrations.webSearch.provider}
                      onChange={(e) => setIntegrations({
                        ...integrations,
                        webSearch: { ...integrations.webSearch, provider: e.target.value as any }
                      })}
                      className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                    >
                      <option value="google">Google</option>
                      <option value="duckduckgo">DuckDuckGo</option>
                      <option value="bing">Bing</option>
                      <option value="brave">Brave Search</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Code Execution */}
              <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
                <h2 className="text-xl font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Code Execution
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm text-[#e8e8e8] mb-1">Allow Code Execution</label>
                      <p className="text-xs text-[#6a6a6a]">Enable AI to run code snippets in a sandbox</p>
                    </div>
                    <button
                      onClick={() => setIntegrations({
                        ...integrations,
                        codeExecution: { ...integrations.codeExecution, enabled: !integrations.codeExecution.enabled }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        integrations.codeExecution.enabled ? 'bg-accent-orange' : 'bg-[#3a3a3a]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          integrations.codeExecution.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a8a] mb-2">Allowed Languages</label>
                    <input
                      type="text"
                      value={integrations.codeExecution.allowedLanguages.join(', ')}
                      onChange={(e) => setIntegrations({
                        ...integrations,
                        codeExecution: {
                          ...integrations.codeExecution,
                          allowedLanguages: e.target.value.split(',').map(lang => lang.trim())
                        }
                      })}
                      className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                      placeholder="python, javascript, typescript, bash"
                    />
                    <p className="text-xs text-[#6a6a6a] mt-1">Comma-separated list of programming languages</p>
                  </div>
                </div>
              </div>

              {/* File Access */}
              <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
                <h2 className="text-xl font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  File Access
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm text-[#e8e8e8] mb-1">File Upload</label>
                      <p className="text-xs text-[#6a6a6a]">Allow uploading files to chat</p>
                    </div>
                    <button
                      onClick={() => setIntegrations({
                        ...integrations,
                        fileUpload: { ...integrations.fileUpload, enabled: !integrations.fileUpload.enabled }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        integrations.fileUpload.enabled ? 'bg-accent-orange' : 'bg-[#3a3a3a]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          integrations.fileUpload.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm text-[#8a8a8a] mb-2">Allowed File Types</label>
                    <input
                      type="text"
                      value={integrations.fileUpload.allowedTypes.join(', ')}
                      onChange={(e) => setIntegrations({
                        ...integrations,
                        fileUpload: {
                          ...integrations.fileUpload,
                          allowedTypes: e.target.value.split(',').map(type => type.trim())
                        }
                      })}
                      className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                      placeholder=".txt, .md, .pdf, .jpg, .png"
                    />
                    <p className="text-xs text-[#6a6a6a] mt-1">Comma-separated list of file extensions</p>
                  </div>
                </div>
              </div>

              {/* Third-party Services */}
              <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
                <h2 className="text-xl font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Third-party Services
                </h2>
                <p className="text-sm text-[#8a8a8a] mb-4">Connect with external services</p>
                <div className="space-y-2">
                  <div className="w-full flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-[#3a3a3a]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#2a2a2a] flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#8a8a8a]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-[#e8e8e8]">GitHub</div>
                        <div className="text-xs text-[#6a6a6a]">
                          {integrations.github.connected
                            ? `Connected as ${integrations.github.username}`
                            : 'Not connected'}
                        </div>
                      </div>
                    </div>
                    {integrations.github.connected ? (
                      <button
                        onClick={handleGithubDisconnect}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded text-sm transition-all"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowGithubModal(true)}
                        className="px-3 py-1.5 bg-accent-orange/10 hover:bg-accent-orange/20 border border-accent-orange/30 text-accent-orange rounded text-sm transition-all"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <>
              {/* General Settings */}
              <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
                <h2 className="text-xl font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  General
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#8a8a8a] mb-2">Default Model</label>
                    <input
                      type="text"
                      value={settings.defaultModel}
                      onChange={(e) => setSettings({ ...settings, defaultModel: e.target.value })}
                      className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                      placeholder="qwen2.5:1.5b"
                    />
                    <p className="text-xs text-[#6a6a6a] mt-1">Default model for new chats</p>
                  </div>
                </div>
              </div>

              {/* Display Preferences */}
              <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
                <h2 className="text-xl font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Display
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#8a8a8a] mb-2">Message Font Size</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="12"
                        max="20"
                        value={settings.messagesFontSize}
                        onChange={(e) => setSettings({ ...settings, messagesFontSize: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-[#e8e8e8] min-w-[3rem] text-right">{settings.messagesFontSize}px</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm text-[#e8e8e8] mb-1">Show Timestamps</label>
                      <p className="text-xs text-[#6a6a6a]">Display time information on messages</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, showTimestamps: !settings.showTimestamps })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.showTimestamps ? 'bg-accent-orange' : 'bg-[#3a3a3a]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.showTimestamps ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
                <h2 className="text-xl font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Performance
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#8a8a8a] mb-2">Auto-save Interval (milliseconds)</label>
                    <input
                      type="number"
                      value={settings.autoSaveInterval}
                      onChange={(e) => setSettings({ ...settings, autoSaveInterval: parseInt(e.target.value) })}
                      min="1000"
                      max="10000"
                      step="500"
                      className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                    />
                    <p className="text-xs text-[#6a6a6a] mt-1">How long to wait before auto-saving chats (2000ms = 2 seconds)</p>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6">
                <h2 className="text-xl font-semibold text-[#e8e8e8] mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  Data Management
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={clearAllData}
                    className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-lg transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All Data
                  </button>
                  <p className="text-xs text-[#6a6a6a]">⚠️ This will permanently delete all chats, projects, artifacts, and code snippets</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={saveSettings}
            className="px-6 py-3 bg-accent-orange hover-accent-orange text-white rounded-lg transition-all duration-150 font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Settings
          </button>
          <button
            onClick={resetSettings}
            className="px-6 py-3 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e8e8e8] rounded-lg transition-all duration-150"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* GitHub Connection Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowGithubModal(false)}>
          <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-[#e8e8e8] mb-4">Connect GitHub</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#8a8a8a] mb-2">GitHub Username</label>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="your-username"
                  className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8a8a8a] mb-2">Personal Access Token</label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full bg-[#1a1a1a] text-[#e8e8e8] rounded-lg px-4 py-2.5 border border-[#3a3a3a] focus:outline-none focus:border-accent-orange transition-colors"
                />
                <p className="text-xs text-[#6a6a6a] mt-1">
                  Create a token at{' '}
                  <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-accent-orange hover:underline">
                    github.com/settings/tokens
                  </a>
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleGithubConnect}
                  disabled={!githubToken || !githubUsername}
                  className="flex-1 px-4 py-2.5 bg-accent-orange hover-accent-orange disabled:bg-[#3a3a3a] disabled:text-[#6a6a6a] disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium"
                >
                  Connect
                </button>
                <button
                  onClick={() => setShowGithubModal(false)}
                  className="flex-1 px-4 py-2.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e8e8e8] rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
