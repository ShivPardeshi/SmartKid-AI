import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { Button } from '../components/Button';

export const OnboardingScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.heroArea}>
        <View style={styles.iconWrap}>
          <Ionicons name="school" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>SmartKid AI</Text>
        <Text style={styles.desc}>
          An NLP-powered learning companion for curious kids aged 5–10. Built as a college AI/NLP project.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>What you can do</Text>

        <View style={styles.featureList}>
          <FeatureItem text="Ask any question — get friendly, simplified answers" />
          <FeatureItem text="Toggle Live API to fetch real Wikipedia facts" />
          <FeatureItem text="See how the AI processes your text (NLP Pipeline)" />
        </View>

        <Button
          title="Get Started"
          variant="primary"
          onPress={() => navigation.navigate('Login')}
          fullWidth
        />
        <Button
          title="Create Account"
          variant="outline"
          onPress={() => navigation.navigate('Register')}
          fullWidth
        />
      </View>
    </View>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <View style={styles.featureRow}>
    <View style={styles.bullet} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  heroArea: {
    flex: 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    ...SHADOWS.light,
  },
  title: {
    fontSize: SIZES.xxlarge + 2,
    fontWeight: '900',
    color: COLORS.darkText,
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  desc: {
    fontSize: SIZES.small + 1,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 21,
  },
  card: {
    flex: 0.55,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    ...SHADOWS.medium,
  },
  cardTitle: {
    fontSize: SIZES.large - 1,
    fontWeight: '800',
    color: COLORS.darkText,
    marginBottom: 18,
    letterSpacing: -0.2,
  },
  featureList: { marginBottom: 24, gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 7,
    flexShrink: 0,
  },
  featureText: { flex: 1, fontSize: SIZES.small + 1, color: COLORS.text, lineHeight: 20 },
});
