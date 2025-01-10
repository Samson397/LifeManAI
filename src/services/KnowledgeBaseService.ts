import { firestore } from '../config/firebase';
import type { Emotion } from '../contexts/EmotionContext';

interface KnowledgeEntry {
  pattern: string;
  response: string;
  context: {
    emotion: Emotion;
    effectiveness: number;
    useCount: number;
  };
  metadata: {
    lastUsed: number;
    totalFeedbackScore: number;
  };
}

class KnowledgeBaseService {
  private static instance: KnowledgeBaseService;
  private knowledgeBase: Map<string, KnowledgeEntry> = new Map();
  private readonly COLLECTION_NAME = 'learning_patterns';

  // Privacy rules for data sanitization
  private readonly PRIVACY_PATTERNS = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // emails
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // phone numbers
    /\b(?:\d[ -]*?){13,16}\b/g, // credit card numbers
    /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, // SSN
    /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, // IP addresses
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // proper names
    /\b\d+ [A-Za-z]+ (Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)\b/gi, // addresses
  ];

  private constructor() {}

  static getInstance(): KnowledgeBaseService {
    if (!KnowledgeBaseService.instance) {
      KnowledgeBaseService.instance = new KnowledgeBaseService();
    }
    return KnowledgeBaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const snapshot = await firestore.collection(this.COLLECTION_NAME).get();
      snapshot.forEach(doc => {
        const entry = doc.data() as KnowledgeEntry;
        this.knowledgeBase.set(doc.id, entry);
      });
    } catch (error) {
      console.error('Failed to initialize knowledge base:', error);
    }
  }

  private sanitizeText(text: string): string {
    // Remove any personal or sensitive information
    let sanitized = text;
    
    // Replace sensitive patterns with generic placeholders
    this.PRIVACY_PATTERNS.forEach((pattern, index) => {
      sanitized = sanitized.replace(pattern, `[REDACTED_${index}]`);
    });

    // Remove specific dates
    sanitized = sanitized.replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '[DATE]');

    // Remove specific locations
    sanitized = sanitized.replace(/\b(in|at|from|to) [A-Z][a-zA-Z]+(,? [A-Z][a-zA-Z]+)*\b/g, '[LOCATION]');

    // Remove specific numbers (keeping general quantities)
    sanitized = sanitized.replace(/\b\d{5,}\b/g, '[NUMBER]');

    // Remove URLs
    sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL]');

    return sanitized;
  }

  private extractGenericPattern(input: string): string {
    // Convert to generic pattern while preserving intent
    return this.sanitizeText(input)
      .toLowerCase()
      .replace(/[0-9]/g, '#')
      .replace(/[^a-z#\s]/g, '')
      .trim();
  }

  async learnFromInteraction(
    userInput: string,
    aiResponse: string,
    emotion: Emotion,
    effectiveness: number
  ): Promise<void> {
    // Sanitize both input and response
    const sanitizedInput = this.sanitizeText(userInput);
    const sanitizedResponse = this.sanitizeText(aiResponse);
    const pattern = this.extractGenericPattern(sanitizedInput);

    const entry: KnowledgeEntry = {
      pattern,
      response: sanitizedResponse,
      context: {
        emotion,
        effectiveness,
        useCount: 1,
      },
      metadata: {
        lastUsed: Date.now(),
        totalFeedbackScore: effectiveness,
      },
    };

    try {
      await firestore.collection(this.COLLECTION_NAME).add(entry);
      this.knowledgeBase.set(pattern, entry);
    } catch (error) {
      console.error('Failed to store knowledge:', error);
    }
  }

  async findRelevantKnowledge(
    userInput: string,
    emotion: Emotion
  ): Promise<KnowledgeEntry | null> {
    const sanitizedInput = this.sanitizeText(userInput);
    const pattern = this.extractGenericPattern(sanitizedInput);
    
    // Find entries with similar patterns and matching emotional context
    const relevantEntries = Array.from(this.knowledgeBase.values())
      .filter(entry => 
        this.calculateSimilarity(pattern, entry.pattern) > 0.7 &&
        entry.context.emotion === emotion
      )
      .sort((a, b) => 
        (b.context.effectiveness * b.context.useCount) - 
        (a.context.effectiveness * a.context.useCount)
      );

    return relevantEntries[0] || null;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1.0;
    
    const distance = this.levenshteinDistance(str1, str2);
    return 1 - distance / maxLength;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str1.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[str1.length][str2.length];
  }

  async updateEffectiveness(
    pattern: string,
    newEffectiveness: number
  ): Promise<void> {
    const sanitizedPattern = this.extractGenericPattern(pattern);
    const entry = this.knowledgeBase.get(sanitizedPattern);
    if (!entry) return;

    const updatedEntry = {
      ...entry,
      context: {
        ...entry.context,
        effectiveness: (entry.context.effectiveness + newEffectiveness) / 2,
        useCount: entry.context.useCount + 1,
      },
      metadata: {
        ...entry.metadata,
        lastUsed: Date.now(),
        totalFeedbackScore: entry.metadata.totalFeedbackScore + newEffectiveness,
      },
    };

    try {
      await firestore
        .collection(this.COLLECTION_NAME)
        .where('pattern', '==', sanitizedPattern)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            doc.ref.update(updatedEntry);
          });
        });

      this.knowledgeBase.set(sanitizedPattern, updatedEntry);
    } catch (error) {
      console.error('Failed to update effectiveness:', error);
    }
  }
}

export default KnowledgeBaseService.getInstance();
