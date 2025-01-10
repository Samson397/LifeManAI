import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  duration?: number;
  key?: string;
}

class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, CacheItem<any>>;
  private readonly CACHE_DURATION = Number(Constants.expoConfig?.extra?.CACHE_DURATION) || 3600000; // 1 hour
  private readonly ASSET_CACHE_DURATION = Number(Constants.expoConfig?.extra?.ASSET_CACHE_DURATION) || 86400000; // 24 hours

  private constructor() {
    this.memoryCache = new Map();
    this.initializeCache();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private async initializeCache(): Promise<void> {
    try {
      // Clean up expired items from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache:'));
      
      for (const key of cacheKeys) {
        const item = await this.getFromStorage(key);
        if (item && this.isExpired(item)) {
          await AsyncStorage.removeItem(key);
        }
      }

      // Clean up expired assets
      await this.cleanupAssetCache();
    } catch (error) {
      console.error('Cache initialization error:', error);
    }
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() > item.expiresAt;
  }

  private async getFromStorage<T>(key: string): Promise<CacheItem<T> | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private async saveToStorage<T>(key: string, item: CacheItem<T>): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  async get<T>(key: string, config?: CacheConfig): Promise<T | null> {
    // Check memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && !this.isExpired(memoryItem)) {
      return memoryItem.data;
    }

    // Check persistent storage
    const storageKey = `cache:${key}`;
    const storageItem = await this.getFromStorage<T>(storageKey);
    if (storageItem && !this.isExpired(storageItem)) {
      this.memoryCache.set(key, storageItem);
      return storageItem.data;
    }

    return null;
  }

  async set<T>(key: string, data: T, config?: CacheConfig): Promise<void> {
    const duration = config?.duration || this.CACHE_DURATION;
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration,
    };

    // Save to memory cache
    this.memoryCache.set(key, item);

    // Save to persistent storage
    await this.saveToStorage(`cache:${key}`, item);
  }

  async cacheAsset(url: string, config?: CacheConfig): Promise<string> {
    const cacheKey = `asset:${url}`;
    const cachedPath = await this.get<string>(cacheKey);

    if (cachedPath) {
      try {
        const info = await FileSystem.getInfoAsync(cachedPath);
        if (info.exists) {
          return cachedPath;
        }
      } catch {}
    }

    try {
      const filename = url.split('/').pop() || 'asset';
      const extension = filename.includes('.') ? '' : '.tmp';
      const localPath = `${FileSystem.cacheDirectory}${filename}${extension}`;

      await FileSystem.downloadAsync(url, localPath);
      await this.set(cacheKey, localPath, {
        duration: config?.duration || this.ASSET_CACHE_DURATION,
      });

      return localPath;
    } catch (error) {
      console.error('Asset caching error:', error);
      throw error;
    }
  }

  private async cleanupAssetCache(): Promise<void> {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) return;

      const dirContent = await FileSystem.readDirectoryAsync(cacheDir);
      for (const filename of dirContent) {
        const filePath = `${cacheDir}${filename}`;
        const info = await FileSystem.getInfoAsync(filePath);
        
        if (info.exists) {
          const modificationTime = info.modificationTime || 0;
          const age = Date.now() - modificationTime * 1000;
          
          if (age > this.ASSET_CACHE_DURATION) {
            await FileSystem.deleteAsync(filePath, { idempotent: true });
          }
        }
      }
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key);
    await AsyncStorage.removeItem(`cache:${key}`);
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache:'));
      await AsyncStorage.multiRemove(cacheKeys);
      
      // Clean up asset cache
      await this.cleanupAssetCache();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

export default CacheService.getInstance();
