import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import { useTheme } from '@react-navigation/native';
import { useEmotion } from '../../contexts/EmotionContext';
import type { Emotion } from '../../types/emotions';

interface DynamicBackgroundProps {
  style?: ViewStyle;
  children: React.ReactNode;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ style, children }) => {
  const theme = useTheme();
  const { emotionalState } = useEmotion();

  const getGradientColors = () => {
    const emotion: Emotion = emotionalState.currentEmotion.dominantEmotion;
    switch (emotion) {
      case 'happy':
        return ['#FFD700', '#FFA500']; // Gold to Orange
      case 'sad':
        return ['#4682B4', '#000080']; // Steel Blue to Navy
      case 'angry':
        return ['#FF4500', '#8B0000']; // Orange Red to Dark Red
      case 'surprised':
        return ['#9370DB', '#4B0082']; // Medium Purple to Indigo
      case 'stressed':
        return ['#FF6B6B', '#4A4A4A']; // Light Red to Dark Gray
      case 'energetic':
        return ['#FFD700', '#FF4500']; // Gold to Orange Red
      case 'calm':
        return ['#87CEEB', '#4682B4']; // Sky Blue to Steel Blue
      case 'neutral':
      default:
        return [theme.colors.background, theme.colors.background];
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});

export default DynamicBackground;
