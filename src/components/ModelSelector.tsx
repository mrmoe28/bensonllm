import { type Model } from '../lib/ollama-client';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

export default function ModelSelector({ models, selectedModel, onSelectModel }: ModelSelectorProps) {
  if (models.length === 0) {
    return (
      <div className="text-sm text-[#6a6a6a]">
        No models available
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={selectedModel}
        onChange={(e) => onSelectModel(e.target.value)}
        className="appearance-none bg-[#2a2a2a] text-[#e8e8e8] rounded-lg px-3 py-1.5 pr-8 text-sm border border-[#3a3a3a] hover:border-[#4a4a4a] focus:outline-none focus:border-accent-orange transition-colors cursor-pointer"
      >
        {models.map((model) => (
          <option key={model.name} value={model.name} className="bg-[#2a2a2a]">
            {model.name}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6a6a] pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
