import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, ImageBackground, ViewStyle } from 'react-native';
import { useEmotion } from '../contexts/EmotionContext';
import { useTheme } from '../contexts/ThemeContext';
import BackgroundService from '../services/BackgroundService';

interface Props {
  style?: ViewStyle;
  children: React.ReactNode;
}

const DynamicBackground: React.FC<Props> = ({ children, style }) => {
  const { emotionalState } = useEmotion();
  const { theme } = useTheme();
  const prevEmotion = useRef(emotionalState.currentEmotion);

  useEffect(() => {
    if (prevEmotion.current !== emotionalState.currentEmotion) {
      BackgroundService.transitionBackground(
        prevEmotion.current,
        emotionalState.currentEmotion
      );
      prevEmotion.current = emotionalState.currentEmotion;
    }
  }, [emotionalState.currentEmotion]);

  const backgroundImage = BackgroundService.getBackgroundForEmotion(
    emotionalState.currentEmotion
  );

  const animatedStyle = BackgroundService.getAnimatedStyle(
    emotionalState.currentEmotion
  );

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ImageBackground
        source={{ uri: backgroundImage }}
        style={[styles.background, style]}
        resizeMode="cover"
      >
        {children}
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default DynamicBackground;
