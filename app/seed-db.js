import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VOCAB_FILE = path.join(__dirname, 'vocabulary.json');

// Extensive database of 200+ selected vocabulary items for age 6 girls.
// High quality words, emojis, categories, and pronunciation alternates where useful.
const library = [
  // --- Animals (Cute, classic & pets) ---
  { "word": "cat", "emoji": "🐱", "category": "animal" },
  { "word": "dog", "emoji": "🐶", "category": "animal" },
  { "word": "bird", "emoji": "🐦", "category": "animal" },
  { "word": "fish", "emoji": "🐠", "category": "animal" },
  { "word": "cow", "emoji": "🐮", "category": "animal" },
  { "word": "pig", "emoji": "🐷", "category": "animal" },
  { "word": "horse", "emoji": "🐴", "category": "animal" },
  { "word": "sheep", "emoji": "🐑", "category": "animal" },
  { "word": "duck", "emoji": "🦆", "category": "animal" },
  { "word": "frog", "emoji": "🐸", "category": "animal" },
  { "word": "bear", "emoji": "🐻", "category": "animal", "alts": ["bare"] },
  { "word": "lion", "emoji": "🦁", "category": "animal" },
  { "word": "tiger", "emoji": "🐯", "category": "animal" },
  { "word": "elephant", "emoji": "🐘", "category": "animal" },
  { "word": "monkey", "emoji": "🐵", "category": "animal" },
  { "word": "rabbit", "emoji": "🐰", "category": "animal" },
  { "word": "mouse", "emoji": "🐭", "category": "animal" },
  { "word": "snake", "emoji": "🐍", "category": "animal" },
  { "word": "turtle", "emoji": "🐢", "category": "animal" },
  { "word": "butterfly", "emoji": "🦋", "category": "animal" },
  { "word": "bee", "emoji": "🐝", "category": "animal", "alts": ["be"] },
  { "word": "owl", "emoji": "🦉", "category": "animal" },
  { "word": "fox", "emoji": "🦊", "category": "animal" },
  { "word": "penguin", "emoji": "🐧", "category": "animal" },
  { "word": "panda", "emoji": "🐼", "category": "animal" },
  { "word": "koala", "emoji": "🐨", "category": "animal" },
  { "word": "kangaroo", "emoji": "🦘", "category": "animal" },
  { "word": "dolphin", "emoji": "🐬", "category": "animal" },
  { "word": "whale", "emoji": "🐳", "category": "animal" },
  { "word": "octopus", "emoji": "🐙", "category": "animal" },
  { "word": "crab", "emoji": "🦀", "category": "animal" },
  { "word": "shark", "emoji": "🦈", "category": "animal" },
  { "word": "giraffe", "emoji": "🦒", "category": "animal" },
  { "word": "zebra", "emoji": "🦓", "category": "animal" },
  { "word": "unicorn", "emoji": "🦄", "category": "animal" },
  { "word": "ladybug", "emoji": "🐞", "category": "animal" },
  { "word": "spider", "emoji": "🕷️", "category": "animal" },
  { "word": "snails", "emoji": "🐌", "category": "animal", "alts": ["snail"] },
  { "word": "deer", "emoji": "🦌", "category": "animal", "alts": ["dear"] },
  { "word": "chick", "emoji": "🐤", "category": "animal" },
  { "word": "dinosaur", "emoji": "🦖", "category": "animal" },

  // --- Fruits ---
  { "word": "apple", "emoji": "🍎", "category": "fruit" },
  { "word": "banana", "emoji": "🍌", "category": "fruit" },
  { "word": "orange", "emoji": "🍊", "category": "fruit" },
  { "word": "grape", "emoji": "🍇", "category": "fruit", "alts": ["grapes"] },
  { "word": "strawberry", "emoji": "🍓", "category": "fruit" },
  { "word": "watermelon", "emoji": "🍉", "category": "fruit" },
  { "word": "pineapple", "emoji": "🍍", "category": "fruit" },
  { "word": "mango", "emoji": "🥭", "category": "fruit" },
  { "word": "cherry", "emoji": "🍒", "category": "fruit", "alts": ["cherries"] },
  { "word": "lemon", "emoji": "🍋", "category": "fruit" },
  { "word": "peach", "emoji": "🍑", "category": "fruit" },
  { "word": "pear", "emoji": "🍐", "category": "fruit", "alts": ["pair", "pare"] },
  { "word": "melon", "emoji": "🍈", "category": "fruit" },
  { "word": "kiwi", "emoji": "🥝", "category": "fruit" },
  { "word": "coconut", "emoji": "🥥", "category": "fruit" },
  { "word": "blueberry", "emoji": "🫐", "category": "fruit" },

  // --- Vegetables ---
  { "word": "carrot", "emoji": "🥕", "category": "vegetable" },
  { "word": "tomato", "emoji": "🍅", "category": "vegetable" },
  { "word": "potato", "emoji": "🥔", "category": "vegetable" },
  { "word": "corn", "emoji": "🌽", "category": "vegetable" },
  { "word": "broccoli", "emoji": "🥦", "category": "vegetable" },
  { "word": "onion", "emoji": "🧅", "category": "vegetable" },
  { "word": "cucumber", "emoji": "🥒", "category": "vegetable" },
  { "word": "pepper", "emoji": "🫑", "category": "vegetable" },
  { "word": "mushroom", "emoji": "🍄", "category": "vegetable" },
  { "word": "pumpkin", "emoji": "🎃", "category": "vegetable" },

  // --- Colors ---
  { "word": "red", "emoji": "🔴", "category": "color" },
  { "word": "blue", "emoji": "🔵", "category": "color" },
  { "word": "green", "emoji": "🟢", "category": "color" },
  { "word": "yellow", "emoji": "🟡", "category": "color" },
  { "word": "purple", "emoji": "🟣", "category": "color" },
  { "word": "pink", "emoji": "🩷", "category": "color" },
  { "word": "black", "emoji": "⚫", "category": "color" },
  { "word": "white", "emoji": "⚪", "category": "color" },
  { "word": "brown", "emoji": "🟤", "category": "color" },
  { "word": "rainbow", "emoji": "🌈", "category": "color" },

  // --- Numbers ---
  { "word": "one", "emoji": "1️⃣", "category": "number", "alts": ["won"] },
  { "word": "two", "emoji": "2️⃣", "category": "number", "alts": ["to", "too"] },
  { "word": "three", "emoji": "3️⃣", "category": "number" },
  { "word": "four", "emoji": "4️⃣", "category": "number", "alts": ["for", "fore"] },
  { "word": "five", "emoji": "5️⃣", "category": "number" },
  { "word": "six", "emoji": "6️⃣", "category": "number" },
  { "word": "seven", "emoji": "7️⃣", "category": "number" },
  { "word": "eight", "emoji": "8️⃣", "category": "number", "alts": ["ate"] },
  { "word": "nine", "emoji": "9️⃣", "category": "number" },
  { "word": "ten", "emoji": "🔟", "category": "number" },
  { "word": "zero", "emoji": "0️⃣", "category": "number" },

  // --- Shapes ---
  { "word": "circle", "emoji": "⭕", "category": "shape" },
  { "word": "square", "emoji": "🟦", "category": "shape" },
  { "word": "triangle", "emoji": "🔺", "category": "shape" },
  { "word": "diamond", "emoji": "💎", "category": "shape" },
  { "word": "oval", "emoji": "🥚", "category": "shape" },

  // --- Family ---
  { "word": "baby", "emoji": "👶", "category": "family" },
  { "word": "mom", "emoji": "👩", "category": "family", "alts": ["mum", "mommy", "mama"] },
  { "word": "dad", "emoji": "👨", "category": "family", "alts": ["daddy", "papa"] },
  { "word": "sister", "emoji": "👧", "category": "family" },
  { "word": "brother", "emoji": "👦", "category": "family" },
  { "word": "grandma", "emoji": "👵", "category": "family", "alts": ["grandmother"] },
  { "word": "grandpa", "emoji": "👴", "category": "family", "alts": ["grandfather"] },

  // --- Food & Yummy Treats ---
  { "word": "bread", "emoji": "🍞", "category": "food" },
  { "word": "milk", "emoji": "🥛", "category": "food" },
  { "word": "cake", "emoji": "🍰", "category": "food" },
  { "word": "pizza", "emoji": "🍕", "category": "food" },
  { "word": "cookie", "emoji": "🍪", "category": "food" },
  { "word": "cheese", "emoji": "🧀", "category": "food" },
  { "word": "rice", "emoji": "🍚", "category": "food" },
  { "word": "ice cream", "emoji": "🍦", "category": "food", "alts": ["icecream"] },
  { "word": "donut", "emoji": "🍩", "category": "food", "alts": ["doughnut"] },
  { "word": "honey", "emoji": "🍯", "category": "food" },
  { "word": "burger", "emoji": "🍔", "category": "food" },
  { "word": "french fries", "emoji": "🍟", "category": "food", "alts": ["fries"] },
  { "word": "popcorn", "emoji": "🍿", "category": "food" },
  { "word": "candy", "emoji": "🍬", "category": "food" },
  { "word": "lollipop", "emoji": "🍭", "category": "food" },
  { "word": "chocolate", "emoji": "🍫", "category": "food" },
  { "word": "juice", "emoji": "🧃", "category": "food" },
  { "word": "meat", "emoji": "🥩", "category": "food", "alts": ["meet"] },
  { "word": "soup", "emoji": "🥣", "category": "food" },

  // --- Vehicles ---
  { "word": "car", "emoji": "🚗", "category": "vehicle" },
  { "word": "bus", "emoji": "🚌", "category": "vehicle" },
  { "word": "train", "emoji": "🚂", "category": "vehicle" },
  { "word": "plane", "emoji": "✈️", "category": "vehicle", "alts": ["airplane", "plain"] },
  { "word": "boat", "emoji": "⛵", "category": "vehicle" },
  { "word": "bike", "emoji": "🚲", "category": "vehicle", "alts": ["bicycle"] },
  { "word": "truck", "emoji": "🚚", "category": "vehicle" },
  { "word": "rocket", "emoji": "🚀", "category": "vehicle" },
  { "word": "helicopter", "emoji": "🚁", "category": "vehicle" },
  { "word": "police car", "emoji": "🚓", "category": "vehicle" },
  { "word": "ambulance", "emoji": "🚑", "category": "vehicle" },
  { "word": "fire truck", "emoji": "🚒", "category": "vehicle" },

  // --- Clothes ---
  { "word": "hat", "emoji": "🎩", "category": "clothes" },
  { "word": "shirt", "emoji": "👕", "category": "clothes" },
  { "word": "shoes", "emoji": "👟", "category": "clothes", "alts": ["shoe"] },
  { "word": "socks", "emoji": "🧦", "category": "clothes", "alts": ["sock"] },
  { "word": "dress", "emoji": "👗", "category": "clothes" },
  { "word": "skirt", "emoji": "👚", "category": "clothes" },
  { "word": "jacket", "emoji": "🧥", "category": "clothes" },
  { "word": "crown", "emoji": "👑", "category": "clothes" },
  { "word": "ring", "emoji": "💍", "category": "clothes" },
  { "word": "glasses", "emoji": "👓", "category": "clothes" },
  { "word": "bag", "emoji": "🎒", "category": "clothes" },

  // --- Nature & Weather ---
  { "word": "moon", "emoji": "🌙", "category": "nature" },
  { "word": "cloud", "emoji": "☁️", "category": "nature" },
  { "word": "rain", "emoji": "🌧️", "category": "nature", "alts": ["reign"] },
  { "word": "tree", "emoji": "🌳", "category": "nature" },
  { "word": "flower", "emoji": "🌸", "category": "nature", "alts": ["flour"] },
  { "word": "snow", "emoji": "❄️", "category": "nature" },
  { "word": "wind", "emoji": "💨", "category": "nature" },
  { "word": "leaf", "emoji": "🍃", "category": "nature" },
  { "word": "fire", "emoji": "🔥", "category": "nature" },
  { "word": "mountain", "emoji": "⛰️", "category": "nature" },
  { "word": "beach", "emoji": "🏖️", "category": "nature", "alts": ["beech"] },
  { "word": "river", "emoji": "🌊", "category": "nature" },
  { "word": "ice", "emoji": "🧊", "category": "nature" },

  // --- Toys & Fun objects ---
  { "word": "ball", "emoji": "⚽", "category": "object" },
  { "word": "book", "emoji": "📚", "category": "object" },
  { "word": "balloon", "emoji": "🎈", "category": "object" },
  { "word": "doll", "emoji": "🪆", "category": "object" },
  { "word": "teddy bear", "emoji": "🧸", "category": "object", "alts": ["bear"] },
  { "word": "gift", "emoji": "🎁", "category": "object", "alts": ["present"] },
  { "word": "crayon", "emoji": "🖍️", "category": "object" },
  { "word": "pencil", "emoji": "✏️", "category": "object" },
  { "word": "kite", "emoji": "🪁", "category": "object" },
  { "word": "bubble", "emoji": "🫧", "category": "object" },
  { "word": "clock", "emoji": "🕐", "category": "object" },
  { "word": "key", "emoji": "🔑", "category": "object" },
  { "word": "bed", "emoji": "🛏️", "category": "object" },
  { "word": "door", "emoji": "🚪", "category": "object" },
  { "word": "chair", "emoji": "🪑", "category": "object" },
  { "word": "table", "emoji": "🪑", "category": "object" },

  // --- Fantasy & Sparkles (Super popular with 6 year old girls) ---
  { "word": "fairy", "emoji": "🧚‍♀️", "category": "nature" },
  { "word": "mermaid", "emoji": "🧜‍♀️", "category": "nature" },
  { "word": "castle", "emoji": "🏰", "category": "object" },
  { "word": "wand", "emoji": "🪄", "category": "object" },
  { "word": "mirror", "emoji": "🪞", "category": "object" },
  { "word": "perfume", "emoji": "🧴", "category": "object" },
  { "word": "ribbon", "emoji": "🎀", "category": "clothes" },
  { "word": "shell", "emoji": "🐚", "category": "nature" },
  { "word": "glitter", "emoji": "✨", "category": "nature", "alts": ["sparkle"] },

  // --- Body parts & feelings ---
  { "word": "hair", "emoji": "💇‍♀️", "category": "body", "alts": ["hare"] },
  { "word": "teeth", "emoji": "🦷", "category": "body", "alts": ["tooth"] },
  { "word": "smile", "emoji": "😊", "category": "body" },

  // --- Everyday Actions (Dolch Kindergarten sight verbs) ---
  { "word": "run", "emoji": "🏃‍♀️", "category": "object" },
  { "word": "jump", "emoji": "🦘", "category": "object" },
  { "word": "dance", "emoji": "💃", "category": "object" },
  { "word": "sing", "emoji": "🎤", "category": "object" },
  { "word": "sleep", "emoji": "😴", "category": "object" },
  { "word": "eat", "emoji": "😋", "category": "object" },
  { "word": "drink", "emoji": "🥤", "category": "object" },
  { "word": "wash", "emoji": "🧼", "category": "object" },
  { "word": "swim", "emoji": "🏊‍♀️", "category": "object" },
  { "word": "paint", "emoji": "🎨", "category": "object" },
  { "word": "write", "emoji": "✍️", "category": "object" },
  { "word": "read", "emoji": "📖", "category": "object", "alts": ["red"] },
  { "word": "play", "emoji": "🧸", "category": "object" },
  { "word": "laugh", "emoji": "😆", "category": "object" },
  { "word": "hug", "emoji": "🤗", "category": "object" },
  { "word": "clapping", "emoji": "👏", "category": "object", "alts": ["clap"] },

  // --- School & Place objects ---
  { "word": "school", "emoji": "🏫", "category": "object" },
  { "word": "house", "emoji": "🏠", "category": "object" },
  { "word": "room", "emoji": "🚪", "category": "object" },
  { "word": "playground", "emoji": "🛝", "category": "object", "alts": ["slide"] },
  { "word": "swing", "emoji": "🛝", "category": "object" },
  { "word": "bus stop", "emoji": "🏣", "category": "object" },
  { "word": "garden", "emoji": "🏡", "category": "object" },
  { "word": "tent", "emoji": "⛺", "category": "object" },

  // --- Musical Instruments ---
  { "word": "piano", "emoji": "🎹", "category": "object" },
  { "word": "guitar", "emoji": "🎸", "category": "object" },
  { "word": "violin", "emoji": "🎻", "category": "object" },
  { "word": "trumpet", "emoji": "🎺", "category": "object" },
  { "word": "harp", "emoji": "🪕", "category": "object" },

  // --- Space & Sky ---
  { "word": "earth", "emoji": "🌍", "category": "nature" },
  { "word": "alien", "emoji": "👽", "category": "nature" },
  { "word": "telescope", "emoji": "🔭", "category": "object" }
];

console.log(`Curated library size: ${library.length} items.`);

// Check for duplicates
const seen = new Set();
const dups = [];
library.forEach(item => {
  if (seen.has(item.word)) {
    dups.push(item.word);
  }
  seen.add(item.word);
});

if (dups.length) {
  console.log('Duplicates found: ', dups);
}

// Write the database file!
fs.writeFileSync(VOCAB_FILE, JSON.stringify(library, null, 2), 'utf-8');
console.log('Successfully wrote 200+ vocabulary database file.');
