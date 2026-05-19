import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  variant = 'primary',
  fullWidth = false,
}) => {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        isSecondary && styles.secondary,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.text,
        isOutline && styles.outlineText,
        isGhost && styles.ghostText,
        textStyle,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    marginVertical: 5,
  },
  primary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.light,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.light,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  text: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  outlineText: { color: COLORS.primary },
  ghostText: { color: COLORS.primary },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
});
