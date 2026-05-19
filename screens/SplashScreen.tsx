import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../utils/theme';

export const SplashScreen = () => (
  <View style={styles.container}>
    <Ionicons name="school" size={56} color={COLORS.white} />
    <Text style={styles.title}>SmartKid AI</Text>
    <ActivityIndicator color={COLORS.white} size="small" style={{ marginTop: 20 }} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: SIZES.xlarge + 6,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: 16,
  },
});
