import { db, auth } from '../config/firebase';
import { Emotion } from '../contexts/EmotionContext';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
  emotion?: Emotion;
  userId?: string;
}

class FirebaseChatService {
  private static COLLECTION_NAME = 'chats';

  static async saveMessage(message: Omit<ChatMessage, 'id'>): Promise<string> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const chatRef = await db.collection(this.COLLECTION_NAME).add({
        ...message,
        userId,
        createdAt: new Date().toISOString(),
      });

      return chatRef.id;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  static async getChatHistory(limit: number = 50): Promise<ChatMessage[]> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const snapshot = await db
        .collection(this.COLLECTION_NAME)
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await db.collection(this.COLLECTION_NAME).doc(messageId).delete();
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  static subscribeToNewMessages(
    callback: (messages: ChatMessage[]) => void,
  ): () => void {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const unsubscribe = db
      .collection(this.COLLECTION_NAME)
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .onSnapshot(snapshot => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatMessage[];
        callback(messages);
      });

    return unsubscribe;
  }

  static async clearChatHistory(): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const snapshot = await db
        .collection(this.COLLECTION_NAME)
        .where('userId', '==', userId)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }
}

export default FirebaseChatService;
