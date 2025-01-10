import { Platform } from 'react-native';
import { Emotion } from '../contexts/EmotionContext';

export enum AnalyticsEvent {
  USER_LOGIN = 'user_login',
  USER_SIGNUP = 'user_signup',
  CHAT_MESSAGE_SENT = 'chat_message_sent',
  CHAT_MESSAGE_RECEIVED = 'chat_message_received',
  EMOTION_DETECTED = 'emotion_detected',
  VOICE_ANALYZED = 'voice_analyzed',
  FEATURE_USED = 'feature_used',
  ERROR_OCCURRED = 'error_occurred',
}

export interface AnalyticsParams {
  [key: string]: any;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private isEnabled: boolean = true;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async initialize() {
    try {
      console.log('Analytics initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      this.isEnabled = false;
    }
  }

  static logEvent(eventName: string, params?: Record<string, any>) {
    console.log('Analytics Event:', eventName, params);
  }

  static logScreenView(screenName: string) {
    console.log('Screen View:', screenName);
  }

  static setUserProperty(name: string, value: string) {
    console.log('User Property:', name, value);
  }

  async logEmotionDetected(emotion: Emotion, confidence: number) {
    AnalyticsService.logEvent(AnalyticsEvent.EMOTION_DETECTED, {
      emotion,
      confidence,
      timestamp: new Date().toISOString(),
    });
  }

  async logChatInteraction(messageType: 'sent' | 'received', messageLength: number, emotion?: Emotion) {
    const eventName = messageType === 'sent' 
      ? AnalyticsEvent.CHAT_MESSAGE_SENT 
      : AnalyticsEvent.CHAT_MESSAGE_RECEIVED;

    AnalyticsService.logEvent(eventName, {
      message_length: messageLength,
      emotion,
      timestamp: new Date().toISOString(),
    });
  }

  async logError(error: Error, context: string) {
    AnalyticsService.logEvent(AnalyticsEvent.ERROR_OCCURRED, {
      error_message: error.message,
      error_stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  async logFeatureUsage(featureName: string, params?: AnalyticsParams) {
    AnalyticsService.logEvent(AnalyticsEvent.FEATURE_USED, {
      feature_name: featureName,
      ...params,
      timestamp: new Date().toISOString(),
    });
  }

  async setUserProperties(properties: { [key: string]: string }) {
    Object.entries(properties).forEach(([key, value]) => {
      AnalyticsService.setUserProperty(key, value);
    });
  }

  async setUserId(userId: string | null) {
    console.log('User ID set:', userId);
  }
}

export default AnalyticsService.getInstance();
