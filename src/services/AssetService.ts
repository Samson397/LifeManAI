import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../config/firebase';

interface AssetUrls {
  icon: string;
  adaptiveIcon: string;
  favicon: string;
}

class AssetService {
  private static instance: AssetService;
  private assetUrls: AssetUrls | null = null;

  private constructor() {}

  public static getInstance(): AssetService {
    if (!AssetService.instance) {
      AssetService.instance = new AssetService();
    }
    return AssetService.instance;
  }

  public async loadAssets(): Promise<void> {
    try {
      const [iconUrl, adaptiveIconUrl, faviconUrl] = await Promise.all([
        getDownloadURL(ref(storage, 'assets/icon.png')),
        getDownloadURL(ref(storage, 'assets/adaptive-icon.png')),
        getDownloadURL(ref(storage, 'assets/favicon.png')),
      ]);

      this.assetUrls = {
        icon: iconUrl,
        adaptiveIcon: adaptiveIconUrl,
        favicon: faviconUrl,
      };
    } catch (error) {
      console.error('Error loading assets:', error);
      throw error;
    }
  }

  public getAssetUrl(assetName: keyof AssetUrls): string {
    if (!this.assetUrls) {
      throw new Error('Assets not loaded');
    }
    return this.assetUrls[assetName];
  }
}

export default AssetService.getInstance();
