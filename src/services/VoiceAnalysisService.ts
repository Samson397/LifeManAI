import { Audio } from 'expo-av';
import type { EmotionData } from '../types/emotions';

class VoiceAnalysisService {
  private recording: Audio.Recording | null = null;
  private isRecording: boolean = false;

  async initialize(): Promise<void> {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Audio permission not granted');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false
    });
  }

  async startRecognition(): Promise<void> {
    if (this.isRecording) return;

    try {
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await this.recording.startAsync();
      this.isRecording = true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecognition(): Promise<void> {
    if (!this.isRecording || !this.recording) return;

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isRecording = false;

      if (uri) {
        // Here you would typically send the audio file to your emotion analysis service
        // For now, we'll return a mock emotion
        this.analyzeVoiceEmotion(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  private analyzeVoiceEmotion(audioUri: string): EmotionData {
    // Mock implementation - in a real app, you'd analyze the audio file
    return {
      dominantEmotion: 'neutral',
      emotions: [
        { emotion: 'neutral', confidence: 0.8 },
        { emotion: 'calm', confidence: 0.2 }
      ],
      confidence: 0.8,
      timestamp: Date.now()
    };
  }
}

export default new VoiceAnalysisService();
