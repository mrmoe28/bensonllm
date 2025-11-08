#!/bin/bash

# Ollama Custom Chat - One-Click Launcher
# This script starts Ollama and the dev server, then opens your browser

echo "🚀 Starting Ollama Custom Chat..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to check if Ollama is running
check_ollama() {
    curl -s http://localhost:11434/api/tags > /dev/null 2>&1
    return $?
}

# Function to check if dev server is running
check_dev_server() {
    curl -s http://localhost:5173 > /dev/null 2>&1
    return $?
}

# Function to start Ollama
start_ollama() {
    echo "📡 Starting Ollama service..."

    # Check if Ollama is already running
    if check_ollama; then
        echo "✅ Ollama is already running"
    else
        # Start Ollama in the background
        ollama serve > /dev/null 2>&1 &

        # Wait for Ollama to be ready (max 10 seconds)
        for i in {1..10}; do
            sleep 1
            if check_ollama; then
                echo "✅ Ollama started successfully"
                return 0
            fi
            echo "⏳ Waiting for Ollama... ($i/10)"
        done

        echo "⚠️  Ollama may not have started properly"
        return 1
    fi
}

# Function to check if TTS server is running
check_tts_server() {
    curl -s http://localhost:3001/health > /dev/null 2>&1
    return $?
}

# Function to start TTS server
start_tts_server() {
    echo "🎙️  Starting TTS server..."

    # Check if TTS server is already running
    if check_tts_server; then
        echo "✅ TTS server is already running"
        return 0
    fi

    # Kill any process on port 3001
    lsof -ti:3001 | xargs kill -9 2>/dev/null

    # Start the TTS server in a new Terminal tab
    osascript <<EOF
tell application "Terminal"
    activate
    tell application "System Events" to keystroke "t" using command down
    delay 0.5
    do script "cd '$SCRIPT_DIR' && echo '🎙️  Starting TTS Server...' && npm run tts-server" in front window
end tell
EOF

    echo "✅ TTS server starting in new Terminal tab..."

    # Wait a moment for TTS server to initialize
    sleep 2
}

# Function to start dev server
start_dev_server() {
    echo "🔧 Starting development server..."

    # Check if dev server is already running
    if check_dev_server; then
        echo "✅ Dev server is already running"
        return 0
    fi

    # Kill any process on port 5173
    lsof -ti:5173 | xargs kill -9 2>/dev/null

    # Start the dev server in a new Terminal tab
    osascript <<EOF
tell application "Terminal"
    activate
    tell application "System Events" to keystroke "t" using command down
    delay 0.5
    do script "cd '$SCRIPT_DIR' && echo '🚀 Starting Ollama Chat Dev Server...' && npm run dev" in front window
end tell
EOF

    echo "✅ Dev server starting in new Terminal tab..."

    # Wait for dev server to be ready (max 30 seconds)
    echo "⏳ Waiting for dev server to be ready..."
    for i in {1..30}; do
        sleep 1
        if check_dev_server; then
            echo "✅ Dev server is ready!"
            return 0
        fi
        if [ $i -eq 10 ] || [ $i -eq 20 ]; then
            echo "⏳ Still waiting... ($i/30 seconds)"
        fi
    done

    echo "⚠️  Dev server is taking longer than expected"
    echo "    Check the Terminal tab for any errors"
    return 1
}

# Function to open browser
open_browser() {
    echo "🌐 Opening browser..."

    # Final check before opening
    if ! check_dev_server; then
        echo "⚠️  Dev server doesn't seem to be ready yet"
        echo "    Opening browser anyway - you may need to refresh the page"
    fi

    # Open in default browser
    open http://localhost:5173

    # Give the browser a moment to open
    sleep 1

    # Bring browser to front
    osascript -e 'tell application "System Events"
        set frontmost of the first process whose frontmost is true to true
    end tell' 2>/dev/null || true

    echo "✅ Browser opened"
}

# Main execution
echo ""
echo "=========================================="
echo "   Ollama Custom Chat Launcher"
echo "=========================================="
echo ""

# Step 1: Start Ollama
start_ollama

echo ""

# Step 2: Start TTS server
start_tts_server

echo ""

# Step 3: Start dev server
start_dev_server

echo ""

# Step 4: Open browser
open_browser

echo ""
echo "=========================================="
echo "✨ All done!"
echo "=========================================="
echo ""
echo "Your chat is now running at: http://localhost:5173"
echo ""
echo "📱 Available models:"
curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | sed 's/^/   - /' 2>/dev/null || echo "   (check Terminal for Ollama status)"
echo ""
echo "🎙️  TTS Voice Features:"
echo "   - Go to Settings to enable voice"
echo "   - TTS server running on port 3001"
echo ""
echo "To stop everything:"
echo "  - Close the Terminal tabs (dev server & TTS server)"
echo "  - Run: pkill -f 'ollama serve'"
echo ""
