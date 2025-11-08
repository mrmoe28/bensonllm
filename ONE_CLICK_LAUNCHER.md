# One-Click Launcher Setup ✨

Your Ollama Chat now has a one-click launcher app installed!

## 📍 Location

The app is installed in two places:

1. **Applications Folder**: `/Applications/Ollama Chat.app`
   - This is your main launcher
   - Double-click to start everything
   - You can add it to your Dock for even easier access

2. **Project Folder**: `ollama-custom-chat/Ollama Chat.app`
   - Backup copy in your project
   - Useful for development

## 🚀 How to Use

### Method 1: From Applications (Recommended)
1. Open **Finder** → **Applications**
2. Find **Ollama Chat**
3. **Double-click** the icon
4. Your browser will open automatically at `http://localhost:5173`

### Method 2: From Spotlight
1. Press **⌘ + Space** to open Spotlight
2. Type "Ollama Chat"
3. Press **Enter**

### Method 3: Add to Dock
1. Open **Finder** → **Applications**
2. Find **Ollama Chat**
3. **Drag** it to your Dock
4. Now you can click it anytime from the Dock!

## 🎯 What It Does

When you launch the app, it automatically:

1. ✅ Checks if Ollama is running
2. ✅ Starts Ollama if needed
3. ✅ Starts the development server
4. ✅ Opens your browser to the chat interface

All in one click!

## 🛑 How to Stop

To stop everything:

1. **Close the Terminal tab** that opened (the one running the dev server)
2. **Optional**: Stop Ollama completely:
   ```bash
   pkill -f 'ollama serve'
   ```

## 🎨 Customize the Icon (Optional)

Want a custom icon? Here's how:

### Easy Way (Use an Image)
1. Find or create an icon image (PNG, JPG, etc.)
2. Right-click the image → **Get Info** (⌘ + I)
3. Click the small icon in the top-left of the Info window
4. Press **⌘ + C** to copy it
5. Right-click **Ollama Chat.app** → **Get Info**
6. Click the icon in the top-left
7. Press **⌘ + V** to paste

### Professional Way (Use .icns file)
1. Create or download an `.icns` icon file
2. Name it `AppIcon.icns`
3. Replace the file at:
   ```
   /Applications/Ollama Chat.app/Contents/Resources/AppIcon.icns
   ```

## 🔧 Troubleshooting

### App won't open
- **First time opening**: Right-click → Open (to bypass security)
- Or: System Settings → Privacy & Security → Allow

### Ollama fails to start
```bash
# Check if Ollama is installed
which ollama

# Manually start Ollama
ollama serve
```

### Dev server fails to start
```bash
# Go to project folder
cd ~/Desktop/ollama-custom-chat

# Install dependencies
npm install

# Try manually
npm run dev
```

### Browser doesn't open
- Manually open: `http://localhost:5173`
- Check if dev server is running in Terminal

## 📁 Files Created

Here's what was created for you:

```
ollama-custom-chat/
├── start-chat.sh                    # Main startup script
├── Start Ollama Chat.command        # Alternative launcher
├── Ollama Chat.app/                 # macOS app bundle
│   └── Contents/
│       ├── Info.plist               # App metadata
│       ├── MacOS/launcher           # Launcher executable
│       └── Resources/AppIcon.icns   # App icon
└── ONE_CLICK_LAUNCHER.md           # This file
```

## 🎉 Advanced: Auto-Start on Login (Optional)

Want the app to start when you log in?

1. **System Settings** → **General** → **Login Items**
2. Click the **+** button
3. Navigate to **Applications** → **Ollama Chat**
4. Click **Add**

Now it starts automatically when you log in!

## 🔄 Updates

If you update the code or scripts:

1. The app will automatically use the latest version (it references `start-chat.sh`)
2. No need to reinstall or update the app
3. Just make sure `start-chat.sh` is always in the project folder

## 🐛 Need Help?

- Check Terminal output for error messages
- Make sure Ollama is installed: `ollama --version`
- Make sure npm packages are installed: `cd ~/Desktop/ollama-custom-chat && npm install`

## 🚀 Quick Commands

```bash
# Manually start everything
~/Desktop/ollama-custom-chat/start-chat.sh

# Check if Ollama is running
curl http://localhost:11434/api/tags

# Check if dev server is running
curl http://localhost:5173

# Stop Ollama
pkill -f 'ollama serve'

# Stop dev server
# (Just close the Terminal tab)
```

---

**Enjoy your one-click Ollama Chat launcher!** 🎉
