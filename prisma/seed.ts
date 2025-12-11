import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEITIES = [
  'ganesha',
  'shiva',
  'lakshmi',
  'hanuman',
  'krishna',
  'durga',
  'ram',
  'vishnu',
];

const GAMES = [
  {
    deity: 'ganesha',
    name: "Ganesha's Modak Catcher",
    description: 'Drag the basket to catch falling modaks while avoiding obstacles. Collect as many as you can in 60 seconds!',
    mechanics: 'catch',
    unlockPrice: 111,
  },
  {
    deity: 'shiva',
    name: "Shiva's Trishul Aim",
    description: 'Drag to aim the trishul and release to throw at targets. Hit the center for bonus points!',
    mechanics: 'aim',
    unlockPrice: 111,
  },
  {
    deity: 'lakshmi',
    name: "Lakshmi's Coin Sorter",
    description: 'Drag coins to their correct denomination buckets before time runs out. Speed increases with each level!',
    mechanics: 'sort',
    unlockPrice: 111,
  },
  {
    deity: 'hanuman',
    name: "Hanuman's Mountain Lifter",
    description: 'Hold your finger to lift the mountain and release at the right moment. Timing is everything!',
    mechanics: 'lift',
    unlockPrice: 111,
  },
  {
    deity: 'krishna',
    name: "Krishna's Flute Rhythm",
    description: 'Drag musical notes to match the rhythm pattern. Create beautiful melodies!',
    mechanics: 'rhythm',
    unlockPrice: 111,
  },
  {
    deity: 'durga',
    name: "Durga's Weapon Matcher",
    description: 'Drag weapons to their correct hands on Maa Durga. Complete the divine arsenal!',
    mechanics: 'match',
    unlockPrice: 111,
  },
  {
    deity: 'ram',
    name: "Ram's Arrow Shooter",
    description: 'Drag to aim the bow and release to shoot arrows at targets. Precision matters!',
    mechanics: 'shoot',
    unlockPrice: 111,
  },
  {
    deity: 'vishnu',
    name: "Vishnu's Chakra Spinner",
    description: 'Drag the chakra in circles to gain speed and hit multiple targets. Keep the momentum!',
    mechanics: 'spin',
    unlockPrice: 111,
  },
];

const CONTENT = [
  // Videos
  {
    title: 'Complete Diwali Puja Vidhi - Step by Step Guide',
    type: 'video',
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    body: 'Learn the traditional way to perform Lakshmi Puja on Diwali night.',
    tags: ['diwali', 'lakshmi', 'puja', 'festival', 'video'],
  },
  {
    title: 'Ganesh Chaturthi Celebration - Traditional Rituals',
    type: 'video',
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    body: 'Experience the grandeur of Ganesh Chaturthi celebrations and learn the rituals.',
    tags: ['ganesha', 'ganesh-chaturthi', 'festival', 'video'],
  },
  {
    title: 'Daily Morning Puja - Simple Routine for Beginners',
    type: 'video',
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    body: 'A simple 10-minute morning puja routine you can follow every day.',
    tags: ['daily-puja', 'morning', 'beginner', 'video'],
  },
  {
    title: 'Mahashivratri Special - Night Long Vigil and Rituals',
    type: 'video',
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    body: 'How to observe Mahashivratri with proper rituals and mantras.',
    tags: ['shiva', 'mahashivratri', 'festival', 'video'],
  },
  {
    title: 'Navratri Garba & Aarti - Complete Guide',
    type: 'video',
    mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    body: 'Learn the proper way to perform Durga aarti during Navratri.',
    tags: ['durga', 'navratri', 'festival', 'video'],
  },
  // Blogs
  {
    title: 'Understanding the Significance of 108 in Hindu Rituals',
    type: 'blog',
    body: `The number 108 holds deep spiritual significance in Hinduism. From 108 beads in a mala to 108 names of deities, this sacred number appears throughout our traditions.\n\nThe distance between Earth and Sun is approximately 108 times the Sun's diameter. Similarly, the distance between Earth and Moon is about 108 times the Moon's diameter.\n\nThere are said to be 108 Upanishads, 108 sacred sites (pithas), and 108 marma points in Ayurveda. This number represents wholeness and completeness in spiritual practice.`,
    tags: ['spirituality', 'knowledge', 'numerology', 'blog'],
  },
  {
    title: 'The Science Behind Ringing Temple Bells',
    type: 'blog',
    body: `Temple bells are not just instruments for creating sound. The sound of the bell is believed to create vibrations that activate the seven chakras in our body.\n\nScientifically, the bell produces a sharp but lasting sound that can last for about 7 seconds, creating an echo mode in our brain. This sound helps clear our mind and focus on the divine.\n\nThe bell's metal composition (usually an alloy of copper, brass, zinc, nickel, and other metals) is designed to produce specific frequencies that have therapeutic effects on the human body.`,
    tags: ['temple', 'science', 'spirituality', 'blog'],
  },
  {
    title: 'Tulsi Plant: The Sacred Basil in Hindu Homes',
    type: 'blog',
    body: `Tulsi (Holy Basil) is revered as a manifestation of Goddess Lakshmi. Every Hindu household traditionally maintains a Tulsi plant in their courtyard or entrance.\n\nBeyond spiritual significance, Tulsi has remarkable medicinal properties. It purifies air, acts as a natural mosquito repellent, and its leaves have powerful anti-bacterial properties.\n\nDaily worship of Tulsi with water and lighting a diya brings positive energy to the home. The plant requires minimal care and provides maximum spiritual and health benefits.`,
    tags: ['tulsi', 'home', 'lakshmi', 'plants', 'blog'],
  },
  {
    title: 'Fasting in Hinduism: Types and Their Significance',
    type: 'blog',
    body: `Fasting (Vrat or Upvas) is an integral part of Hindu spiritual practice. Different fasts are observed for different deities and purposes.\n\nMonday fasts are dedicated to Lord Shiva, Tuesday to Hanuman, Thursday to Guru (Jupiter), Friday to Goddess Lakshmi, and Saturday to Lord Shani.\n\nFasting is not just about abstaining from food - it's about controlling the senses, practicing self-discipline, and focusing the mind on the divine. It also has proven health benefits when done correctly.`,
    tags: ['fasting', 'vrat', 'spirituality', 'health', 'blog'],
  },
  {
    title: 'Auspicious Days in Hindu Calendar 2024',
    type: 'blog',
    body: `Understanding auspicious days (Shubh Muhurat) is important for conducting ceremonies and starting new ventures. Here are key dates for 2024:\n\n- Makar Sankranti: January 15\n- Maha Shivaratri: March 8\n- Holi: March 25\n- Ram Navami: April 17\n- Akshaya Tritiya: May 10\n- Guru Purnima: July 21\n- Raksha Bandhan: August 19\n- Janmashtami: August 26\n- Ganesh Chaturthi: September 7\n- Navratri: October 3-12\n- Diwali: November 1\n\nEach of these days carries special spiritual energy for specific activities.`,
    tags: ['calendar', 'festivals', 'muhurat', 'blog'],
  },
  // Images
  {
    title: '108 Names of Goddess Lakshmi - Infographic',
    type: 'image',
    mediaUrl: 'https://via.placeholder.com/800x1200/D4AF37/FFFFFF?text=108+Names+of+Lakshmi',
    body: 'A beautiful infographic listing all 108 names of Goddess Lakshmi with their meanings.',
    tags: ['lakshmi', 'names', 'infographic', 'image'],
  },
  {
    title: 'Sacred Symbols in Hinduism Explained',
    type: 'image',
    mediaUrl: 'https://via.placeholder.com/1000x1000/FF6F00/FFFFFF?text=Hindu+Symbols',
    body: 'Visual guide to understanding Om, Swastika, Trishul, and other sacred symbols.',
    tags: ['symbols', 'spirituality', 'knowledge', 'image'],
  },
  {
    title: 'Mudras for Meditation - Hand Positions Guide',
    type: 'image',
    mediaUrl: 'https://via.placeholder.com/800x1200/5D4037/FFFFFF?text=Meditation+Mudras',
    body: 'Learn different hand mudras for various meditation practices.',
    tags: ['meditation', 'mudra', 'yoga', 'image'],
  },
  {
    title: 'Rangoli Designs for Diwali',
    type: 'image',
    mediaUrl: 'https://via.placeholder.com/1000x1000/FF6F00/FFFFFF?text=Diwali+Rangoli',
    body: 'Beautiful rangoli patterns to decorate your home during Diwali.',
    tags: ['diwali', 'rangoli', 'decoration', 'image'],
  },
  {
    title: 'Puja Thali Arrangement - Traditional Setup',
    type: 'image',
    mediaUrl: 'https://via.placeholder.com/800x800/D4AF37/FFFFFF?text=Puja+Thali',
    body: 'How to properly arrange items on your puja thali.',
    tags: ['puja', 'thali', 'ritual', 'image'],
  },
  {
    title: 'Chakra System - Visual Guide',
    type: 'image',
    mediaUrl: 'https://via.placeholder.com/600x1200/5D4037/FFFFFF?text=7+Chakras',
    body: 'Understanding the seven chakras and their significance.',
    tags: ['chakra', 'yoga', 'spirituality', 'image'],
  },
  {
    title: 'Hindu Temple Architecture Elements',
    type: 'image',
    mediaUrl: 'https://via.placeholder.com/1200x800/FF6F00/FFFFFF?text=Temple+Architecture',
    body: 'Exploring the divine geometry and symbolism in temple design.',
    tags: ['temple', 'architecture', 'knowledge', 'image'],
  },
  {
    title: 'Vedic Astrology Birth Chart Basics',
    type: 'image',
    mediaUrl: 'https://via.placeholder.com/1000x1000/D4AF37/FFFFFF?text=Kundali+Chart',
    body: 'Introduction to reading and understanding a Vedic birth chart.',
    tags: ['astrology', 'kundali', 'vedic', 'image'],
  },
  {
    title: 'Sanskrit Mantras with Pronunciation Guide',
    type: 'image',
    mediaUrl: 'https://via.placeholder.com/800x1200/5D4037/FFFFFF?text=Sanskrit+Mantras',
    body: 'Common mantras written in Devanagari with transliteration.',
    tags: ['mantra', 'sanskrit', 'chanting', 'image'],
  },
  {
    title: 'Offerings to Different Deities - Quick Reference',
    type: 'image',
    mediaUrl: 'https://via.placeholder.com/1000x800/FF6F00/FFFFFF?text=Deity+Offerings',
    body: 'What flowers, fruits, and items to offer to each deity.',
    tags: ['offerings', 'puja', 'deities', 'image'],
  },
];

const AFFIRMATIONS = [
  'Obstacles melt away as new paths appear',
  'Inner peace flows through every moment',
  'Abundance finds its way to you',
  'Strength rises within you effortlessly',
  'Love surrounds you in all directions',
  'Courage awakens, fear dissolves',
  'Righteousness guides your choices',
  'Balance restores in all aspects of life',
];

async function main() {
  console.log('🌸 Starting database seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.blessingCard.deleteMany();
  await prisma.offering.deleteMany();
  await prisma.userGame.deleteMany();
  await prisma.game.deleteMany();
  await prisma.puja.deleteMany();
  await prisma.content.deleteMany();
  await prisma.user.deleteMany();

  // Seed games
  console.log('Seeding games...');
  for (const game of GAMES) {
    await prisma.game.create({
      data: game,
    });
  }
  console.log(`✅ Created ${GAMES.length} games`);

  // Seed content
  console.log('Seeding content...');
  for (const content of CONTENT) {
    await prisma.content.create({
      data: content,
    });
  }
  console.log(`✅ Created ${CONTENT.length} content posts`);

  console.log('🎉 Database seed completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Sign up in the app to create your first user');
  console.log('2. Perform a puja to earn Punya Points');
  console.log('3. Try unlocking a game');
  console.log('4. Browse the content feed');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
