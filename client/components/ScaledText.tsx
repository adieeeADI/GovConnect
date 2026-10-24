import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text as NativeText,
  TextInput as NativeTextInput,
  TextInputProps,
  TextProps,
} from 'react-native';
import { cssInterop } from 'nativewind';
import { FONT_SIZE_SCALES, useTranslation } from '../utils/i18n';

type ScaledTextProps = TextProps & { className?: string };
type ScaledTextInputProps = TextInputProps & { className?: string };

function getScaledStyle(
  style: ScaledTextProps['style'] | ScaledTextInputProps['style'],
  scale: number,
) {
  const flattenedStyle = StyleSheet.flatten(style);
  if (flattenedStyle?.fontSize === undefined) return style;
  return [
    style,
    { fontSize: flattenedStyle.fontSize * scale },
  ];
}

function ScaledText({ style, ...props }: ScaledTextProps) {
  const { fontSize } = useTranslation();
  return (
    <NativeText
      {...props}
      style={getScaledStyle(style, FONT_SIZE_SCALES[fontSize])}
    />
  );
}

cssInterop(ScaledText, { className: 'style' });

export const AppText = ScaledText;

const ScaledTextInput = forwardRef<NativeTextInput, ScaledTextInputProps>(
  ({ style, ...props }, ref) => {
    const { fontSize } = useTranslation();
    return (
      <NativeTextInput
        {...props}
        ref={ref}
        style={getScaledStyle(style, FONT_SIZE_SCALES[fontSize])}
      />
    );
  },
);

ScaledTextInput.displayName = 'ScaledTextInput';

cssInterop(ScaledTextInput, { className: 'style' });

export const AppTextInput = ScaledTextInput;
