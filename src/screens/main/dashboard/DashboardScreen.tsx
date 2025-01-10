import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import DynamicBackground from '../../components/DynamicBackground';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const features = [
    {
      id: 'emotional-intelligence',
      title: 'Emotional Intelligence',
      description: 'Advanced emotion recognition technology that understands and responds to your emotional state in real-time.',
      icon: 'heart',
      screen: 'Emotion'
    },
    {
      id: 'ai-companion',
      title: 'AI Companion',
      description: 'Your personal AI companion that learns and grows with you, providing support and guidance.',
      icon: 'chatbubble',
      screen: 'AI Companion'
    },
    {
      id: 'personalized-growth',
      title: 'Personalized Growth',
      description: 'Adaptive AI that learns from your interactions to provide increasingly personalized support and guidance.',
      icon: 'trending-up',
      screen: 'Profile'
    }
  ];

  return (
    <DynamicBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user?.name || 'Friend'}</Text>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={styles.featureCard}
              onPress={() => navigation.navigate(feature.screen as never)}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name={feature.icon as any} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </DynamicBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  nameText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  featuresContainer: {
    gap: 20,
  },
  featureCard: {
    borderRadius: 15,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        boxboxShadowow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      android: {
        elevation: 4,
      },
      web: {
        boxboxShadowow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  cardGradient: {
    padding: 20,
    borderRadius: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 24,
  },
});

export default DashboardScreen;
