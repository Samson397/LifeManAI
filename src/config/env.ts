import { REACT_APP_OPENAI_API_KEY } from '@env';

export const config = {
  openAIApiKey: REACT_APP_OPENAI_API_KEY || '',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validate required environment variables
const validateEnv = () => {
  if (!config.openAIApiKey) {
    console.error('Missing REACT_APP_OPENAI_API_KEY environment variable');
  }
};

validateEnv();
