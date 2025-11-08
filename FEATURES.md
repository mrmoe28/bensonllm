# 🚀 Ollama Custom Chat - Feature Documentation

## Overview

This advanced chat interface for Ollama includes intelligent long-term memory, knowledge base management, and audio responses powered by Piper TTS.

## ✨ New Features

### 1. **Long-Term Memory System**
The LLM now remembers every conversation across all sessions and can intelligently reference past discussions.

**Key Capabilities:**
- **Session Tracking**: Each chat session is tracked with a unique ID
- **Conversation Summarization**: Automatic summaries of conversations
- **Entity Extraction**: Identifies people, places, concepts mentioned
- **Topic Clustering**: Groups conversations by topic
- **Memory Search**: Search across all past conversations
- **Contextual Retrieval**: Relevant memories injected into new conversations

**How It Works:**
- When you save a chat, a memory is automatically created
- Memories include: summary, key topics, entities, timestamp
- When starting a new conversation, relevant past memories are retrieved
- The LLM uses these memories to provide context-aware responses

**Storage Location:** `localStorage: ollama-conversation-memory`

---

### 2. **Knowledge Base Management**
Upload documents and URLs to give the LLM domain-specific knowledge.

**Supported File Types:**
- **PDF**: Automatic text extraction from PDF documents
- **Images** (PNG, JPG, etc.): OCR processing using Tesseract.js
- **DOCX**: Microsoft Word document parsing
- **Text/Markdown**: Plain text and markdown files
- **URLs**: Web page content scraping and extraction

**Features:**
- Drag-and-drop file upload
- URL content fetching
- Document search and filtering
- Tag management
- Storage usage tracking
- Document preview/viewer
- Automatic relevance scoring

**Access:** Settings → Knowledge Base tab

**How Context Injection Works:**
1. You upload documents (PDFs, images, text, URLs)
2. When you ask a question, the system searches the knowledge base
3. Relevant documents (top 3 by default) are automatically included in the context
4. The LLM uses this information to answer your question
5. Active knowledge documents are displayed above the chat

**Storage Location:** `localStorage: ollama-knowledge-base`

---

### 3. **Audio Responses (Piper TTS)**
Hear AI responses with high-quality text-to-speech.

**Features:**
- **11 US English Voices**: Amy, Bryce, Danny, Joe, John, Kathleen, Kristin, Norman, Ryan, Sam
- **Quality Levels**: Low, Medium, High
- **Speed Control**: 0.5x to 2x playback speed
- **Auto-play**: Optional automatic playback
- **Per-Message Playback**: Play/pause button on each assistant message

**Available Voices:**
- Ryan (default - clear, professional)
- Joe, John (male voices)
- Amy, Kathleen, Kristin (female voices)
- Bryce, Danny, Norman, Sam (varied characteristics)

**Access:** Settings → Audio tab

**Requirements:**
- Piper TTS must be installed
- TTS server must be running: `npm run tts-server`
- Voice models located at: `/Volumes/MrMoe28Hub_Main/piper-voices`

---

### 4. **Enhanced Chat Interface**

**Knowledge Base Toggle:**
- Toggle button above chat shows knowledge base status
- Displays number of active knowledge documents
- Shows which documents are being used for context
- Can be enabled/disabled per conversation

**Audio Controls:**
- Speaker icon on each assistant message
- Click to play/pause audio
- Visual indicator when audio is playing
- Stop current audio when playing new message

**Memory Integration:**
- Automatic memory creation when saving chats
- Relevant past conversations included in context
- Seamless cross-session continuity

---

## 📁 Project Structure

```
src/
├── types/
│   └── app.ts                    # Type definitions
├── lib/
│   ├── storage.ts                # Storage functions (updated)
│   ├── document-processor.ts     # PDF/OCR/DOCX processing
│   ├── memory.ts                 # Memory system
│   ├── context-builder.ts        # Context injection
│   └── audio.ts                  # Piper TTS integration
├── utils/
│   └── piper-helper.ts           # Voice detection
├── components/
│   ├── ChatInterface.tsx         # Main chat (updated)
│   ├── SettingsView.tsx          # Settings (updated)
│   ├── MessageList.tsx           # Messages (updated)
│   └── KnowledgeBaseManager.tsx  # Knowledge base UI
└── server/
    └── tts-server.js             # TTS backend server
```

---

## 🛠️ Setup Instructions

### Prerequisites

1. **Ollama** running on `http://localhost:11434`
2. **Piper TTS** installed (for audio features)
3. **Node.js** 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start the main app
npm run dev

# Start TTS server (in separate terminal)
npm run tts-server
```

### Installing Piper TTS

**macOS:**
```bash
brew install piper-tts
```

**Linux/Windows:**
Download from: https://github.com/rhasspy/piper

**Voice Models:**
The app expects voices at `/Volumes/MrMoe28Hub_Main/piper-voices`

You can change this path in Settings → Audio → Piper Path

---

## 📊 Storage & Data

All data is stored in `localStorage`:

| Key | Purpose | Size Limit |
|-----|---------|-----------|
| `ollama-chat-history` | Chat conversations | ~5-10MB |
| `ollama-conversation-memory` | Long-term memories | ~2-5MB |
| `ollama-knowledge-base` | Uploaded documents | ~50MB+ |
| `ollama-audio-settings` | TTS preferences | <1KB |
| `ollama-settings` | App settings | <1KB |

**Clearing Data:**
Settings → Settings → Data Management → Clear All Data

---

## 🎯 Usage Examples

### Example 1: Using Knowledge Base

1. Go to Settings → Knowledge Base
2. Upload a PDF document about "Machine Learning"
3. Start a new chat
4. Ask: "What are the key concepts in machine learning?"
5. The LLM will use the uploaded PDF to answer

**Visual Indicator:**
You'll see "Knowledge (1)" button above the chat showing the PDF is active.

### Example 2: Long-Term Memory

1. Have a conversation about React hooks
2. Save the chat (automatic after 2 seconds)
3. Start a new chat tomorrow
4. Ask: "What were we discussing about React yesterday?"
5. The LLM will recall the previous conversation

### Example 3: Audio Responses

1. Go to Settings → Audio
2. Enable "Audio Responses"
3. Select "Ryan (Medium)" voice
4. Set speed to 1.2x
5. Enable "Auto-play Responses"
6. Start chatting - responses will be spoken automatically

### Example 4: OCR from Images

1. Go to Settings → Knowledge Base
2. Upload a screenshot with text
3. Wait for OCR processing
4. Ask questions about the text in the image
5. The LLM can read and reference the extracted text

---

## 🔧 Advanced Configuration

### Context Configuration

Edit `src/lib/context-builder.ts` to adjust:

```typescript
export const DEFAULT_CONTEXT_CONFIG: ContextConfig = {
  includeKnowledge: true,
  includeMemory: true,
  maxKnowledgeDocs: 3,      // Max docs to include
  maxMemories: 2,            // Max past memories
  maxContextLength: 4000,    // Max context tokens
};
```

### Memory Settings

Edit `src/lib/memory.ts` to customize:
- Summary generation
- Entity extraction
- Topic clustering
- Memory scoring algorithm

### Audio Settings

Edit `src/utils/piper-helper.ts` to:
- Add more voices
- Change default voice
- Adjust voice model paths

---

## 🐛 Troubleshooting

### TTS Not Working

**Problem:** "TTS server not running" error

**Solution:**
```bash
# Make sure TTS server is running
npm run tts-server

# Check if Piper is installed
which piper

# Test Piper directly
echo "Hello" | piper --model /path/to/model.onnx --output_file test.wav
```

### Knowledge Base Upload Fails

**Problem:** File upload fails or gets stuck

**Solution:**
- Check file size (PDF.js has limits around 10-20MB)
- For large PDFs, try splitting them
- Check browser console for errors
- Clear localStorage if it's full

### Memory Not Working

**Problem:** LLM doesn't remember past conversations

**Solution:**
- Check if chats are being saved (auto-save after 2 seconds)
- Verify localStorage has memory entries
- Try manually saving: complete a chat and switch views
- Check browser console for errors

### OCR Processing Slow

**Problem:** Image OCR takes too long

**Solution:**
- Use smaller images (resize to 1920px width max)
- Compress images before uploading
- Use clear, high-contrast images for better accuracy
- Wait patiently - OCR can take 10-30 seconds

---

## 📈 Performance Tips

1. **Knowledge Base:**
   - Keep documents under 5MB each
   - Use concise, well-structured documents
   - Remove unnecessary documents periodically
   - Total limit: ~50MB for optimal performance

2. **Memory:**
   - System stores all conversations
   - Searches are client-side (fast)
   - Consider clearing old memories after 6+ months

3. **Audio:**
   - Medium quality voices are recommended
   - High quality uses more bandwidth
   - Low quality for faster generation

---

## 🔐 Security & Privacy

- **All data stored locally** in browser `localStorage`
- **No cloud services** - everything runs on your machine
- **Ollama runs locally** - no data sent to external APIs
- **TTS server is local** - Piper runs on your machine
- **Knowledge base documents** never leave your device

**To completely remove all data:**
1. Settings → Settings → Clear All Data
2. Or manually: Clear browser localStorage

---

## 🚦 System Requirements

- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 500MB+ free space
- **Browser**: Chrome/Edge/Firefox (latest)
- **CPU**: Any modern processor (M1+ recommended for macOS)

---

## 📝 License

This project extends the Ollama chat interface with additional features.
All original Ollama code and dependencies retain their respective licenses.

---

## 🙏 Credits

- **PDF.js** - PDF text extraction
- **Tesseract.js** - OCR processing
- **Mammoth.js** - DOCX parsing
- **Cheerio** - Web scraping
- **Piper TTS** - Text-to-speech engine
- **Ollama** - Local LLM inference

---

**Enjoy your enhanced Ollama chat experience!** 🎉
