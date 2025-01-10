import type { Face } from 'expo-face-detector';
import type { Camera } from 'expo-camera';

export type Emotion = 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral';

export interface EmotionData {
  emotion: Emotion;
  confidence: number;
  timestamp: number;
}

export interface FaceData {
  bounds: {
    origin: {
      x: number;
      y: number;
    };
    size: {
      width: number;
      height: number;
    };
  };
  rollAngle: number;
  yawAngle: number;
  smilingProbability: number;
  leftEyeOpenProbability: number;
  rightEyeOpenProbability: number;
  leftEarPosition: { x: number; y: number };
  rightEarPosition: { x: number; y: number };
  leftEyePosition: { x: number; y: number };
  rightEyePosition: { x: number; y: number };
  leftCheekPosition: { x: number; y: number };
  rightCheekPosition: { x: number; y: number };
  leftMouthPosition: { x: number; y: number };
  rightMouthPosition: { x: number; y: number };
  bottomMouthPosition: { x: number; y: number };
  noseBasePosition: { x: number; y: number };
}

export interface EmotionRecognitionConfig {
  minConfidence: number;
  samplingInterval: number;
  modelPath: string;
}

export interface EmotionRecognitionResult {
  emotion: Emotion;
  confidence: number;
  faceData: FaceData;
}

export interface EmotionRecognitionServiceType {
  initialize(): Promise<void>;
  startVoiceRecording(): Promise<void>;
  stopVoiceRecording(): Promise<string | undefined>;
  startRecognition(): Promise<void>;
  stopRecognition(): void;
  processImage(imageUri: string): Promise<EmotionRecognitionResult | null>;
  onEmotionDetected(callback: (result: EmotionRecognitionResult) => void): () => void;
  setCamera(camera: Camera): void;
}

export interface EmotionState {
  currentEmotion: Emotion;
  emotionHistory: EmotionData[];
  isRecording: boolean;
  isProcessing: boolean;
}

export interface EmotionContextType {
  state: EmotionState;
  startEmotionRecognition(): Promise<void>;
  stopEmotionRecognition(): void;
  startVoiceRecording(): Promise<void>;
  stopVoiceRecording(): Promise<void>;
  clearEmotionHistory(): void;
  getEmotionStats(): {
    dominant: Emotion;
    distribution: Record<Emotion, number>;
  };
}
