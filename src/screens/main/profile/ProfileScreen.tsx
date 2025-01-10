import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import DynamicBackground from '../../components/DynamicBackground';
import CustomButton from '../../components/CustomButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useEmotion } from '../../contexts/EmotionContext';
import AIPersonalityService from '../../services/AIPersonalityService';

const ProfileScreen = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { emotionalState } = useEmotion();
  const aiPersonality = AIPersonalityService.getPersonality();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderPersonalityTrait = (trait: { name: string; value: number }) => {
    const percentage = Math.round(trait.value * 100);
    return (
      <View key={trait.name} style={styles.traitContainer}>
        <Text style={[styles.traitName, { color: theme.textColor }]}>
          {trait.name.charAt(0).toUpperCase() + trait.name.slice(1)}
        </Text>
        <View style={styles.traitBarContainer}>
          <View
            style={[
              styles.traitBar,
              {
                width: `${percentage}%`,
                backgroundColor: theme.accentColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.traitValue, { color: theme.textColor }]}>
          {percentage}%
        </Text>
      </View>
    );
  };

  return (
    <DynamicBackground>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textColor }]}>Profile</Text>
          <Text style={[styles.subtitle, { color: theme.textColor }]}>
            Your Personal Journey
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            User Information
          </Text>
          <View style={styles.card}>
            <Text style={[styles.label, { color: theme.textColor }]}>Email</Text>
            <Text style={[styles.value, { color: theme.textColor }]}>
              {user?.email || 'Not available'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Emotional Journey
          </Text>
          <View style={styles.card}>
            <Text style={[styles.label, { color: theme.textColor }]}>
              Current Mood
            </Text>
            <Text
              style={[styles.value, { color: theme.accentColor, fontSize: 24 }]}
            >
              {emotionalState.currentEmotion.charAt(0).toUpperCase() +
                emotionalState.currentEmotion.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            AI Companion Personality
          </Text>
          <View style={styles.card}>
            {aiPersonality.traits.map(renderPersonalityTrait)}
            <Text style={[styles.aiStats, { color: theme.textColor }]}>
              Interactions: {aiPersonality.interactionCount}
            </Text>
            <Text style={[styles.aiStats, { color: theme.textColor }]}>
              Learning Rate: {Math.round(aiPersonality.learningRate * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <CustomButton
            title="Log Out"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </DynamicBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
  },
  traitContainer: {
    marginBottom: 15,
  },
  traitName: {
    fontSize: 16,
    marginBottom: 5,
  },
  traitBarContainer: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  traitBar: {
    height: '100%',
    borderRadius: 4,
  },
  traitValue: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'right',
  },
  aiStats: {
    fontSize: 14,
    marginTop: 10,
    opacity: 0.8,
  },
  logoutButton: {
    marginTop: 20,
  },
});

export default ProfileScreen;
