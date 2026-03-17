import React from 'react';
import { StatusBar } from 'react-native';

interface CustomStatusBarProps {
  barStyle?: 'default' | 'light-content' | 'dark-content';
  backgroundColor?: string;
}

export default function CustomStatusBar({
  barStyle = 'light-content',
  backgroundColor = '#00000000',
}: CustomStatusBarProps) {
  return (
    <StatusBar
      barStyle={barStyle}
      backgroundColor={backgroundColor}
      translucent={true}
    />
  );
}
