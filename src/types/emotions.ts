export type Emotion = 'happy' | 'sad' | 'angry' | 'surprised' | 'stressed' | 'energetic' | 'calm' | 'neutral';

export interface EmotionData {
  dominantEmotion: Emotion;
  emotions: Array<{
    emotion: Emotion;
    confidence: number;
  }>;
  timestamp: number;
  confidence: number;
}

export interface EmotionState {
  currentEmotion: EmotionData;
  emotionHistory: EmotionData[];
  lastUpdate: number;
  dominantEmotion: Emotion;
}

export interface EmotionContextType {
  emotionState: EmotionState;
  updateEmotion: (emotion: EmotionData) => void;
  getEmotionHistory: () => EmotionData[];
  clearEmotionHistory: () => void;
}

export type EmotionHistory = EmotionData;

export interface EmotionRecognitionServiceType {
  initialize: () => Promise<void>;
  startRecognition: () => Promise<void>;
  stopRecognition: () => Promise<void>;
}

export interface EmotionRecognitionConfig {
  sensitivity: number;
  updateInterval: number;
}

export interface EmotionRecognitionResult {
  emotion: Emotion;
  confidence: number;
}

export interface FaceData {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  emotions: EmotionConfidence[];
}

export interface EmotionConfidence {
  emotion: Emotion;
  confidence: number;
}

export interface VoiceEmotionData extends EmotionData {
  audioFeatures?: {
    pitch: number;
    volume: number;
    tempo: number;
  };
}

export interface FacialEmotionData extends EmotionData {
  faceDetection?: {
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}
