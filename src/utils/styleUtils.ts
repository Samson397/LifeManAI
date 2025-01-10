import { Platform, ViewStyle } from 'react-native';

type PlatformStyles = {
  ios?: ViewStyle;
  android?: ViewStyle;
  web?: any; // Allow web-specific styles
  default?: ViewStyle;
};

export const createBoxShadow = (
  color: string,
  offset = { height: 2, width: 2 },
  radius = 8,
  opacity = 0.2
): ViewStyle => {
  const styles: PlatformStyles = {
    ios: {
      shadowColor: color,
      shadowOffset: offset,
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation: radius,
    },
    web: {
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    },
  };

  return (Platform.OS === 'web' ? styles.web : (styles[Platform.OS] || styles.default || {})) as ViewStyle;
};

export const createPointerEvents = (): ViewStyle => {
  const styles: PlatformStyles = {
    web: {
      cursor: 'pointer',
    },
    default: {},
  };

  return (Platform.OS === 'web' ? styles.web : (styles[Platform.OS] || styles.default || {})) as ViewStyle;
};
