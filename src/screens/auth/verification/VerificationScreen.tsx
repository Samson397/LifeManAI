import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DynamicBackground from '../../components/DynamicBackground';
import CustomButton from '../../components/CustomButton';
import { useTheme } from '../../contexts/ThemeContext';

const VerificationScreen = () => {
  const [code, setCode] = useState('');
  const { theme } = useTheme();

  const handleVerification = async () => {
    try {
      // Implement verification logic
      console.log('Verifying code:', code);
    } catch (error) {
      // Handle error
    }
  };

  const handleResendCode = () => {
    // Implement resend code logic
  };

  return (
    <DynamicBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.textColor }]}>
            Verify Your Account
          </Text>
          <Text style={[styles.subtitle, { color: theme.textColor }]}>
            We've sent a verification code to your email
          </Text>

          <TextInput
            style={[styles.input, { borderColor: theme.accentColor }]}
            placeholder="Enter verification code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            placeholderTextColor={theme.textColor + '80'}
          />

          <CustomButton
            title="Verify"
            onPress={handleVerification}
            style={styles.button}
          />

          <CustomButton
            title="Resend Code"
            onPress={handleResendCode}
            variant="secondary"
            style={styles.resendButton}
          />
        </View>
      </KeyboardAvoidingView>
    </DynamicBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
  },
  button: {
    marginTop: 20,
  },
  resendButton: {
    marginTop: 10,
  },
});

export default VerificationScreen;
