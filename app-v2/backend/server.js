import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, '..', 'frontend');

const app = express();
const PORT = Number(process.env.PORT || 5501);
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Paths to storage files
const CONFIG_FILE = path.join(__dirname, 'config.json');
const VOCAB_FILE = path.join(__dirname, 'vocabulary.json');
const MATH_FILE = path.join(__dirname, 'math-questions.json');

// Default initial config
const DEFAULT_CONFIG = {
  TOTAL_ROUNDS: 3,
  MAX_RETRIES: 2,
  YOUTUBE_PLAY_LIMIT_MS: 10 * 60 * 1000, // 10 minutes
  YOUTUBE_URL: 'https://www.youtube.com/tv'
};

// Ensure configuration file exists
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
}

// Convert legacy vocabulary.js array elements into standalone JSON database if missing
if (!fs.existsSync(VOCAB_FILE)) {
  const defaultWords = [
    { "word": "cat", "emoji": "🐱", "category": "animal" },
    { "word": "dog", "emoji": "🐶", "category": "animal" },
    { "word": "bird", "emoji": "🐦", "category": "animal" },
    { "word": "fish", "emoji": "🐠", "category": "animal" },
    { "word": "apple", "emoji": "🍎", "category": "fruit" },
    { "word": "banana", "emoji": "🍌", "category": "fruit" },
    { "word": "carrot", "emoji": "🥕", "category": "vegetable" },
    { "word": "red", "emoji": "🔴", "category": "color" },
    { "word": "sun", "emoji": "☀️", "category": "nature" },
    { "word": "star", "emoji": "⭐", "category": "shape" }
  ];
  fs.writeFileSync(VOCAB_FILE, JSON.stringify(defaultWords, null, 2), 'utf-8');
}

// Helper utilities to load databases
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
const saveConfig = (cfg) => fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');

const loadVocab = () => JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf-8'));
const saveVocab = (v) => fs.writeFileSync(VOCAB_FILE, JSON.stringify(v, null, 2), 'utf-8');

const defaultMathQuestions = () => ({
  addition: [
    { id: 'add-1', question: '2 + 1 = ?', choices: [3, 2, 4], answer: 3 },
    { id: 'add-2', question: '4 + 2 = ?', choices: [6, 5, 7], answer: 6 },
    { id: 'add-3', question: '3 + 3 = ?', choices: [6, 7, 5], answer: 6 },
    { id: 'add-4', question: '5 + 1 = ?', choices: [6, 8, 4], answer: 6 },
    { id: 'add-5', question: '2 + 4 = ?', choices: [5, 6, 7], answer: 6 }
  ],
  subtraction: [
    { id: 'sub-1', question: '5 - 2 = ?', choices: [3, 4, 2], answer: 3 },
    { id: 'sub-2', question: '6 - 1 = ?', choices: [4, 5, 6], answer: 5 },
    { id: 'sub-3', question: '7 - 3 = ?', choices: [5, 4, 3], answer: 4 },
    { id: 'sub-4', question: '8 - 2 = ?', choices: [6, 5, 7], answer: 6 },
    { id: 'sub-5', question: '9 - 4 = ?', choices: [6, 5, 4], answer: 5 }
  ]
});

if (!fs.existsSync(MATH_FILE)) {
  fs.writeFileSync(MATH_FILE, JSON.stringify(defaultMathQuestions(), null, 2), 'utf-8');
}

const loadMath = () => JSON.parse(fs.readFileSync(MATH_FILE, 'utf-8'));
const saveMath = (m) => fs.writeFileSync(MATH_FILE, JSON.stringify(m, null, 2), 'utf-8');

const normalizeMode = (mode) => {
  const m = String(mode || '').trim().toLowerCase();
  if (m === 'addition' || m === 'subtract' || m === 'subtraction') {
    return m === 'subtract' ? 'subtraction' : m;
  }
  return null;
};

const normalizeQuestionPayload = (body = {}) => {
  const mode = normalizeMode(body.mode);
  const question = String(body.question || '').trim();
  const answer = Number(body.answer);
  const choices = Array.isArray(body.choices)
    ? body.choices.map((c) => Number(c)).filter((n) => Number.isFinite(n))
    : [];

  if (!mode) return { error: 'mode must be addition or subtraction' };
  if (!question) return { error: 'question is required' };
  if (!Number.isInteger(answer)) return { error: 'answer must be an integer' };
  if (choices.length !== 3) return { error: 'choices must contain exactly 3 numbers' };
  if (!choices.includes(answer)) return { error: 'choices must include the correct answer' };

  return {
    mode,
    item: {
      id: body.id ? String(body.id).trim() : `${mode}-${Date.now()}`,
      question,
      answer,
      choices
    }
  };
};

// --- REST Endpoints ---

// Get active configuration (e.g. game duration limits)
app.get('/api/config', (req, res) => {
  try {
    res.json(loadConfig());
  } catch (err) {
    res.status(500).json({ error: 'Failed to read config' });
  }
});

// Update active play limits or target score parameters
app.post('/api/config', (req, res) => {
  try {
    const { TOTAL_ROUNDS, MAX_RETRIES, YOUTUBE_PLAY_LIMIT_MS, YOUTUBE_URL } = req.body;
    const current = loadConfig();

    if (TOTAL_ROUNDS !== undefined) current.TOTAL_ROUNDS = Number(TOTAL_ROUNDS);
    if (MAX_RETRIES !== undefined) current.MAX_RETRIES = Number(MAX_RETRIES);
    if (YOUTUBE_PLAY_LIMIT_MS !== undefined) current.YOUTUBE_PLAY_LIMIT_MS = Number(YOUTUBE_PLAY_LIMIT_MS);
    if (YOUTUBE_URL !== undefined) current.YOUTUBE_URL = YOUTUBE_URL;

    saveConfig(current);
    res.json({ message: 'Configuration updated successfully!', config: current });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save config' });
  }
});

// Get the full kid-gated English vocabulary library
app.get('/api/vocabulary', (req, res) => {
  try {
    res.json(loadVocab());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Append a fresh custom flash card descriptor
app.post('/api/vocabulary', (req, res) => {
  try {
    const { word, emoji, category, alts } = req.body;
    if (!word || !emoji || !category) {
      return res.status(400).json({ error: 'Word, emoji, and category are required' });
    }

    const items = loadVocab();
    const cleanWord = word.trim().toLowerCase();

    // Avoid duplicating exact matches
    const exists = items.some(item => item.word.toLowerCase() === cleanWord);
    if (exists) {
      return res.status(400).json({ error: 'Word already exists in database' });
    }

    const newItem = {
      word: cleanWord,
      emoji: emoji.trim(),
      category: category.trim().toLowerCase()
    };

    if (alts && Array.isArray(alts)) {
      newItem.alts = alts.map(a => a.trim().toLowerCase()).filter(Boolean);
    }

    items.push(newItem);
    saveVocab(items);

    res.status(201).json({ message: 'Added to vocabulary library!', item: newItem, total: items.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to append vocabulary item' });
  }
});

// Delete a card by word handle
app.delete('/api/vocabulary/:word', (req, res) => {
  try {
    const target = req.params.word.toLowerCase().trim();
    let items = loadVocab();
    const lenBefore = items.length;

    items = items.filter(i => i.word.toLowerCase() !== target);

    if (items.length === lenBefore) {
      return res.status(404).json({ error: 'Word not found' });
    }

    saveVocab(items);
    res.json({ message: `Successfully deleted "${target}"!`, total: items.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vocabulary item' });
  }
});

// Get math questions (all modes or a single mode)
app.get('/api/math', (req, res) => {
  try {
    const mode = normalizeMode(req.query.mode);
    const db = loadMath();
    if (mode) return res.json(db[mode] || []);
    return res.json(db);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch math questions' });
  }
});

// Add a math question with exactly 3 choices
app.post('/api/math', (req, res) => {
  try {
    const parsed = normalizeQuestionPayload(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });

    const db = loadMath();
    if (!Array.isArray(db[parsed.mode])) db[parsed.mode] = [];

    const exists = db[parsed.mode].some((q) => q.id === parsed.item.id || q.question === parsed.item.question);
    if (exists) {
      return res.status(400).json({ error: 'A question with the same id or text already exists' });
    }

    db[parsed.mode].push(parsed.item);
    saveMath(db);
    res.status(201).json({ message: 'Math question added', item: parsed.item, total: db[parsed.mode].length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add math question' });
  }
});

// Delete a math question by id
app.delete('/api/math/:mode/:id', (req, res) => {
  try {
    const mode = normalizeMode(req.params.mode);
    const id = String(req.params.id || '').trim();
    if (!mode || !id) return res.status(400).json({ error: 'mode and id are required' });

    const db = loadMath();
    const list = Array.isArray(db[mode]) ? db[mode] : [];
    const next = list.filter((q) => q.id !== id);
    if (next.length === list.length) return res.status(404).json({ error: 'Question not found' });

    db[mode] = next;
    saveMath(db);
    res.json({ message: 'Math question deleted', total: next.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete math question' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.use(express.static(FRONTEND_DIR, {
  dotfiles: 'ignore',
  index: false
}));

app.listen(PORT, HOST, () => {
  console.log(`The Gate running at http://${HOST}:${PORT}`);
});
