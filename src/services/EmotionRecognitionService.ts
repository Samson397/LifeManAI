import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as FaceDetector from 'expo-face-detector';
import { Camera, CameraType } from 'expo-camera';
import { throttle } from 'lodash';
import type {
  EmotionRecognitionServiceType,
  EmotionRecognitionConfig,
  EmotionRecognitionResult,
  FaceData,
  Emotion,
  EmotionData,
  EmotionConfidence,
  VoiceEmotionData,
  FacialEmotionData
} from '../types/emotions';

const CONFIG: EmotionRecognitionConfig = {
  minConfidence: 0.7,
  samplingInterval: 1000, // 1 second
  modelPath: `${FileSystem.documentDirectory}emotion_model.tflite`,
};

const RECORDING_OPTIONS = {
  android: {
    extension: '.m4a',
    outputFormat: 4, // MPEG_4
    audioEncoder: 3, // AAC
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: 'aac',
    audioQuality: 'max',
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

class EmotionRecognitionService implements EmotionRecognitionServiceType {
  private static instance: EmotionRecognitionService;
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private camera: Camera | null = null;
  private apiKey: string = '';
  private lastAnalysis: number = 0;
  private readonly ANALYSIS_COOLDOWN: number = 1000; // 1 second cooldown
  private readonly CONFIG: EmotionRecognitionConfig = {
    analysisCooldown: 1000, // 1 second cooldown
  };

  private constructor() {}

  static getInstance(): EmotionRecognitionService {
    if (!EmotionRecognitionService.instance) {
      EmotionRecognitionService.instance = new EmotionRecognitionService();
    }
    return EmotionRecognitionService.instance;
  }

  async initialize(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Audio recording permission not granted');
    }

    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      throw new Error('Camera permission not granted');
    }
  }

  async startVoiceRecording(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(RECORDING_OPTIONS);
      await this.recording.startAsync();
      this.isRecording = true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopVoiceRecording(): Promise<VoiceEmotionData> {
    if (!this.isRecording || !this.recording) {
      throw new Error('No active recording');
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.isRecording = false;
      this.recording = null;

      if (!uri) throw new Error('No recording URI available');

      return await this.analyzeVoiceEmotion(uri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  private async analyzeVoiceEmotion(audioUri: string): Promise<VoiceEmotionData> {
    try {
      const audioData = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Call external API for voice emotion analysis
      const response = await fetch('https://api.emotion-recognition.ai/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          audio: audioData,
          format: 'wav',
        }),
      });

      const result = await response.json();

      return {
        dominantEmotion: this.mapEmotionFromAPI(result.dominant_emotion),
        emotions: result.emotions.map((e: any) => ({
          emotion: this.mapEmotionFromAPI(e.name),
          confidence: e.confidence,
        })),
        pitch: result.pitch,
        volume: result.volume,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to analyze voice emotion:', error);
      throw error;
    }
  }

  async analyzeFacialEmotion(imageUri: string): Promise<FacialEmotionData> {
    try {
      const imageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Call external API for facial emotion analysis
      const response = await fetch('https://api.emotion-recognition.ai/face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          image: imageData,
        }),
      });

      const result = await response.json();

      return {
        dominantEmotion: this.mapEmotionFromAPI(result.dominant_emotion),
        emotions: result.emotions.map((e: any) => ({
          emotion: this.mapEmotionFromAPI(e.name),
          confidence: e.confidence,
        })),
        faceDetected: result.face_detected,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to analyze facial emotion:', error);
      throw error;
    }
  }

  private async analyzeEmotionInternal(face: FaceData): Promise<{ emotion: Emotion; confidence: number }> {
    try {
      // Add validation for face data
      if (!face || !face.bounds || !face.faceID) {
        throw new Error('Invalid face data');
      }

      // Rate limiting
      const now = Date.now();
      if (now - this.lastAnalysis < this.CONFIG.analysisCooldown) {
        throw new Error('Too many requests');
      }
      this.lastAnalysis = now;

      // Mock emotion analysis (replace with actual API call)
      const emotions: Emotion[] = ['happy', 'sad', 'neutral', 'angry', 'surprised'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const confidence = Math.random() * 0.3 + 0.7; // Random confidence between 0.7 and 1.0

      return {
        emotion: randomEmotion,
        confidence,
      };
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      throw error;
    }
  }

  analyzeFacialEmotionDebounced = throttle(this.analyzeEmotionInternal, 500);

  async batchAnalyzeEmotions(faces: FaceData[]): Promise<Array<{ emotion: Emotion; confidence: number }>> {
    return Promise.all(faces.map(face => this.analyzeEmotionInternal(face)));
  }

  async startRealtimeFaceDetection(
    camera: Camera,
    onFaceDetected: (emotions: FacialEmotionData) => void
  ): Promise<void> {
    this.camera = camera;

    if (!this.camera) return;

    // Set up face detection
    const cameraWithFaceDetection = this.camera as any;
    cameraWithFaceDetection.onFacesDetected = async ({ faces }: FaceDetectionResult) => {
      if (faces.length > 0) {
        try {
          const photo = await this.camera?.takePictureAsync({
            quality: 0.5,
            base64: true,
          });

          if (photo) {
            const emotions = await this.analyzeFacialEmotion(photo.uri);
            onFaceDetected(emotions);
          }
        } catch (error) {
          console.error('Error in real-time face detection:', error);
        }
      }
    };

    cameraWithFaceDetection.faceDetectorSettings = {
      mode: FaceDetector.FaceDetectorMode.fast,
      detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
      runClassifications: FaceDetector.FaceDetectorClassifications.all,
      minDetectionInterval: 1000,
      tracking: true,
    };
  }

  stopRealtimeFaceDetection(): void {
    if (this.camera) {
      const cameraWithFaceDetection = this.camera as any;
      cameraWithFaceDetection.onFacesDetected = undefined;
      cameraWithFaceDetection.faceDetectorSettings = undefined;
      this.camera = null;
    }
  }

  private mapEmotionFromAPI(apiEmotion: string): Emotion {
    const emotionMap: { [key: string]: Emotion } = {
      'happy': 'happy',
      'sad': 'sad',
      'calm': 'calm',
      'angry': 'stressed',
      'excited': 'energetic',
      'neutral': 'neutral',
    };

    return emotionMap[apiEmotion.toLowerCase()] || 'neutral';
  }

  async getCombinedEmotionalState(
    voiceData?: VoiceEmotionData,
    facialData?: FacialEmotionData,
    healthData?: any
  ): Promise<EmotionData> {
    const emotions: EmotionConfidence[] = [];
    let totalConfidence = 0;

    // Combine voice emotions
    if (voiceData) {
      voiceData.emotions.forEach(e => {
        emotions.push({ ...e, confidence: e.confidence * 0.4 }); // Voice has 40% weight
        totalConfidence += e.confidence * 0.4;
      });
    }

    // Combine facial emotions
    if (facialData) {
      facialData.emotions.forEach(e => {
        const existing = emotions.find(em => em.emotion === e.emotion);
        if (existing) {
          existing.confidence += e.confidence * 0.4; // Face has 40% weight
        } else {
          emotions.push({ ...e, confidence: e.confidence * 0.4 });
        }
        totalConfidence += e.confidence * 0.4;
      });
    }

    // Add health data influence (20% weight)
    if (healthData) {
      const healthEmotion = this.determineEmotionFromHealth(healthData);
      const existing = emotions.find(em => em.emotion === healthEmotion.emotion);
      if (existing) {
        existing.confidence += healthEmotion.confidence * 0.2;
      } else {
        emotions.push({ ...healthEmotion, confidence: healthEmotion.confidence * 0.2 });
      }
      totalConfidence += healthEmotion.confidence * 0.2;
    }

    // Normalize confidences
    emotions.forEach(e => {
      e.confidence = e.confidence / totalConfidence;
    });

    // Sort by confidence and get dominant emotion
    emotions.sort((a, b) => b.confidence - a.confidence);
    const dominantEmotion = emotions[0]?.emotion || 'neutral';

    return {
      dominantEmotion,
      emotions,
      timestamp: Date.now(),
      confidence: emotions[0]?.confidence || 0,
    };
  }

  private determineEmotionFromHealth(healthData: any): EmotionConfidence {
    const { heartRate, stressLevel } = healthData;

    if (stressLevel > 70) {
      return { emotion: 'stressed', confidence: 0.8 };
    } else if (stressLevel < 30) {
      return { emotion: 'calm', confidence: 0.8 };
    } else if (heartRate > 100) {
      return { emotion: 'energetic', confidence: 0.7 };
    } else {
      return { emotion: 'neutral', confidence: 0.6 };
    }
  }
}

export default EmotionRecognitionService.getInstance();
