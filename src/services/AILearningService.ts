import type { Emotion } from '../contexts/EmotionContext';
import ChatService from './ChatService';

interface PersonalityTrait {
  trait: string;
  value: number;  // 0 to 1
}

interface Memory {
  type: 'interaction' | 'emotion' | 'preference';
  content: string;
  timestamp: number;
  importance: number;  // 0 to 1
}

interface AIPersonality {
  empathy: number;
  openness: number;
  adaptability: number;
  humor: number;
  traits: PersonalityTrait[];
}

class AILearningService {
  private static personality: AIPersonality = {
    empathy: 0.5,
    openness: 0.5,
    adaptability: 0.5,
    humor: 0.5,
    traits: [],
  };

  private static memories: Memory[] = [];
  private static initialized = false;

  static initialize(openAIKey: string) {
    if (!this.initialized) {
      ChatService.initialize(openAIKey);
      this.initialized = true;
    }
  }

  static async learnFromEmotion(emotion: Emotion, intensity: number): Promise<void> {
    // Adjust personality based on user's emotional state
    if (emotion === 'happy') {
      this.personality.humor = Math.min(1, this.personality.humor + 0.05);
    } else if (emotion === 'sad') {
      this.personality.empathy = Math.min(1, this.personality.empathy + 0.05);
    }

    // Store emotional memory
    this.memories.push({
      type: 'emotion',
      content: `User felt ${emotion} with intensity ${intensity}`,
      timestamp: Date.now(),
      importance: intensity,
    });
  }

  static async learnFromInteraction(userMessage: string, aiResponse: string): Promise<void> {
    // Analyze interaction and store memory
    this.memories.push({
      type: 'interaction',
      content: `User: ${userMessage}\nAI: ${aiResponse}`,
      timestamp: Date.now(),
      importance: 0.7,
    });

    // Adjust adaptability based on interaction frequency
    this.personality.adaptability = Math.min(1, this.personality.adaptability + 0.02);
  }

  static async generateResponse(userMessage: string, currentEmotion: Emotion): Promise<string> {
    if (!this.initialized) {
      throw new Error('AILearningService not initialized. Call initialize() with OpenAI API key first.');
    }

    try {
      const response = await ChatService.generateResponse(
        userMessage,
        currentEmotion,
        {
          empathy: this.personality.empathy,
          openness: this.personality.openness,
          adaptability: this.personality.adaptability,
          humor: this.personality.humor,
        }
      );
      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      return this.generateFallbackResponse(currentEmotion);
    }
  }

  private static generateFallbackResponse(emotion: Emotion): string {
    const responses = {
      happy: "I'm so glad you're feeling happy! Your positive energy is contagious.",
      sad: "I understand you're feeling down. I'm here to listen and support you.",
      stressed: "It sounds like you're under a lot of pressure. Let's take a deep breath together.",
      calm: "It's wonderful that you're feeling peaceful. Let's maintain this tranquil state.",
      energetic: "Your energy is amazing! Let's channel it into something productive.",
      neutral: "How are you feeling right now? I'm here to chat about anything.",
    };
    return responses[emotion];
  }

  static getPersonalityInsights(): AIPersonality {
    return { ...this.personality };
  }

  static getRecentMemories(limit: number = 10): Memory[] {
    return this.memories
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  static clearMemories() {
    this.memories = [];
    ChatService.clearHistory();
  }
}

export default AILearningService;
