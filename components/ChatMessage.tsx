import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

export type MessageType = 'user' | 'thought' | 'action' | 'observation' | 'response' | 'quiz' | 'quiz_prompt';

interface ChatMessageProps {
  text: string;
  type: MessageType;
  timestamp?: string;
  imageUrl?: string;
  quizData?: QuizData;
  isAnswered?: boolean;
  selectedAnswer?: number;
  onQuizAnswer?: (answer: number) => void;
}

export interface QuizData {
  question: string;
  options: string[];
  correctAnswer: number;
}

const AGENT_CONFIG = {
  thought: { icon: 'bulb-outline' as const, color: COLORS.secondary, bg: COLORS.secondaryLight, label: 'Thinking' },
  action:  { icon: 'search-outline' as const, color: COLORS.primary,   bg: COLORS.primaryLight,   label: 'Searching' },
  observation: { icon: 'checkmark-circle-outline' as const, color: COLORS.green, bg: COLORS.greenLight, label: 'Found' },
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ text, type, timestamp, imageUrl, quizData, isAnswered, selectedAnswer, onQuizAnswer }) => {
  const isUser = type === 'user';
  const isAgentStep = type === 'thought' || type === 'action' || type === 'observation';
  const isQuiz = type === 'quiz';
  const isQuizPrompt = type === 'quiz_prompt';

  if (isQuiz && quizData) {
    return (
      <View style={styles.rowBot}>
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={14} color={COLORS.primary} />
        </View>
        <View style={styles.quizBubble}>
          <Text style={styles.quizQuestion}>{quizData.question}</Text>
          {quizData.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === quizData.correctAnswer;
            const showCorrectness = isAnswered;

            return (
            <TouchableOpacity
              key={index}
              style={[
                styles.quizOptionTouchable,
                isAnswered && !isSelected && !isCorrect && { opacity: 0.5 }
              ]}
              onPress={() => onQuizAnswer?.(index)}
              activeOpacity={0.7}
              disabled={isAnswered}
            >
              <View style={[
                styles.quizOption,
                isSelected && styles.quizOptionSelected,
                showCorrectness && isCorrect && styles.quizOptionCorrect,
                showCorrectness && isSelected && !isCorrect && styles.quizOptionIncorrect,
              ]}>
                <View style={[
                  styles.quizOptionCircle,
                  showCorrectness && isCorrect && styles.quizOptionCircleCorrect,
                  showCorrectness && isSelected && !isCorrect && styles.quizOptionCircleIncorrect,
                ]}>
                  <Text style={[styles.quizOptionLetter, showCorrectness && isSelected && !isCorrect && { color: COLORS.white }]}>{String.fromCharCode(65 + index)}</Text>
                </View>
                <Text style={[styles.quizOptionText, showCorrectness && isCorrect && { fontWeight: '700' }]}>{option}</Text>
              </View>
            </TouchableOpacity>
          )})}
        </View>
      </View>
    );
  }

  if (isQuizPrompt) {
    return (
      <View style={styles.rowBot}>
        <View style={styles.avatar}>
          <Ionicons name="sparkles" size={14} color={COLORS.primary} />
        </View>
        <View style={styles.botBubble}>
          <Text style={styles.botText}>{text}</Text>
          {onQuizAnswer && (
            <View style={styles.quizPromptButtons}>
              <TouchableOpacity
                style={[styles.quizPromptButton, styles.quizPromptYes, isAnswered && { opacity: 0.5 }]}
                onPress={() => onQuizAnswer(1)}
                disabled={isAnswered}
              >
                <Text style={styles.quizPromptButtonText}>Yes! 🎯</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quizPromptButton, styles.quizPromptNo, isAnswered && { opacity: 0.5 }]}
                onPress={() => onQuizAnswer(0)}
                disabled={isAnswered}
              >
                <Text style={[styles.quizPromptButtonText, styles.quizPromptButtonTextDark]}>No thanks</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  if (isAgentStep) {
    const cfg = AGENT_CONFIG[type];
    return (
      <View style={[styles.agentStep, { backgroundColor: cfg.bg }]}>
        <View style={[styles.agentDot, { backgroundColor: cfg.color }]} />
        <Text style={[styles.agentLabel, { color: cfg.color }]}>{cfg.label}</Text>
        <Text style={styles.agentText} numberOfLines={2}>{text}</Text>
      </View>
    );
  }

  if (isUser) {
    return (
      <View style={styles.rowUser}>
        <View style={styles.userBubble}>
          {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />}
          <Text style={styles.userText}>{text}</Text>
          {timestamp && <Text style={styles.userTime}>{timestamp}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.rowBot}>
      <View style={styles.avatar}>
        <Ionicons name="sparkles" size={14} color={COLORS.primary} />
      </View>
      <View style={styles.botBubble}>
        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />}
        <Text style={styles.botText}>{text}</Text>
        {timestamp && <Text style={styles.botTime}>{timestamp}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowUser: { alignSelf: 'flex-end', marginVertical: 5, maxWidth: '82%' },
  userBubble: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    ...SHADOWS.light,
  },
  userText: { fontSize: SIZES.medium, lineHeight: 22, color: COLORS.white, fontWeight: '500' },
  userTime: { fontSize: 11, color: 'rgba(255,255,255,0.68)', marginTop: 6, alignSelf: 'flex-end' },

  rowBot: { flexDirection: 'row', alignSelf: 'flex-start', marginVertical: 5, maxWidth: '88%', gap: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  botBubble: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  botText: { fontSize: SIZES.medium, lineHeight: 23, color: COLORS.text },
  botTime: { fontSize: 11, color: COLORS.lightText, marginTop: 6, alignSelf: 'flex-end' },

  agentStep: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginLeft: 42,
    marginVertical: 2,
    maxWidth: '80%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  agentDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  agentLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3, flexShrink: 0 },
  agentText: { fontSize: 12, color: COLORS.textMuted, flexShrink: 1, lineHeight: 16 },

  image: { width: '100%', height: 150, borderRadius: 12, marginBottom: 10, backgroundColor: COLORS.border },

  quizBubble: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  quizQuestion: { fontSize: SIZES.medium, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quizOptionTouchable: {
    flex: 1,
  },
  quizOptionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quizOptionLetter: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  quizOptionText: { fontSize: SIZES.small + 1, color: COLORS.text, flex: 1 },
  quizOptionSelected: { borderColor: COLORS.primary, borderWidth: 2 },
  quizOptionCorrect: { backgroundColor: COLORS.success + '20', borderColor: COLORS.success, borderWidth: 2 },
  quizOptionIncorrect: { backgroundColor: COLORS.error + '20', borderColor: COLORS.error, borderWidth: 2 },
  quizOptionCircleCorrect: { backgroundColor: COLORS.success },
  quizOptionCircleIncorrect: { backgroundColor: COLORS.error },

  quizPromptButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  quizPromptButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quizPromptYes: {
    backgroundColor: COLORS.primary,
  },
  quizPromptNo: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quizPromptButtonText: {
    fontSize: SIZES.small + 1,
    fontWeight: '600',
    color: COLORS.white,
  },
  quizPromptButtonTextDark: {
    color: COLORS.text,
  },
});
