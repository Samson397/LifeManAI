import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { createInteractionStyle } from '../../utils/styleUtils';

interface NavigationViewProps extends ViewProps {
  interactive?: boolean;
}

export const NavigationView: React.FC<NavigationViewProps> = ({
  children,
  style,
  interactive = true,
  ...props
}) => {
  return (
    <View
      style={[
        styles.container,
        style,
        createInteractionStyle(interactive),
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default NavigationView;
