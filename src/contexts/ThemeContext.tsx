import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Emotion } from './EmotionContext';

interface Theme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  textColor: string;
  accentColor: string;
  backgroundImage?: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  updateThemeFromEmotion: (emotion: Emotion) => void;
}

const lightTheme: Theme = {
  primary: '#4A90E2',
  secondary: '#50E3C2',
  background: '#FFFFFF',
  text: '#333333',
  accent: '#FF9500',
  textColor: '#333333',
  accentColor: '#FF9500',
};

const darkTheme: Theme = {
  primary: '#2C5282',
  secondary: '#38B2AC',
  background: '#1A202C',
  text: '#FFFFFF',
  accent: '#F6AD55',
  textColor: '#FFFFFF',
  accentColor: '#F6AD55',
};

const emotionColors: Record<Emotion, { light: string; dark: string }> = {
  happy: {
    light: '#FFD700',
    dark: '#B8860B',
  },
  sad: {
    light: '#4682B4',
    dark: '#191970',
  },
  angry: {
    light: '#FF4500',
    dark: '#8B0000',
  },
  surprised: {
    light: '#9370DB',
    dark: '#4B0082',
  },
  calm: {
    light: '#87CEEB',
    dark: '#4682B4',
  },
  stressed: {
    light: '#FF6B6B',
    dark: '#4A4A4A',
  },
  energetic: {
    light: '#FFA500',
    dark: '#FF4500',
  },
  neutral: {
    light: '#E5E5E5',
    dark: '#2D2D2D',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(lightTheme);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    setCurrentTheme(prev => ({
      ...prev,
      ...(isDarkMode ? lightTheme : darkTheme),
    }));
  };

  const updateThemeFromEmotion = (emotion: Emotion) => {
    const colors = emotionColors[emotion];
    const baseTheme = isDarkMode ? darkTheme : lightTheme;
    setCurrentTheme({
      ...baseTheme,
      accent: isDarkMode ? colors.dark : colors.light,
      accentColor: isDarkMode ? colors.dark : colors.light,
    });
  };

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        setTheme,
        isDarkMode,
        toggleDarkMode,
        updateThemeFromEmotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
