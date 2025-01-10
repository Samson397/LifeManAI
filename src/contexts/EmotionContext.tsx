import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import WearableService from '../services/WearableService';
import FacialAnalysisService from '../services/FacialAnalysisService';
import VoiceAnalysisService from '../services/VoiceAnalysisService';
import type { EmotionState, EmotionData, Emotion } from '../types/emotions';
import { useAuth } from './AuthContext';

interface EmotionContextType {
  emotionalState: EmotionState;
  startEmotionDetection: () => Promise<void>;
  stopEmotionDetection: () => Promise<void>;
  isDetecting: boolean;
}

const EmotionContext = createContext<EmotionContextType | null>(null);

export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (!context) {
    throw new Error('useEmotion must be used within an EmotionProvider');
  }
  return context;
};

export const EmotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emotionalState, setEmotionalState] = useState<EmotionState>({
    currentEmotion: {
      dominantEmotion: 'neutral',
      emotions: [],
      confidence: 0,
      timestamp: Date.now()
    },
    emotionHistory: [],
    lastUpdate: Date.now(),
    dominantEmotion: 'neutral'
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [servicesInitialized, setServicesInitialized] = useState(false);
  const { user } = useAuth();
  
  // Use the singleton instances instead of trying to construct new ones
  const wearableService = WearableService;
  const facialService = FacialAnalysisService;
  const voiceService = VoiceAnalysisService;

  useEffect(() => {
    const initializeServices = async () => {
      try {
        if (typeof window !== 'undefined') {
          console.log('Using mock data for web platform');
        } else if (Platform.OS === 'ios') {
          await wearableService.initialize();
        } else if (Platform.OS === 'android') {
          // Android initialization
        }
        setServicesInitialized(true);
      } catch (error) {
        console.error('Error initializing services:', error);
        setServicesInitialized(false);
      }
    };

    if (user) {
      initializeServices();
    }

    return () => {
      stopEmotionDetection();
    };
  }, [user]);

  const startEmotionDetection = async () => {
    if (isDetecting) return;

    try {
      setIsDetecting(true);
      
      // Start all detection services
      await Promise.all([
        wearableService.startMonitoring((healthData) => {
          updateEmotionalState({
            dominantEmotion: healthData.value > 100 ? 'stressed' : 'neutral',
            emotions: [],
            confidence: 0.7,
            timestamp: Date.now()
          });
        }),
        facialService.startRecognition(),
        voiceService.startRecognition()
      ]);
    } catch (error) {
      console.error('Failed to start emotion detection:', error);
      setIsDetecting(false);
    }
  };

  const stopEmotionDetection = async () => {
    if (!isDetecting) return;

    try {
      await Promise.all([
        wearableService.stopMonitoring(),
        facialService.stopRecognition(),
        voiceService.stopRecognition()
      ]);
    } catch (error) {
      console.error('Failed to stop emotion detection:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const updateEmotionalState = (newEmotion: EmotionData) => {
    setEmotionalState(prev => ({
      ...prev,
      currentEmotion: newEmotion,
      emotionHistory: [...prev.emotionHistory, newEmotion],
      lastUpdate: Date.now(),
      dominantEmotion: newEmotion.dominantEmotion
    }));
  };

  const value = {
    emotionalState,
    startEmotionDetection,
    stopEmotionDetection,
    isDetecting
  };

  return (
    <EmotionContext.Provider value={value}>
      {children}
    </EmotionContext.Provider>
  );
};

export type { EmotionState, EmotionData, Emotion } from '../types/emotions';
