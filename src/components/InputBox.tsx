import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { type Model } from '../lib/ollama-client';

interface InputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  models: Model[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export default function InputBox({ onSend, disabled = false, models, selectedModel, onSelectModel }: InputBoxProps) {
  const [input, setInput] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-[#2a2a2a] bg-[#1a1a1a]">
      <div className="max-w-[800px] mx-auto px-6 py-4">
        <div className="relative flex items-end gap-2 bg-[#2a2a2a] rounded-2xl px-3 py-2.5 border border-[#3a3a3a] focus-within:border-[#4a4a4a] transition-colors">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            disabled={disabled}
            className="flex-1 bg-transparent text-[#e8e8e8] placeholder-[#6a6a6a] resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed auto-expand-textarea text-[15px] leading-6"
            rows={1}
            style={{ minHeight: '24px', maxHeight: '200px' }}
          />

          {/* Web Search Toggle */}
          <button
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-[#3a3a3a] transition-colors self-end mb-0.5"
            title={webSearchEnabled ? 'Web search enabled' : 'Web search disabled'}
          >
            <svg
              className={`w-4 h-4 ${webSearchEnabled ? 'text-accent-orange' : 'text-[#6a6a6a]'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-accent-orange hover-accent-orange disabled:bg-[#3a3a3a] disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center self-end"
          >
            <svg
              className={`w-3.5 h-3.5 ${disabled || !input.trim() ? 'text-[#6a6a6a]' : 'text-white'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
        {/* Model Selector - Below input, aligned right */}
        <div className="flex justify-end px-2 mt-1">
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="appearance-none bg-[#1a1a1a] text-[#8a8a8a] rounded-md px-2 py-1 pr-6 text-xs border border-[#3a3a3a] hover:border-[#4a4a4a] focus:outline-none focus:border-accent-orange transition-colors cursor-pointer"
            >
              {models.map((model) => (
                <option key={model.name} value={model.name} className="bg-[#1a1a1a]">
                  {model.name}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6a6a6a] pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {webSearchEnabled && (
          <div className="flex items-center gap-2 px-2 py-1">
            <svg className="w-3 h-3 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span className="text-xs text-accent-orange">Web search enabled</span>
          </div>
        )}
        <div className="mt-2 text-xs text-[#6a6a6a] px-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
