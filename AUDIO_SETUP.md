# 🔊 Audio Setup Guide - Piper TTS

## ✅ What's Ready

All 5 US English voice models are **already downloaded** to your external drive:

- ✅ Ryan (Male) - 16MB at `/Volumes/MrMoe28Hub_Main/piper-voices/en/en_US/ryan/medium/`
- ✅ Joe (Male) - 38MB at `/Volumes/MrMoe28Hub_Main/piper-voices/en/en_US/joe/medium/`
- ✅ John (Male) - 9.2MB at `/Volumes/MrMoe28Hub_Main/piper-voices/en/en_US/john/medium/`
- ✅ Amy (Female) - 13MB at `/Volumes/MrMoe28Hub_Main/piper-voices/en/en_US/amy/medium/`
- ✅ Kristin (Female) - 7.8MB at `/Volumes/MrMoe28Hub_Main/piper-voices/en/en_US/kristin/medium/`

## 📦 Install Piper (Choose ONE method)

### Method 1: Homebrew (Recommended)
```bash
brew tap rhasspy/tap
brew install rhasspy/tap/piper
```

### Method 2: Download Binary (If Homebrew fails)
```bash
# For M1/M2 Mac (ARM)
curl -L "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_macos_aarch64.tar.gz" -o ~/Downloads/piper.tar.gz

# For Intel Mac (x86)
curl -L "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_macos_x86_64.tar.gz" -o ~/Downloads/piper.tar.gz

# Extract and install
cd ~/Downloads
tar -xzf piper.tar.gz
sudo mv piper/piper /usr/local/bin/
chmod +x /usr/local/bin/piper
```

### Method 3: Use macOS `say` command (Fallback)
If Piper installation is difficult, I can configure the app to use macOS's built-in `say` command instead.

## ✅ Verify Installation

```bash
# Check if Piper is installed
which piper

# Test with Ryan voice
echo "Hello, this is a test" | piper --model /Volumes/MrMoe28Hub_Main/piper-voices/en/en_US/ryan/medium/en_US-ryan-medium.onnx --output_file test.wav

# Play the audio
afplay test.wav
```

## 🚀 Start the Servers

Once Piper is installed:

```bash
# Terminal 1 - Main app
cd /Users/ekodevapps/Desktop/ollama-custom-chat
npm run dev

# Terminal 2 - TTS server
cd /Users/ekodevapps/Desktop/ollama-custom-chat
npm run tts-server
```

## 🎛️ Enable Audio in the App

1. Open browser to `http://localhost:5173`
2. Go to **Settings → Audio** tab
3. Toggle **"Enable Audio Responses"** to ON
4. Select a voice (Ryan is default)
5. Adjust speed if desired (1.0x is normal)
6. Enable **"Auto-play Responses"** if you want automatic playback

## 🎵 Test Audio

1. Start a new chat
2. Ask the AI anything
3. Look for the **speaker icon** next to the AI's response
4. Click the speaker icon to hear the response
5. Click again to stop playback

## 🛠️ Troubleshooting

### Problem: "TTS server not running"
**Solution:**
```bash
# Make sure TTS server is running in a separate terminal
cd /Users/ekodevapps/Desktop/ollama-custom-chat
npm run tts-server

# You should see:
# "TTS Server running on http://localhost:3001"
```

### Problem: "Piper command not found"
**Solution:**
```bash
# Check if it's in your PATH
which piper

# If not found, add to PATH or use full path in Settings
# Go to Settings → Audio → Piper Path
# Enter: /usr/local/bin/piper
```

### Problem: Audio plays but sounds garbled
**Solution:**
- Try a different voice
- Reduce speed to 0.8x
- Make sure voice files are fully downloaded (check file sizes above)

### Problem: "Failed to play audio"
**Solution:**
```bash
# Test Piper directly
echo "Test" | piper --model /Volumes/MrMoe28Hub_Main/piper-voices/en/en_US/ryan/medium/en_US-ryan-medium.onnx --output_file /tmp/test.wav

# Check if file was created
ls -lh /tmp/test.wav

# Try to play it
afplay /tmp/test.wav
```

## 📊 What Each Voice Sounds Like

- **Ryan**: Professional, clear, news anchor style
- **Joe**: Casual, friendly, conversational
- **John**: Smooth, confident, radio host style
- **Amy**: Warm, friendly female voice
- **Kristin**: Professional female voice, podcast style

## ⚡ Performance Tips

- **Medium quality** voices (what you have) are best balance of quality/speed
- **Auto-play** uses more CPU - disable if needed
- **Speed 1.2x-1.5x** is good for faster listening
- **TTS server** runs locally - no internet needed

## 🎯 Quick Start (After Piper is Installed)

```bash
# 1. Start both servers
cd /Users/ekodevapps/Desktop/ollama-custom-chat
npm run dev &
npm run tts-server &

# 2. Open browser
open http://localhost:5173

# 3. Go to Settings → Audio
# 4. Enable audio and select voice
# 5. Start chatting and click speaker icons!
```

---

**Next Step:** Install Piper using one of the methods above, then run the Quick Start commands!
