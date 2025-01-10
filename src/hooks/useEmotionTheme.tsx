import { useEffect } from 'react';
import { useEmotion } from '../contexts/EmotionContext';
import { useTheme } from '../contexts/ThemeContext';

export const useEmotionTheme = () => {
  const { emotionalState } = useEmotion();
  const { updateThemeFromEmotion } = useTheme();

  useEffect(() => {
    updateThemeFromEmotion(emotionalState.currentEmotion);
  }, [emotionalState.currentEmotion, updateThemeFromEmotion]);

  return null;
};
