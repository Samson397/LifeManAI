export const API_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://api.lifemateai.com';

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
};

export const APP_CONFIG = {
  version: '1.0.0',
  buildNumber: 1,
  minIOSVersion: '14.0',
  minAndroidVersion: '24',
  supportEmail: 'support@lifemateai.com',
  privacyPolicyUrl: 'https://lifemateai.com/privacy',
  termsOfServiceUrl: 'https://lifemateai.com/terms',
};
