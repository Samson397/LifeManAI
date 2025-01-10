import { Image } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { storage } from '../config/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import Constants from 'expo-constants';

interface AssetUrls {
  icon: string;
  adaptiveIcon: string;
  [key: string]: string;
}

interface LocalAssets {
  icon: number;
  adaptiveIcon: number;
  [key: string]: number;
}

class AssetManager {
  private static instance: AssetManager;
  private assetUrls: AssetUrls | null = null;
  private localAssets: LocalAssets;
  private cachedAssets: Map<string, string> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  private constructor(localAssets: LocalAssets) {
    this.localAssets = localAssets;
  }

  static getInstance(localAssets: LocalAssets): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager(localAssets);
    }
    return AssetManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Load and cache Firebase URLs
      await this.loadFirebaseUrls();
      
      // Pre-load local assets as fallback
      await this.loadLocalAssets();

      // Pre-cache remote assets
      if (this.assetUrls) {
        await this.prefetchRemoteAssets();
      }
    } catch (error) {
      console.error('Asset initialization error:', error);
      // Fall back to local assets
      this.assetUrls = null;
    }
  }

  private async loadFirebaseUrls(): Promise<void> {
    try {
      const [iconUrl, adaptiveIconUrl] = await Promise.all([
        getDownloadURL(ref(storage, 'assets/icon.png')),
        getDownloadURL(ref(storage, 'assets/adaptive-icon.png')),
      ]);

      this.assetUrls = {
        icon: iconUrl,
        adaptiveIcon: adaptiveIconUrl,
      };
    } catch (error) {
      console.warn('Failed to load Firebase assets:', error);
      this.assetUrls = null;
    }
  }

  private async loadLocalAssets(): Promise<void> {
    try {
      await Asset.loadAsync(Object.values(this.localAssets));
    } catch (error) {
      console.error('Failed to load local assets:', error);
      throw error; // This is critical, so we throw
    }
  }

  private async prefetchRemoteAssets(): Promise<void> {
    if (!this.assetUrls) return;

    const prefetchPromises = Object.entries(this.assetUrls).map(async ([key, url]) => {
      try {
        if (this.cachedAssets.has(key)) return;

        // Check if we have the asset cached in FileSystem
        const cacheKey = `${Constants.expoConfig?.slug}_${key}`;
        const cacheDir = `${FileSystem.cacheDirectory}assets/`;
        const cachePath = `${cacheDir}${cacheKey}`;

        // Ensure cache directory exists
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });

        // Check if cached version exists
        const cacheInfo = await FileSystem.getInfoAsync(cachePath);
        
        if (cacheInfo.exists) {
          this.cachedAssets.set(key, cachePath);
          return;
        }

        // Download and cache the asset
        await FileSystem.downloadAsync(url, cachePath);
        this.cachedAssets.set(key, cachePath);

        // Prefetch for Image component
        await Image.prefetch(url);
      } catch (error) {
        console.warn(`Failed to prefetch asset ${key}:`, error);
      }
    });

    await Promise.all(prefetchPromises);
  }

  async getAsset(key: keyof LocalAssets): Promise<string | number> {
    // If we're already loading this asset, wait for it
    if (this.loadingPromises.has(key)) {
      await this.loadingPromises.get(key);
    }

    // Check if we have a cached local file
    if (this.cachedAssets.has(key)) {
      return this.cachedAssets.get(key)!;
    }

    // Try to load from Firebase if available
    if (this.assetUrls?.[key]) {
      const loadPromise = (async () => {
        try {
          await this.prefetchRemoteAssets();
          return this.assetUrls![key];
        } catch (error) {
          console.warn(`Failed to load remote asset ${key}, falling back to local:`, error);
          return this.localAssets[key];
        }
      })();

      this.loadingPromises.set(key, loadPromise);
      const result = await loadPromise;
      this.loadingPromises.delete(key);
      return result;
    }

    // Fall back to local asset
    return this.localAssets[key];
  }

  clearCache(): void {
    this.cachedAssets.clear();
    this.loadingPromises.clear();
  }
}

export default AssetManager;
