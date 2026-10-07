**Project Overview**

This repository implements SmartKid AI — a React Native learning chat app for children (ages ~5–8). The app provides a chat UI, a simple local knowledge base, intent/topic classification, optional live Wikipedia lookup, and kid-friendly rewriting.

**Top-level**
- **App entry**: [App.tsx](App.tsx) — wraps app in providers and starts navigation.
- **Navigation**: [navigation/AppNavigator.tsx](navigation/AppNavigator.tsx) — routes/screens registration.
- **Screens**: [screens/ChatScreen.tsx](screens/ChatScreen.tsx) (main chat), [screens/NLPInsightsScreen.tsx](screens/NLPInsightsScreen.tsx) (pipeline view) and other screens in the `screens/` folder.

**Context & State**
- **Auth**: [context/AuthContext.tsx](context/AuthContext.tsx) — app auth provider used by screens.

**UI Components**
- `components/ChatMessage.tsx` — message rendering including quiz UI and different message `type`s.
- `components/Button.tsx`, `components/Card.tsx` — generic UI primitives.

**Services (where NLP lives)**
- **Main agent & pipeline**: [services/nlpAgent.ts](services/nlpAgent.ts)
  - Key exports / symbols:
    - `processQueryAgentic(query, useLiveAPI, onStep)` — main async entry used by the chat UI. Emits incremental `AgentStep` events (thought/action/observation/response) for UI tracing.
    - `classifyIntent(query)` — intent classifier (phrase match + weighted bag-of-words + small lemmatization boost) which returns `{ label, value }`.
    - `resolveTopic(query, doc)` — topic/entity resolver: phrase lookup (TOPIC_RESOLVER), `compromise` topics(), and noun heuristics.
    - `generateQuiz(kbKey, topicLabel)` — picks a quiz from `QUIZ_QUESTIONS` for a topic.
  - Local data in this file:
    - `KNOWLEDGE_BASE` — curated kid-friendly answer snippets used as first preference for answers.
    - `QUIZ_QUESTIONS` — small quiz bank mapped by topic keys.
  - External lookup:
    - `fetchWikipedia(searchTerm)` — simple fetch to Simple Wikipedia API used when `useLiveAPI` is true.

- **Kid-language adapter**: [services/kidLanguage.ts](services/kidLanguage.ts)
  - Key exports:
    - `adaptWikipediaForKids(rawText, title)` — simplifies, shortens, and rewrites Wikipedia sentences for ages 5–8 (word substitution, sentence clamping, safety filters).
    - `buildKidLiveMessage({title, wikiSummary, style, soundPrefix})` — composes the final kid-facing message with intro, simplified fact, and friendly closing.
    - `kidFriendlyTitle(title)` and `applyKidWordMap(...)` — helpers used during adaptation.

- **Intents**: [services/intents.json](services/intents.json) — patterns and template responses for `greeting`, `educational_query`, and `farewell`.

**Other supporting code**
- `services/api.ts` — fake auth API using `mock/data.ts`.
- `mock/data.ts` — test/mock users and sample data used by `services/api.ts`.
- `utils/` — UI helpers: `theme.ts`, `layout.ts`.

**How the NLP / response pipeline flows (step-by-step)**
1. Chat UI triggers a query: `ChatScreen` calls `processQueryAgentic(query, useLiveAPI, onStep)`.
2. Pre-processing/tokenization: `nlp` (compromise) and the `tokenize()` helper are used; stop-words are removed.
3. Lemmatization: `doc.compute('root')` to access root forms for better matching.
4. Intent classification: `classifyIntent()` scores each intent using phrase matches, token overlap, and root matches — returns top label + confidence.
5. Topic resolution: `resolveTopic()` attempts (in order):
   - Longest phrase match against `TOPIC_RESOLVER` (explicit mappings).
   - `compromise`'s `topics()` output.
   - Noun heuristics (filtered nouns, excluding colors/generic nouns/stop-words) and `KNOWLEDGE_BASE` lookup.
6. Decision logic in `processQueryAgentic`:
   - If the top intent is `greeting` or `farewell`, return a template response from `intents.json`.
   - If `topic.kbKey` matches `KNOWLEDGE_BASE`, use the curated local answer.
   - Else if `useLiveAPI` is true, call `fetchWikipedia()` and pass the returned summary through `buildKidLiveMessage()` which uses `adaptWikipediaForKids()` to simplify text.
   - Fallback: friendly messages via `entityFallback()` or local KB if available.
7. Emitted UI trace: `processQueryAgentic` calls `onStep()` multiple times with `thought` / `action` / `observation` / `response` steps so the app can render an NLP pipeline trace in the chat UX.

**Where to look for key behaviours**
- Tokenization, stop-words, intent scoring: [services/nlpAgent.ts](services/nlpAgent.ts)
- Topic -> KB mapping: `TOPIC_RESOLVER` and `KNOWLEDGE_BASE` inside [services/nlpAgent.ts](services/nlpAgent.ts)
- Wikipedia fetch and rewriting for kids: [services/nlpAgent.ts](services/nlpAgent.ts) → `fetchWikipedia()` → [services/kidLanguage.ts](services/kidLanguage.ts)
- UI integration / pipeline tracing: [screens/ChatScreen.tsx](screens/ChatScreen.tsx) (calls `processQueryAgentic` and shows pipeline steps). The pipeline view is reachable via the chat message "View NLP pipeline" link and implemented in [screens/NLPInsightsScreen.tsx](screens/NLPInsightsScreen.tsx).

**Notes & suggestions**
- The core rule-set and curated content live in `services/nlpAgent.ts` (easy to extend `KNOWLEDGE_BASE`, `TOPIC_RESOLVER`, and `QUIZ_QUESTIONS`).
- `compromise` is used for light NLP (tokenization, root forms, topics). For stronger intent detection, consider adding a small ML model or training a lightweight classifier with examples.
- `adaptWikipediaForKids` contains safety filtering (regex patterns) — review and extend it if you add new content sources.

If you want, I can:
- open specific functions and annotate them inline in this file with line references,
- generate a simple diagram of the pipeline, or
- add README sections describing how to extend KB, intents, or quizzes.
