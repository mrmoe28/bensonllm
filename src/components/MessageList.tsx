import { type Message } from '../lib/ollama-client';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-[800px] mx-auto px-6 py-6 space-y-8">
        {messages.map((message, index) => (
          <div key={index} className="space-y-3">
            {/* User message */}
            {message.role === 'user' && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  U
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-[15px] leading-relaxed text-[#e8e8e8] whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            )}

            {/* Assistant message */}
            {message.role === 'assistant' && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-accent-orange flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  A
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-[15px] leading-relaxed text-[#e8e8e8] whitespace-pre-wrap">
                    {message.content || (
                      <div className="flex items-center gap-2 text-[#6a6a6a]">
                        <div className="w-2 h-2 bg-[#6a6a6a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-[#6a6a6a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-[#6a6a6a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-accent-orange flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              A
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#6a6a6a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#6a6a6a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#6a6a6a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
