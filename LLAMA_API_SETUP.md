# Llama API Setup Guide

This app now supports both **local Ollama** and **cloud-based Llama API** providers. You can use either or both!

## Supported Providers

### 1. Groq (Recommended - Fast & Free Tier) ⚡
**Fastest inference, generous free tier**

1. Get your API key: https://console.groq.com/keys
2. Add to `.env`:
   ```env
   VITE_LLAMA_API_KEY=gsk_your_key_here
   VITE_LLAMA_PROVIDER=groq
   ```

**Available Models:**
- `llama-3.1-70b-versatile` - Best for complex tasks
- `llama-3.1-8b-instant` - Super fast responses
- `llama3-70b-8192` - Llama 3 flagship
- `llama3-8b-8192` - Smaller, faster Llama 3

---

### 2. Together AI
**Great for experimentation and research**

1. Get your API key: https://api.together.xyz/settings/api-keys
2. Add to `.env`:
   ```env
   VITE_LLAMA_API_KEY=your_together_key_here
   VITE_LLAMA_PROVIDER=together
   ```

**Available Models:**
- `meta-llama/Llama-3-70b-chat-hf`
- `meta-llama/Llama-3-8b-chat-hf`
- `meta-llama/Llama-2-70b-chat-hf`
- `meta-llama/Llama-2-13b-chat-hf`

---

### 3. OpenRouter
**Access to multiple providers through one API**

1. Get your API key: https://openrouter.ai/keys
2. Add to `.env`:
   ```env
   VITE_LLAMA_API_KEY=sk-or-v1-your_key_here
   VITE_LLAMA_PROVIDER=openrouter
   ```

**Available Models:**
- `meta-llama/llama-3.1-70b-instruct`
- `meta-llama/llama-3.1-8b-instruct`
- `meta-llama/llama-3-70b-instruct`
- `meta-llama/llama-3-8b-instruct`

---

### 4. Fireworks AI
**Production-ready with high performance**

1. Get your API key: https://fireworks.ai/api-keys
2. Add to `.env`:
   ```env
   VITE_LLAMA_API_KEY=your_fireworks_key_here
   VITE_LLAMA_PROVIDER=fireworks
   ```

**Available Models:**
- `accounts/fireworks/models/llama-v3p1-70b-instruct`
- `accounts/fireworks/models/llama-v3p1-8b-instruct`
- `accounts/fireworks/models/llama-v3-70b-instruct`

---

## Quick Start

1. **Copy the example env file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your API key:**
   ```env
   VITE_LLAMA_API_KEY=your_actual_key_here
   VITE_LLAMA_PROVIDER=groq  # or together, openrouter, fireworks
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

4. **Select a Llama model from the dropdown!**

---

## Using Both Ollama & Llama API

You can have both configured and switch between them:

- **Local models** appear under "Ollama (Local)"
- **Cloud models** appear under "Groq API" (or your chosen provider)

Just select from the dropdown at the bottom of the chat!

---

## Pricing & Free Tiers

| Provider | Free Tier | Pricing |
|----------|-----------|---------|
| **Groq** | ✅ Yes, generous | Pay-as-you-go (very cheap) |
| **Together AI** | ✅ Credits on signup | $0.20-$0.90 per 1M tokens |
| **OpenRouter** | ❌ No free tier | Varies by model |
| **Fireworks AI** | ✅ Trial credits | Pay-as-you-go |

---

## Security Notes

⚠️ **IMPORTANT:**
- ✅ `.env` is gitignored - your API key won't be committed
- ✅ Never share screenshots of your `.env` file
- ✅ Use `.env.example` for documentation only
- ❌ Never hardcode API keys in source code

---

## Troubleshooting

### "Llama API key not configured"
- Check your `.env` file exists
- Make sure `VITE_LLAMA_API_KEY` is set
- Restart your dev server after changing `.env`

### "No models available"
- Ensure you have either:
  - Ollama running (`ollama serve`)
  - OR a valid Llama API key configured

### Models not showing up
- Verify your provider is set correctly in `.env`
- Check console for any API errors
- Restart the dev server

---

## Example .env File

```env
# Ollama (Local)
VITE_OLLAMA_URL=http://localhost:11434

# Llama API (Cloud)
VITE_LLAMA_API_KEY=gsk_your_groq_key_here
VITE_LLAMA_PROVIDER=groq
```

---

**Ready to chat! 🚀**
