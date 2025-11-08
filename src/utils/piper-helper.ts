export interface PiperVoice {
  id: string;
  name: string;
  language: string;
  quality: 'low' | 'medium' | 'high';
  modelPath: string;
}

export const AVAILABLE_US_VOICES: PiperVoice[] = [
  { id: 'en_US-ryan-medium', name: 'Ryan (Male)', language: 'en_US', quality: 'medium', modelPath: '/Volumes/MrMoe28Hub_Main/piper-voices/en/en_US/ryan/medium/en_US-ryan-medium.onnx' },
  { id: 'en_US-joe-medium', name: 'Joe (Male)', language: 'en_US', quality: 'medium', modelPath: '/Volumes/MrMoe28Hub_Main/piper-voices/en/en_US/joe/medium/en_US-joe-medium.onnx' },
  { id: 'en_US-john-medium', name: 'John (Male)', language: 'en_US', quality: 'medium', modelPath: '/Volumes/MrMoe28Hub_Main/piper-voices/en/en_US/john/medium/en_US-john-medium.onnx' },
  { id: 'en_US-amy-medium', name: 'Amy (Female)', language: 'en_US', quality: 'medium', modelPath: '/Volumes/MrMoe28Hub_Main/piper-voices/en/en_US/amy/medium/en_US-amy-medium.onnx' },
  { id: 'en_US-kristin-medium', name: 'Kristin (Female)', language: 'en_US', quality: 'medium', modelPath: '/Volumes/MrMoe28Hub_Main/piper-voices/en/en_US/kristin/medium/en_US-kristin-medium.onnx' },
];

export function getAvailableVoices(): PiperVoice[] {
  return AVAILABLE_US_VOICES;
}

export function getVoiceById(id: string): PiperVoice | undefined {
  return AVAILABLE_US_VOICES.find(v => v.id === id);
}

export function getDefaultVoice(): PiperVoice {
  return AVAILABLE_US_VOICES.find(v => v.id === 'en_US-ryan-medium') || AVAILABLE_US_VOICES[0];
}

export function getVoiceDisplayName(voice: PiperVoice): string {
  return voice.name;
}
