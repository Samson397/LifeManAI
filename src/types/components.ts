import type { EmotionData, EmotionState, Emotion } from './emotions';

export interface EmotionContextType {
  emotionState: EmotionState;
  currentEmotion: EmotionData;
  emotionalState: EmotionState;
  updateEmotion: (newEmotion: EmotionData) => void;
  clearEmotionHistory: () => void;
}

export type { Emotion };
