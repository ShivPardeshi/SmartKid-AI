# 🚀 SmartKid AI

<p align="center">
  <strong>An Intelligent, Agentic AI Learning Assistant & Chat Companion for Curious Kids (Ages 5–8)</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react&logoColor=white" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-v54.0.0-000020?logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/NLP-Compromise.js-FF6B6B" alt="Compromise NLP" />
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-4CAF50" alt="Platforms" />
</p>

---

## 🌟 Overview

**SmartKid AI** is an interactive, educational chatbot designed specifically for early learners. It breaks down complex scientific concepts, animal facts, astronomy questions, and everyday curiosities into simple, bite-sized, safe, and engaging answers.

Powered by a transparent **Agentic NLP pipeline**, SmartKid AI provides not only joyful conversational learning for children, but also an inspectable reasoning trace for parents, educators, and developers.

---

## ✨ Key Features

- 💬 **Kid-Friendly Chat Experience**:
  - Expressive chat bubble UI with colorful avatars, high-contrast readability, and child-safe interactions.
  - Vocabulary adaptation that translates dense academic explanations into simple, playful sentences.
- 🧠 **Agentic NLP Reasoning Pipeline**:
  - Incremental execution trace: `Thought` ➔ `Action` ➔ `Observation` ➔ `Response`.
  - Intent classification (Greeting, Educational Q&A, Farewell).
  - Multi-tier topic and entity resolution using `compromise.js` and custom heuristics.
- 📚 **Dual-Tier Knowledge Engine**:
  - **Curated Local Knowledge Base**: Instant offline responses for high-frequency topics (Space, Dinosaurs, Animals, Oceans, Science).
  - **Live Simple Wikipedia Adapter**: Real-time lookup with dynamic kid-language rewriting, sentence clamping, and safety filtering.
- 🎯 **Interactive Post-Topic Quizzes**:
  - Automatically attaches mini-quizzes after educational answers to reinforce retention and gamify learning.
- 🔍 **NLP Insights & Debugger**:
  - Dedicated pipeline inspector screen showing tokenization, lemmatization (root computation), intent confidence scores, and step execution time.
- 🛡️ **Child Safety & Content Filtering**:
  - Built-in multi-pattern regex safety filters to ensure all external data is kid-appropriate.

---

## 🏗️ Architecture & NLP Pipeline

```
                     ┌─────────────────────────┐
                     │   User Query from UI    │
                     └────────────┬────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │ Pre-processing & Roots  │
                     │  (Tokenize, Stopwords)  │
                     └────────────┬────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │  Intent Classification  │
                     │  (Score & Confidence)   │
                     └────────────┬────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │    Topic Resolution     │
                     │ (Phrase -> NLP -> Noun) │
                     └────────────┬────────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                ▼                                   ▼
    [ Local Knowledge Base ]              [ Live Wikipedia API ]
                │                                   │
                │                         ┌─────────┴─────────┐
                │                         │ Kid Adaptation &  │
                │                         │ Safety Filtering  │
                │                         └─────────┬─────────┘
                │                                   │
                └─────────────────┬─────────────────┘
                                  ▼
                     ┌─────────────────────────┐
                     │   Kid-Friendly Output   │
                     │    + Optional Quiz      │
                     └─────────────────────────┘
```

---

## 📁 Repository Structure

```tree
SmartKidAI/
├── assets/                  # App icons, splash screens, and visual assets
├── components/              # Reusable UI components
│   ├── Button.tsx           # Kid-styled button component
│   ├── Card.tsx             # Card containers with soft shadows
│   └── ChatMessage.tsx      # Rich chat bubbles, quiz cards, & pipeline triggers
├── context/                 # State management
│   └── AuthContext.tsx      # Auth & user profile state provider
├── mock/                    # Mock data for offline testing
├── navigation/              # Navigation graphs and tab bars
│   └── AppNavigator.tsx     # Stack and Tab navigation configuration
├── screens/                 # Application screens
│   ├── SplashScreen.tsx     # Branded launch screen
│   ├── OnboardingScreen.tsx # Welcome flow for children & parents
│   ├── LoginScreen.tsx      # Sign-in screen
│   ├── RegisterScreen.tsx   # Sign-up screen
│   ├── ProfileSetupScreen.tsx# Avatar & child profile customizer
│   ├── HomeScreen.tsx       # Discovery hub with topic cards
│   ├── ChatScreen.tsx       # Main interactive AI chat interface
│   └── NLPInsightsScreen.tsx# Visual NLP agent pipeline inspector
├── services/                # Core business logic & AI pipeline
│   ├── api.ts               # Authentication API service
│   ├── intents.json         # Predefined intent patterns & templates
│   ├── kidLanguage.ts       # Simplification, safety filtering & phrase adapter
│   └── nlpAgent.ts          # Agentic NLP engine, KB, & quiz generators
├── utils/                   # Design system tokens and styling helpers
│   ├── layout.ts            # Screen dimensions & responsive metrics
│   └── theme.ts             # Child-friendly color palettes, typography, & radius
├── App.tsx                  # Root component
├── app.json                 # Expo project configuration
├── eas.json                 # EAS build configuration for Android/iOS
└── package.json             # Project dependencies and npm scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.x` or `v20.x` (LTS recommended)
- **Package Manager**: `npm` or `yarn`
- **Expo Go App** (iOS / Android) or simulator / emulator

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ShivPardeshi/Smart-Kid-AI.git
   cd Smart-Kid-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Running the App

Start the Expo development server:

```bash
npm start
```

Run on specific targets:
- **Android**: `npm run android`
- **iOS**: `npm run ios` (macOS required)
- **Web**: `npm run web`

---

## 🛠️ Building Standalone Binaries (EAS)

The project is configured with Expo Application Services (EAS Build):

```bash
# Build Android preview APK
npm run eas:build:android
```

---

## 🧩 Extending Knowledge & Quizzes

1. **Add new topics to the Knowledge Base**:
   Edit `KNOWLEDGE_BASE` and `TOPIC_RESOLVER` in [`services/nlpAgent.ts`](services/nlpAgent.ts).
2. **Add interactive quizzes**:
   Add new multiple-choice question arrays in `QUIZ_QUESTIONS` within [`services/nlpAgent.ts`](services/nlpAgent.ts).
3. **Customize language simplification**:
   Update the dictionary substitutions or safety rules in [`services/kidLanguage.ts`](services/kidLanguage.ts).

---

## 📄 License

This project is created for educational and learning purposes.
