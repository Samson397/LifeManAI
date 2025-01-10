import React, { useEffect, useState } from 'react';
import { Image, ImageProps, ActivityIndicator, View, StyleSheet } from 'react-native';
import assetManager from '../../constants/assets';

interface AsyncImageProps extends Omit<ImageProps, 'source'> {
  assetKey: string;
  loadingColor?: string;
}

const AsyncImage: React.FC<AsyncImageProps> = ({ 
  assetKey, 
  loadingColor = '#4A90E2',
  style,
  ...props 
}) => {
  const [source, setSource] = useState<number | { uri: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadAsset = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const asset = await assetManager.getAsset(assetKey);
        
        if (!mounted) return;

        if (typeof asset === 'string') {
          setSource({ uri: asset });
        } else {
          setSource(asset);
        }
      } catch (err) {
        console.error(`Failed to load asset ${assetKey}:`, err);
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAsset();

    return () => {
      mounted = false;
    };
  }, [assetKey]);

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator color={loadingColor} />
      </View>
    );
  }

  if (error || !source) {
    // You might want to show a placeholder image here
    return null;
  }

  return (
    <Image
      source={source}
      style={style}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AsyncImage;
