import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const TMP_DIR = path.join(os.tmpdir(), 'ollama-tts');
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// Map voice IDs to macOS say voices
const VOICE_MAP = {
  'en_US-ryan-medium': 'Daniel',
  'en_US-joe-medium': 'Alex',
  'en_US-john-medium': 'Fred',
  'en_US-amy-medium': 'Samantha',
  'en_US-kristin-medium': 'Victoria',
};

app.post('/api/tts', async (req, res) => {
  const { text, voice = 'en_US-ryan-medium', speed = 1.0, modelPath, piperPath = 'piper' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Missing required field: text' });
  }

  const timestamp = Date.now();
  const outputPath = path.join(TMP_DIR, `speech_${timestamp}.aiff`);
  const wavPath = path.join(TMP_DIR, `speech_${timestamp}.wav`);

  try {
    const escapedText = text.replace(/'/g, "'\\''");

    // Use macOS say command (always available on macOS)
    const sayVoice = VOICE_MAP[voice] || 'Alex';
    const rate = Math.round(200 * speed); // 200 is default rate for say

    const command = `say -v "${sayVoice}" -r ${rate} -o "${outputPath}" '${escapedText}'`;

    console.log(`Generating speech with macOS say: "${text.substring(0, 50)}..." using voice ${sayVoice} at rate ${rate}`);

    await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });

    if (!fs.existsSync(outputPath)) {
      throw new Error('Audio file was not generated');
    }

    // Convert AIFF to WAV using afconvert
    await execAsync(`afconvert "${outputPath}" "${wavPath}" -d LEI16 -f WAVE`);

    const audioBuffer = fs.readFileSync(wavPath);

    // Cleanup temp files
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);

    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': audioBuffer.length,
    });

    res.send(audioBuffer);

  } catch (error) {
    console.error('TTS generation error:', error);

    // Cleanup on error
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);

    res.status(500).json({
      error: 'Failed to generate speech',
      details: error.message,
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TTS server is running' });
});

setInterval(() => {
  try {
    const files = fs.readdirSync(TMP_DIR);
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(TMP_DIR, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;

      if (fileAge > 60000) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old temp file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}, 60000);

app.listen(PORT, () => {
  console.log(`TTS Server running on http://localhost:${PORT}`);
  console.log(`Temp directory: ${TMP_DIR}`);
  console.log('Ready to generate speech!');
});
