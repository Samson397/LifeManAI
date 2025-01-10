import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Camera, CameraType, FaceDetectionResult } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import type { Face } from '../../types/face';
import type { Emotion } from '../../contexts/EmotionContext';
import DynamicBackground from '../../components/DynamicBackground';
import CustomButton from '../../components/CustomButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useEmotion } from '../../contexts/EmotionContext';
import EmotionRecognitionService from '../../services/EmotionRecognitionService';
import ErrorBoundary from '../../components/common/ErrorBoundary';

const EmotionTrackerScreen: React.FC = () => {
  const { theme } = useTheme();
  const { emotionalState, updateEmotion } = useEmotion();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
      setHasPermission(cameraStatus === 'granted' && audioStatus === 'granted');
      
      if (cameraStatus !== 'granted' || audioStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera and microphone permissions are required for emotion tracking.',
          [{ text: 'OK', onPress: () => requestPermissions() }]
        );
      }
    } catch (error) {
      setError('Failed to request permissions');
      console.error('Permission error:', error);
    }
  };

  const handleFacesDetected = useCallback(async (result: FaceDetectionResult) => {
    const { faces } = result;
    if (!faces || faces.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      // Use batch processing for multiple faces
      if (faces.length > 1) {
        const emotions = await EmotionRecognitionService.batchAnalyzeEmotions(faces as Face[]);
        // Use the most confident emotion
        const mostConfident = emotions.reduce((prev, current) => 
          (current.confidence > prev.confidence) ? current : prev
        );
        updateEmotion(mostConfident.emotion, mostConfident.confidence);
      } else {
        const emotionData = await EmotionRecognitionService.analyzeFacialEmotionDebounced(faces[0] as Face);
        updateEmotion(emotionData.emotion, emotionData.confidence);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Too many requests') {
        // Ignore rate limiting errors
        return;
      }
      setError('Failed to analyze emotion');
      console.error('Emotion analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [updateEmotion]);

  const cameraOptions = useMemo(() => ({
    type: CameraType.front,
    faceDetectorSettings: {
      mode: FaceDetector.FaceDetectorMode.fast,
      detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
      runClassifications: FaceDetector.FaceDetectorClassifications.all,
      minDetectionInterval: 1000,
      tracking: true,
    },
  }), []);

  if (hasPermission === null) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.text, { color: theme.colors.text }]}>
          Requesting permissions...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.text, { color: theme.colors.error }]}>
          No access to camera or microphone
        </Text>
        <CustomButton
          title="Grant Permissions"
          onPress={requestPermissions}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <DynamicBackground>
        <View style={styles.container}>
          {isCameraActive && (
            <Camera
              style={styles.camera}
              type={cameraOptions.type}
              onFacesDetected={handleFacesDetected}
              faceDetectorSettings={cameraOptions.faceDetectorSettings}
            />
          )}
          
          <ScrollView style={styles.content}>
            <View style={styles.emotionContainer}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Current Emotion
              </Text>
              {isLoading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              ) : error ? (
                <Text style={[styles.error, { color: theme.colors.error }]}>
                  {error}
                </Text>
              ) : (
                <Text style={[styles.emotion, { color: theme.colors.text }]}>
                  {emotionalState.currentEmotion || 'No emotion detected'}
                </Text>
              )}
              <Text style={[styles.confidence, { color: theme.colors.text }]}>
                Confidence: {Math.round(emotionalState.confidence * 100)}%
              </Text>
            </View>

            <View style={styles.controls}>
              <CustomButton
                title={isCameraActive ? "Stop Camera" : "Start Camera"}
                onPress={() => setIsCameraActive(!isCameraActive)}
                variant={isCameraActive ? "secondary" : "primary"}
              />
            </View>
          </ScrollView>
        </View>
      </DynamicBackground>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: 300,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emotionContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emotion: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
    textTransform: 'capitalize',
  },
  confidence: {
    fontSize: 16,
    opacity: 0.8,
  },
  controls: {
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default EmotionTrackerScreen;
