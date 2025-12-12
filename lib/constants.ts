export const DEITIES = [
  {
    id: 'ganesha',
    name: 'Shri Ganesha',
    subtitle: 'Remover of Obstacles',
    icon: '🐘',
    description: 'Remover of Obstacles',
    color: 'bg-gradient-to-br from-orange-400 to-amber-500',
    blessings: ['Obstacle Removal', 'New Beginnings', 'Wisdom'],
  },
  {
    id: 'shiva',
    name: 'Shiva',
    subtitle: 'Destroyer & Transformer',
    icon: '🔱',
    description: 'Destroyer & Transformer',
    color: 'bg-gradient-to-br from-slate-600 to-gray-800',
    blessings: ['Transformation', 'Inner Peace', 'Meditation'],
  },
  {
    id: 'lakshmi',
    name: 'Lakshmi',
    subtitle: 'Goddess of Wealth',
    icon: '💰',
    description: 'Goddess of Wealth',
    color: 'bg-gradient-to-br from-yellow-400 to-amber-600',
    blessings: ['Prosperity', 'Abundance', 'Fortune'],
  },
  {
    id: 'hanuman',
    name: 'Hanuman',
    subtitle: 'Symbol of Strength',
    icon: '🐵',
    description: 'Symbol of Strength',
    color: 'bg-gradient-to-br from-orange-500 to-red-600',
    blessings: ['Strength', 'Courage', 'Devotion'],
  },
  {
    id: 'krishna',
    name: 'Krishna',
    subtitle: 'Divine Love',
    icon: '🪈',
    description: 'Divine Love',
    color: 'bg-gradient-to-br from-blue-500 to-indigo-700',
    blessings: ['Love', 'Joy', 'Divine Grace'],
  },
  {
    id: 'durga',
    name: 'Durga',
    subtitle: 'Warrior Goddess',
    icon: '⚔️',
    description: 'Warrior Goddess',
    color: 'bg-gradient-to-br from-red-500 to-pink-700',
    blessings: ['Protection', 'Courage', 'Victory'],
  },
  {
    id: 'ram',
    name: 'Ram',
    subtitle: 'Ideal Righteousness',
    icon: '🏹',
    description: 'Ideal Righteousness',
    color: 'bg-gradient-to-br from-green-500 to-teal-700',
    blessings: ['Righteousness', 'Truth', 'Honor'],
  },
  {
    id: 'vishnu',
    name: 'Vishnu',
    subtitle: 'The Preserver',
    icon: '🐚',
    description: 'The Preserver',
    color: 'bg-gradient-to-br from-purple-500 to-indigo-700',
    blessings: ['Balance', 'Preservation', 'Harmony'],
  },
  {
    id: 'saraswati',
    name: 'Saraswati',
    subtitle: 'Goddess of Knowledge',
    icon: '🎼',
    description: 'Goddess of Knowledge',
    color: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    blessings: ['Knowledge', 'Arts', 'Wisdom'],
  },
];

export const PUJA_STEPS = [
  {
    id: 1,
    name: 'Light the Diya',
    icon: '🪔',
    gesture: 'swipe-up',
    instruction: 'Swipe up to light the sacred diya',
  },
  {
    id: 2,
    name: 'Light Agarbatti',
    icon: '🌿',
    gesture: 'hold-drag',
    instruction: 'Hold and move to light the incense',
  },
  {
    id: 3,
    name: 'Offer Milk',
    icon: '🥛',
    gesture: 'tilt',
    instruction: 'Tilt your phone to pour the offering',
  },
  {
    id: 4,
    name: 'Offer Flowers',
    icon: '🌸',
    gesture: 'drag',
    instruction: 'Drag flowers to the deity',
  },
  {
    id: 5,
    name: 'Perform Aarti',
    icon: '🪔',
    gesture: 'circular',
    instruction: 'Make a circular motion with your finger',
  },
  {
    id: 6,
    name: 'Blow Shankha',
    icon: '🐚',
    gesture: 'tap',
    instruction: 'Tap to blow the sacred conch',
  },
  {
    id: 7,
    name: 'Play Nagada',
    icon: '🥁',
    gesture: 'rhythm-tap',
    instruction: 'Tap in rhythm to play the drum',
  },
];

export const AFFIRMATIONS = [
  { deity: 'ganesha', text: 'Obstacles melt away as new paths appear' },
  { deity: 'shiva', text: 'Inner peace flows through every moment' },
  { deity: 'lakshmi', text: 'Abundance finds its way to you' },
  { deity: 'hanuman', text: 'Strength rises within you effortlessly' },
  { deity: 'krishna', text: 'Love surrounds you in all directions' },
  { deity: 'durga', text: 'Courage awakens, fear dissolves' },
  { deity: 'ram', text: 'Righteousness guides your choices' },
  { deity: 'vishnu', text: 'Balance restores in all aspects of life' },
  { deity: 'saraswati', text: 'Knowledge flows effortlessly to you' },
];

export const OFFERING_TIERS = [
  { amount: 11, punyaBonus: 50, label: '₹11' },
  { amount: 21, punyaBonus: 75, label: '₹21' },
  { amount: 51, punyaBonus: 100, label: '₹51' },
  { amount: 111, punyaBonus: 150, label: '₹111' },
];

export const PUNYA_REWARDS = {
  DAILY_PUJA: 150,
  FESTIVAL_BONUS: 250,
  GAME_UNLOCK_BONUS: 200,
  STREAK_3_DAYS: 100,
  STREAK_7_DAYS: 300,
  STREAK_14_DAYS: 500,
  STREAK_30_DAYS: 1000,
};

export const GAME_CONFIGS = {
  ganesha: {
    type: 'catch',
    duration: 60,
    difficulty: 'medium',
    pointsPerItem: 10,
  },
  shiva: {
    type: 'aim',
    duration: 60,
    difficulty: 'hard',
    pointsPerHit: 20,
  },
  lakshmi: {
    type: 'sort',
    duration: 60,
    difficulty: 'medium',
    pointsPerCoin: 15,
  },
  hanuman: {
    type: 'lift',
    duration: 60,
    difficulty: 'easy',
    pointsPerLift: 25,
  },
  krishna: {
    type: 'rhythm',
    duration: 60,
    difficulty: 'medium',
    pointsPerNote: 12,
  },
  durga: {
    type: 'match',
    duration: 60,
    difficulty: 'hard',
    pointsPerMatch: 18,
  },
  ram: {
    type: 'shoot',
    duration: 60,
    difficulty: 'medium',
    pointsPerHit: 20,
  },
  vishnu: {
    type: 'spin',
    duration: 60,
    difficulty: 'hard',
    pointsPerHit: 15,
  },
  saraswati: {
    type: 'music',
    duration: 60,
    difficulty: 'medium',
    pointsPerNote: 18,
  },
};

export const CONTENT_TYPES = {
  VIDEO: 'video',
  BLOG: 'blog',
  IMAGE: 'image',
} as const;

export const FESTIVAL_CALENDAR = [
  { name: 'Makar Sankranti', date: '2024-01-15', deity: 'vishnu', bonus: 250 },
  { name: 'Maha Shivaratri', date: '2024-03-08', deity: 'shiva', bonus: 250 },
  { name: 'Holi', date: '2024-03-25', deity: 'krishna', bonus: 250 },
  { name: 'Ram Navami', date: '2024-04-17', deity: 'ram', bonus: 250 },
  { name: 'Hanuman Jayanti', date: '2024-04-23', deity: 'hanuman', bonus: 250 },
  { name: 'Ganesh Chaturthi', date: '2024-09-07', deity: 'ganesha', bonus: 250 },
  { name: 'Navratri', date: '2024-10-03', deity: 'durga', bonus: 250 },
  { name: 'Diwali', date: '2024-11-01', deity: 'lakshmi', bonus: 250 },
];
