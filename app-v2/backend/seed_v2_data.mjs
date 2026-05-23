import fs from 'fs';
import path from 'path';

const backend = 'c:/Users/danait/OneDrive - Microsoft/Documents/Cowork/Projects/Temp/TheGate-v2-sample/backend';
const mathFile = path.join(backend, 'math-questions.json');
const vocabFile = path.join(backend, 'vocabulary.json');

function newChoices(answer, min, max) {
  const choices = [answer];
  const offsets = [-2, -1, 1, 2, 3, -3, 4, -4];
  for (const o of offsets) {
    const c = answer + o;
    if (c >= min && c <= max && !choices.includes(c)) {
      choices.push(c);
      if (choices.length === 3) break;
    }
  }
  while (choices.length < 3) {
    const r = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!choices.includes(r)) choices.push(r);
  }
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

const addPairs = [];
for (let a = 0; a <= 10; a++) {
  for (let b = 0; b <= 10; b++) {
    if (a + b <= 12) addPairs.push([a, b]);
  }
}

const addition = [];
for (let i = 0; i < 50; i++) {
  const [a, b] = addPairs[i];
  const ans = a + b;
  addition.push({
    id: `add-${i + 1}`,
    question: `${a} + ${b} = ?`,
    choices: newChoices(ans, 0, 12),
    answer: ans,
  });
}

const subPairs = [];
for (let a = 0; a <= 12; a++) {
  for (let b = 0; b <= a; b++) {
    if (a - b <= 10) subPairs.push([a, b]);
  }
}

const subtraction = [];
for (let i = 0; i < 50; i++) {
  const [a, b] = subPairs[i];
  const ans = a - b;
  subtraction.push({
    id: `sub-${i + 1}`,
    question: `${a} - ${b} = ?`,
    choices: newChoices(ans, 0, 12),
    answer: ans,
  });
}

const mathObj = { addition, subtraction };
fs.writeFileSync(mathFile, JSON.stringify(mathObj, null, 2), 'utf8');

const candidates = [
  { word: 'water bottle', emoji: '🧴', category: 'object' },
  { word: 'backpack', emoji: '🎒', category: 'school' },
  { word: 'pencil', emoji: '✏️', category: 'school' },
  { word: 'eraser', emoji: '🩹', category: 'school' },
  { word: 'notebook', emoji: '📓', category: 'school' },
  { word: 'crayon', emoji: '🖍️', category: 'school' },
  { word: 'marker', emoji: '🖊️', category: 'school' },
  { word: 'glue', emoji: '🧴', category: 'school' },
  { word: 'scissors', emoji: '✂️', category: 'school' },
  { word: 'ruler', emoji: '📏', category: 'school' },
  { word: 'teacher', emoji: '👩‍🏫', category: 'school' },
  { word: 'student', emoji: '🧒', category: 'school' },
  { word: 'classroom', emoji: '🏫', category: 'place' },
  { word: 'playground', emoji: '🛝', category: 'place' },
  { word: 'library', emoji: '📚', category: 'place' },
  { word: 'bathroom', emoji: '🚻', category: 'place' },
  { word: 'bedroom', emoji: '🛏️', category: 'place' },
  { word: 'kitchen', emoji: '🍽️', category: 'place' },
  { word: 'living room', emoji: '🛋️', category: 'place' },
  { word: 'garden', emoji: '🌷', category: 'place' },
  { word: 'park', emoji: '🌳', category: 'place' },
  { word: 'street', emoji: '🛣️', category: 'place' },
  { word: 'home', emoji: '🏠', category: 'place' },
  { word: 'school', emoji: '🏫', category: 'place' },
  { word: 'hospital', emoji: '🏥', category: 'place' },
  { word: 'shop', emoji: '🏪', category: 'place' },
  { word: 'morning', emoji: '🌅', category: 'time' },
  { word: 'afternoon', emoji: '🌤️', category: 'time' },
  { word: 'evening', emoji: '🌇', category: 'time' },
  { word: 'night', emoji: '🌙', category: 'time' },
  { word: 'today', emoji: '📅', category: 'time' },
  { word: 'tomorrow', emoji: '⏭️', category: 'time' },
  { word: 'yesterday', emoji: '⏮️', category: 'time' },
  { word: 'breakfast', emoji: '🥣', category: 'food' },
  { word: 'lunch', emoji: '🍱', category: 'food' },
  { word: 'dinner', emoji: '🍛', category: 'food' },
  { word: 'snack', emoji: '🍪', category: 'food' },
  { word: 'sandwich', emoji: '🥪', category: 'food' },
  { word: 'noodles', emoji: '🍜', category: 'food' },
  { word: 'soup', emoji: '🍲', category: 'food' },
  { word: 'chicken rice', emoji: '🍗', category: 'food' },
  { word: 'juice', emoji: '🧃', category: 'food' },
  { word: 'yogurt', emoji: '🥛', category: 'food' },
  { word: 'toothbrush', emoji: '🪥', category: 'routine' },
  { word: 'toothpaste', emoji: '🧴', category: 'routine' },
  { word: 'soap', emoji: '🧼', category: 'routine' },
  { word: 'towel', emoji: '🧽', category: 'routine' },
  { word: 'comb', emoji: '🪮', category: 'routine' },
  { word: 'wash hands', emoji: '🫧', category: 'routine' },
  { word: 'take a bath', emoji: '🛁', category: 'routine' },
  { word: 'brush teeth', emoji: '🪥', category: 'routine' },
  { word: 'get dressed', emoji: '👗', category: 'routine' },
  { word: 'go to sleep', emoji: '😴', category: 'routine' },
  { word: 'wake up', emoji: '⏰', category: 'routine' },
  { word: 'wash face', emoji: '💦', category: 'routine' },
  { word: 'hands', emoji: '🤲', category: 'body' },
  { word: 'fingers', emoji: '🖐️', category: 'body' },
  { word: 'arm', emoji: '💪', category: 'body' },
  { word: 'leg', emoji: '🦵', category: 'body' },
  { word: 'hair', emoji: '💇', category: 'body' },
  { word: 'teeth', emoji: '😁', category: 'body' },
  { word: 'tongue', emoji: '👅', category: 'body' },
  { word: 'stomach', emoji: '🤰', category: 'body' },
  { word: 'thirsty', emoji: '🥤', category: 'feeling' },
  { word: 'hungry', emoji: '😋', category: 'feeling' },
  { word: 'sleepy', emoji: '😪', category: 'feeling' },
  { word: 'happy', emoji: '😊', category: 'feeling' },
  { word: 'sad', emoji: '😢', category: 'feeling' },
  { word: 'angry', emoji: '😠', category: 'feeling' },
  { word: 'scared', emoji: '😨', category: 'feeling' },
  { word: 'excited', emoji: '🤩', category: 'feeling' },
  { word: 'please', emoji: '🙏', category: 'manners' },
  { word: 'thank you', emoji: '💖', category: 'manners' },
  { word: 'sorry', emoji: '🙇', category: 'manners' },
  { word: 'excuse me', emoji: '🙂', category: 'manners' },
  { word: 'hello', emoji: '👋', category: 'manners' },
  { word: 'goodbye', emoji: '👋', category: 'manners' },
  { word: 'yes', emoji: '✅', category: 'manners' },
  { word: 'no', emoji: '❌', category: 'manners' },
  { word: 'please wait', emoji: '⏳', category: 'manners' },
  { word: 'share', emoji: '🤝', category: 'social' },
  { word: 'help', emoji: '🆘', category: 'social' },
  { word: 'clean up', emoji: '🧹', category: 'routine' },
  { word: 'line up', emoji: '🚶', category: 'school' },
  { word: 'sit down', emoji: '🪑', category: 'action' },
  { word: 'stand up', emoji: '🧍', category: 'action' },
  { word: 'listen', emoji: '👂', category: 'action' },
  { word: 'look', emoji: '👀', category: 'action' },
  { word: 'read', emoji: '📖', category: 'action' },
  { word: 'write', emoji: '✍️', category: 'action' },
  { word: 'draw', emoji: '🎨', category: 'action' },
  { word: 'color', emoji: '🖍️', category: 'action' },
  { word: 'count', emoji: '🔢', category: 'action' },
  { word: 'jump', emoji: '🤸', category: 'action' },
  { word: 'run', emoji: '🏃', category: 'action' },
  { word: 'walk', emoji: '🚶', category: 'action' },
  { word: 'clap', emoji: '👏', category: 'action' },
  { word: 'sing', emoji: '🎵', category: 'action' },
  { word: 'dance', emoji: '💃', category: 'action' },
  { word: 'open', emoji: '📂', category: 'action' },
  { word: 'close', emoji: '📕', category: 'action' },
  { word: 'inside', emoji: '🏠', category: 'position' },
  { word: 'outside', emoji: '🌤️', category: 'position' },
  { word: 'up', emoji: '⬆️', category: 'position' },
  { word: 'down', emoji: '⬇️', category: 'position' },
  { word: 'left', emoji: '⬅️', category: 'position' },
  { word: 'right', emoji: '➡️', category: 'position' },
  { word: 'near', emoji: '📍', category: 'position' },
  { word: 'far', emoji: '🛣️', category: 'position' },
  { word: 'on', emoji: '🔛', category: 'position' },
  { word: 'under', emoji: '⬇️', category: 'position' },
  { word: 'raincoat', emoji: '🧥', category: 'clothes' },
  { word: 'umbrella', emoji: '☂️', category: 'object' },
  { word: 'lunch box', emoji: '🍱', category: 'object' },
  { word: 'water', emoji: '💧', category: 'food' },
  { word: 'nap', emoji: '😴', category: 'routine' },
  { word: 'story time', emoji: '📚', category: 'routine' },
  { word: 'pick up', emoji: '🧸', category: 'action' },
  { word: 'put away', emoji: '🗂️', category: 'action' },
  { word: 'be careful', emoji: '⚠️', category: 'safety' },
  { word: 'stop', emoji: '🛑', category: 'safety' },
  { word: 'go', emoji: '🟢', category: 'safety' },
  { word: 'crosswalk', emoji: '🚸', category: 'safety' },
  { word: 'seat belt', emoji: '🔒', category: 'safety' },
  { word: 'helmet', emoji: '⛑️', category: 'safety' },
  { word: 'doctor', emoji: '🩺', category: 'people' },
  { word: 'nurse', emoji: '👩‍⚕️', category: 'people' },
  { word: 'friend', emoji: '🧒', category: 'people' },
  { word: 'neighbor', emoji: '🏘️', category: 'people' },
];

const vocab = JSON.parse(fs.readFileSync(vocabFile, 'utf8'));
const existing = new Set(vocab.map((v) => String(v.word || '').trim().toLowerCase()));

let added = 0;
for (const c of candidates) {
  if (added >= 100) break;
  const w = String(c.word || '').trim().toLowerCase();
  if (!w || existing.has(w)) continue;
  vocab.push({ word: w, emoji: c.emoji, category: String(c.category || 'object').toLowerCase() });
  existing.add(w);
  added += 1;
}

if (added < 100) {
  const dailyActions = [
    'pack', 'unpack', 'tidy', 'fold', 'hang', 'carry', 'wipe', 'rinse', 'sort', 'arrange',
    'zip', 'button', 'tie', 'untie', 'pour', 'mix', 'share', 'stack', 'count', 'check'
  ];
  const dailyObjects = [
    'school bag', 'lunch bag', 'water cup', 'clean shirt', 'study desk', 'toy box', 'book shelf',
    'homework book', 'pencil case', 'sports shoes', 'hair ribbon', 'rain boots', 'snack box',
    'bath towel', 'story book', 'name tag', 'school uniform', 'music folder', 'drawing paper', 'meal tray'
  ];

  for (const action of dailyActions) {
    for (const obj of dailyObjects) {
      if (added >= 100) break;
      const phrase = `${action} ${obj}`;
      if (existing.has(phrase)) continue;
      vocab.push({ word: phrase, emoji: '✨', category: 'daily_routine' });
      existing.add(phrase);
      added += 1;
    }
    if (added >= 100) break;
  }
}

if (added < 100) {
  throw new Error(`Only added ${added} new vocabulary words; need 100 even after fallback generation.`);
}

fs.writeFileSync(vocabFile, JSON.stringify(vocab, null, 2), 'utf8');

const verifyVocab = JSON.parse(fs.readFileSync(vocabFile, 'utf8')).length;
const verifyMath = JSON.parse(fs.readFileSync(mathFile, 'utf8'));
console.log(`added_vocab=${added}`);
console.log(`vocab_count=${verifyVocab}`);
console.log(`add_count=${verifyMath.addition.length}`);
console.log(`sub_count=${verifyMath.subtraction.length}`);
