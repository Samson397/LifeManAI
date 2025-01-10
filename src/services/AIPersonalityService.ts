import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Emotion } from '../contexts/EmotionContext';

interface PersonalityTrait {
  name: string;
  value: number; // 0-1 scale
}

interface Interaction {
  timestamp: number;
  userEmotion: Emotion;
  aiResponse: string;
  userFeedback?: number; // -1 to 1
}

interface PersonalityProfile {
  empathy: number;
  enthusiasm: number;
  formality: number;
  humor: number;
  assertiveness: number;
  creativity: number;
}

interface EmotionalResponse {
  content: string;
  tone: string;
  suggestedActions?: string[];
}

class AIPersonalityService {
  private personality: PersonalityProfile;
  private interactions: Interaction[] = [];
  private readonly STORAGE_KEY = 'ai_personality_data';
  private readonly MAX_INTERACTIONS = 1000;

  constructor() {
    this.personality = {
      empathy: 0.5,
      enthusiasm: 0.5,
      formality: 0.5,
      humor: 0.5,
      assertiveness: 0.5,
      creativity: 0.5,
    };
  }

  async initialize(): Promise<void> {
    try {
      const storedData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        this.personality = data.personality;
        this.interactions = data.interactions;
      }
    } catch (error) {
      console.error('Failed to load AI personality data:', error);
    }
  }

  async saveState(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          personality: this.personality,
          interactions: this.interactions,
        })
      );
    } catch (error) {
      console.error('Failed to save AI personality data:', error);
    }
  }

  getPersonality(): PersonalityProfile {
    return { ...this.personality };
  }

  async addInteraction(
    userEmotion: Emotion,
    aiResponse: string,
    userFeedback?: number
  ): Promise<void> {
    const interaction: Interaction = {
      timestamp: Date.now(),
      userEmotion,
      aiResponse,
      userFeedback,
    };

    this.interactions.push(interaction);
    if (this.interactions.length > this.MAX_INTERACTIONS) {
      this.interactions = this.interactions.slice(-this.MAX_INTERACTIONS);
    }

    if (userFeedback !== undefined) {
      this.updatePersonality(userEmotion, userFeedback);
    }

    await this.saveState();
  }

  private updatePersonality(emotion: Emotion, feedback: number): void {
    const learningRate = 0.05;

    // Update personality traits based on feedback and emotion
    switch (emotion) {
      case 'sad':
        this.personality.empathy = this.adjustTrait(
          this.personality.empathy,
          feedback,
          learningRate
        );
        this.personality.humor = this.adjustTrait(
          this.personality.humor,
          feedback,
          learningRate * 0.5
        );
        break;

      case 'stressed':
        this.personality.empathy = this.adjustTrait(
          this.personality.empathy,
          feedback,
          learningRate
        );
        this.personality.assertiveness = this.adjustTrait(
          this.personality.assertiveness,
          -feedback,
          learningRate
        );
        break;

      case 'happy':
        this.personality.enthusiasm = this.adjustTrait(
          this.personality.enthusiasm,
          feedback,
          learningRate
        );
        this.personality.creativity = this.adjustTrait(
          this.personality.creativity,
          feedback,
          learningRate
        );
        break;

      case 'energetic':
        this.personality.enthusiasm = this.adjustTrait(
          this.personality.enthusiasm,
          feedback,
          learningRate
        );
        this.personality.creativity = this.adjustTrait(
          this.personality.creativity,
          feedback,
          learningRate
        );
        break;

      case 'calm':
        this.personality.formality = this.adjustTrait(
          this.personality.formality,
          feedback,
          learningRate
        );
        this.personality.assertiveness = this.adjustTrait(
          this.personality.assertiveness,
          feedback * 0.5,
          learningRate
        );
        break;

      default:
        // For neutral emotion, make smaller adjustments to all traits
        Object.keys(this.personality).forEach(trait => {
          this.personality[trait as keyof PersonalityProfile] = this.adjustTrait(
            this.personality[trait as keyof PersonalityProfile],
            feedback * 0.25,
            learningRate
          );
        });
    }
  }

  private adjustTrait(current: number, feedback: number, learningRate: number): number {
    return Math.max(0, Math.min(1, current + feedback * learningRate));
  }

  generateResponse(
    userMessage: string,
    userEmotion: Emotion,
    context?: any
  ): EmotionalResponse {
    const response = this.craftResponse(userMessage, userEmotion);
    const tone = this.determineTone(userEmotion);
    const actions = this.suggestActions(userEmotion, context);

    return {
      content: response,
      tone,
      suggestedActions: actions,
    };
  }

  private craftResponse(message: string, emotion: Emotion): string {
    // This is a placeholder. In a real implementation, you would:
    // 1. Use NLP to understand the message
    // 2. Consider the user's emotional state
    // 3. Apply the AI's personality traits
    // 4. Generate an appropriate response using a language model
    return `I understand you're feeling ${emotion}. How can I help?`;
  }

  private determineTone(emotion: Emotion): string {
    const { empathy, enthusiasm, formality } = this.personality;

    switch (emotion) {
      case 'sad':
        return empathy > 0.7 ? 'compassionate' : 'supportive';
      case 'stressed':
        return empathy > 0.6 ? 'calming' : 'practical';
      case 'happy':
        return enthusiasm > 0.6 ? 'enthusiastic' : 'pleasant';
      case 'energetic':
        return enthusiasm > 0.7 ? 'dynamic' : 'engaging';
      case 'calm':
        return formality > 0.6 ? 'composed' : 'relaxed';
      default:
        return 'neutral';
    }
  }

  private suggestActions(emotion: Emotion, context?: any): string[] {
    const suggestions: string[] = [];

    switch (emotion) {
      case 'sad':
        suggestions.push(
          "Would you like to talk about what's bothering you?",
          "How about we do something enjoyable together?",
          "Should we look at some happy memories?"
        );
        break;

      case 'stressed':
        suggestions.push(
          "Let's try some breathing exercises",
          "Would you like to take a short break?",
          "Should we break down what's causing the stress?"
        );
        break;

      case 'happy':
        suggestions.push(
          "Want to share what made you happy?",
          "Should we plan something fun?",
          "How about we set some exciting goals?"
        );
        break;

      case 'energetic':
        suggestions.push(
          "Want to channel this energy into something productive?",
          "How about we tackle that project you've been thinking about?",
          "Should we do something creative?"
        );
        break;

      case 'calm':
        suggestions.push(
          "Would you like to reflect on your day?",
          "How about we plan for tomorrow?",
          "Should we practice some mindfulness?"
        );
        break;

      default:
        suggestions.push(
          "What would you like to focus on?",
          "How can I help you today?",
          "Want to explore something new?"
        );
    }

    return suggestions;
  }

  getInteractionHistory(): Interaction[] {
    return [...this.interactions];
  }

  async resetPersonality(): Promise<void> {
    this.personality = {
      empathy: 0.5,
      enthusiasm: 0.5,
      formality: 0.5,
      humor: 0.5,
      assertiveness: 0.5,
      creativity: 0.5,
    };
    this.interactions = [];
    await this.saveState();
  }
}

export default new AIPersonalityService();
