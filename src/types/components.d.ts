import { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface CustomButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export type Emotion = 'happy' | 'sad' | 'neutral' | 'angry' | 'surprised';

export interface EmotionContextType {
  currentEmotion: Emotion | null;
  emotionHistory: Array<{
    emotion: Emotion;
    timestamp: number;
  }>;
  updateEmotion: (emotion: Emotion) => void;
  clearEmotionHistory: () => void;
}
