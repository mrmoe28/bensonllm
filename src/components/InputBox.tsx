import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import type { Model } from '../lib/ollama-client';

interface InputBoxProps {
  onSend: (message: string, images?: string[]) => void;
  disabled?: boolean;
  models: Model[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export default function InputBox({ onSend, disabled = false, models, selectedModel, onSelectModel }: InputBoxProps) {
  const [input, setInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onSend(input, uploadedImages.length > 0 ? uploadedImages : undefined);
      setInput('');
      setUploadedImages([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setUploadedImages(prev => [...prev, base64]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-[#2a2a2a] bg-[#1a1a1a]">
      <div className="max-w-[800px] mx-auto px-6 py-4">
        {/* Image previews */}
        {uploadedImages.length > 0 && (
          <div className="mb-3 flex gap-2 flex-wrap">
            {uploadedImages.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Upload ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-[#3a3a3a]"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-[#2a2a2a] rounded-2xl px-3 py-2.5 border border-[#3a3a3a] focus-within:border-[#4a4a4a] transition-colors">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Image upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-[#3a3a3a] transition-colors self-end mb-0.5"
            title="Upload images"
            disabled={disabled}
          >
            <svg
              className="w-4 h-4 text-[#6a6a6a] hover:text-accent-orange transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

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
        <div className="mt-2 text-xs text-[#6a6a6a] px-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
