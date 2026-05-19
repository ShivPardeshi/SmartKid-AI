import nlp from 'compromise';
import intentsData from './intents.json';
import { buildKidLiveMessage, type QuestionStyle } from './kidLanguage';

export type AgentStepType = 'thought' | 'action' | 'observation' | 'response';

export interface AgentStep {
  id: string;
  type: AgentStepType;
  content: string;
  imageUrl?: string;
  quizData?: QuizData;
}

export interface QuizData {
  question: string;
  options: string[];
  correctAnswer: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const pickRandom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that', 'these', 'those',
  'am', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'as',
  'until', 'while', 'tell', 'know', 'want', 'like', 'get', 'got', 'go', 'going',
  'please', 'thanks', 'thank', 'hello', 'hi', 'hey',
]);

const COLOR_WORDS = new Set([
  'blue', 'red', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white',
  'brown', 'gray', 'grey', 'gold', 'silver',
]);

const GENERIC_NOUNS = new Set([
  'thing', 'things', 'something', 'anything', 'everything', 'nothing',
  'way', 'ways', 'time', 'times', 'day', 'days', 'year', 'years',
  'people', 'person', 'world', 'place', 'part', 'question', 'answer',
  'fact', 'facts', 'topic', 'idea', 'name',
]);

/** Maps phrases and synonyms → knowledge-base key and Wikipedia search term */
const TOPIC_RESOLVER: Record<string, { kbKey: string; wiki: string }> = {
  sky: { kbKey: 'sky', wiki: 'Sky' },
  'blue sky': { kbKey: 'sky', wiki: 'Sky' },
  'why sky blue': { kbKey: 'sky', wiki: 'Sky' },
  elephant: { kbKey: 'elephant', wiki: 'Elephant' },
  elephants: { kbKey: 'elephant', wiki: 'Elephant' },
  africa: { kbKey: 'africa', wiki: 'Africa' },
  math: { kbKey: 'math', wiki: 'Mathematics' },
  mathematics: { kbKey: 'math', wiki: 'Mathematics' },
  multiplication: { kbKey: 'multiplication', wiki: 'Multiplication' },
  multiply: { kbKey: 'multiplication', wiki: 'Multiplication' },
  'how does multiplication work': { kbKey: 'multiplication', wiki: 'Multiplication' },
  times: { kbKey: 'multiplication', wiki: 'Multiplication' },
  space: { kbKey: 'space', wiki: 'Outer space' },
  outer: { kbKey: 'space', wiki: 'Outer space' },
  planet: { kbKey: 'space', wiki: 'Planet' },
  planets: { kbKey: 'space', wiki: 'Planet' },
  solar: { kbKey: 'space', wiki: 'Solar System' },
  astronaut: { kbKey: 'space', wiki: 'Astronaut' },
  moon: { kbKey: 'moon', wiki: 'Moon' },
  sun: { kbKey: 'sun', wiki: 'Sun' },
  star: { kbKey: 'sun', wiki: 'Star' },
  stars: { kbKey: 'sun', wiki: 'Star' },
  animal: { kbKey: 'animal', wiki: 'Animal' },
  animals: { kbKey: 'animal', wiki: 'Animal' },
  dinosaur: { kbKey: 'dinosaur', wiki: 'Dinosaur' },
  dinosaurs: { kbKey: 'dinosaur', wiki: 'Dinosaur' },
  ocean: { kbKey: 'ocean', wiki: 'Ocean' },
  sea: { kbKey: 'ocean', wiki: 'Ocean' },
  rainbow: { kbKey: 'rainbow', wiki: 'Rainbow' },
  volcano: { kbKey: 'volcano', wiki: 'Volcano' },
  plant: { kbKey: 'plant', wiki: 'Plant' },
  plants: { kbKey: 'plant', wiki: 'Plant' },
  photosynthesis: { kbKey: 'plant', wiki: 'Photosynthesis' },
  lion: { kbKey: 'lion', wiki: 'Lion' },
  tiger: { kbKey: 'tiger', wiki: 'Tiger' },
  penguin: { kbKey: 'penguin', wiki: 'Penguin' },
  bee: { kbKey: 'bee', wiki: 'Bee' },
  honey: { kbKey: 'bee', wiki: 'Honey' },
};

const KNOWLEDGE_BASE: Record<string, string[]> = {
  sky: [
    "The sky looks blue because sunlight is made of all the colors of the rainbow! When that light passes through the air around Earth, the blue color bounces around the most — like tiny blue bouncy balls — so we see a blue sky.",
    "Sunlight looks white, but it's really a mix of colors. The air around our planet scatters blue light more than other colors, and that's the cool science trick that paints the sky blue!",
    "It's not paint up there! Blue light from the sun hits tiny invisible air molecules and spreads everywhere, which is why the sky looks blue to our eyes.",
  ],
  elephant: [
    "Elephants are the biggest animals that live on land! They use their long trunks to drink, grab food, and trumpet loudly — PAHOOO! 🐘",
    "An elephant's trunk has tens of thousands of muscles! They can spray water on themselves like a shower and make deep rumbles to talk to their family.",
    "Elephants are super smart with amazing memories. They live in big families led by an older female elephant, and babies stay close to their moms.",
  ],
  africa: [
    "Africa is a huge continent with amazing wildlife like lions, giraffes, zebras, and elephants! It has rainforests, savannas, and the giant Sahara desert.",
    "The Nile River in Africa is one of the longest rivers in the world. Africa is also home to Mount Kilimanjaro — a snowy mountain near the equator!",
    "More than 50 countries and over a thousand languages are spoken in Africa. It's full of incredible cultures, music, and history.",
  ],
  math: [
    "Math is like a puzzle language for your brain! It helps you count, measure, build shapes, and solve real problems — like sharing pizza fairly.",
    "We use math every day: telling time, buying snacks, scoring games, and even coding video games. Math is everywhere once you look for it!",
    "Think of math as your super toolbox: addition puts things together, subtraction takes away, and patterns help you predict what comes next.",
  ],
  multiplication: [
    "Multiplication is a fast way to add the same number again and again! 3 bags with 4 apples each = 3 × 4 = 12 apples — no counting one by one.",
    "Imagine multiplication as making equal groups. If you have 5 groups of 2 stars, that's 5 × 2 = 10 stars total!",
    "Multiplication is skip-counting on turbo mode: 2, 4, 6, 8… is the same as 4 × 2. It saves time with bigger numbers!",
  ],
  space: [
    "Space is the enormous area beyond Earth where stars, planets, moons, and galaxies live. It's mostly empty and incredibly vast!",
    "In space there's almost no air, so astronauts float and sound can't travel — space is completely silent!",
    "Our Solar System has the Sun at the center and eight planets orbiting it, including Earth. Rockets help explorers study space safely.",
  ],
  moon: [
    "The Moon is Earth's buddy in space! It doesn't make its own light — it reflects sunlight, which is why it glows at night.",
    "The Moon's gravity pulls on oceans and helps create tides. Astronauts have walked on the Moon and brought back moon rocks to study!",
    "The Moon takes about 27 days to orbit Earth. Its changing shapes — phases — happen because we see different parts lit by the sun.",
  ],
  sun: [
    "The Sun is a giant star at the center of our Solar System! It gives Earth heat and light so plants, animals, and people can live.",
    "The Sun is so big that about one million Earths could fit inside it. Never look straight at it — it can hurt your eyes!",
    "Energy from the Sun powers weather, ocean currents, and helps plants make food through photosynthesis. It's Earth's main battery!",
  ],
  animal: [
    "Animals are living creatures that move, eat, and grow. Dogs go WOOF 🐶, cats go MEOW 🐱, and cows go MOO 🐮!",
    "Some animals have fur, some have feathers, and some have scales. Each kind is adapted to survive in its home habitat.",
    "Animals are part of nature's team — bees pollinate flowers, birds spread seeds, and worms keep soil healthy.",
  ],
  dinosaur: [
    "Dinosaurs lived millions of years ago — long before humans! Some were huge plant-eaters and some were fierce meat-eaters with sharp teeth.",
    "Scientists learn about dinosaurs from fossils — bones and footprints turned to stone. The T. rex is one of the most famous dinosaurs!",
    "Birds are related to dinosaurs! Not all dinosaurs were giants — some were only the size of a chicken.",
  ],
  ocean: [
    "Oceans cover most of Earth and are home to whales, dolphins, coral reefs, and countless fish. They're deep, salty, and full of mystery!",
    "The Pacific Ocean is the biggest ocean on our planet. Ocean currents move warm and cold water around the world like a giant conveyor belt.",
    "Oceans produce much of the oxygen we breathe thanks to tiny ocean plants. We must keep oceans clean to protect marine life.",
  ],
  rainbow: [
    "A rainbow appears when sunlight shines through raindrops! The drops split white light into red, orange, yellow, green, blue, and purple.",
    "You usually see a rainbow when the sun is behind you and rain is in front of you. Each person's rainbow is slightly different!",
    "Rainbows are actually full circles, but we usually only see an arc from the ground. Red is on the outside and violet on the inside.",
  ],
  volcano: [
    "A volcano is an opening in Earth's crust where hot melted rock called lava can erupt out. Some volcanoes sleep for centuries, then wake up!",
    "Volcanoes can build new mountains and islands when lava cools and hardens. They also help release pressure deep inside the Earth.",
    "The Ring of Fire is a zone around the Pacific Ocean with many volcanoes and earthquakes because Earth's plates move there.",
  ],
  plant: [
    "Plants make their own food using sunlight, water, and air — a process called photosynthesis. They give us oxygen to breathe!",
    "Roots drink water from soil, stems hold the plant up, and leaves catch sunlight. Flowers attract bees to help make seeds.",
    "Without plants, animals couldn't survive. Trees, grass, fruits, and vegetables are all plants doing important jobs for life on Earth.",
  ],
  lion: [
    "Lions are big cats known as the 'king of the jungle' — though they usually live in grasslands called savannas. Male lions have majestic manes!",
    "Lionesses often hunt together in a pride. A lion's roar can be heard miles away — ROAR! 🦁",
  ],
  tiger: [
    "Tigers are the largest wild cats, with orange fur and black stripes — every tiger's pattern is unique, like a fingerprint!",
    "Tigers are excellent swimmers and often live in forests in Asia. They hunt alone and are incredibly strong.",
  ],
  penguin: [
    "Penguins are birds that swim instead of fly! They live in cold places like Antarctica and slide on their bellies — called tobogganing.",
    "Penguin parents take turns keeping eggs warm. Their waterproof feathers and blubber keep them cozy in icy water.",
  ],
  bee: [
    "Bees buzz from flower to flower collecting nectar and spread pollen, which helps plants grow fruits and seeds. BUZZZ! 🐝",
    "Honey bees live in hives and make honey from nectar. A bee colony has a queen, workers, and drones — everyone has a job!",
    "Did you know honey can last a very long time? Bees are tiny but incredibly important for our food supply.",
  ],
};

const FUN_SOUNDS: Record<string, string> = {
  monkey: 'Ooh ooh aah aah! 🐒',
  dog: 'Woof woof! 🐶',
  cat: 'Meow! 🐱',
  cow: 'Moo! 🐄',
  pig: 'Oink oink! 🐷',
  duck: 'Quack quack! 🦆',
  horse: 'Neigh! 🐴',
  lion: 'Roar! 🦁',
  tiger: 'Roar! 🐯',
  elephant: 'Pawoo! 🐘',
  frog: 'Ribbit! 🐸',
  bee: 'Bzzzz! 🐝',
  bird: 'Tweet tweet! 🐦',
  sheep: 'Baa baa! 🐑',
  snake: 'Sssss! 🐍',
  wolf: 'Awooo! 🐺',
  penguin: 'Honk honk! 🐧',
  dinosaur: 'ROAR! 🦕',
};

const tokenize = (text: string) =>
  text.toLowerCase().match(/\b[\w']+\b/g)?.map(t => t.replace(/'/g, '')) || [];

const detectQuestionStyle = (query: string): QuestionStyle => {
  const q = query.toLowerCase().trim();
  if (q.startsWith('why ') || q.includes(' why ')) return 'why';
  if (q.startsWith('how ') || q.includes(' how ')) return 'how';
  if (q.startsWith('who ') || q.includes(' who ')) return 'who';
  if (q.startsWith('what ') || q.includes(' what ')) return 'what';
  return 'general';
};

/** Phrase match + weighted token overlap + lemmatized roots */
export const classifyIntent = (query: string): { label: string; value: number } => {
  const q = query.toLowerCase().trim();
  const queryTokens = tokenize(q).filter(t => !STOP_WORDS.has(t) && t.length > 1);
  const doc = nlp(query);
  doc.compute('root');
  const roots = new Set(
    (doc.terms().json() as { normal: string; root?: string }[])
      .map(t => (t.root || t.normal || '').toLowerCase())
      .filter(Boolean),
  );

  let bestIntent = 'educational_query';
  let bestScore = 0;

  const isShort = queryTokens.length <= 3;

  for (const intent of intentsData.intents) {
    let score = 0;

    for (const pattern of intent.patterns) {
      const p = pattern.toLowerCase();
      if (q === p) score += 5;
      else if (q.startsWith(p + ' ') || q.startsWith(p)) score += 3;
      else if (q.includes(p)) score += 1 + p.split(' ').length * 0.5;
    }

    const intentTokens = new Set<string>();
    for (const pattern of intent.patterns) {
      tokenize(pattern).forEach(w => {
        if (!STOP_WORDS.has(w)) intentTokens.add(w);
      });
    }

    for (const word of queryTokens) {
      if (intentTokens.has(word)) score += 0.8;
      if (roots.has(word)) score += 0.4;
    }

    if (intent.tag === 'greeting' && isShort) {
      const greetingHits = queryTokens.filter(t =>
        ['hi', 'hello', 'hey', 'morning', 'evening', 'afternoon', 'sup'].includes(t),
      );
      score += greetingHits.length * 2;
    }

    if (intent.tag === 'educational_query') {
      if (/^(what|why|how|who|when|where|tell|explain|describe)\b/.test(q)) score += 2;
      if (q.includes('?')) score += 0.5;
    }

    if (intent.tag === 'farewell') {
      if (/\b(bye|goodbye|later|night)\b/.test(q)) score += 2;
    }

    const normalized = score / Math.max(queryTokens.length, 1);
    if (normalized > bestScore) {
      bestScore = normalized;
      bestIntent = intent.tag;
    }
  }

  const confidence = Math.min(0.95, Math.max(0.15, bestScore / 4));
  return { label: bestIntent, value: confidence };
};

export interface ResolvedTopic {
  label: string;
  kbKey: string | null;
  wikiSearch: string;
}

/** Resolve the best topic from query text and NLP parse */
export const resolveTopic = (query: string, doc: ReturnType<typeof nlp>): ResolvedTopic => {
  const q = query.toLowerCase();

  // 1. Longest phrase match in resolver (e.g. "blue sky" before "sky")
  const phraseKeys = Object.keys(TOPIC_RESOLVER).sort((a, b) => b.length - a.length);
  for (const phrase of phraseKeys) {
    if (q.includes(phrase)) {
      const { kbKey, wiki } = TOPIC_RESOLVER[phrase];
      return { label: phrase, kbKey, wikiSearch: wiki };
    }
  }

  // 2. compromise topics() — good for "sky" in "why is the sky blue"
  const topics = doc.topics().out('array') as string[];
  for (const topic of topics) {
    const key = topic.toLowerCase();
    if (TOPIC_RESOLVER[key]) {
      const { kbKey, wiki } = TOPIC_RESOLVER[key];
      return { label: key, kbKey, wikiSearch: wiki };
    }
    if (KNOWLEDGE_BASE[key]) {
      return { label: key, kbKey: key, wikiSearch: key.charAt(0).toUpperCase() + key.slice(1) };
    }
  }

  // 3. Nouns — prefer KB matches, skip colors and generic words
  const nouns = doc
    .nouns()
    .not('#Pronoun')
    .not('#Determiner')
    .not('#QuestionWord')
    .out('array') as string[];

  const candidates = nouns
    .map(n => n.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim())
    .filter(n => n.length > 1 && !COLOR_WORDS.has(n) && !GENERIC_NOUNS.has(n) && !STOP_WORDS.has(n));

  for (const noun of [...candidates].reverse()) {
    if (TOPIC_RESOLVER[noun]) {
      const { kbKey, wiki } = TOPIC_RESOLVER[noun];
      return { label: noun, kbKey, wikiSearch: wiki };
    }
    if (KNOWLEDGE_BASE[noun]) {
      return { label: noun, kbKey: noun, wikiSearch: noun.charAt(0).toUpperCase() + noun.slice(1) };
    }
  }

  const fallback = candidates[candidates.length - 1] || candidates[0] || 'learning';
  const capitalized = fallback.charAt(0).toUpperCase() + fallback.slice(1);
  return { label: fallback, kbKey: null, wikiSearch: capitalized };
};

const formatFact = (fact: string, style: QuestionStyle, entity: string): string => {
  const openings: Record<QuestionStyle, string[]> = {
    why: [`🤔 Here's why, in simple words:`, `Great "why" question!`],
    how: [`🛠️ Here's how it works:`, `Let me show you how:`],
    what: [`📚 Let's learn!`, `🌟 Here's the answer:`],
    who: [`👋 Here you go:`, `🌟 Meet ${entity}:`],
    general: [`🌟 Fun fact!`, `📖 Did you know?`],
  };

  const opener = pickRandom(openings[style]);
  return `${opener}\n\n${fact}\n\nPretty cool, right? Ask me another question! 🎉`;
};

const lookupLocalFact = (kbKey: string): string | null => {
  const facts = KNOWLEDGE_BASE[kbKey];
  return facts ? pickRandom(facts) : null;
};

const entityFallback = (entity: string) =>
  pickRandom([
    `Wow, great question about ${entity}! 🌟 I'm still learning that one. Try tapping a colorful button below — like space or elephants!`,
    `Hmm, I don't have a super simple answer about ${entity} yet. Pick a topic below and we'll learn together! 📚`,
    `You're so curious about ${entity}! ⭐ Ask a grown-up to explore more, or try "Tell me about rainbows" — I love that one!`,
  ]);

interface WikiResult {
  title: string;
  summary: string;
  imageUrl?: string;
}

const fetchWikipedia = async (searchTerm: string): Promise<WikiResult | null> => {
  const url =
    `https://simple.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages` +
    `&exintro=1&explaintext=1&exchars=500&generator=search` +
    `&gsrsearch=${encodeURIComponent(searchTerm)}&gsrlimit=1&format=json&origin=*&pithumbsize=300`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  const pages = data?.query?.pages;
  if (!pages) return null;

  const pageId = Object.keys(pages)[0];
  const page = pages[pageId];
  if (!page?.extract) return null;

  return {
    title: page.title as string,
    summary: page.extract as string,
    imageUrl: page.thumbnail?.source,
  };
};

const buildLiveResponse = (wiki: WikiResult, topic: ResolvedTopic, style: QuestionStyle): string => {
  const key = topic.kbKey || topic.label.toLowerCase();
  const sound = FUN_SOUNDS[wiki.title.toLowerCase()] || FUN_SOUNDS[key] || '';
  const soundPrefix = sound ? `${sound}\n\n` : '';

  return buildKidLiveMessage({
    title: wiki.title,
    wikiSummary: wiki.summary,
    style,
    soundPrefix,
  });
};

const QUIZ_QUESTIONS: Record<string, QuizData[]> = {
  sky: [
    { question: 'Why does the sky look blue?', options: ['Because of blue paint', 'Blue light scatters most', 'The sun is blue', 'It reflects the ocean'], correctAnswer: 1 },
    { question: 'What color is sunlight before it reaches Earth?', options: ['Blue', 'Red', 'White', 'Yellow'], correctAnswer: 2 },
  ],
  elephant: [
    { question: 'What do elephants use their trunks for?', options: ['Only breathing', 'Drinking, grabbing food, and making sounds', 'Just for show', 'To fly'], correctAnswer: 1 },
    { question: 'How many muscles are in an elephant\'s trunk?', options: ['A few dozen', 'Hundreds', 'Tens of thousands', 'None'], correctAnswer: 2 },
  ],
  math: [
    { question: 'What is 3 × 4?', options: ['7', '10', '12', '14'], correctAnswer: 2 },
    { question: 'What does multiplication do?', options: ['Takes away numbers', 'Adds the same number many times', 'Divides numbers', 'Makes numbers smaller'], correctAnswer: 1 },
  ],
  multiplication: [
    { question: 'What is 5 × 2?', options: ['7', '10', '12', '8'], correctAnswer: 1 },
    { question: 'Multiplication is like...', options: ['Slow counting', 'Fast adding', 'Subtraction', 'Division'], correctAnswer: 1 },
  ],
  space: [
    { question: 'Can sound travel in space?', options: ['Yes, very loud', 'No, space is silent', 'Only sometimes', 'Only with special equipment'], correctAnswer: 1 },
    { question: 'What is at the center of our Solar System?', options: ['Earth', 'The Moon', 'The Sun', 'A black hole'], correctAnswer: 2 },
  ],
  moon: [
    { question: 'Does the Moon make its own light?', options: ['Yes, it glows', 'No, it reflects sunlight', 'Only during full moon', 'It uses electricity'], correctAnswer: 1 },
    { question: 'How long does it take the Moon to orbit Earth?', options: ['1 day', '7 days', '27 days', '365 days'], correctAnswer: 2 },
  ],
  sun: [
    { question: 'What is the Sun?', options: ['A planet', 'A giant star', 'A moon', 'A comet'], correctAnswer: 1 },
    { question: 'How many Earths could fit inside the Sun?', options: ['10', '100', '1,000', 'About 1 million'], correctAnswer: 3 },
  ],
  animal: [
    { question: 'What sound does a cow make?', options: ['Woof', 'Meow', 'Moo', 'Tweet'], correctAnswer: 2 },
    { question: 'What do animals need to survive?', options: ['Only water', 'Only air', 'Food, water, and shelter', 'Nothing'], correctAnswer: 2 },
  ],
  dinosaur: [
    { question: 'When did dinosaurs live?', options: ['Yesterday', 'Millions of years ago', 'In the future', 'They never existed'], correctAnswer: 1 },
    { question: 'How do we learn about dinosaurs?', options: ['From photos', 'From fossils', 'From videos', 'From living ones'], correctAnswer: 1 },
  ],
  ocean: [
    { question: 'What is the biggest ocean?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], correctAnswer: 2 },
    { question: 'What lives in the ocean?', options: ['Only fish', 'Only plants', 'Whales, dolphins, fish, and more', 'Nothing'], correctAnswer: 2 },
  ],
  rainbow: [
    { question: 'When do rainbows appear?', options: ['Only at night', 'When sunlight shines through raindrops', 'In the dark', 'When it snows'], correctAnswer: 1 },
    { question: 'What colors are in a rainbow?', options: ['Just red and blue', 'Red, orange, yellow, green, blue, and purple', 'Only green', 'Black and white'], correctAnswer: 1 },
  ],
  volcano: [
    { question: 'What comes out of a volcano?', options: ['Cold water', 'Hot melted rock (lava)', 'Ice', 'Sand'], correctAnswer: 1 },
    { question: 'What can volcanoes create?', options: ['Only destruction', 'New mountains and islands', 'Nothing', 'Only smoke'], correctAnswer: 1 },
  ],
  plant: [
    { question: 'How do plants make food?', options: ['By eating', 'Using sunlight (photosynthesis)', 'By hunting', 'They don\'t need food'], correctAnswer: 1 },
    { question: 'What do plants give us?', options: ['Nothing', 'Oxygen to breathe', 'Only shade', 'Noise'], correctAnswer: 1 },
  ],
  lion: [
    { question: 'Where do lions usually live?', options: ['In the ocean', 'In grasslands (savannas)', 'In the Arctic', 'In trees only'], correctAnswer: 1 },
    { question: 'What is a male lion known for?', options: ['Flying', 'Its majestic mane', 'Being small', 'Being quiet'], correctAnswer: 1 },
  ],
  tiger: [
    { question: 'What is special about tiger stripes?', options: ['All tigers have the same pattern', 'Each tiger\'s pattern is unique', 'They have no stripes', 'Stripes change color'], correctAnswer: 1 },
    { question: 'Are tigers good swimmers?', options: ['No, they hate water', 'Yes, they are excellent swimmers', 'Only some can swim', 'They sink'], correctAnswer: 1 },
  ],
  penguin: [
    { question: 'Can penguins fly?', options: ['Yes, very high', 'No, they swim instead', 'Only in winter', 'They fly backwards'], correctAnswer: 1 },
    { question: 'Where do penguins live?', options: ['In hot deserts', 'In cold places like Antarctica', 'In trees', 'Underground'], correctAnswer: 1 },
  ],
  bee: [
    { question: 'What do bees do for flowers?', options: ['Eat them', 'Spread pollen (help them grow)', 'Break them', 'Nothing'], correctAnswer: 1 },
    { question: 'What do bees make?', options: ['Milk', 'Honey', 'Paper', 'Plastic'], correctAnswer: 1 },
  ],
  africa: [
    { question: 'What is the longest river in Africa?', options: ['Amazon', 'Nile', 'Mississippi', 'Thames'], correctAnswer: 1 },
    { question: 'What animals live in Africa?', options: ['Penguins only', 'Lions, giraffes, zebras, and elephants', 'Only polar bears', 'No animals'], correctAnswer: 1 },
  ],
};

export const generateQuiz = (kbKey: string | null, topicLabel: string): QuizData | null => {
  const key = kbKey || topicLabel.toLowerCase();
  const quizzes = QUIZ_QUESTIONS[key];
  if (quizzes && quizzes.length > 0) {
    return pickRandom(quizzes);
  }
  return null;
};

const buildLocalResponse = (kbKey: string, style: QuestionStyle): string => {
  const fact = lookupLocalFact(kbKey)!;
  return formatFact(fact, style, kbKey);
};

export const processQueryAgentic = async (
  query: string,
  useLiveAPI: boolean,
  onStep: (step: AgentStep) => void,
): Promise<{ text: string; imageUrl?: string }> => {
  const doc = nlp(query);
  const questionStyle = detectQuestionStyle(query);

  await delay(500);
  const tokens = doc.terms().out('array');
  onStep({
    id: `${Date.now()}-p1`,
    type: 'thought',
    content: `Pre-processing: ${tokens.length} tokens, normalized & filtered stop-words.`,
  });

  await delay(500);
  doc.compute('root');
  onStep({
    id: `${Date.now()}-p2`,
    type: 'thought',
    content: `Lemmatization: reduced words to root forms for better matching.`,
  });

  await delay(500);
  const topIntent = classifyIntent(query);
  onStep({
    id: `${Date.now()}-t1`,
    type: 'thought',
    content: `Intent (weighted BoW + phrases): [${topIntent.label}] (${(topIntent.value * 100).toFixed(0)}% confidence)`,
  });

  await delay(500);
  const topic = resolveTopic(query, doc);
  onStep({
    id: `${Date.now()}-a1`,
    type: 'action',
    content: `Entity resolution: topic="${topic.label}" → search="${topic.wikiSearch}"${topic.kbKey ? ` (KB: ${topic.kbKey})` : ''}`,
  });

  const intentBlock = intentsData.intents.find(i => i.tag === topIntent.label);
  const templateResponse = intentBlock
    ? pickRandom(intentBlock.responses)
    : "I'm not sure how to respond to that.";

  if (topIntent.label === 'greeting' || topIntent.label === 'farewell') {
    const responseText = templateResponse;
    await delay(400);
    onStep({
      id: `${Date.now()}-a2`,
      type: 'action',
      content: `Template response for ${topIntent.label}.`,
    });
    onStep({
      id: `${Date.now()}-o1`,
      type: 'observation',
      content: `No knowledge lookup needed.`,
    });
    await delay(600);
    onStep({ id: `${Date.now()}-r1`, type: 'response', content: responseText });
    return { text: responseText };
  }

  let observation = '';
  let responseText = '';
  let imageUrl: string | undefined;

  // Prefer curated kid-friendly KB when we have a match
  if (topic.kbKey && KNOWLEDGE_BASE[topic.kbKey]) {
    onStep({
      id: `${Date.now()}-a2`,
      type: 'action',
      content: `Knowledge base hit: curated answer for "${topic.kbKey}".`,
    });
    await delay(600);
    observation = `Found trusted local document for "${topic.kbKey}".`;
    responseText = buildLocalResponse(topic.kbKey, questionStyle);

    if (useLiveAPI) {
      try {
        const wiki = await fetchWikipedia(topic.wikiSearch);
        if (wiki?.imageUrl) imageUrl = wiki.imageUrl;
      } catch {
        /* image optional */
      }
    }
  } else if (useLiveAPI) {
    onStep({
      id: `${Date.now()}-a2`,
      type: 'action',
      content: `Wikipedia lookup: "${topic.wikiSearch}" → kid-language filter (ages 5–8)`,
    });

    try {
      const wiki = await fetchWikipedia(topic.wikiSearch);
      if (wiki) {
        observation = `Found "${wiki.title}" and rewrote it with short, simple sentences for kids.`;
        imageUrl = wiki.imageUrl;
        responseText = buildLiveResponse(wiki, topic, questionStyle);
      } else {
        throw new Error('No results');
      }
    } catch {
      observation = `Wikipedia unavailable. Trying local knowledge.`;
      if (topic.kbKey) {
        responseText = buildLocalResponse(topic.kbKey, questionStyle);
      } else {
        responseText = entityFallback(topic.label);
      }
    }
  } else {
    onStep({
      id: `${Date.now()}-a2`,
      type: 'action',
      content: `Offline mode: searching knowledge base.`,
    });
    await delay(600);

    if (topic.kbKey) {
      observation = `Local KB match: "${topic.kbKey}".`;
      responseText = buildLocalResponse(topic.kbKey, questionStyle);
    } else {
      observation = `No KB entry for "${topic.label}".`;
      responseText = entityFallback(topic.label);
    }
  }

  onStep({
    id: `${Date.now()}-o1`,
    type: 'observation',
    content: observation,
  });

  await delay(600);
  onStep({
    id: `${Date.now()}-r1`,
    type: 'response',
    content: responseText,
    imageUrl,
  });

  return { text: responseText, imageUrl };
};
