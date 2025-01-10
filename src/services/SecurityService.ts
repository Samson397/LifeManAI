import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

interface EncryptionKey {
  key: string;
  iv: string;
}

interface SecuritySettings {
  dataRetentionDays: number;
  privacyMode: boolean;
  biometricEnabled: boolean;
  encryptionEnabled: boolean;
}

class SecurityService {
  private readonly ENCRYPTION_KEY_STORAGE = '@encryption_key';
  private readonly SECURITY_SETTINGS_STORAGE = '@security_settings';
  private encryptionKey: EncryptionKey | null = null;

  async initialize(): Promise<void> {
    try {
      // Generate or retrieve encryption key
      const storedKey = await AsyncStorage.getItem(this.ENCRYPTION_KEY_STORAGE);
      if (storedKey) {
        this.encryptionKey = JSON.parse(storedKey);
      } else {
        this.encryptionKey = await this.generateEncryptionKey();
        await AsyncStorage.setItem(
          this.ENCRYPTION_KEY_STORAGE,
          JSON.stringify(this.encryptionKey)
        );
      }
    } catch (error) {
      console.error('Failed to initialize security service:', error);
      throw error;
    }
  }

  async encryptData(data: any): Promise<string> {
    try {
      if (!this.encryptionKey) {
        await this.initialize();
      }

      const jsonData = JSON.stringify(data);
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        jsonData + this.encryptionKey!.key
      );

      // In a real app, you would use a proper encryption algorithm
      // This is a simplified example using base64 encoding
      return Buffer.from(jsonData).toString('base64') + '.' + digest;
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      throw error;
    }
  }

  async decryptData(encryptedData: string): Promise<any> {
    try {
      if (!this.encryptionKey) {
        await this.initialize();
      }

      const [data, digest] = encryptedData.split('.');
      const jsonData = Buffer.from(data, 'base64').toString();
      
      // Verify data integrity
      const expectedDigest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        jsonData + this.encryptionKey!.key
      );

      if (digest !== expectedDigest) {
        throw new Error('Data integrity check failed');
      }

      return JSON.parse(jsonData);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw error;
    }
  }

  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const settings = await AsyncStorage.getItem(this.SECURITY_SETTINGS_STORAGE);
      return settings
        ? JSON.parse(settings)
        : this.getDefaultSecuritySettings();
    } catch (error) {
      console.error('Failed to get security settings:', error);
      return this.getDefaultSecuritySettings();
    }
  }

  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<void> {
    try {
      const currentSettings = await this.getSecuritySettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(
        this.SECURITY_SETTINGS_STORAGE,
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      console.error('Failed to update security settings:', error);
      throw error;
    }
  }

  async cleanupExpiredData(): Promise<void> {
    try {
      const settings = await this.getSecuritySettings();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - settings.dataRetentionDays);

      // Clean up old emotional data
      const emotionalData = await AsyncStorage.getItem('@emotional_data');
      if (emotionalData) {
        const parsedData = JSON.parse(emotionalData);
        const filteredData = parsedData.filter(
          (item: any) => new Date(item.timestamp) > cutoffDate
        );
        await AsyncStorage.setItem(
          '@emotional_data',
          JSON.stringify(filteredData)
        );
      }

      // Clean up old health data
      const healthData = await AsyncStorage.getItem('@health_data');
      if (healthData) {
        const parsedData = JSON.parse(healthData);
        const filteredData = parsedData.filter(
          (item: any) => new Date(item.timestamp) > cutoffDate
        );
        await AsyncStorage.setItem('@health_data', JSON.stringify(filteredData));
      }
    } catch (error) {
      console.error('Failed to cleanup expired data:', error);
    }
  }

  private async generateEncryptionKey(): Promise<EncryptionKey> {
    const key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Date.now().toString()
    );
    const iv = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key
    );
    return { key, iv };
  }

  private getDefaultSecuritySettings(): SecuritySettings {
    return {
      dataRetentionDays: 30,
      privacyMode: false,
      biometricEnabled: false,
      encryptionEnabled: true,
    };
  }

  // Privacy Policy Methods
  async acceptPrivacyPolicy(): Promise<void> {
    await AsyncStorage.setItem('@privacy_policy_accepted', 'true');
  }

  async hasAcceptedPrivacyPolicy(): Promise<boolean> {
    const accepted = await AsyncStorage.getItem('@privacy_policy_accepted');
    return accepted === 'true';
  }

  // Data Export
  async exportUserData(): Promise<string> {
    try {
      const userData = {
        emotional: await AsyncStorage.getItem('@emotional_data'),
        health: await AsyncStorage.getItem('@health_data'),
        tasks: await AsyncStorage.getItem('@tasks'),
        analytics: await AsyncStorage.getItem('@analytics'),
      };

      return JSON.stringify(userData);
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }

  // Data Deletion
  async deleteAllUserData(): Promise<void> {
    const keys = [
      '@emotional_data',
      '@health_data',
      '@tasks',
      '@analytics',
      '@privacy_policy_accepted',
    ];

    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Failed to delete user data:', error);
      throw error;
    }
  }
}

export default new SecurityService();
