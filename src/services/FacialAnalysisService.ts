import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { Platform } from 'react-native';
import type { EmotionState, EmotionData, FacialEmotionData } from '../types/emotions';

export class FacialAnalysisService {
  private static instance: FacialAnalysisService;
  private isInitialized: boolean = false;
  private camera: typeof Camera | null = null;
  private isAnalyzing: boolean = false;

  private constructor() {}

  public static getInstance(): FacialAnalysisService {
    if (!FacialAnalysisService.instance) {
      FacialAnalysisService.instance = new FacialAnalysisService();
    }
    return FacialAnalysisService.instance;
  }

  public async initialize(): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Using mock facial analysis for web platform');
      this.isInitialized = true;
      return;
    }
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera permission not granted');
    }
    this.isInitialized = true;
  }

  public async startRecognition(): Promise<void> {
    this.isAnalyzing = true;
  }

  public async stopRecognition(): Promise<void> {
    this.isAnalyzing = false;
  }

  public setCamera(camera: typeof Camera): void {
    this.camera = camera;
  }

  public async detectEmotion(imageData: any): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('FacialAnalysisService not initialized');
    }

    if (Platform.OS === 'web') {
      // Return mock emotion data for web
      const emotions = ['happy', 'sad', 'neutral', 'surprised'];
      return emotions[Math.floor(Math.random() * emotions.length)];
    }

    const faces = await FaceDetector.detectFacesAsync(imageData, this.getFaceDetectionOptions());
    if (!faces.length) {
      return 'neutral';
    }

    const face = faces[0];
    const emotions = this.analyzeFacialExpressions(face);
    const dominantEmotion = this.getDominantEmotion(emotions);

    return dominantEmotion;
  }

  private handleFaceDetected(faces: FaceDetector.FaceFeature[]): EmotionData {
    if (!faces.length) {
      return {
        dominantEmotion: 'neutral',
        emotions: [],
        confidence: 0,
        timestamp: Date.now()
      };
    }

    const face = faces[0];
    const emotions = this.analyzeFacialExpressions(face);
    const dominantEmotion = this.getDominantEmotion(emotions);

    return {
      dominantEmotion,
      emotions,
      confidence: Math.max(...emotions.map(e => e.confidence)),
      timestamp: Date.now()
    };
  }

  private analyzeFacialExpressions(face: FaceDetector.FaceFeature): Array<{ emotion: EmotionData['dominantEmotion']; confidence: number }> {
    const emotions: Array<{ emotion: EmotionData['dominantEmotion']; confidence: number }> = [];
    
    // Simple mapping of face detection values to emotions
    if (face.smilingProbability && face.smilingProbability > 0.7) {
      emotions.push({ emotion: 'happy', confidence: face.smilingProbability });
    }
    
    if (face.rightEyeOpenProbability && face.rightEyeOpenProbability < 0.3) {
      emotions.push({ emotion: 'stressed', confidence: 1 - face.rightEyeOpenProbability });
    }

    if (emotions.length === 0) {
      emotions.push({ emotion: 'neutral', confidence: 0.5 });
    }

    return emotions;
  }

  private getDominantEmotion(emotions: Array<{ emotion: EmotionData['dominantEmotion']; confidence: number }>): EmotionData['dominantEmotion'] {
    if (!emotions.length) return 'neutral';
    
    return emotions.reduce((prev, current) => 
      current.confidence > prev.confidence ? current : prev
    ).emotion;
  }

  private getFaceDetectionOptions(): FaceDetector.FaceDetectorOptions {
    return {
      mode: FaceDetector.FaceDetectorMode.fast,
      detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
      runClassifications: FaceDetector.FaceDetectorClassifications.all,
      minDetectionInterval: 100,
      tracking: true,
    };
  }
}

export default FacialAnalysisService.getInstance();
