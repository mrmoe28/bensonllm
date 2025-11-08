import { useState } from 'react';
import { type Message } from '../lib/ollama-client';
import { synthesizeAndPlay, stopCurrentAudio, loadAudioSettings } from '../lib/audio';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handlePlayAudio = async (content: string, index: number) => {
    try {
      const audioSettings = loadAudioSettings();

      if (playingIndex === index) {
        stopCurrentAudio();
        setPlayingIndex(null);
        return;
      }

      stopCurrentAudio();
      setPlayingIndex(index);

      await synthesizeAndPlay(content, audioSettings);
      setPlayingIndex(null);
    } catch (error) {
      console.error('Failed to play audio:', error);
      alert('Failed to play audio. Make sure the TTS server is running (npm run tts-server)');
      setPlayingIndex(null);
    }
  };
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-[800px] mx-auto px-6 py-6 space-y-8">
        {messages.map((message, index) => (
          <div key={index} className="space-y-3">
            {/* User message */}
            {message.role === 'user' && (
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl px-4 py-3 max-w-[85%]">
                  {/* Display images if present */}
                  {message.images && message.images.length > 0 && (
                    <div className="mb-3 flex gap-2 flex-wrap">
                      {message.images.map((img, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={img}
                          alt={`Uploaded image ${imgIndex + 1}`}
                          className="max-w-xs rounded-lg border border-white/20"
                        />
                      ))}
                    </div>
                  )}
                  <div className="text-[15px] leading-relaxed text-white whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            )}

            {/* Assistant message */}
            {message.role === 'assistant' && (
              <div className="flex items-start gap-2">
                <div className="max-w-[85%]">
                  <div className="text-[15px] leading-relaxed text-[#e8e8e8]">
                    {message.content ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: ({node, inline, className, children, ...props}: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline ? (
                              <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-4 my-2 overflow-x-auto">
                                <pre className="text-sm">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              </div>
                            ) : (
                              <code className="bg-[#2a2a2a] px-1.5 py-0.5 rounded text-sm" {...props}>
                                {children}
                              </code>
                            );
                          },
                          img: ({node, ...props}: any) => (
                            <img
                              {...props}
                              className="rounded-lg max-w-full h-auto my-2 border border-[#3a3a3a]"
                              alt={props.alt || 'Image'}
                            />
                          ),
                          p: ({node, ...props}: any) => (
                            <p className="mb-2" {...props} />
                          ),
                          ul: ({node, ...props}: any) => (
                            <ul className="list-disc list-inside mb-2 space-y-1" {...props} />
                          ),
                          ol: ({node, ...props}: any) => (
                            <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#8a8a8a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-[#8a8a8a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-[#8a8a8a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    )}
                  </div>
                </div>
                {message.content && (
                  <button
                    onClick={() => handlePlayAudio(message.content, index)}
                    className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors group"
                    title={playingIndex === index ? 'Stop audio' : 'Play audio'}
                  >
                    {playingIndex === index ? (
                      <svg className="w-5 h-5 text-accent-orange" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-[#8a8a8a] group-hover:text-accent-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#8a8a8a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#8a8a8a] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#8a8a8a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
