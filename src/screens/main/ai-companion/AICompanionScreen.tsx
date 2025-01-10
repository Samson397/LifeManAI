import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { useEmotion } from '../../../contexts/EmotionContext';
import { useAuth } from '../../../contexts/AuthContext';
import DynamicBackground from '../../../components/common/DynamicBackground';
import CustomButton from '../../../components/CustomButton';
import AILearningService from '../../../services/AILearningService';
import ChatService from '../../../services/ChatService'; // Import ChatService
import { config } from '../../../config/env';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

const AICompanionScreen: React.FC = () => {
  const { theme } = useTheme();
  const { emotionalState } = useEmotion();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Add feedback state
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setError('Please sign in to use the chat');
      setLoading(false);
      return;
    }

    try {
      AILearningService.initialize(config.openAIApiKey);
      setLoading(false);
    } catch (error) {
      setError('Failed to initialize AI service');
      setLoading(false);
    }
  }, [user]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await AILearningService.generateResponse(
        message,
        emotionalState.currentEmotion.dominantEmotion
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setShowFeedback(aiMessage.id);
    } catch (err) {
      setError('Failed to get AI response');
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = async (messageId: string, rating: number) => {
    await ChatService.provideFeedback(rating);
    setShowFeedback(null);
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.sender === 'user' ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Text style={[styles.messageText, { color: theme.text }]}>
        {message.text}
      </Text>
      {message.sender === 'ai' && showFeedback === message.id && (
        <View style={styles.feedbackContainer}>
          <Text style={[styles.feedbackText, { color: theme.text }]}>
            Was this response helpful?
          </Text>
          <View style={styles.feedbackButtons}>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => handleFeedback(message.id, 1)}
            >
              <Text style={styles.feedbackButtonText}>👍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => handleFeedback(message.id, 0)}
            >
              <Text style={styles.feedbackButtonText}>👎</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.accent }]}>{error}</Text>
      </View>
    );
  }

  return (
    <DynamicBackground style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}
          {isTyping && (
            <View style={styles.typingIndicator}>
              <Text style={{ color: theme.text }}>AI is typing...</Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.accent,
              },
            ]}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={theme.text + '80'}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: theme.primary,
                opacity: !message.trim() || isTyping ? 0.5 : 1,
              },
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() || isTyping}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </DynamicBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messagesContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    minHeight: 40,
    borderWidth: 1,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  typingIndicator: {
    padding: 10,
    alignSelf: 'flex-start',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  feedbackContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 14,
    marginBottom: 4,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  feedbackButton: {
    padding: 8,
  },
  feedbackButtonText: {
    fontSize: 20,
  },
});

export default AICompanionScreen;
