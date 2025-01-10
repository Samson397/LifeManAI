import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingOverlayProps {
  message?: string;
  isVisible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message, isVisible }) => {
  const { theme } = useTheme();

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        {message && (
          <Text style={[styles.message, { color: theme.colors.text }]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlay: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    boxShadowowColor: '#000',
    boxShadowowOffset: {
      width: 0,
      height: 2,
    },
    boxShadowowOpacity: 0.25,
    boxShadowowRadius: 3.84,
    elevation: 5,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LoadingOverlay;
