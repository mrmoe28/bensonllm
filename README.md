# 💬 Ollama Custom Chat

A beautiful, customizable chat interface for your local Ollama models built with React, TypeScript, Vite, and Tailwind CSS.

## ✨ Features

- 🎨 **Fully Customizable UI** - Easy to modify colors, styles, and layout
- ⚡ **Real-time Streaming** - See responses as they're generated
- 🔄 **Multi-Model Support** - Switch between any Ollama model
- 🌙 **Dark Theme** - Beautiful gradient background
- 💬 **Chat History** - Keep track of conversations
- 🎯 **Simple Architecture** - Easy to understand and extend

## 🚀 Quick Start

### Prerequisites

1. Install [Ollama](https://ollama.ai)
2. Start Ollama: `ollama serve`
3. Download a model: `ollama pull qwen2.5:1.5b`

### Installation

```bash
# Install dependencies
npm install --ignore-scripts

# Start dev server
npm run dev

# Open browser
open http://localhost:5173
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ChatInterface.tsx    # Main chat component
│   ├── MessageList.tsx       # Message display
│   ├── InputBox.tsx          # Input area
│   └── ModelSelector.tsx     # Model dropdown
├── lib/
│   └── ollama-client.ts      # Ollama API client
├── index.css                 # Tailwind styles
└── App.tsx                   # Root component
```

## 🎨 Customization

See [CUSTOMIZATION.md](./CUSTOMIZATION.md) for detailed customization guide including:

- Changing colors and themes
- Modifying message bubbles
- Adding custom buttons
- Adding emojis and icons
- And much more!

## 🔧 Configuration

Edit `.env`:

```bash
# Change Ollama URL (default: http://localhost:11434)
VITE_OLLAMA_URL=http://localhost:11434
```

## 🛠️ Built With

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Ollama API** - LLM backend

## 📝 Available Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🎯 Features to Add

- [ ] Markdown rendering
- [ ] Code syntax highlighting
- [ ] Export conversations
- [ ] Save chat history
- [ ] System prompts
- [ ] Multi-conversation support
- [ ] Voice input/output

## 📄 License

MIT

---

Made with ❤️ for the Ollama community
