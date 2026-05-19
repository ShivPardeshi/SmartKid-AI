import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: string;
  /** Optional gradient pair for the left accent bar */
  accentGrad?: readonly [string, string];
  /** Filled background gradient (replaces white bg) */
  gradientBg?: readonly [string, string];
}

export const Card: React.FC<CardProps> = ({ children, style, accent, accentGrad, gradientBg }) => {
  const accentBar = accentGrad ? (
    <LinearGradient
      colors={accentGrad as any}
      style={styles.accentBar}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    />
  ) : accent ? (
    <View style={[styles.accentBar, { backgroundColor: accent }]} />
  ) : null;

  if (gradientBg) {
    return (
      <LinearGradient colors={gradientBg as any} style={[styles.card, style]}>
        {accentBar}
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, style]}>
      {accentBar}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: 18,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: SIZES.borderRadiusLg,
    borderBottomLeftRadius: SIZES.borderRadiusLg,
  },
});
