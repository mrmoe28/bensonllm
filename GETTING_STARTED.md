# Getting Started with Your Enhanced Ollama Chat

## What's New

Your Ollama chat application now has four powerful new features:

### 1. **Long-Term Memory System**
- Automatically remembers every conversation across sessions
- Extracts key topics, entities, and summaries
- Intelligently references past discussions in new chats

### 2. **Knowledge Base**
- Upload PDF documents, images, text files, DOCX, and Markdown
- Add content from URLs
- Automatic PDF parsing and OCR for images
- Knowledge documents are automatically injected into conversations when relevant

### 3. **Audio Responses (TTS)**
- Text-to-speech using macOS native voices
- 5 high-quality voices: Ryan, Joe, John (male), Amy, Kristin (female)
- Adjustable speed control
- Auto-play option
- Click speaker icon on any AI response to hear it

### 4. **Enhanced Settings**
- Knowledge Base tab for document management
- Audio tab for voice and playback settings
- Profile and Projects views

## How to Run

You need **TWO terminal windows**:

### Terminal 1 - TTS Server (Audio)
```bash
cd /Users/ekodevapps/Desktop/ollama-custom-chat
node server/tts-server.js
```

You should see:
```
TTS Server running on http://localhost:3001
Temp directory: /var/folders/.../ollama-tts
Ready to generate speech!
```

### Terminal 2 - Main Application
```bash
cd /Users/ekodevapps/Desktop/ollama-custom-chat
npm run dev
```

Then open your browser to: **http://localhost:5173**

## Quick Start Guide

### Using Audio Responses

1. Go to **Settings** (gear icon in sidebar)
2. Click the **Audio** tab
3. Toggle **"Enable Audio Responses"** to ON
4. Select a voice (default is Ryan)
5. Adjust speed if desired (1.0x is normal)
6. Optionally enable **"Auto-play Responses"**
7. Start chatting - click the speaker icon next to any AI response to hear it!

### Using the Knowledge Base

1. Go to **Settings** → **Knowledge Base** tab
2. Upload files by clicking "Upload Files" button
   - Supported: PDF, Images (PNG/JPG), Text, Markdown, DOCX
3. OR add content from a URL
4. The AI will automatically reference uploaded documents when relevant
5. Toggle knowledge base on/off with the book icon in the chat interface

### How Memory Works

The memory system works automatically:
- Every conversation is summarized when saved
- Key topics and entities are extracted
- When you start a new chat, relevant past memories are retrieved
- The AI can reference previous conversations naturally

## Testing Your Setup

### Test TTS Server
```bash
curl -X POST http://localhost:3001/api/health
```

You should see: `{"status":"ok","message":"TTS server is running"}`

### Test Audio Generation
```bash
curl -X POST http://localhost:3001/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test", "voice": "en_US-ryan-medium"}' \
  --output test.wav && afplay test.wav
```

## Available Voices

- **Ryan** (en_US-ryan-medium) - Professional male voice, news anchor style
- **Joe** (en_US-joe-medium) - Casual male voice, conversational
- **John** (en_US-john-medium) - Smooth male voice, radio host style
- **Amy** (en_US-amy-medium) - Warm female voice, friendly
- **Kristin** (en_US-kristin-medium) - Professional female voice, podcast style

## Troubleshooting

### Audio not working
1. Make sure TTS server is running (`node server/tts-server.js`)
2. Check that audio is enabled in Settings → Audio
3. Try clicking the speaker icon on an AI response
4. Check browser console for errors (F12 → Console tab)

### Knowledge base not finding documents
1. Make sure documents are fully uploaded (check Settings → Knowledge Base)
2. Try more specific queries that match document content
3. Check that "Use Knowledge Base" toggle is enabled in chat

### App won't start
1. Make sure Ollama is running (`ollama serve`)
2. Check that no other apps are using port 5173 or 3001
3. Run `npm install` if you see module errors

## Architecture

- **Frontend**: React + Vite (port 5173)
- **LLM Backend**: Ollama (port 11434)
- **TTS Backend**: Express server (port 3001)
- **Storage**: Browser localStorage for chats, knowledge base, and memories

## What's Next

Try these features:
1. Upload a PDF document about a topic
2. Ask questions about that document
3. Listen to the AI's responses with different voices
4. Save the chat and start a new one - the AI will remember the previous conversation
5. Search through your knowledge base in Settings

## Need Help?

Check these files for more details:
- `AUDIO_SETUP.md` - Detailed audio setup guide
- `src/lib/memory.ts` - Memory system implementation
- `src/lib/context-builder.ts` - How knowledge and memory are injected
- `src/components/KnowledgeBaseManager.tsx` - Knowledge base UI
