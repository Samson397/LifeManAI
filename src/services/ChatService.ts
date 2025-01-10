import OpenAI from 'openai';
import type { Emotion } from '../contexts/EmotionContext';
import KnowledgeBaseService from './KnowledgeBaseService';

class ChatService {
  private static openai: OpenAI;
  private static conversationHistory: { role: 'user' | 'assistant' | 'system', content: string }[] = [];
  private static lastResponse: string = '';

  static initialize(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });

    // Initialize knowledge base
    KnowledgeBaseService.initialize();

    // Initialize with system message
    this.conversationHistory = [{
      role: 'system',
      content: `You are an empathetic AI companion that helps users with their emotional well-being. 
      You should be supportive, understanding, and adapt your responses based on the user's emotional state.
      Keep responses concise and natural, as if chatting with a friend.
      Learn from past interactions to provide better support.
      IMPORTANT: Never ask for or store personal information. Keep responses general and avoid specifics.
      If a user shares personal details, acknowledge without repeating them and guide the conversation to general topics.`
    }];
  }

  private static sanitizeMessage(message: string): string {
    // Remove any message that looks like it contains sensitive data
    if (
      message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/) || // email
      message.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/) || // phone
      message.match(/\b(?:\d[ -]*?){13,16}\b/) || // credit card
      message.match(/\b\d{3}[-]?\d{2}[-]?\d{4}\b/) // SSN
    ) {
      return "I notice you've shared some personal information. For your privacy and security, I've removed it. Let's focus on how you're feeling instead.";
    }
    return message;
  }

  static async generateResponse(
    userMessage: string,
    emotion: Emotion,
    personality: {
      empathy: number;
      openness: number;
      adaptability: number;
      humor: number;
    }
  ): Promise<string> {
    try {
      // Check for sensitive information
      const sanitizedMessage = this.sanitizeMessage(userMessage);
      if (sanitizedMessage !== userMessage) {
        return sanitizedMessage;
      }

      // Check knowledge base for relevant response
      const knowledgeEntry = await KnowledgeBaseService.findRelevantKnowledge(
        userMessage,
        emotion
      );

      // Add emotional context
      const emotionContext = `[Current emotion: ${emotion}]`;
      
      // Add message to history
      this.conversationHistory.push({
        role: 'user',
        content: `${emotionContext}\n${userMessage}`
      });

      // If we have relevant knowledge, include it in the prompt
      if (knowledgeEntry) {
        this.conversationHistory.push({
          role: 'system',
          content: `Previous helpful response pattern: "${knowledgeEntry.response}"`
        });
      }

      // Keep conversation history manageable
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-9) // Keep last 9 messages
        ];
      }

      // Generate personality-based instruction
      const personalityInstruction = `Respond with ${personality.empathy * 100}% empathy, 
        ${personality.openness * 100}% openness, ${personality.adaptability * 100}% adaptability, 
        and ${personality.humor * 100}% humor. Remember to keep the response general and avoid asking for personal details.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          ...this.conversationHistory,
          { role: 'system', content: personalityInstruction }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, but I am unable to respond at the moment.';
      
      // Verify the response doesn't contain sensitive information
      const sanitizedResponse = this.sanitizeMessage(response);
      this.lastResponse = sanitizedResponse;

      // Add response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: sanitizedResponse
      });

      // Learn from this interaction (will be updated with effectiveness later)
      await KnowledgeBaseService.learnFromInteraction(
        userMessage,
        sanitizedResponse,
        emotion,
        0.5 // Initial neutral effectiveness
      );

      return sanitizedResponse;
    } catch (error) {
      console.error('Error generating response:', error);
      return 'I apologize, but I encountered an error while processing your message.';
    }
  }

  static async provideFeedback(effectiveness: number): Promise<void> {
    if (this.lastResponse) {
      const pattern = this.conversationHistory[this.conversationHistory.length - 2]?.content || '';
      await KnowledgeBaseService.updateEffectiveness(pattern, effectiveness);
    }
  }
}

export default ChatService;
