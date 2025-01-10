import AssetManager from '../services/AssetManager';

// Local assets with require statements
export const localAssets = {
  icon: require('../../assets/icon.png'),
  adaptiveIcon: require('../../assets/adaptive-icon.png'),
  favicon: require('../../assets/favicon.png'),
};

// Create and export the AssetManager instance
const assetManager = AssetManager.getInstance(localAssets);

export default assetManager;
