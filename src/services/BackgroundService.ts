import { Animated } from 'react-native';

export interface BackgroundTheme {
  name: string;
  category: 'nature' | 'urban' | 'abstract' | 'cosmic';
  images: {
    [key: string]: string; // emotion -> image path
  };
  animations: {
    [key: string]: AnimationConfig; // emotion -> animation config
  };
}

interface AnimationConfig {
  type: 'fade' | 'slide' | 'clouds' | 'waves' | 'particles' | 'aurora' | 'rain';
  duration: number;
  properties: {
    [key: string]: any;
  };
}

class BackgroundService {
  private themes: BackgroundTheme[] = [
    {
      name: 'Nature',
      category: 'nature',
      images: {
        happy: 'assets/backgrounds/nature/sunny_meadow.jpg',
        sad: 'assets/backgrounds/nature/rainy_forest.jpg',
        calm: 'assets/backgrounds/nature/peaceful_lake.jpg',
        stressed: 'assets/backgrounds/nature/stormy_mountains.jpg',
        energetic: 'assets/backgrounds/nature/vibrant_sunset.jpg',
        neutral: 'assets/backgrounds/nature/mild_forest.jpg',
      },
      animations: {
        calm: {
          type: 'clouds',
          duration: 20000,
          properties: {
            speed: 'slow',
            opacity: 0.7,
          },
        },
        energetic: {
          type: 'waves',
          duration: 5000,
          properties: {
            amplitude: 20,
            frequency: 2,
          },
        },
        sad: {
          type: 'rain',
          duration: 10000,
          properties: {
            intensity: 0.5,
            speed: 'medium',
          },
        },
      },
    },
    {
      name: 'Urban',
      category: 'urban',
      images: {
        happy: 'assets/backgrounds/urban/sunny_cityscape.jpg',
        sad: 'assets/backgrounds/urban/rainy_street.jpg',
        calm: 'assets/backgrounds/urban/quiet_park.jpg',
        stressed: 'assets/backgrounds/urban/busy_intersection.jpg',
        energetic: 'assets/backgrounds/urban/night_lights.jpg',
        neutral: 'assets/backgrounds/urban/city_morning.jpg',
      },
      animations: {
        calm: {
          type: 'fade',
          duration: 15000,
          properties: {
            opacity: [0.8, 1],
          },
        },
        stressed: {
          type: 'slide',
          duration: 10000,
          properties: {
            direction: 'horizontal',
          },
        },
        energetic: {
          type: 'particles',
          duration: 8000,
          properties: {
            count: 50,
            speed: 'fast',
          },
        },
      },
    },
    {
      name: 'Abstract',
      category: 'abstract',
      images: {
        happy: 'assets/backgrounds/abstract/warm_colors.jpg',
        sad: 'assets/backgrounds/abstract/cool_waves.jpg',
        calm: 'assets/backgrounds/abstract/floating_shapes.jpg',
        stressed: 'assets/backgrounds/abstract/sharp_patterns.jpg',
        energetic: 'assets/backgrounds/abstract/dynamic_swirls.jpg',
        neutral: 'assets/backgrounds/abstract/balanced_forms.jpg',
      },
      animations: {
        calm: {
          type: 'aurora',
          duration: 25000,
          properties: {
            colors: ['#00ff87', '#60efff', '#0061ff'],
            speed: 'slow',
          },
        },
        energetic: {
          type: 'particles',
          duration: 6000,
          properties: {
            count: 100,
            speed: 'fast',
          },
        },
      },
    },
    {
      name: 'Cosmic',
      category: 'cosmic',
      images: {
        happy: 'assets/backgrounds/cosmic/nebula_burst.jpg',
        sad: 'assets/backgrounds/cosmic/distant_stars.jpg',
        calm: 'assets/backgrounds/cosmic/galaxy_view.jpg',
        stressed: 'assets/backgrounds/cosmic/black_hole.jpg',
        energetic: 'assets/backgrounds/cosmic/supernova.jpg',
        neutral: 'assets/backgrounds/cosmic/star_field.jpg',
      },
      animations: {
        calm: {
          type: 'aurora',
          duration: 30000,
          properties: {
            colors: ['#ff0080', '#ff8c00', '#40e0d0'],
            speed: 'slow',
          },
        },
        energetic: {
          type: 'particles',
          duration: 4000,
          properties: {
            count: 200,
            speed: 'very-fast',
          },
        },
      },
    },
  ];

  private currentTheme: BackgroundTheme;
  private animationValues: {
    [key: string]: Animated.Value;
  } = {};

  constructor() {
    this.currentTheme = this.themes[0]; // Default to Nature theme
    this.initializeAnimations();
  }

  private initializeAnimations() {
    this.animationValues = {
      opacity: new Animated.Value(1),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      scale: new Animated.Value(1),
      rotation: new Animated.Value(0),
      particleOpacity: new Animated.Value(0),
    };
  }

  getBackgroundForEmotion(emotion: string): string {
    return this.currentTheme.images[emotion] || this.currentTheme.images.neutral;
  }

  async transitionBackground(fromEmotion: string, toEmotion: string): Promise<void> {
    const animation = this.createTransitionAnimation(fromEmotion, toEmotion);
    return new Promise((resolve) => {
      Animated.sequence(animation).start(() => resolve());
    });
  }

  private createTransitionAnimation(fromEmotion: string, toEmotion: string): Animated.CompositeAnimation[] {
    const animations: Animated.CompositeAnimation[] = [];

    // Fade out current background
    animations.push(
      Animated.timing(this.animationValues.opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    );

    // Add emotion-specific animations
    const emotionConfig = this.currentTheme.animations[toEmotion];
    if (emotionConfig) {
      switch (emotionConfig.type) {
        case 'clouds':
          animations.push(this.createCloudAnimation(emotionConfig));
          break;
        case 'waves':
          animations.push(this.createWaveAnimation(emotionConfig));
          break;
        case 'particles':
          animations.push(this.createParticleAnimation(emotionConfig));
          break;
        case 'aurora':
          animations.push(this.createAuroraAnimation(emotionConfig));
          break;
        case 'rain':
          animations.push(this.createRainAnimation(emotionConfig));
          break;
      }
    }

    // Fade in new background
    animations.push(
      Animated.timing(this.animationValues.opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    );

    return animations;
  }

  private createCloudAnimation(config: AnimationConfig): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(this.animationValues.translateX, {
          toValue: 100,
          duration: config.duration,
          useNativeDriver: true,
        }),
        Animated.timing(this.animationValues.translateX, {
          toValue: -100,
          duration: config.duration,
          useNativeDriver: true,
        }),
      ])
    );
  }

  private createWaveAnimation(config: AnimationConfig): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(this.animationValues.translateY, {
          toValue: config.properties.amplitude,
          duration: config.duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(this.animationValues.translateY, {
          toValue: -config.properties.amplitude,
          duration: config.duration / 2,
          useNativeDriver: true,
        }),
      ])
    );
  }

  private createParticleAnimation(config: AnimationConfig): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(this.animationValues.particleOpacity, {
            toValue: 1,
            duration: config.duration / 4,
            useNativeDriver: true,
          }),
          Animated.timing(this.animationValues.scale, {
            toValue: 1.2,
            duration: config.duration / 2,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(this.animationValues.particleOpacity, {
            toValue: 0,
            duration: config.duration / 4,
            useNativeDriver: true,
          }),
          Animated.timing(this.animationValues.scale, {
            toValue: 1,
            duration: config.duration / 2,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
  }

  private createAuroraAnimation(config: AnimationConfig): Animated.CompositeAnimation {
    return Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(this.animationValues.rotation, {
            toValue: 1,
            duration: config.duration,
            useNativeDriver: true,
          }),
          Animated.timing(this.animationValues.scale, {
            toValue: 1.1,
            duration: config.duration / 2,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(this.animationValues.rotation, {
            toValue: 0,
            duration: config.duration,
            useNativeDriver: true,
          }),
          Animated.timing(this.animationValues.scale, {
            toValue: 1,
            duration: config.duration / 2,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
  }

  private createRainAnimation(config: AnimationConfig): Animated.CompositeAnimation {
    const speedMultiplier = config.properties.speed === 'fast' ? 0.5 : 1;
    return Animated.loop(
      Animated.sequence([
        Animated.timing(this.animationValues.translateY, {
          toValue: 100,
          duration: config.duration * speedMultiplier,
          useNativeDriver: true,
        }),
        Animated.timing(this.animationValues.translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
  }

  setTheme(category: 'nature' | 'urban' | 'abstract' | 'cosmic') {
    const theme = this.themes.find(t => t.category === category);
    if (theme) {
      this.currentTheme = theme;
    }
  }

  getAnimatedStyle(emotion: string) {
    const baseStyle = {
      opacity: this.animationValues.opacity,
      transform: [
        { translateX: this.animationValues.translateX },
        { translateY: this.animationValues.translateY },
        { scale: this.animationValues.scale },
        {
          rotate: this.animationValues.rotation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          }),
        },
      ],
    };

    const emotionConfig = this.currentTheme.animations[emotion];
    if (emotionConfig?.type === 'particles' || emotionConfig?.type === 'aurora') {
      return {
        ...baseStyle,
        particleOpacity: this.animationValues.particleOpacity,
      };
    }

    return baseStyle;
  }

  getCurrentTheme(): BackgroundTheme {
    return this.currentTheme;
  }

  getAllThemes(): BackgroundTheme[] {
    return this.themes;
  }
}

export default new BackgroundService();
