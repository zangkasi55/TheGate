/* =========================================================
   English Adventure - game logic + speech recognition
   ========================================================= */
(function () {
  'use strict';

  // ---------- Configuration ----------
  let CONFIG = {
    TOTAL_ROUNDS: 3,        // questions to answer
    REQUIRED_CORRECT: 3,    // minimum correct to unlock
    MAX_RETRIES: 2,         // attempts per word before moving on (kindly)
    YOUTUBE_URL: 'https://www.youtube.com/tv',
    YOUTUBE_PLAY_LIMIT_MS: 10 * 60 * 1000, // 10 minutes play duration (600,000 ms)
    CORRECT_HOLD_MS: 1300,  // how long the "Great job!" overlay shows
    WRONG_HOLD_MS: 1300,
    LISTEN_TIMEOUT_MS: 6000 // auto-stop recognition if nothing happens
  };

  const CONFIG_STORAGE_KEY = 'thegate.offline.config.v1';
  const PASSCODE_STORAGE_KEY = 'thegate.parent.passcode.v1';
  const DEFAULT_PARENT_PASSCODE = '1234';

  // ---------- DOM ----------
  const screens = {
    splash:   document.getElementById('screen-splash'),
    card:     document.getElementById('screen-card'),
    done:     document.getElementById('screen-done'),
    youtube:  document.getElementById('screen-youtube')
  };
  const overlays = {
    correct: document.getElementById('overlay-correct'),
    wrong:   document.getElementById('overlay-wrong')
  };
  const els = {
    cardEmoji:    document.getElementById('card-emoji'),
    cardWord:     document.getElementById('card-word'),
    roundCurrent: document.getElementById('round-current'),
    roundTotal:   document.getElementById('round-total'),
    starTracker:  document.getElementById('star-tracker'),
    micIndicator: document.getElementById('mic-indicator'),
    micLabel:     document.getElementById('mic-label'),
    transcript:   document.getElementById('transcript'),
    choiceGrid:   document.getElementById('choice-grid'),
    btnStart:     document.getElementById('btn-start'),
    btnModeWord:  document.getElementById('btn-mode-word'),
    btnModeAdd:   document.getElementById('btn-mode-add'),
    btnModeSub:   document.getElementById('btn-mode-subtract'),
    btnParentSettings: document.getElementById('btn-parent-settings'),
    parentPanel: document.getElementById('parent-config-panel'),
    parentSettingsFields: document.getElementById('parent-settings-fields'),
    parentPasscodeInput: document.getElementById('parent-passcode-input'),
    cfgTimeLimit: document.getElementById('cfg-time-limit'),
    cfgTotalQuestions: document.getElementById('cfg-total-questions'),
    cfgRequiredCorrect: document.getElementById('cfg-required-correct'),
    cfgNewPasscode: document.getElementById('cfg-new-passcode'),
    parentStatus: document.getElementById('parent-config-status'),
    btnParentUnlock: document.getElementById('btn-parent-unlock'),
    btnParentSave: document.getElementById('btn-parent-save'),
    btnParentClose: document.getElementById('btn-parent-close'),
    btnSpeak:     document.getElementById('btn-speak'),
    btnSkip:      document.getElementById('btn-skip'),
    btnYoutube:   document.getElementById('btn-youtube'),
    btnRestart:   document.getElementById('btn-restart'),
    finalScore:   document.getElementById('final-score'),
    finalTotal:   document.getElementById('final-total'),
    youtubeTimer: document.getElementById('youtube-time-left'),
    youtubeIframe:document.getElementById('youtube-iframe'),
    btnExitYoutube:document.getElementById('btn-exit-youtube')
  };

  // ---------- Speech recognition setup ----------
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recog = null;
  let listenTimer = null;

  if (Recognition) {
    recog = new Recognition();
    recog.lang = 'en-US';
    recog.interimResults = true;
    recog.continuous = false;
    recog.maxAlternatives = 5;
    recog.onresult = onRecogResult;
    recog.onend    = onRecogEnd;
    recog.onerror  = onRecogError;
  } else {
    console.warn('SpeechRecognition not supported in this browser.');
  }

  // ---------- Game state ----------
  const state = {
    queue: [],
    index: 0,
    score: 0,
    retries: 0,
    mode: 'vocabulary',
    current: null,
    listening: false,
    mathLibrary: {
      addition: [],
      subtraction: []
    },
    timerInterval: null,
    timeLeftSeconds: 0
  };

  function hasNativeSpeech() {
    return !!(window.TheGateSpeech && typeof window.TheGateSpeech.listen === 'function');
  }

  function hasAnySpeechSupport() {
    return hasNativeSpeech() || !!recog;
  }

  function hasNativePlayer() {
    return !!(window.TheGatePlayer && typeof window.TheGatePlayer.play === 'function');
  }

  function cancelNativePlayer() {
    if (!hasNativePlayer() || typeof window.TheGatePlayer.cancel !== 'function') return;
    try { window.TheGatePlayer.cancel(); } catch (_) {}
  }

  function cancelNativeSpeech() {
    if (!hasNativeSpeech() || typeof window.TheGateSpeech.cancel !== 'function') return;
    try { window.TheGateSpeech.cancel(); } catch (_) {}
  }

  window.__theGateNativeSpeechPartial = function (payload) {
    if (!state.listening) return;
    const candidates = payload && Array.isArray(payload.candidates) ? payload.candidates : [];
    if (candidates[0]) els.transcript.textContent = candidates[0];
  };

  window.__theGateNativeSpeechResult = function (payload) {
    if (!state.listening) return;
    clearTimeout(listenTimer);
    state.listening = false;
    els.micIndicator.classList.remove('listening');

    const candidates = payload && Array.isArray(payload.candidates) ? payload.candidates : [];
    if (candidates[0]) els.transcript.textContent = candidates[0];

    if (!candidates.length) {
      els.micLabel.textContent = payload && payload.error
        ? payload.error
        : "I didn't hear you. Press Enter to try again.";
      handleWrong();
      return;
    }

    const ok = candidates.some(t => matches(t, state.current));
    if (ok) handleCorrect();
    else handleWrong();
  };

  window.__theGateNativePlayerTick = function (payload) {
    if (!payload || typeof payload.secondsLeft !== 'number') return;
    state.timeLeftSeconds = Math.max(0, Math.ceil(payload.secondsLeft));
    updateTimerDisplay();
  };

  window.__theGateNativePlayerEnded = function () {
    endYouTubeSession();
  };

  // ---------- Screen / overlay helpers ----------
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }
  function showOverlay(name) {
    Object.values(overlays).forEach(o => o.classList.remove('active'));
    if (name) overlays[name].classList.add('active');
  }

  // ---------- Utilities ----------
  function pickRandom(arr, n) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  }

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function fallbackMathQuestions(mode, n) {
    const out = [];
    const isAdd = mode === 'addition';
    for (let i = 0; i < Math.max(3, n); i++) {
      const a = 1 + Math.floor(Math.random() * 9);
      let b = 1 + Math.floor(Math.random() * 9);
      let answer = a + b;
      if (!isAdd) {
        if (b > a) b = Math.floor(Math.random() * a);
        answer = a - b;
      }
      if (answer < 0 || answer > 12) {
        i--;
        continue;
      }

      const c1 = answer;
      const c2 = Math.max(0, Math.min(12, answer + (Math.random() > 0.5 ? 1 : -1)));
      const c3 = Math.max(0, Math.min(12, answer + (Math.random() > 0.5 ? 2 : -2)));
      const uniq = [...new Set([c1, c2, c3])];
      while (uniq.length < 3) {
        uniq.push(Math.floor(Math.random() * 13));
      }

      out.push({
        id: `${mode}-${Date.now()}-${i}`,
        question: `${a} ${isAdd ? '+' : '-'} ${b} = ?`,
        answer,
        choices: shuffle(uniq.slice(0, 3))
      });
    }
    return out;
  }
  function normalize(s) {
    return (s || '').toLowerCase().replace(/[^a-z ]+/g, '').trim();
  }
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }

  /**
   * Lenient match between the recognised transcript and the target entry.
   * Strategy (in order):
   *   1. exact target word found in transcript (whitespace-tokenised)
   *   2. an explicit alt-pronunciation found in transcript
   *   3. Levenshtein distance <= tolerance for any token
   *      (tolerance scales with word length: 1 for short, 2 for 5+ chars)
   *   4. full normalised transcript equals target (handles "ice cream")
   */
  function matches(transcript, entry) {
    const target = normalize(entry.word);
    const norm = normalize(transcript);
    if (!target || !norm) return false;
    if (norm === target) return true;
    if (norm.includes(target)) return true;

    const tokens = norm.split(/\s+/).filter(Boolean);
    const alts = (entry.alts || []).map(normalize);
    if (alts.length && tokens.some(t => alts.includes(t))) return true;

    const tol = target.length >= 5 ? 2 : 1;
    if (tokens.some(t => levenshtein(t, target) <= tol)) return true;
    return false;
  }

  // ---------- Game flow ----------
  function loadLocalConfig() {
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const totalRounds = Number(parsed.TOTAL_ROUNDS);
      const requiredCorrect = Number(parsed.REQUIRED_CORRECT);
      const playLimitMs = Number(parsed.YOUTUBE_PLAY_LIMIT_MS);

      if (Number.isInteger(totalRounds) && totalRounds >= 1 && totalRounds <= 20) {
        CONFIG.TOTAL_ROUNDS = totalRounds;
      }
      if (Number.isInteger(requiredCorrect) && requiredCorrect >= 1 && requiredCorrect <= 20) {
        CONFIG.REQUIRED_CORRECT = requiredCorrect;
      }
      if (Number.isFinite(playLimitMs) && playLimitMs >= 60_000 && playLimitMs <= 7_200_000) {
        CONFIG.YOUTUBE_PLAY_LIMIT_MS = playLimitMs;
      }
    } catch (e) {
      console.warn('Invalid local config. Using defaults.', e);
    }
    CONFIG.REQUIRED_CORRECT = Math.min(CONFIG.REQUIRED_CORRECT, CONFIG.TOTAL_ROUNDS);
  }

  function saveLocalConfig() {
    const payload = {
      TOTAL_ROUNDS: CONFIG.TOTAL_ROUNDS,
      REQUIRED_CORRECT: CONFIG.REQUIRED_CORRECT,
      YOUTUBE_PLAY_LIMIT_MS: CONFIG.YOUTUBE_PLAY_LIMIT_MS
    };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(payload));
  }

  function getParentPasscode() {
    return localStorage.getItem(PASSCODE_STORAGE_KEY) || DEFAULT_PARENT_PASSCODE;
  }

  function setParentPasscode(nextPasscode) {
    localStorage.setItem(PASSCODE_STORAGE_KEY, String(nextPasscode || DEFAULT_PARENT_PASSCODE));
  }

  function ensureMathLibraries() {
    if (!state.mathLibrary.addition.length) {
      state.mathLibrary.addition = fallbackMathQuestions('addition', CONFIG.TOTAL_ROUNDS + 6);
    }
    if (!state.mathLibrary.subtraction.length) {
      state.mathLibrary.subtraction = fallbackMathQuestions('subtraction', CONFIG.TOTAL_ROUNDS + 6);
    }
  }

  function start(mode = 'vocabulary') {
    loadLocalConfig();
    ensureMathLibraries();
    state.mode = mode;
    if (mode === 'addition' || mode === 'subtraction') {
      state.queue = pickRandom(state.mathLibrary[mode], CONFIG.TOTAL_ROUNDS);
    } else {
      state.queue = pickRandom(window.VOCABULARY, CONFIG.TOTAL_ROUNDS);
    }
    state.index = 0;
    state.score = 0;
    state.retries = 0;
    els.roundTotal.textContent = String(CONFIG.TOTAL_ROUNDS);
    showScreen('card');
    nextCard();
  }

  function nextCard() {
    if (state.index >= CONFIG.TOTAL_ROUNDS) return finish();
    state.current = state.queue[state.index];
    state.retries = 0;

    const isMathMode = state.mode === 'addition' || state.mode === 'subtraction';
    if (isMathMode) {
      els.cardEmoji.textContent = state.mode === 'addition' ? '➕' : '➖';
      els.cardWord.textContent = state.current.question;
      els.cardWord.style.textTransform = 'none';
      els.cardWord.style.letterSpacing = '1px';
      els.btnSpeak.style.display = 'none';
      els.btnSkip.style.display = 'none';
      els.micIndicator.style.display = 'none';
      els.transcript.style.display = 'none';
      renderChoiceButtons();
      els.micLabel.textContent = 'Pick the right answer!';
    } else {
      els.cardEmoji.textContent = state.current.emoji;
      els.cardWord.textContent = state.current.word;
      els.cardWord.style.textTransform = 'lowercase';
      els.cardWord.style.letterSpacing = '4px';
      els.btnSpeak.style.display = '';
      els.btnSkip.style.display = '';
      els.micIndicator.style.display = '';
      els.transcript.style.display = '';
      els.choiceGrid.classList.remove('active');
      els.choiceGrid.innerHTML = '';
      els.micLabel.textContent = hasAnySpeechSupport()
        ? 'Press Enter and say the word!'
        : 'Speech recognition is not available on this device.';
      els.btnSpeak.focus();
    }

    els.roundCurrent.textContent = String(state.index + 1);
    renderStars();
    els.transcript.textContent = '';
  }

  function renderChoiceButtons() {
    els.choiceGrid.innerHTML = '';
    els.choiceGrid.classList.add('active');
    const choices = Array.isArray(state.current.choices) ? shuffle(state.current.choices) : [];

    choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-button';
      btn.type = 'button';
      btn.textContent = String(choice);
      btn.addEventListener('click', () => {
        if (Number(choice) === Number(state.current.answer)) handleCorrect();
        else handleWrong();
      });
      els.choiceGrid.appendChild(btn);
      if (idx === 0) setTimeout(() => btn.focus(), 0);
    });
  }

  function renderStars() {
    els.starTracker.innerHTML = '';
    for (let i = 0; i < CONFIG.TOTAL_ROUNDS; i++) {
      const s = document.createElement('span');
      s.textContent = i < state.score ? '⭐' : '☆';
      els.starTracker.appendChild(s);
    }
  }

  function listen() {
    if (state.mode !== 'vocabulary') return;
    if (state.listening) return;
    if (hasNativeSpeech()) {
      state.listening = true;
      els.micIndicator.classList.add('listening');
      els.micLabel.textContent = 'Listening...';
      els.transcript.textContent = '';
      try {
        window.TheGateSpeech.listen();
        listenTimer = setTimeout(() => {
          cancelNativeSpeech();
          window.__theGateNativeSpeechResult({ candidates: [], error: "I didn't hear you. Press Enter to try again." });
        }, CONFIG.LISTEN_TIMEOUT_MS);
      } catch (e) {
        state.listening = false;
        els.micIndicator.classList.remove('listening');
        els.micLabel.textContent = 'Microphone busy. Press Enter to try again.';
      }
      return;
    }

    if (!recog) {
      els.micLabel.textContent = 'Speech recognition is not available on this device.';
      return;
    }
    state.listening = true;
    els.micIndicator.classList.add('listening');
    els.micLabel.textContent = 'Listening...';
    els.transcript.textContent = '';
    try {
      recog.start();
      listenTimer = setTimeout(() => {
        try { recog.stop(); } catch (_) {}
      }, CONFIG.LISTEN_TIMEOUT_MS);
    } catch (e) {
      // start() will throw if recognition is already in progress.
      state.listening = false;
      els.micIndicator.classList.remove('listening');
      els.micLabel.textContent = 'Microphone busy. Press Enter to try again.';
    }
  }

  function onRecogResult(event) {
    const last = event.results[event.results.length - 1];
    const candidates = Array.from(last).map(a => a.transcript || '');
    els.transcript.textContent = candidates[0] || '';
    if (!last.isFinal) return;
    const ok = candidates.some(t => matches(t, state.current));
    if (ok) handleCorrect();
    else handleWrong();
  }

  function onRecogEnd() {
    clearTimeout(listenTimer);
    state.listening = false;
    els.micIndicator.classList.remove('listening');
  }

  function onRecogError(e) {
    clearTimeout(listenTimer);
    state.listening = false;
    els.micIndicator.classList.remove('listening');
    if (e.error === 'no-speech') {
      els.micLabel.textContent = "I didn't hear you. Press Enter to try again.";
    } else if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      els.micLabel.textContent = 'Please allow microphone access.';
    } else {
      els.micLabel.textContent = 'Mic error. Press Enter to try again.';
    }
  }

  function handleCorrect() {
    cancelNativeSpeech();
    if (recog) { try { recog.abort(); } catch (_) {} }
    state.listening = false;
    state.score++;
    renderStars();
    showOverlay('correct');
    spawnStars();
    setTimeout(() => {
      showOverlay(null);
      state.index++;
      nextCard();
    }, CONFIG.CORRECT_HOLD_MS);
  }

  function handleWrong() {
    cancelNativeSpeech();
    if (recog) { try { recog.abort(); } catch (_) {} }
    state.listening = false;
    state.retries++;
    showOverlay('wrong');
    setTimeout(() => {
      showOverlay(null);
      if (state.retries < CONFIG.MAX_RETRIES) {
        if (state.mode === 'vocabulary') {
          els.micLabel.textContent = 'Try again! Press Enter to speak.';
          els.btnSpeak.focus();
        } else {
          els.micLabel.textContent = 'Almost! Tap another number.';
        }
      } else {
        // Move on encouragingly without giving a star.
        state.index++;
        nextCard();
      }
    }, CONFIG.WRONG_HOLD_MS);
  }

  function spawnStars() {
    const container = overlays.correct.querySelector('.overlay__content');
    const symbols = ['⭐', '✨', '🌟', '💫'];
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      s.className = 'floating-star';
      s.textContent = symbols[i % symbols.length];
      const angle = Math.random() * Math.PI * 2;
      const dist  = 220 + Math.random() * 220;
      s.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
      s.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
      s.style.setProperty('--delay', `${i * 35}ms`);
      container.appendChild(s);
      setTimeout(() => s.remove(), 1500);
    }
  }

  function finish() {
    els.finalScore.textContent = String(state.score);
    els.finalTotal.textContent = String(CONFIG.TOTAL_ROUNDS);
    const unlockReady = state.score >= CONFIG.REQUIRED_CORRECT;
    els.btnYoutube.disabled = !unlockReady;
    const label = els.btnYoutube.querySelector('.big-button__label');
    if (label) {
      label.textContent = unlockReady
        ? `Watch YouTube (${Math.round(CONFIG.YOUTUBE_PLAY_LIMIT_MS / 60000)} Mins)`
        : `Need ${CONFIG.REQUIRED_CORRECT}/${CONFIG.TOTAL_ROUNDS} to unlock`;
    }
    showScreen('done');
    (unlockReady ? els.btnYoutube : els.btnRestart).focus();
  }

  function getEmbedUrl(urlOrId) {
    const defaultUrl = 'https://www.youtube.com/tv';
    const embedParams = `autoplay=1&controls=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&fs=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
    const directYoutubePaths = new Set(['/', '/tv', '/feed/subscriptions', '/feed/history']);
    if (!urlOrId) return defaultUrl;

    urlOrId = urlOrId.trim();

    try {
      const parsedUrl = new URL(urlOrId);
      const host = parsedUrl.hostname.replace(/^www\./, '');
      const isYoutube = host === 'youtube.com' || host === 'm.youtube.com';
      const isNormalYoutubeRoute = isYoutube
        && directYoutubePaths.has(parsedUrl.pathname)
        && !parsedUrl.searchParams.has('v')
        && !parsedUrl.searchParams.has('list');

      if (isNormalYoutubeRoute) return parsedUrl.href;
    } catch (_) {}

    // If it is already an embed URL
    if (urlOrId.includes('/embed/')) {
      // Append play/modest parameters if key attributes are missing
      if (!urlOrId.includes('autoplay=')) {
        const symbol = urlOrId.includes('?') ? '&' : '?';
        return `${urlOrId}${symbol}${embedParams}`;
      }
      return urlOrId;
    }

    // If it's a playlist URL
    if (urlOrId.includes('list=')) {
      const match = urlOrId.match(/[&?]list=([^&]+)/);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/videoseries?list=${match[1]}&${embedParams}`;
      }
    }

    // Try parsing video ID from watch URL (watch?v=ID or share youtu.be/ID)
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlOrId.match(regExp);

    if (match && match[2] && match[2].length === 11) {
      videoId = match[2];
    } else if (urlOrId.length === 11 && !urlOrId.includes('/') && !urlOrId.includes('.')) {
      videoId = urlOrId;
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?${embedParams}`;
    }

    return defaultUrl;
  }

  function isDirectYoutubeUrl(url) {
    try {
      const parsedUrl = new URL(url);
      const host = parsedUrl.hostname.replace(/^www\./, '');
      return host === 'youtube.com' || host === 'm.youtube.com';
    } catch (_) {
      return false;
    }
  }

  /**
   * Starts simulated locked-down YouTube viewer screen.
   * Counts down from 10 minutes, then yanks user back to the splash screen.
   */
  function startYouTubeSession() {
    if (state.score < CONFIG.REQUIRED_CORRECT) return;
    showScreen('youtube');
    
    // Dynamically build clean child-safe embed URL from parental config
    const targetSrc = getEmbedUrl(CONFIG.YOUTUBE_URL);
    const playLimitMs = Number(CONFIG.YOUTUBE_PLAY_LIMIT_MS) || (10 * 60 * 1000);
    els.youtubeIframe.src = '';
    
    state.timeLeftSeconds = Math.ceil(playLimitMs / 1000);
    updateTimerDisplay();

    if (hasNativePlayer()) {
      try {
        window.TheGatePlayer.play(targetSrc, playLimitMs);
        return;
      } catch (e) {
        console.warn('Native player unavailable. Falling back to iframe.', e);
      }
    }

    if (isDirectYoutubeUrl(targetSrc) && !targetSrc.includes('/embed/')) {
      window.location.href = targetSrc;
      return;
    }

    els.youtubeIframe.src = targetSrc;

    // Focus the exit button so TV Remote D-Pad select can press it easily
    setTimeout(() => {
      els.btnExitYoutube.focus();
    }, 100);

    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      state.timeLeftSeconds--;
      updateTimerDisplay();

      if (state.timeLeftSeconds <= 0) {
        clearInterval(state.timerInterval);
        endYouTubeSession();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(state.timeLeftSeconds / 60);
    const secs = state.timeLeftSeconds % 60;
    els.youtubeTimer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function endYouTubeSession() {
    clearInterval(state.timerInterval);
    cancelNativeSpeech();
    cancelNativePlayer();
    // Tear down iframe src to halt any active music/video playback cleanly
    els.youtubeIframe.src = '';
    showScreen('splash');
    els.btnStart.focus();
  }

  /**
   * Swap the current word for a different random one without changing the
   * round number or score. Useful when the child is stuck or didn't like the
   * picture.
   */
  function skipCard() {
    if (state.mode !== 'vocabulary') return;
    if (recog && state.listening) { try { recog.abort(); } catch (_) {} }
    state.listening = false;
    els.micIndicator.classList.remove('listening');
    showOverlay(null);

    const usedWords = new Set(state.queue.map(w => w.word));
    const pool = (window.VOCABULARY || []).filter(w => !usedWords.has(w.word));
    if (pool.length === 0) return; // nothing left to swap to
    const replacement = pool[Math.floor(Math.random() * pool.length)];
    state.queue[state.index] = replacement;
    state.current = replacement;
    state.retries = 0;
    els.cardEmoji.textContent = replacement.emoji;
    els.cardWord.textContent  = replacement.word;
    els.transcript.textContent = '';
    els.micLabel.textContent = hasAnySpeechSupport()
      ? 'Press Enter and say the word!'
      : 'Speech recognition is not available on this device.';
    els.btnSpeak.focus();
  }

  function openParentPanel() {
    els.parentPanel.hidden = false;
    els.parentSettingsFields.hidden = true;
    els.btnParentSave.hidden = true;
    els.parentPasscodeInput.value = '';
    els.cfgNewPasscode.value = '';
    els.parentStatus.textContent = '';
    els.parentPasscodeInput.focus();
  }

  function closeParentPanel() {
    els.parentPanel.hidden = true;
    els.btnParentSettings.focus();
  }

  function unlockParentSettings() {
    const entered = String(els.parentPasscodeInput.value || '').trim();
    if (!entered) {
      els.parentStatus.textContent = 'Please enter passcode.';
      return;
    }
    if (entered !== getParentPasscode()) {
      els.parentStatus.textContent = 'Wrong passcode.';
      return;
    }

    loadLocalConfig();
    els.cfgTimeLimit.value = String(Math.max(1, Math.round(CONFIG.YOUTUBE_PLAY_LIMIT_MS / 60000)));
    els.cfgTotalQuestions.value = String(CONFIG.TOTAL_ROUNDS);
    els.cfgRequiredCorrect.value = String(CONFIG.REQUIRED_CORRECT);
    els.parentSettingsFields.hidden = false;
    els.btnParentSave.hidden = false;
    els.parentStatus.textContent = 'Unlocked. Update settings and press Save.';
    els.cfgTimeLimit.focus();
  }

  function saveParentSettings() {
    const minutes = Number(els.cfgTimeLimit.value);
    const total = Number(els.cfgTotalQuestions.value);
    const required = Number(els.cfgRequiredCorrect.value);

    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) {
      els.parentStatus.textContent = 'Time limit must be 1-120 minutes.';
      return;
    }
    if (!Number.isInteger(total) || total < 1 || total > 20) {
      els.parentStatus.textContent = 'Questions to answer must be 1-20.';
      return;
    }
    if (!Number.isInteger(required) || required < 1 || required > total) {
      els.parentStatus.textContent = 'Correct needed must be between 1 and total questions.';
      return;
    }

    CONFIG.TOTAL_ROUNDS = total;
    CONFIG.REQUIRED_CORRECT = required;
    CONFIG.YOUTUBE_PLAY_LIMIT_MS = minutes * 60 * 1000;
    saveLocalConfig();

    const nextPasscode = String(els.cfgNewPasscode.value || '').trim();
    if (nextPasscode) {
      setParentPasscode(nextPasscode);
      els.cfgNewPasscode.value = '';
    }

    els.parentStatus.textContent = 'Saved on this device.';
  }

  // ---------- Event wiring ----------
  els.btnStart.addEventListener('click', () => start('vocabulary'));
  els.btnModeWord.addEventListener('click', () => start('vocabulary'));
  els.btnModeAdd.addEventListener('click', () => start('addition'));
  els.btnModeSub.addEventListener('click', () => start('subtraction'));
  els.btnParentSettings.addEventListener('click', openParentPanel);
  els.btnParentUnlock.addEventListener('click', unlockParentSettings);
  els.btnParentSave.addEventListener('click', saveParentSettings);
  els.btnParentClose.addEventListener('click', closeParentPanel);
  els.btnSpeak.addEventListener('click', listen);
  els.btnSkip.addEventListener('click', skipCard);
  els.btnYoutube.addEventListener('click', startYouTubeSession);
  els.btnExitYoutube.addEventListener('click', endYouTubeSession);
  els.btnRestart.addEventListener('click', () => {
    showScreen('splash');
    els.btnStart.focus();
  });

  // TV-remote-friendly key handling (D-pad maps to arrow keys + Enter).
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      showOverlay(null);
      showScreen('splash');
      els.btnStart.focus();
      return;
    }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const active = document.activeElement;
    // Let focused buttons handle their own activation.
    if (active && active.tagName === 'BUTTON') return;
    e.preventDefault();
    if (screens.splash.classList.contains('active') && els.parentPanel.hidden) start('vocabulary');
    else if (screens.card.classList.contains('active') && state.mode === 'vocabulary') listen();
    else if (screens.done.classList.contains('active')) els.btnYoutube.click();
    else if (screens.youtube.classList.contains('active')) endYouTubeSession();
  });

  // Boot
  if (!localStorage.getItem(PASSCODE_STORAGE_KEY)) {
    setParentPasscode(DEFAULT_PARENT_PASSCODE);
  }
  loadLocalConfig();
  saveLocalConfig();
  showScreen('splash');
  els.btnStart.focus();
})();
