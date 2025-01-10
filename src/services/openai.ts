import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@/config';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const generateResponse = async (
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  } = {}
) => {
  const {
    temperature = 0.7,
    maxTokens = 150,
    model = 'gpt-4-turbo-preview',
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

export const analyzeEmotion = async (text: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert in emotional analysis. Analyze the following text and return a JSON object with the detected emotions and their intensities (0-1).',
        },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Emotion Analysis Error:', error);
    throw error;
  }
};

export default {
  generateResponse,
  analyzeEmotion,
};
