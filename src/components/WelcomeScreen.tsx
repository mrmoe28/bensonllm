interface QuickAction {
  icon: string;
  label: string;
  prompt: string;
}

interface WelcomeScreenProps {
  onSelectAction: (prompt: string) => void;
}

const quickActions: QuickAction[] = [
  {
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    label: 'Write',
    prompt: 'Help me write something'
  },
  {
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    label: 'Learn',
    prompt: 'Teach me about something new'
  },
  {
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    label: 'Code',
    prompt: 'Help me write some code'
  },
  {
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    label: 'From Drive',
    prompt: 'Help me with a document'
  },
  {
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    label: 'From Calendar',
    prompt: 'Help me with my schedule'
  },
];

export default function WelcomeScreen({ onSelectAction }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center h-full px-4 pt-24">
      {/* Welcome Message */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center mb-6">
          <svg className="w-14 h-14 text-accent-orange" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <h1 className="text-4xl font-medium text-[#e8e8e8] mb-3">
          Good evening
        </h1>
        <p className="text-xl text-[#8a8a8a]">
          How can I help you today?
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl w-full">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => onSelectAction(action.prompt)}
            className="flex flex-col items-center gap-3 p-4 rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] hover:bg-[#1f1f1f] hover:border-[#3a3a3a] transition-all duration-150 group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] group-hover:bg-[#3a3a3a] flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
              </svg>
            </div>
            <span className="text-sm font-medium text-[#e8e8e8]">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
