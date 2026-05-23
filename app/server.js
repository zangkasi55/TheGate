import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 5501);
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Paths to storage files
const CONFIG_FILE = path.join(__dirname, 'config.json');
const VOCAB_FILE = path.join(__dirname, 'vocabulary.json');

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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.static(__dirname, {
  dotfiles: 'ignore',
  index: false
}));

app.listen(PORT, HOST, () => {
  console.log(`The Gate running at http://${HOST}:${PORT}`);
});
