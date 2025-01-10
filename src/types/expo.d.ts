declare module 'expo-av' {
  export interface Recording {
    getStatusAsync(): Promise<any>;
    startAsync(): Promise<void>;
    stopAndUnloadAsync(): Promise<void>;
    createNewLoadedSoundAsync(): Promise<any>;
  }

  export const Audio: {
    Recording: new () => Recording;
    setAudioModeAsync(options: {
      allowsRecordingIOS: boolean;
      playsInSilentModeIOS: boolean;
      staysActiveInBackground: boolean;
      shouldDuckAndroid: boolean;
      playThroughEarpieceAndroid: boolean;
    }): Promise<void>;
    RecordingOptionsPresets: {
      HIGH_QUALITY: any;
    };
    requestPermissionsAsync(): Promise<{ status: string }>;
  };
}

declare module 'expo-crypto' {
  export enum CryptoDigestAlgorithm {
    SHA1 = 'SHA-1',
    SHA256 = 'SHA-256',
    SHA384 = 'SHA-384',
    SHA512 = 'SHA-512',
  }

  export function digestStringAsync(
    algorithm: CryptoDigestAlgorithm,
    data: string
  ): Promise<string>;
}

declare module 'expo-linear-gradient' {
  import { ViewProps } from 'react-native';
  
  export interface LinearGradientProps extends ViewProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
  }
  
  export default class LinearGradient extends React.Component<LinearGradientProps> {}
}

declare module 'expo-splash-screen' {
  export function preventAutoHideAsync(): Promise<void>;
  export function hideAsync(): Promise<void>;
}
