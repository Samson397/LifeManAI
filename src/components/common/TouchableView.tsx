import React from 'react';
import { View, ViewProps } from 'react-native';
import { createInteractionStyle } from '../../utils/styleUtils';

interface TouchableViewProps extends ViewProps {
  touchEnabled?: boolean;
}

export const TouchableView: React.FC<TouchableViewProps> = ({
  children,
  style,
  touchEnabled = true,
  ...props
}) => {
  return (
    <View
      style={[style, createInteractionStyle(touchEnabled)]}
      {...props}
    >
      {children}
    </View>
  );
};

export default TouchableView;
