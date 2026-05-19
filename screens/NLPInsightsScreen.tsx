import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import nlp from 'compromise';
import { classifyIntent, resolveTopic } from '../services/nlpAgent';

/**
 * NLP PIPELINE — correct academic order:
 *  1. Raw Input
 *  2. Tokenisation
 *  3. POS Tagging
 *  4. Stop-word / Function-word Removal
 *  5. Noun / Named-Entity Extraction
 *  6. Text Embedding (Simulated Representation)
 *  7. Intent Classification
 *  8. Topic Resolution & Knowledge Routing
 */

export const NLPInsightsScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const inputText: string = route.params?.text || 'Tell me about elephants.';

  const pipeline = useMemo(() => {
    const doc = nlp(inputText);

    /* ── Step 2: Tokenisation ── */
    const tokens: string[] = doc.terms().out('array');

    /* ── Step 3: POS Tagging ── */
    const tagsMap: any[] = doc.out('tags') as any[];
    const posTags: { token: string; tag: string }[] = [];
    if (tagsMap.length > 0) {
      for (const [token, tags] of Object.entries(tagsMap[0])) {
        posTags.push({ token, tag: (tags as string[])[0] || '?' });
      }
    }

    /* ── Step 4: Stop-word removal ── */
    const stopwordsRemoved: string[] = doc
      .not('#Preposition')
      .not('#Determiner')
      .not('#Conjunction')
      .not('#Pronoun')
      .terms()
      .out('array');

    /* ── Step 5: Noun / Named-entity extraction ── */
    const nouns: string[] = doc.nouns().out('array');

    /* ── Step 6: Simulated embedding (hash → 3-dim) ── */
    let hash = 0;
    for (let i = 0; i < inputText.length; i++) {
      hash = (hash << 5) - hash + inputText.charCodeAt(i);
      hash |= 0;
    }
    const embedding = [
      (Math.abs(hash % 100) / 100).toFixed(3),
      ((Math.abs((hash * 2) % 100) / 100) - 0.5).toFixed(3),
      (Math.abs((hash * 3) % 100) / 100).toFixed(3),
    ];

    /* ── Step 7: Intent ── */
    const intent = classifyIntent(inputText);

    /* ── Step 8: Topic resolution ── */
    const topic = resolveTopic(inputText, doc);

    return { tokens, posTags, stopwordsRemoved, nouns, intent, topic, embedding };
  }, [inputText]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>NLP Pipeline</Text>
          <Text style={styles.headerSub}>Text → Understanding, step by step</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── STEP 1: Raw Input ── */}
        <PipelineStep
          number={1}
          title="Raw Input"
          description="The original sentence as typed by the user — no changes made yet."
          accentColor={COLORS.primary}
        >
          <View style={styles.inputBox}>
            <Text style={styles.inputQuote}>"{inputText}"</Text>
          </View>
        </PipelineStep>

        {/* ── STEP 2: Tokenisation ── */}
        <PipelineStep
          number={2}
          title="Tokenisation"
          description="The sentence is split into individual words (tokens). Punctuation is separated. This is the most fundamental step in any NLP system."
          accentColor={COLORS.primary}
        >
          <View style={styles.tokenRow}>
            {pipeline.tokens.map((t, i) => (
              <View key={i} style={styles.tokenChip}>
                <Text style={styles.tokenIndex}>{i}</Text>
                <Text style={styles.tokenText}>{t}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.stepNote}>
            Token count: <Text style={styles.bold}>{pipeline.tokens.length}</Text>
          </Text>
        </PipelineStep>

        {/* ── STEP 3: POS Tagging ── */}
        <PipelineStep
          number={3}
          title="Part-of-Speech (POS) Tagging"
          description="Each token is labelled with its grammatical role — Noun, Verb, Adjective, Preposition, etc. This helps the model understand the structure of the sentence."
          accentColor={COLORS.secondary}
        >
          <View style={styles.posTable}>
            <View style={styles.posTableHeader}>
              <Text style={[styles.posCell, styles.posHeaderText, { flex: 2 }]}>Token</Text>
              <Text style={[styles.posCell, styles.posHeaderText, { flex: 3 }]}>POS Tag</Text>
            </View>
            {pipeline.posTags.map((item, i) => (
              <View
                key={i}
                style={[styles.posTableRow, i % 2 === 0 && styles.posTableRowAlt]}
              >
                <Text style={[styles.posCell, styles.posTokenCell, { flex: 2 }]}>
                  {item.token}
                </Text>
                <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.posTagPill, { backgroundColor: getPOSColor(item.tag) + '18' }]}>
                    <Text style={[styles.posTagText, { color: getPOSColor(item.tag) }]}>
                      {item.tag}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.stepNote}>Library: compromise.js (client-side NLP)</Text>
        </PipelineStep>

        {/* ── STEP 4: Stop-word Removal ── */}
        <PipelineStep
          number={4}
          title="Stop-word / Function-word Removal"
          description="Common words that carry little meaning (prepositions, determiners, conjunctions, pronouns) are removed. This reduces noise and highlights the important content words."
          accentColor={COLORS.secondary}
        >
          <View style={styles.diffRow}>
            {pipeline.tokens.map((t, i) => {
              const kept = pipeline.stopwordsRemoved.includes(t);
              return (
                <View
                  key={i}
                  style={[styles.diffChip, kept ? styles.diffKept : styles.diffRemoved]}
                >
                  <Text style={[styles.diffText, !kept && styles.diffStrike]}>{t}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.legendText}>Kept</Text>
            <View style={[styles.legendDot, { backgroundColor: COLORS.error, marginLeft: 16 }]} />
            <Text style={styles.legendText}>Removed</Text>
          </View>
          <Text style={styles.stepNote}>
            Remaining: <Text style={styles.bold}>{pipeline.stopwordsRemoved.join(', ') || '—'}</Text>
          </Text>
        </PipelineStep>

        {/* ── STEP 5: Noun / Named-Entity Extraction ── */}
        <PipelineStep
          number={5}
          title="Noun & Named-Entity Extraction"
          description="From the filtered tokens, nouns and named entities are extracted. These are the key subjects the user is asking about — the model's primary focus."
          accentColor={COLORS.purple}
        >
          {pipeline.nouns.length > 0 ? (
            <View style={styles.tokenRow}>
              {pipeline.nouns.map((n, i) => (
                <View key={i} style={[styles.tokenChip, { backgroundColor: COLORS.purpleLight, borderColor: COLORS.purple + '40' }]}>
                  <Text style={[styles.tokenText, { color: COLORS.purple }]}>{n}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No nouns detected</Text>
          )}
          <Text style={styles.stepNote}>These become the search terms for knowledge lookup.</Text>
        </PipelineStep>

        {/* ── STEP 6: Text Embedding ── */}
        <PipelineStep
          number={6}
          title="Text Embedding (Simulated)"
          description="In production systems, text is mapped to a high-dimensional vector (embedding) representing semantic meaning. This representation is necessary to enable mathematical classification and retrieval downstream."
          accentColor={COLORS.purple}
        >
          <View style={styles.embedBox}>
            <Text style={styles.embedVector}>
              v = [{pipeline.embedding.join(',  ')}]
            </Text>
            <Text style={styles.embedDim}>3-dimensional vector (simulated)</Text>
          </View>
          <Text style={styles.stepNote}>
            Real models (e.g. BERT) yield dense 768-dim semantic embeddings.
          </Text>
        </PipelineStep>

        {/* ── STEP 7: Intent Classification ── */}
        <PipelineStep
          number={7}
          title="Intent Classification"
          description="Using the semantic vector representation of the text, a classifier head determines what the user wants to achieve (e.g. ask a factual question, request a story)."
          accentColor={COLORS.purple}
        >
          <View style={styles.intentBox}>
            <View style={styles.intentRow}>
              <Text style={styles.intentLabel}>Detected Intent</Text>
              <View style={[styles.intentBadge, { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary + '40' }]}>
                <Text style={[styles.intentBadgeText, { color: COLORS.primary }]}>
                  {pipeline.intent.label}
                </Text>
              </View>
            </View>
            <View style={styles.confBar}>
              <View
                style={[
                  styles.confFill,
                  { width: `${Math.round(pipeline.intent.value * 100)}%` as any },
                ]}
              />
            </View>
            <Text style={styles.confLabel}>
              Confidence: <Text style={styles.bold}>{(pipeline.intent.value * 100).toFixed(0)}%</Text>
            </Text>
          </View>
        </PipelineStep>

        {/* ── STEP 8: Topic Resolution & Knowledge Routing ── */}
        <PipelineStep
          number={8}
          title="Topic Resolution & Knowledge Routing"
          description="The system routes the request based on extracted nouns and intent. It maps the query to a topic domain and decides whether to fetch a local fact or trigger a real-time Wikipedia search."
          accentColor={COLORS.green}
          last
        >
          <View style={styles.topicGrid}>
            <TopicRow label="Detected Topic" value={pipeline.topic.label} />
            <TopicRow label="Wikipedia Query" value={pipeline.topic.wikiSearch} mono />
            <TopicRow
              label="Knowledge Base Key"
              value={pipeline.topic.kbKey || 'Not in local KB — live lookup triggered'}
              muted={!pipeline.topic.kbKey}
            />
            <TopicRow
              label="Routing Decision"
              value={pipeline.topic.kbKey ? 'Local KB → fast answer' : 'Wikipedia API → real-time fetch'}
            />
          </View>
        </PipelineStep>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
};

/* ── Helper: colour by POS category ── */
function getPOSColor(tag: string): string {
  if (/Noun|Singular|Plural/i.test(tag)) return COLORS.primary;
  if (/Verb|Gerund|Infinitive/i.test(tag)) return COLORS.green;
  if (/Adjective/i.test(tag)) return COLORS.purple;
  if (/Adverb/i.test(tag)) return COLORS.secondary;
  if (/Preposition|Conjunction|Determiner/i.test(tag)) return COLORS.lightText;
  if (/Pronoun/i.test(tag)) return COLORS.coral;
  return COLORS.textMuted;
}

/* ── Reusable pipeline step card ── */
interface StepProps {
  number: number;
  title: string;
  description: string;
  accentColor: string;
  children: React.ReactNode;
  last?: boolean;
}
const PipelineStep = ({ number, title, description, accentColor, children, last }: StepProps) => (
  <View style={{ marginBottom: last ? 0 : 16 }}>
    {/* Step connector */}
    {!last && <View style={[styles.connector, { borderColor: accentColor + '30' }]} />}

    <View style={styles.stepCard}>
      {/* Accent left bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.stepInner}>
        {/* Step header */}
        <View style={styles.stepHeader}>
          <View style={[styles.stepNumber, { backgroundColor: accentColor }]}>
            <Text style={styles.stepNumberText}>{number}</Text>
          </View>
          <Text style={styles.stepTitle}>{title}</Text>
        </View>

        {/* Description */}
        <Text style={styles.stepDesc}>{description}</Text>

        {/* Content */}
        <View style={styles.stepContent}>{children}</View>
      </View>
    </View>
  </View>
);

const TopicRow = ({ label, value, mono, muted }: { label: string; value: string; mono?: boolean; muted?: boolean }) => (
  <View style={styles.topicRow}>
    <Text style={styles.topicLabel}>{label}</Text>
    <Text style={[styles.topicValue, mono && styles.topicMono, muted && styles.topicMuted]}>
      {value}
    </Text>
  </View>
);

/* ── Styles ── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
    ...SHADOWS.xs,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: '800',
    color: COLORS.darkText,
    letterSpacing: -0.3,
  },
  headerSub: { fontSize: SIZES.small - 1, color: COLORS.textMuted, marginTop: 1 },

  scroll: { flex: 1 },
  content: { padding: 16 },

  /* Step card */
  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  accentBar: { width: 4 },
  stepInner: { flex: 1, padding: 16 },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: { color: COLORS.white, fontSize: SIZES.small - 1, fontWeight: '800' },
  stepTitle: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.darkText,
    flex: 1,
  },
  stepDesc: {
    fontSize: SIZES.small,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 14,
  },
  stepContent: {},

  /* Connector between steps */
  connector: {
    position: 'absolute',
    left: 31,
    top: 26,
    width: 0,
    height: 16,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    zIndex: 10,
  },

  /* Step 1 — Input box */
  inputBox: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputQuote: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 22,
  },

  /* Step 2 — Tokens */
  tokenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  tokenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary + '35',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tokenIndex: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    opacity: 0.6,
  },
  tokenText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },

  /* Step 3 — POS Table */
  posTable: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  posTableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  posHeaderText: { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.lightText, textTransform: 'uppercase', letterSpacing: 0.5 },
  posTableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  posTableRowAlt: { backgroundColor: COLORS.background },
  posCell: { fontSize: SIZES.small },
  posTokenCell: { fontWeight: '600', color: COLORS.text },
  posTagPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  posTagText: { fontSize: SIZES.small - 1, fontWeight: '700' },

  /* Step 4 — Stop-word diff */
  diffRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  diffChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  diffKept: { backgroundColor: COLORS.success + '12', borderColor: COLORS.success + '40' },
  diffRemoved: { backgroundColor: COLORS.error + '10', borderColor: COLORS.error + '30' },
  diffText: { fontSize: SIZES.small, fontWeight: '600', color: COLORS.text },
  diffStrike: { textDecorationLine: 'line-through', color: COLORS.lightText },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendText: { fontSize: SIZES.xs, color: COLORS.textMuted },

  /* Step 6 — Intent */
  intentBox: {},
  intentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  intentLabel: { fontSize: SIZES.small, color: COLORS.textMuted, fontWeight: '600' },
  intentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  intentBadgeText: { fontSize: SIZES.small, fontWeight: '700' },
  confBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  confFill: { height: 6, backgroundColor: COLORS.primary, borderRadius: 3 },
  confLabel: { fontSize: SIZES.small, color: COLORS.textMuted },

  /* Step 7 — Topic */
  topicGrid: { gap: 10 },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 12,
  },
  topicLabel: { fontSize: SIZES.small - 1, color: COLORS.lightText, fontWeight: '600', flex: 1, textTransform: 'uppercase', letterSpacing: 0.3 },
  topicValue: { fontSize: SIZES.small, color: COLORS.text, fontWeight: '500', flex: 2, textAlign: 'right' },
  topicMono: { fontFamily: 'Courier', color: COLORS.primaryDark },
  topicMuted: { color: COLORS.textMuted, fontStyle: 'italic' },

  /* Step 8 — Embedding */
  embedBox: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    alignItems: 'center',
  },
  embedVector: {
    fontSize: SIZES.medium,
    fontFamily: 'Courier',
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  embedDim: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 4 },

  /* Shared */
  stepNote: { fontSize: SIZES.small - 1, color: COLORS.textMuted, marginTop: 6, fontStyle: 'italic' },
  bold: { fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: SIZES.small, color: COLORS.lightText, fontStyle: 'italic' },
});
