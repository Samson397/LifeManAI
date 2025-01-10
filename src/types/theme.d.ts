import '@react-navigation/native';

declare module '@react-navigation/native' {
  export interface Theme {
    dark: boolean;
    colors: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
      accent?: string;
      highlight?: string;
      error?: string;
      success?: string;
      warning?: string;
      info?: string;
      disabled?: string;
      placeholder?: string;
    };
    fonts?: {
      regular: string;
      medium: string;
      light: string;
      thin: string;
    };
    spacing?: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    roundness?: number;
  }
}
