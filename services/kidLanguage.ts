/** Language tools to turn Wikipedia text into answers for ages 5–8 */

export type QuestionStyle = 'why' | 'how' | 'what' | 'who' | 'general';

const MAX_SENTENCES = 2;
const MAX_WORDS_PER_SENTENCE = 12;

const TITLE_FOR_KIDS: Record<string, string> = {
  'outer space': 'Space',
  mathematics: 'Math',
  photosynthesis: 'How plants eat sunlight',
  'solar system': 'Our Solar System',
  astronaut: 'Astronauts',
  continent: 'A big land area',
  equator: 'The middle line of Earth',
};

/** Longer phrases first when replacing */
const KID_WORD_MAP: Record<string, string> = {
  'approximately': 'about',
  'significantly': 'a lot',
  'primarily': 'mostly',
  'generally': 'usually',
  'typically': 'usually',
  'frequently': 'often',
  'therefore': 'so',
  'however': 'but',
  'although': 'but',
  'because': 'since',
  'including': 'like',
  'consisting': 'made of',
  'composed': 'made of',
  'located': 'found',
  'considered': 'thought to be',
  'recognized': 'known',
  'classified': 'sorted into groups',
  'evolved': 'changed over time',
  'extinct': 'not alive anymore',
  'predator': 'hunter animal',
  'prey': 'animal that gets hunted',
  'habitat': 'home in nature',
  'ecosystem': 'nature neighborhood',
  'atmosphere': 'air around us',
  'environment': 'world around us',
  'temperature': 'how hot or cold',
  'revolution': 'trip around',
  'rotation': 'spinning',
  'orbit': 'path in space',
  'gravitation': 'gravity',
  'gravitational': 'gravity',
  'electromagnetic': 'light and energy',
  'radiation': 'energy from light',
  'molecules': 'tiny pieces',
  'particles': 'tiny pieces',
  'organisms': 'living things',
  'vertebrates': 'animals with backbones',
  'invertebrates': 'animals without backbones',
  'mammals': 'animals that feed milk to babies',
  'reptiles': 'scaly animals',
  'amphibians': 'animals that live in water and on land',
  'carnivore': 'meat eater',
  'herbivore': 'plant eater',
  'omnivore': 'eats plants and meat',
  'species': 'kind of animal or plant',
  'population': 'group of living things',
  'continent': 'huge land',
  'civilization': 'group of people long ago',
  'archaeological': 'from old digging finds',
  'scientific': 'science',
  'laboratory': 'science lab',
  'experiment': 'science test',
  'hypothesis': 'science guess',
  'phenomenon': 'cool thing that happens',
  'composition': 'what something is made of',
  'substance': 'stuff',
  'chemical': 'science mix',
  'compound': 'mixture',
  'formula': 'recipe',
  'equation': 'math sentence',
  'calculate': 'figure out',
  'measurement': 'measuring',
  'instrument': 'tool',
  'apparatus': 'tool',
  'mechanism': 'how it works',
  'process': 'way it works',
  'function': 'job',
  'structure': 'shape',
  'characteristic': 'special thing about it',
  'distinctive': 'special',
  'enormous': 'huge',
  'gigantic': 'super big',
  'minuscule': 'super tiny',
  'microscopic': 'too tiny to see',
  'ancient': 'very old',
  'prehistoric': 'before people wrote things down',
  'century': '100 years',
  'millennium': '1000 years',
  'decade': '10 years',
  'surface': 'outside',
  'crust': 'outer layer',
  'mantle': 'layer inside Earth',
  'eruption': 'big burst',
  'lava': 'hot melted rock',
  'magma': 'hot rock inside Earth',
  'tsunami': 'giant ocean wave',
  'hurricane': 'huge storm',
  'tornado': 'spinning wind storm',
  'precipitation': 'rain or snow',
  'evaporation': 'water going into the air',
  'condensation': 'water making clouds',
  'photosynthesis': 'how plants make food from sun',
  'chlorophyll': 'green stuff in leaves',
  'pollination': 'flowers getting help to make seeds',
  'nutrients': 'healthy food bits',
  'oxygen': 'air we need to breathe',
  'carbon dioxide': 'gas plants use',
  'astronomy': 'study of stars',
  'telescope': 'star-looking tool',
  'galaxy': 'big family of stars',
  'universe': 'everything in space',
  'astronaut': 'space explorer',
  'satellite': 'thing that travels in space',
  'democracy': 'people voting together',
  'government': 'leaders of a country',
  'economy': 'how people buy and sell',
  'indigenous': 'first people living there',
  'migration': 'moving to a new home',
  'reproduction': 'making babies',
  'gestation': 'time before a baby is born',
  'domesticated': 'animal friends for people',
  'agriculture': 'farming',
  'cultivate': 'grow',
  'harvest': 'pick crops',
  'biodiversity': 'many kinds of life',
  'conservation': 'protecting nature',
  'endangered': 'needs our help to survive',
  'predators': 'hunter animals',
  'survive': 'stay alive',
  'adaptation': 'special body help',
  'camouflage': 'hiding look',
  'nocturnal': 'awake at night',
  'diurnal': 'awake in the day',
  'hibernation': 'long winter sleep',
  'metamorphosis': 'big change as it grows',
  'larvae': 'baby insect',
  'mammal': 'animal with fur or hair',
  'reptile': 'scaly animal',
  'amphibian': 'water and land animal',
  'crustacean': 'shell animal like crab',
  'mollusk': 'soft body animal like snail',
  'cephalopod': 'animal like octopus',
  'echinoderm': 'spiky sea animal',
  'arthropod': 'bug-type animal',
  'parasite': 'tiny creature that lives on others',
  'bacteria': 'super tiny germs',
  'virus': 'super tiny germ',
  'fungus': 'mushroom-type life',
  'decompose': 'break down in nature',
  'fossil': 'very old bone turned to stone',
  'paleontologist': 'dinosaur scientist',
  'excavation': 'digging carefully',
  'excavate': 'dig carefully',
  'terrestrial': 'on land',
  'aquatic': 'in water',
  'marine': 'in the ocean',
  'freshwater': 'river or lake water',
  'saline': 'salty',
  'altitude': 'how high up',
  'latitude': 'how far from equator',
  'longitude': 'map lines',
  'hemisphere': 'half of Earth',
  'equator': 'middle line of Earth',
  'axis': 'spin line',
  'solar': 'from the sun',
  'lunar': 'from the moon',
  'eclipse': 'sun or moon hiding',
  'meteor': 'space rock streak',
  'meteorite': 'space rock on ground',
  'asteroid': 'rock in space',
  'comet': 'icy space traveler',
  'nebula': 'cloud in space',
  'supernova': 'star explosion',
  'black hole': 'super strong space pull',
  'density': 'how squished together',
  'volume': 'how much space it takes',
  'mass': 'how heavy',
  'energy': 'power',
  'friction': 'rubbing slow-down',
  'motion': 'movement',
  'velocity': 'speed',
  'acceleration': 'speeding up',
  'transparent': 'see-through',
  'opaque': 'not see-through',
  'reflect': 'bounce light back',
  'absorb': 'soak up',
  'vibrate': 'shake fast',
  'frequency': 'how fast it shakes',
  'wavelength': 'wave size',
  'spectrum': 'rainbow of colors',
  'ultraviolet': 'special sun light',
  'infrared': 'heat light',
  'visible': 'we can see',
  'invisible': 'we cannot see',
  'microorganism': 'super tiny living thing',
  'vertebrate': 'animal with a backbone',
  'invertebrate': 'animal with no backbone',
  'carnivorous': 'meat eating',
  'herbivorous': 'plant eating',
  'omnivorous': 'eats many foods',
  'dominant': 'strongest',
  'subordinate': 'less powerful',
  'territory': 'home area',
  'colony': 'big group',
  'hive': 'bee home',
  'pack': 'group of animals',
  'herd': 'group of animals',
  'flock': 'group of birds',
  'school': 'group of fish',
  'pride': 'lion family',
  'swarm': 'big group of insects',
};

const UNSAFE_SENTENCE_PATTERNS = [
  /\b(kill|killed|killing|murder|war|wars|weapon|weapons|bomb|terror|suicide|abuse|torture)\b/i,
  /\b(sexual|pornograph|nude|naked)\b/i,
  /\b(drugs?|cocaine|heroin|meth)\b/i,
];

const applyKidWordMap = (text: string): string => {
  let result = text;
  const entries = Object.entries(KID_WORD_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [complex, simple] of entries) {
    result = result.replace(new RegExp(`\\b${complex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), simple);
  }
  return result;
};

const cleanWikiText = (text: string): string =>
  text
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\{[^}]*\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const splitSentences = (text: string): string[] =>
  text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

const wordCount = (sentence: string) => sentence.split(/\s+/).filter(Boolean).length;

const isSafeForKids = (sentence: string) =>
  !UNSAFE_SENTENCE_PATTERNS.some(pattern => pattern.test(sentence));

/** Lower score = simpler (better for young kids) */
const sentenceComplexity = (sentence: string): number => {
  const words = sentence.split(/\s+/).filter(Boolean);
  let score = words.length * 1.2;
  for (const word of words) {
    if (word.length > 12) score += 3;
    else if (word.length > 9) score += 2;
    else if (word.length > 7) score += 1;
    if (/\d{4,}/.test(word)) score += 2;
    if (/[^a-zA-Z'-]/.test(word) && /\d/.test(word)) score += 0.5;
  }
  return score;
};

const clampSentence = (sentence: string, maxWords = MAX_WORDS_PER_SENTENCE): string => {
  let s = sentence.replace(/\s+/g, ' ').trim();
  if (!s.endsWith('.') && !s.endsWith('!') && !s.endsWith('?')) {
    s += '.';
  }
  const words = s.split(/\s+/);
  if (words.length <= maxWords) return s;
  return `${words.slice(0, maxWords).join(' ')}.`;
};

export const kidFriendlyTitle = (title: string): string => {
  const key = title.toLowerCase().trim();
  return TITLE_FOR_KIDS[key] || title;
};

/**
 * Picks the simplest, safest sentences and rewrites hard words for ages 5–8.
 */
export const adaptWikipediaForKids = (rawText: string, title: string): string => {
  const cleaned = cleanWikiText(rawText);
  if (!cleaned) {
    return `${kidFriendlyTitle(title)} is something really cool to learn about!`;
  }

  const simplified = applyKidWordMap(cleaned);
  const candidates = splitSentences(simplified)
    .map(s => applyKidWordMap(s))
    .map(s => s.replace(/[,;:—–-]\s+/g, '. '))
    .flatMap(s => splitSentences(s))
    .map(s => clampSentence(s))
    .filter(s => wordCount(s) >= 4 && wordCount(s) <= MAX_WORDS_PER_SENTENCE + 2)
    .filter(isSafeForKids);

  const ranked = [...new Set(candidates)].sort(
    (a, b) => sentenceComplexity(a) - sentenceComplexity(b),
  );

  const chosen = ranked.slice(0, MAX_SENTENCES);

  if (chosen.length === 0) {
    return `${kidFriendlyTitle(title)} is an amazing part of our world. Scientists and kids love learning about it!`;
  }

  return chosen.join(' ');
};

const pickRandom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export const buildKidLiveMessage = (options: {
  title: string;
  wikiSummary: string;
  style: QuestionStyle;
  soundPrefix?: string;
}): string => {
  const { title, wikiSummary, style, soundPrefix = '' } = options;
  const displayTitle = kidFriendlyTitle(title);
  const fact = adaptWikipediaForKids(wikiSummary, title);

  const intros: Record<QuestionStyle, string[]> = {
    why: [
      `🤔 Great "why" question! Here's the kid-friendly answer about ${displayTitle}:`,
      `Let's figure out why ${displayTitle} works like that!`,
    ],
    how: [
      `🛠️ Here's how ${displayTitle} works — nice and simple!`,
      `Let me explain how ${displayTitle} works for young learners:`,
    ],
    what: [
      `📚 Let's learn about ${displayTitle}!`,
      `🌟 Here's what ${displayTitle} means:`,
    ],
    who: [
      `👋 Let me tell you about ${displayTitle}!`,
      `🌟 Here's who or what ${displayTitle} is:`,
    ],
    general: [
      `🌟 Fun fact time about ${displayTitle}!`,
      `📖 Here's something cool about ${displayTitle}:`,
    ],
  };

  const closings = [
    `Pretty cool, right? Ask me another question! 🎉`,
    `Want to learn more? Try asking "Tell me more about ${displayTitle.toLowerCase()}"!`,
    `You're doing awesome learning! Keep being curious! ⭐`,
  ];

  const intro = pickRandom(intros[style]);
  const closing = pickRandom(closings);

  return `${soundPrefix}${intro}\n\n${fact}\n\n${closing}`;
};
