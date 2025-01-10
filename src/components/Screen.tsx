import React from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getThemeColors, spacing } from '../theme';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  withPadding?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  withPadding = true,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View
        style={[
          styles.container,
          withPadding && styles.padding,
          { backgroundColor: colors.background },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  padding: {
    padding: spacing.md,
  },
});
