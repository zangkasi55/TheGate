// Kindergarten vocabulary (ages 5-6).
// Each entry: word, emoji (picture), category, optional `alts` for lenient
// speech-recognition matching (homophones / common kid mispronunciations).
window.VOCABULARY = [
  // --- Animals ---
  { word: 'cat',       emoji: '🐱', category: 'animal' },
  { word: 'dog',       emoji: '🐶', category: 'animal' },
  { word: 'bird',      emoji: '🐦', category: 'animal' },
  { word: 'fish',      emoji: '🐠', category: 'animal' },
  { word: 'cow',       emoji: '🐮', category: 'animal' },
  { word: 'pig',       emoji: '🐷', category: 'animal' },
  { word: 'horse',     emoji: '🐴', category: 'animal' },
  { word: 'sheep',     emoji: '🐑', category: 'animal' },
  { word: 'duck',      emoji: '🦆', category: 'animal' },
  { word: 'frog',      emoji: '🐸', category: 'animal' },
  { word: 'bear',      emoji: '🐻', category: 'animal', alts: ['bare'] },
  { word: 'lion',      emoji: '🦁', category: 'animal' },
  { word: 'tiger',     emoji: '🐯', category: 'animal' },
  { word: 'elephant',  emoji: '🐘', category: 'animal' },
  { word: 'monkey',    emoji: '🐵', category: 'animal' },
  { word: 'rabbit',    emoji: '🐰', category: 'animal' },
  { word: 'mouse',     emoji: '🐭', category: 'animal' },
  { word: 'snake',     emoji: '🐍', category: 'animal' },
  { word: 'turtle',    emoji: '🐢', category: 'animal' },
  { word: 'butterfly', emoji: '🦋', category: 'animal' },
  { word: 'bee',       emoji: '🐝', category: 'animal', alts: ['be'] },
  { word: 'owl',       emoji: '🦉', category: 'animal' },
  { word: 'fox',       emoji: '🦊', category: 'animal' },
  { word: 'penguin',   emoji: '🐧', category: 'animal' },
  { word: 'chicken',   emoji: '🐔', category: 'animal' },

  // --- Fruits ---
  { word: 'apple',      emoji: '🍎', category: 'fruit' },
  { word: 'banana',     emoji: '🍌', category: 'fruit' },
  { word: 'orange',     emoji: '🍊', category: 'fruit' },
  { word: 'grape',      emoji: '🍇', category: 'fruit', alts: ['grapes'] },
  { word: 'strawberry', emoji: '🍓', category: 'fruit' },
  { word: 'watermelon', emoji: '🍉', category: 'fruit' },
  { word: 'pineapple',  emoji: '🍍', category: 'fruit' },
  { word: 'mango',      emoji: '🥭', category: 'fruit' },
  { word: 'cherry',     emoji: '🍒', category: 'fruit', alts: ['cherries'] },
  { word: 'lemon',      emoji: '🍋', category: 'fruit' },
  { word: 'peach',      emoji: '🍑', category: 'fruit' },
  { word: 'pear',       emoji: '🍐', category: 'fruit', alts: ['pair', 'pare'] },

  // --- Vegetables ---
  { word: 'carrot',   emoji: '🥕', category: 'vegetable' },
  { word: 'tomato',   emoji: '🍅', category: 'vegetable' },
  { word: 'potato',   emoji: '🥔', category: 'vegetable' },
  { word: 'corn',     emoji: '🌽', category: 'vegetable' },
  { word: 'broccoli', emoji: '🥦', category: 'vegetable' },
  { word: 'onion',    emoji: '🧅', category: 'vegetable' },

  // --- Colors ---
  { word: 'red',    emoji: '🔴', category: 'color' },
  { word: 'blue',   emoji: '🔵', category: 'color' },
  { word: 'green',  emoji: '🟢', category: 'color' },
  { word: 'yellow', emoji: '🟡', category: 'color' },
  { word: 'purple', emoji: '🟣', category: 'color' },
  { word: 'pink',   emoji: '🩷', category: 'color' },
  { word: 'black',  emoji: '⚫', category: 'color' },
  { word: 'white',  emoji: '⚪', category: 'color' },
  { word: 'brown',  emoji: '🟤', category: 'color' },

  // --- Numbers ---
  { word: 'one',   emoji: '1️⃣', category: 'number', alts: ['won'] },
  { word: 'two',   emoji: '2️⃣', category: 'number', alts: ['to', 'too'] },
  { word: 'three', emoji: '3️⃣', category: 'number' },
  { word: 'four',  emoji: '4️⃣', category: 'number', alts: ['for', 'fore'] },
  { word: 'five',  emoji: '5️⃣', category: 'number' },
  { word: 'six',   emoji: '6️⃣', category: 'number' },
  { word: 'seven', emoji: '7️⃣', category: 'number' },
  { word: 'eight', emoji: '8️⃣', category: 'number', alts: ['ate'] },
  { word: 'nine',  emoji: '9️⃣', category: 'number' },
  { word: 'ten',   emoji: '🔟', category: 'number' },

  // --- Shapes ---
  { word: 'circle',   emoji: '⭕', category: 'shape' },
  { word: 'square',   emoji: '🟦', category: 'shape' },
  { word: 'triangle', emoji: '🔺', category: 'shape' },
  { word: 'star',     emoji: '⭐', category: 'shape' },
  { word: 'heart',    emoji: '❤️', category: 'shape' },

  // --- Body parts ---
  { word: 'eye',   emoji: '👁️', category: 'body', alts: ['i', 'aye'] },
  { word: 'ear',   emoji: '👂', category: 'body' },
  { word: 'nose',  emoji: '👃', category: 'body', alts: ['knows'] },
  { word: 'mouth', emoji: '👄', category: 'body' },
  { word: 'hand',  emoji: '✋', category: 'body' },
  { word: 'foot',  emoji: '🦶', category: 'body' },

  // --- Family ---
  { word: 'baby',    emoji: '👶', category: 'family' },
  { word: 'mom',     emoji: '👩', category: 'family', alts: ['mum', 'mommy', 'mama'] },
  { word: 'dad',     emoji: '👨', category: 'family', alts: ['daddy', 'papa'] },
  { word: 'sister',  emoji: '👧', category: 'family' },
  { word: 'brother', emoji: '👦', category: 'family' },

  // --- Food ---
  { word: 'bread',     emoji: '🍞', category: 'food' },
  { word: 'milk',      emoji: '🥛', category: 'food' },
  { word: 'egg',       emoji: '🥚', category: 'food' },
  { word: 'cake',      emoji: '🍰', category: 'food' },
  { word: 'pizza',     emoji: '🍕', category: 'food' },
  { word: 'cookie',    emoji: '🍪', category: 'food' },
  { word: 'cheese',    emoji: '🧀', category: 'food' },
  { word: 'rice',      emoji: '🍚', category: 'food' },
  { word: 'ice cream', emoji: '🍦', category: 'food', alts: ['icecream'] },
  { word: 'donut',     emoji: '🍩', category: 'food', alts: ['doughnut'] },

  // --- Vehicles ---
  { word: 'car',    emoji: '🚗', category: 'vehicle' },
  { word: 'bus',    emoji: '🚌', category: 'vehicle' },
  { word: 'train',  emoji: '🚂', category: 'vehicle' },
  { word: 'plane',  emoji: '✈️', category: 'vehicle', alts: ['airplane', 'plain'] },
  { word: 'boat',   emoji: '⛵', category: 'vehicle' },
  { word: 'bike',   emoji: '🚲', category: 'vehicle', alts: ['bicycle'] },
  { word: 'truck',  emoji: '🚚', category: 'vehicle' },
  { word: 'rocket', emoji: '🚀', category: 'vehicle' },

  // --- Clothes ---
  { word: 'hat',   emoji: '🎩', category: 'clothes' },
  { word: 'shirt', emoji: '👕', category: 'clothes' },
  { word: 'shoes', emoji: '👟', category: 'clothes', alts: ['shoe'] },
  { word: 'socks', emoji: '🧦', category: 'clothes', alts: ['sock'] },

  // --- Nature / Weather ---
  { word: 'sun',     emoji: '☀️', category: 'nature', alts: ['son'] },
  { word: 'moon',    emoji: '🌙', category: 'nature' },
  { word: 'cloud',   emoji: '☁️', category: 'nature' },
  { word: 'rain',    emoji: '🌧️', category: 'nature', alts: ['reign'] },
  { word: 'tree',    emoji: '🌳', category: 'nature' },
  { word: 'flower',  emoji: '🌸', category: 'nature', alts: ['flour'] },
  { word: 'snow',    emoji: '❄️', category: 'nature' },
  { word: 'rainbow', emoji: '🌈', category: 'nature' },

  // --- Toys / Household ---
  { word: 'ball',    emoji: '⚽', category: 'object' },
  { word: 'book',    emoji: '📚', category: 'object' },
  { word: 'bed',     emoji: '🛏️', category: 'object' },
  { word: 'chair',   emoji: '🪑', category: 'object' },
  { word: 'door',    emoji: '🚪', category: 'object' },
  { word: 'clock',   emoji: '🕐', category: 'object' },
  { word: 'key',     emoji: '🔑', category: 'object' },
  { word: 'drum',    emoji: '🥁', category: 'object' },
  { word: 'bell',    emoji: '🔔', category: 'object' },
  { word: 'balloon', emoji: '🎈', category: 'object' }
];
