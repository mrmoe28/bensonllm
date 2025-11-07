# 🎨 Ollama Custom Chat - Customization Guide

Your custom Ollama chat UI is ready! Here's how to customize it.

## 🚀 Quick Start

1. **Make sure Ollama is running**: `ollama serve`
2. **Start the dev server**: `npm run dev`
3. **Open**: http://localhost:5173

## 🎨 Easy Customizations

### Change Colors

Edit `src/index.css`:

```css
/* Change background gradient */
body {
  @apply bg-gradient-to-br from-purple-900 via-pink-800 to-red-900;
}

/* Or solid color */
body {
  @apply bg-black;
}
```

### Modify Message Bubbles

Edit `src/components/MessageList.tsx` around line 25-35:

```tsx
// User messages (currently blue)
'bg-blue-500/20 border border-blue-500/50 text-blue-100'

// Assistant messages (currently gray)
'bg-gray-700/50 border border-gray-600/50 text-gray-100'
```

**Try these:**
- Green: `bg-green-500/20 border border-green-500/50`
- Purple: `bg-purple-500/20 border border-purple-500/50`
- Red: `bg-red-500/20 border border-red-500/50`

### Add Custom Emojis/Icons

In `src/components/MessageList.tsx`:

```tsx
// Change user icon (line ~30)
{message.role === 'user' ? '😎 You' : '🤖 Assistant'}

// Change assistant icon
{message.role === 'user' ? '👤 You' : '⚡ AI'}
```

### Customize Header

Edit `src/components/ChatInterface.tsx` around line 95:

```tsx
<h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
  My Custom Chat
</h1>
```

### Add Custom Buttons

In `src/components/ChatInterface.tsx`, add after the Clear Chat button:

```tsx
<button
  onClick={() => alert('Custom button!')}
  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
>
  Custom Action
</button>
```

## 🎭 Advanced Customizations

### Add Dark/Light Mode Toggle

1. Install a theme library:
```bash
npm install use-dark-mode
```

2. Add toggle in header component

### Add Message Reactions

Add emoji reactions to messages by modifying `MessageList.tsx`:

```tsx
<div className="flex gap-2 mt-2">
  <button onClick={() => reactToMessage(index, '👍')}>👍</button>
  <button onClick={() => reactToMessage(index, '❤️')}>❤️</button>
</div>
```

### Add Voice Input

Install speech recognition:
```bash
npm install react-speech-recognition
```

### Save Chat History

Use localStorage to persist chats:

```tsx
// In ChatInterface.tsx
useEffect(() => {
  localStorage.setItem('chatHistory', JSON.stringify(messages));
}, [messages]);
```

## 📁 File Structure

```
src/
├── components/
│   ├── ChatInterface.tsx    # Main chat logic
│   ├── MessageList.tsx       # Message display
│   ├── InputBox.tsx          # Input area
│   └── ModelSelector.tsx     # Model dropdown
├── lib/
│   └── ollama-client.ts      # Ollama API calls
├── index.css                 # Global styles
└── App.tsx                   # Root component
```

## 🔧 Configuration

Edit `.env`:

```bash
# Change Ollama URL if running remotely
VITE_OLLAMA_URL=http://your-server:11434
```

## 💡 Tips

- **Tailwind Classes**: Use [Tailwind Docs](https://tailwindcss.com/docs) for styling
- **Hot Reload**: Changes appear instantly in browser
- **Console Errors**: Press F12 to debug
- **Model Selection**: Your qwen2.5:1.5b will appear in the dropdown

## 🎯 Next Steps

- [ ] Add markdown rendering for code blocks
- [ ] Add copy-to-clipboard buttons
- [ ] Add conversation history sidebar
- [ ] Add system prompts
- [ ] Export conversations as PDF
- [ ] Add image input support

---

**Need help?** Check the component files - they're well-commented and easy to modify!
