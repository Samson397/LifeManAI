import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import LinearGradient from 'expo-linear-gradient';
import { useTheme } from '@react-navigation/native';

interface AuthBackgroundProps {
  type: 'login' | 'signup';
  children: React.ReactNode;
}

const AuthBackground: React.FC<AuthBackgroundProps> = ({ type, children }) => {
  const theme = useTheme();

  const getGradientColors = () => {
    switch (type) {
      case 'login':
        // Darker, more sophisticated gradient for login
        return ['#2C5282', '#4A90E2', '#63B3ED'];
      case 'signup':
        // Lighter, welcoming gradient for signup
        return ['#4299E1', '#63B3ED', '#90CDF4'];
      default:
        return [theme.colors.background, theme.colors.background];
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getGradientColors()}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.overlay}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 20,
  },
});

export default AuthBackground;
