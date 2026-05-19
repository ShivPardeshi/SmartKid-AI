import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS, CHIP_COLORS, GRADIENTS } from '../utils/theme';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const QUICK_TOPICS = [
  { label: 'Science', icon: 'flask-outline' as const, color: COLORS.primary, bg: COLORS.primaryLight },
  { label: 'Animals', icon: 'paw-outline' as const, color: COLORS.secondary, bg: COLORS.secondaryLight },
  { label: 'Space', icon: 'planet-outline' as const, color: COLORS.purple, bg: COLORS.purpleLight },
];

const FACTS = [
  { emoji: '🍯', text: 'Honey can last thousands of years without spoiling — bees are amazing little scientists!' },
  { emoji: '🐙', text: 'An octopus has three hearts and blue blood — nature is full of surprises!' },
  { emoji: '🌍', text: 'The Earth is about 4.5 billion years old — older than you can imagine!' },
];

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const firstName = user?.name?.split(' ')[0] || 'Explorer';
  const fact = FACTS[Math.floor(Date.now() / 86400000) % FACTS.length];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
              <Text style={styles.subtitle}>What will you discover today?</Text>
            </View>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => navigation.navigate('ProfileSetup')}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={15} color={COLORS.primary} />
              <Text style={styles.profileBtnText}>View Profile</Text>
            </TouchableOpacity>
          </View>

          {/* ── Hero — single gradient, intentional ── */}
          <LinearGradient
            colors={GRADIENTS.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroTitle}>SmartKid AI</Text>
            <Text style={styles.heroBody}>
              Ask anything — your AI learning companion explains it in a friendly way!
            </Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => navigation.navigate('Chat')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroBtnText}>Start Chatting</Text>
            </TouchableOpacity>
            <View style={styles.blob1} />
          </LinearGradient>

          {/* ── Did You Know ── */}
          <View style={styles.factCard}>
            <Text style={styles.factEmoji}>{fact.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.factLabel}>Did You Know?</Text>
              <Text style={styles.factBody}>{fact.text}</Text>
            </View>
          </View>

          {/* ── Explore Topics ── */}
          <Text style={styles.sectionLabel}>Explore Topics</Text>
          <View style={styles.topicRow}>
            {QUICK_TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic.label}
                style={[styles.topicCard, { backgroundColor: topic.bg }]}
                onPress={() => navigation.navigate('Chat')}
                activeOpacity={0.85}
              >
                <Ionicons name={topic.icon} size={24} color={topic.color} />
                <Text style={[styles.topicLabel, { color: topic.color }]}>{topic.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── NLP Feature ── */}
          <View style={styles.nlpCard}>
            <View style={styles.nlpRow}>
              <View style={[styles.nlpIcon, { backgroundColor: COLORS.purpleLight }]}>
                <Ionicons name="analytics" size={20} color={COLORS.purple} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nlpTitle}>See How AI Thinks</Text>
                <Text style={styles.nlpSub}>Explore the full NLP pipeline step by step</Text>
              </View>
            </View>
            <Button title="Open NLP Pipeline" onPress={() => navigation.navigate('NLP Pipeline')} variant="outline" />
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: SIZES.xlarge,
    fontWeight: '800',
    color: COLORS.darkText,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  profileBtnText: {
    fontSize: SIZES.small,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Hero — only gradient in the app
  hero: {
    borderRadius: SIZES.borderRadiusLg,
    padding: 22,
    marginBottom: 14,
    overflow: 'hidden',
  },
  heroTitle: {
    fontSize: SIZES.xxlarge,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  heroBody: {
    fontSize: SIZES.small + 1,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 20,
    marginBottom: 16,
    maxWidth: '80%',
  },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  heroBtnText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.small + 1 },
  blob1: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -40,
    right: -30,
  },

  // Fact
  factCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMd,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  factEmoji: { fontSize: 28, marginTop: 2 },
  factLabel: {
    fontSize: SIZES.small - 1,
    fontWeight: '700',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  factBody: { fontSize: SIZES.small, color: COLORS.text, lineHeight: 19 },

  // Topics
  sectionLabel: {
    fontSize: SIZES.small - 1,
    fontWeight: '700',
    color: COLORS.lightText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  topicRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  topicCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: SIZES.borderRadiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    ...SHADOWS.light,
  },
  topicLabel: { fontSize: SIZES.small, fontWeight: '700' },

  // NLP card
  nlpCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMd,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  nlpRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  nlpIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nlpTitle: { fontSize: SIZES.medium, fontWeight: '700', color: COLORS.darkText, marginBottom: 2 },
  nlpSub: { fontSize: SIZES.small - 1, color: COLORS.textMuted },
});
