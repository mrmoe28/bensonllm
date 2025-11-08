import type { AudioSettings } from '../types/app';
import { getVoiceById } from '../utils/piper-helper';

const AUDIO_API_URL = 'http://localhost:3001/api/tts';

let currentAudio: HTMLAudioElement | null = null;
let audioQueue: Array<{ text: string; settings: AudioSettings }> = [];
let isPlaying = false;

export async function synthesizeAndPlay(text: string, settings: AudioSettings): Promise<void> {
  if (!settings.enabled) return;

  if (settings.autoPlay) {
    await playImmediately(text, settings);
  } else {
    queueAudio(text, settings);
  }
}

async function playImmediately(text: string, settings: AudioSettings): Promise<void> {
  try {
    stopCurrentAudio();

    const audioBlob = await generateSpeech(text, settings);
    const audioUrl = URL.createObjectURL(audioBlob);

    currentAudio = new Audio(audioUrl);
    currentAudio.playbackRate = settings.speed;

    currentAudio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
      processQueue();
    };

    currentAudio.onerror = (e) => {
      console.error('Audio playback error:', e);
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
    };

    await currentAudio.play();
    isPlaying = true;
  } catch (error) {
    console.error('Failed to play audio:', error);
    isPlaying = false;
  }
}

function queueAudio(text: string, settings: AudioSettings): void {
  audioQueue.push({ text, settings });

  if (!isPlaying) {
    processQueue();
  }
}

async function processQueue(): Promise<void> {
  if (audioQueue.length === 0) {
    isPlaying = false;
    return;
  }

  const { text, settings } = audioQueue.shift()!;
  await playImmediately(text, settings);
}

export function stopCurrentAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  isPlaying = false;
}

export function clearQueue(): void {
  audioQueue = [];
  stopCurrentAudio();
}

export async function generateSpeech(text: string, settings: AudioSettings): Promise<Blob> {
  const voice = getVoiceById(settings.voice);

  if (!voice) {
    throw new Error(`Voice not found: ${settings.voice}`);
  }

  try {
    const response = await fetch(AUDIO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: voice.id,
        modelPath: voice.modelPath,
        speed: settings.speed,
        piperPath: settings.piperPath || 'piper',
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch')) {
      throw new Error('TTS server not running. Please start the TTS server on port 3001.');
    }
    throw error;
  }
}

export async function downloadAudio(text: string, settings: AudioSettings, filename: string): Promise<void> {
  try {
    const audioBlob = await generateSpeech(text, settings);
    const url = URL.createObjectURL(audioBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download audio:', error);
    throw error;
  }
}

export function getAudioStatus(): { isPlaying: boolean; queueLength: number } {
  return {
    isPlaying,
    queueLength: audioQueue.length,
  };
}

export function getDefaultAudioSettings(): AudioSettings {
  return {
    enabled: false,
    voice: 'en_US-ryan-medium',
    speed: 1.0,
    autoPlay: false,
    piperPath: 'piper',
  };
}

export function loadAudioSettings(): AudioSettings {
  const saved = localStorage.getItem('ollama-audio-settings');
  return saved ? JSON.parse(saved) : getDefaultAudioSettings();
}

export function saveAudioSettings(settings: AudioSettings): void {
  localStorage.setItem('ollama-audio-settings', JSON.stringify(settings));
}
