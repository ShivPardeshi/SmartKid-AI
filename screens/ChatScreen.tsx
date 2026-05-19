import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
  Animated,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS, CHIP_COLORS } from '../utils/theme';
import { TAB_BAR_HEIGHT } from '../utils/layout';
import { ChatMessage, MessageType, QuizData } from '../components/ChatMessage';
import { processQueryAgentic, AgentStep, generateQuiz, resolveTopic } from '../services/nlpAgent';
import nlp from 'compromise';

const SUGGESTIONS = [
  'Why is the sky blue?',
  'Tell me about elephants',
  'How does multiplication work?',
  'What is space?',
];

interface Message {
  id: string;
  text: string;
  type: MessageType;
  timestamp?: string;
  imageUrl?: string;
  quizData?: QuizData;
  topicKey?: string;
  isAnswered?: boolean;
  selectedAnswer?: number;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'init1',
    text: "Hi! I'm SmartKid AI. Ask me anything — try a suggestion below, or turn on Live API for real Wikipedia facts!",
    type: 'response',
  },
];

export const ChatScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useLiveAPI, setUseLiveAPI] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Animated typing dots
  const dotAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    if (!isProcessing) return;
    const anims = dotAnims.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 140),
          Animated.timing(dot, { toValue: -5, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 280, useNativeDriver: true }),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, [isProcessing]);

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;
    const query = inputText;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now().toString(), text: query, type: 'user', timestamp }]);
    setInputText('');
    setIsProcessing(true);

    // Resolve topic for quiz generation
    const doc = nlp(query);
    const topic = resolveTopic(query, doc);
    const topicKey = topic.kbKey || topic.label.toLowerCase();

    await processQueryAgentic(query, useLiveAPI, (step: AgentStep) => {
      setMessages(prev => [
        ...prev,
        {
          id: step.id,
          text: step.content,
          type: step.type,
          timestamp: step.type === 'response' ? timestamp : undefined,
          imageUrl: step.imageUrl,
        },
      ]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    });

    setIsProcessing(false);

    // Show quiz prompt after response if using live API
    if (useLiveAPI) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString() + '-quiz-prompt',
            text: 'Would you like to try a quick quiz about this topic?',
            type: 'quiz_prompt',
            topicKey: topicKey,
          },
        ]);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }, 500);
    }
  };

  const handleQuizAction = (messageId: string, answer: number) => {
    setMessages(prev => {
      const msgIndex = prev.findIndex(m => m.id === messageId);
      if (msgIndex === -1) return prev;
      
      const msg = prev[msgIndex];
      if (msg.isAnswered) return prev; // prevent double clicks

      const updatedPrev = [...prev];
      updatedPrev[msgIndex] = { ...msg, isAnswered: true, selectedAnswer: answer };

      let newMessages = [...updatedPrev];

      if (msg.type === 'quiz_prompt') {
        if (answer === 1) {
          const quiz = generateQuiz(null, msg.topicKey || '');
          if (quiz) {
            newMessages.push({
              id: Date.now().toString() + '-quiz',
              text: '',
              type: 'quiz',
              quizData: quiz,
              topicKey: msg.topicKey,
            });
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
          } else {
            newMessages.push({
              id: Date.now().toString() + '-no-quiz',
              text: "I don't have a quiz for this topic yet. Try asking about space, animals, or math!",
              type: 'response',
            });
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
          }
        } else {
          newMessages.push({
            id: Date.now().toString() + '-no-quiz',
            text: "No problem! Feel free to ask me anything else.",
            type: 'response',
          });
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
      } else if (msg.type === 'quiz' && msg.quizData) {
        const isCorrect = answer === msg.quizData.correctAnswer;
        const responseText = isCorrect
          ? "🎉 Correct! Great job! You're a star!"
          : `😅 Not quite! The correct answer was: ${msg.quizData.options[msg.quizData.correctAnswer]}. Keep learning!`;
        
        newMessages.push({
          id: Date.now().toString() + '-quiz-result',
          text: responseText,
          type: 'response',
        });
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }

      return newMessages;
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.innerContainer, { paddingBottom: keyboardVisible ? 0 : TAB_BAR_HEIGHT }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerIcon}>
            <Ionicons name="chatbubbles" size={20} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Learning Chat</Text>
            <Text style={styles.headerSub}>Friendly answers for curious minds</Text>
          </View>
        </View>

        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <View style={[styles.liveDot, { backgroundColor: useLiveAPI ? COLORS.success : COLORS.lightText }]} />
            <Text style={styles.toggleLabel}>Live API (Wikipedia)</Text>
            {useLiveAPI && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ON</Text>
              </View>
            )}
          </View>
          <Switch
            value={useLiveAPI}
            onValueChange={setUseLiveAPI}
            trackColor={{ false: COLORS.border, true: COLORS.success }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={COLORS.border}
          />
        </View>
      </View>

      {/* ── Messages ── */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(msg => (
          <View key={msg.id}>
            <ChatMessage
              text={msg.text}
              type={msg.type}
              timestamp={msg.timestamp}
              imageUrl={msg.imageUrl}
              quizData={msg.quizData}
              isAnswered={msg.isAnswered}
              selectedAnswer={msg.selectedAnswer}
              onQuizAnswer={(answer) => handleQuizAction(msg.id, answer)}
            />
            {msg.type === 'user' && (
              <TouchableOpacity
                style={styles.pipelineLink}
                onPress={() => navigation.navigate('NLP Pipeline', { text: msg.text })}
              >
                <Ionicons name="analytics-outline" size={13} color={COLORS.purple} />
                <Text style={styles.pipelineLinkText}>View NLP pipeline</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {isProcessing && (
          <View style={styles.thinkingRow}>
            <View style={styles.thinkingBubble}>
              {dotAnims.map((dot, i) => (
                <Animated.View
                  key={i}
                  style={[styles.dot, { transform: [{ translateY: dot }] }]}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Suggestions ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        {SUGGESTIONS.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.chip, { backgroundColor: CHIP_COLORS[i % CHIP_COLORS.length] }]}
            onPress={() => setInputText(item)}
            disabled={isProcessing}
          >
            <Text style={styles.chipText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Input bar — BlurView on iOS ── */}
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={65}
          tint="systemChromeMaterialLight"
          style={[
            styles.inputWrap,
            { paddingBottom: 12 }
          ]}
        >
          <InputBar
            inputText={inputText}
            setInputText={setInputText}
            handleSend={handleSend}
            isProcessing={isProcessing}
          />
        </BlurView>
      ) : (
        <View style={[
          styles.inputWrap,
          styles.inputWrapAndroid,
          { paddingBottom: 12 }
        ]}>
          <InputBar
            inputText={inputText}
            setInputText={setInputText}
            handleSend={handleSend}
            isProcessing={isProcessing}
          />
        </View>
      )}
      </View>
    </KeyboardAvoidingView>
  );
};

interface InputBarProps {
  inputText: string;
  setInputText: (v: string) => void;
  handleSend: () => void;
  isProcessing: boolean;
}

const InputBar = ({ inputText, setInputText, handleSend, isProcessing }: InputBarProps) => (
  <View style={styles.inputRow}>
    <TextInput
      style={styles.input}
      placeholder={isProcessing ? 'Please wait…' : 'Ask anything…'}
      placeholderTextColor={COLORS.lightText}
      value={inputText}
      onChangeText={setInputText}
      onSubmitEditing={handleSend}
      editable={!isProcessing}
      returnKeyType="send"
    />
    <TouchableOpacity
      style={[styles.sendBtn, isProcessing && styles.sendBtnDisabled]}
      onPress={handleSend}
      disabled={isProcessing}
      activeOpacity={0.85}
    >
      {isProcessing
        ? <ActivityIndicator color={COLORS.white} size="small" />
        : <Ionicons name="send" size={18} color={COLORS.white} />
      }
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  innerContainer: { flex: 1 },

  header: {
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.xs,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: SIZES.large, fontWeight: '800', color: COLORS.darkText, letterSpacing: -0.3 },
  headerSub: { fontSize: SIZES.small - 1, color: COLORS.textMuted, marginTop: 2 },

  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.xs,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  toggleLabel: { fontSize: SIZES.small + 1, fontWeight: '600', color: COLORS.darkText },
  activeBadge: {
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.success,
  },

  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 8 },

  pipelineLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    marginBottom: 10,
    marginRight: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: COLORS.purpleLight,
    borderRadius: 12,
  },
  pipelineLinkText: { fontSize: 12, color: COLORS.purple, fontWeight: '600' },

  thinkingRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 12, marginTop: 8 },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  chipsScroll: { maxHeight: 48, marginBottom: 4 },
  chipsContent: { paddingHorizontal: 14, gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  chipText: { fontSize: SIZES.small, fontWeight: '600', color: COLORS.text },

  inputWrap: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  inputWrapAndroid: { backgroundColor: COLORS.white },

  inputRow: { flexDirection: 'row', paddingHorizontal: 12, alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    minHeight: 46,
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: SIZES.medium,
    color: COLORS.text,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  sendBtnDisabled: { opacity: 0.5 },
});
