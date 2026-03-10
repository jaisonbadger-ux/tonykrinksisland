// ═══════════════════════════════════════════════
// FIREBASE AUTH + COMMUNAL CLOUD SYNC
// Tony Krink's Island
// ═══════════════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDpFlMknPObiiH0AAyJ8Hhacla_NIe-lzA",
  authDomain:        "tonykrink-63723.firebaseapp.com",
  projectId:         "tonykrink-63723",
  storageBucket:     "tonykrink-63723.firebasestorage.app",
  messagingSenderId: "500681949863",
  appId:             "1:500681949863:web:90519bf57149e3c6d15182"
};

// ──────────────────────────────────────────────
const AVATARS = [
  { id:'goblin',     emoji:'\uD83D\uDC7E',                                      label:'GOBLIN',  bg:'#1a3a1a' },
  { id:'brown-guy',  emoji:'\uD83D\uDC66\uD83C\uDFFD',                          label:'MATE',    bg:'#3a1a00' },
  { id:'dark-girl',  emoji:'\uD83D\uDC67\uD83C\uDFFF',                          label:'LEGEND',  bg:'#1a0a2a' },
  { id:'beardo',     emoji:'\uD83E\uDDD4\uD83C\uDFFB',                          label:'BEARDO',  bg:'#0a1a2a' },
  { id:'hijab',      emoji:'\uD83E\uDDD5\uD83C\uDFFD',                          label:'BOSS',    bg:'#2a1a0a' },
  { id:'wheelchair', emoji:'\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDDBD',        label:'ROLLIN',  bg:'#0a2a2a' },
  { id:'cane',       emoji:'\uD83E\uDDD1\uD83C\uDFFF\u200D\uD83E\uDDAF',        label:'VIBE',    bg:'#1a1a3a' },
  { id:'nonbinary',  emoji:'\uD83E\uDDD1\uD83C\uDFFE',                          label:'ENTITY',  bg:'#2a0a2a' },
  { id:'silver',     emoji:'\uD83D\uDC68\u200D\uD83E\uDDB3',                    label:'OG',      bg:'#1a2a1a' },
  { id:'trans',      emoji:'\uD83C\uDFF3\uFE0F\u200D\u26A7\uFE0F',              label:'VALID',   bg:'#0a1a3a' },
  { id:'curly',      emoji:'\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDDB1',        label:'CHAOS',   bg:'#2a1a1a' },
  { id:'bald',       emoji:'\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDDB2',        label:'CHROME',  bg:'#1a1a1a' },
];

let _auth, _db;
let _currentUser      = null;
let _currentProfile   = null;
let _selectedAvatarId = 'goblin';
let _cloudSaveTimer   = null;
let _japSnapUnsub     = null;
let _statsSnapUnsub   = null;
let _gameSnapUnsub    = null;
let _eventsSnapUnsub  = null;

// Batched click accumulator (avoids write-per-click to Firestore)
let _pendingClickReward = 0;
let _pendingClickCount  = 0;
let _clickFlushTimer    = null;

// Message board cache (Firestore → local array)
let _msgCache = [];

// Per-user cumulative accumulators (flushed with clicks)
let _pendingUserCoins  = 0;
let _pendingUserClicks = 0;

// Milestones already crossed for event triggers
let _crossedMilestones = {};

// ── SECURITY HELPERS ──
// Escape HTML so user data can never inject markup
function _esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
// Only allow alphanumeric, spaces, underscores, hyphens, dots, ! — no HTML chars
function _sanitizeName(s, max) {
  return String(s ?? '').replace(/[^a-zA-Z0-9 _\-\.!]/g,'').trim().slice(0, max || 20) || 'anon';
}

// Event countdown timer
let _eventTimerInterval = null;

// Casino state (local, persisted to userStats)
let _casino = {
  bet:         10,
  totalBets:   0,
  totalWagered:0,
  totalWon:    0,
  biggestWin:  0,
  jackpotsHit: 0,
  freeSpins:   0,
  wins:        0,
  spins:       0,
  spinning:    false,
};

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
(function _initFirebase() {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    try { localStorage.setItem('tk_firebase_cfg', JSON.stringify(FIREBASE_CONFIG)); } catch(e) {}
    _auth = firebase.auth();
    _db   = firebase.firestore();
    window._db = _db; // expose for inline handlers
    _auth.onAuthStateChanged(_onAuthChanged);
    _startGameSync();
    _startJapingusSync();
    _startStatsSync();
    _startMsgSync();
    _startReactionsSync();
    _startEventsSync();
    _incrementVisitCount();
  } catch(e) {
    console.warn('Firebase init failed:', e);
    if (typeof initGame === 'function') initGame();
  }
})();

// ──────────────────────────────────────────────
// AUTH STATE
// ──────────────────────────────────────────────
async function _onAuthChanged(user) {
  if (user) {
    _currentUser = user;
    await _loadProfile(user.uid);
    _showProfileBadge();
    _hideLoginOverlay();
    _hideLoginBtn();
    _touchUserStats();
  } else {
    _currentUser    = null;
    _currentProfile = null;
    try { localStorage.removeItem('tk_profile'); } catch(e) {}
    _showLoginBtn();
  }
}

async function _loadProfile(uid) {
  // Derive a sane fallback name from email rather than 'anon'
  const emailFallback = (_currentUser?.email || '').split('@')[0]
    .replace(/[^a-zA-Z0-9_\-\.]/g, '').slice(0, 16) || 'user';
  try {
    const snap = await _db.doc(`users/${uid}/data/profile`).get();
    if (snap.exists) {
      _currentProfile = snap.data();
      // Repair if username is somehow blank/anon
      if (!_currentProfile.username || _currentProfile.username === 'anon') {
        _currentProfile.username = emailFallback;
        _db.doc(`users/${uid}/data/profile`).set(_currentProfile, { merge: true }).catch(() => {});
      }
    } else {
      // Profile doc missing — create a minimal one from email
      _currentProfile = { username: emailFallback, avatarId: 'goblin' };
      _db.doc(`users/${uid}/data/profile`).set(_currentProfile).catch(() => {});
    }
  } catch(e) {
    // Firestore read blocked — still show email prefix, not 'anon'
    _currentProfile = { username: emailFallback, avatarId: 'goblin' };
  }
  // Expose profile to bungalow (map.html) via localStorage
  try { localStorage.setItem('tk_profile', JSON.stringify(_currentProfile)); } catch(e) {}
}

// Write username/avatarId/lastSeen to userStats on login/load
async function _touchUserStats() {
  if (!_db || !_currentUser || !_currentProfile) return;
  try {
    await _db.doc(`userStats/${_currentUser.uid}`).set({
      username:  _currentProfile.username || 'anon',
      avatarId:  _currentProfile.avatarId || 'goblin',
      lastSeen:  firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch(e) {}
}

// ──────────────────────────────────────────────
// COMMUNAL GAME SYNC  —  shared/game
// ──────────────────────────────────────────────
function _startGameSync() {
  if (!_db) return;

  _db.doc('shared/game').get().then(snap => {
    if (snap.exists) _applyGameState(snap.data());
    if (typeof initGame === 'function') initGame();
  }).catch(() => {
    if (typeof initGame === 'function') initGame();
  });

  _gameSnapUnsub = _db.doc('shared/game').onSnapshot(snap => {
    if (!snap.exists || snap.metadata.hasPendingWrites) return;
    _mergeGameState(snap.data());
    if (typeof updateDisplay === 'function') updateDisplay();
    if (typeof maybeRender   === 'function') maybeRender();
    _checkAscension(snap.data());
  });

  _patchDoClick();
}

function _applyGameState(d) {
  coins       = parseFloat(d.coins  ?? coins       ?? 0);
  totalEarned = parseFloat(d.earned ?? totalEarned ?? 0);
  clicks      = parseInt  (d.clicks ?? clicks      ?? 0);
  owned       = d.owned   ?? owned   ?? {};
  bought      = d.bought  ?? bought  ?? {};
  pacts       = d.pacts   ?? pacts   ?? {};
  globalMult  = parseFloat(d.gmult  ?? globalMult  ?? 1);
  seenMs      = d.seenms  ?? seenMs  ?? {};
  _updateEraBadge(d.era ?? 1);
  if (typeof recalc === 'function') recalc();
}

function _mergeGameState(d) {
  if ((d.coins  ?? 0) > coins)       coins       = parseFloat(d.coins);
  if ((d.earned ?? 0) > totalEarned) totalEarned = parseFloat(d.earned);
  if ((d.clicks ?? 0) > clicks)      clicks      = parseInt(d.clicks);

  let changed = false;
  if (d.owned)  Object.keys(d.owned).forEach(k => {
    if ((d.owned[k]  ?? 0) > (owned[k]  ?? 0)) { owned[k]  = d.owned[k];  changed = true; }
  });
  if (d.bought) Object.keys(d.bought).forEach(k => {
    if (d.bought[k] && !bought[k]) { bought[k] = true; changed = true; }
  });
  if (d.pacts)  Object.keys(d.pacts).forEach(k => {
    if (d.pacts[k]  && !pacts[k])  { pacts[k]  = true; changed = true; }
  });
  if ((d.gmult ?? 1) > globalMult) { globalMult = parseFloat(d.gmult); changed = true; }
  _updateEraBadge(d.era ?? 1);
  if (changed && typeof recalc === 'function') recalc();
}

// ──────────────────────────────────────────────
// CLICK BATCHING + USER STATS FLUSH
// ──────────────────────────────────────────────
function _patchDoClick() {
  const _orig = window.doClick;

  // Combo state
  window._comboCount    = 0;
  window._lastClickTime = 0;
  window._comboMult     = 1;

  window.doClick = function(e) {
    // Combo tracking
    const now = Date.now();
    const gap = now - window._lastClickTime;
    window._lastClickTime = now;
    if (gap < 600) {
      window._comboCount = Math.min(window._comboCount + 1, 20);
    } else {
      window._comboCount = 0;
    }
    window._comboMult = 1 + window._comboCount * 0.1; // max ×3 at 20 combo

    // Apply combo to reward BEFORE calling orig (which uses raw clickPow)
    const baseReward = (typeof clickPow !== 'undefined') ? clickPow : 1;
    const comboReward = baseReward * window._comboMult;

    // Call original to handle local state (coins, display, etc.)
    _orig && _orig(e);

    // Adjust coins for combo bonus (orig already added clickPow, add the delta)
    const comboDelta = comboReward - baseReward;
    if (comboDelta > 0) {
      coins       += comboDelta;
      totalEarned += comboDelta;
    }

    // Accumulate for Firestore flush
    _pendingClickReward += comboReward;
    _pendingClickCount++;
    _pendingUserCoins  += comboReward;
    _pendingUserClicks++;

    // Update combo bar
    _updateComboBar();

    if (!_clickFlushTimer) _clickFlushTimer = setTimeout(_flushClicks, 500);
  };
}

function _updateComboBar() {
  const bar   = document.getElementById('combo-bar');
  const label = document.getElementById('combo-label');
  if (!bar || !label) return;
  const pct = (window._comboCount / 20) * 100;
  bar.style.width = pct + '%';
  if (pct < 40)       bar.style.background = 'var(--green)';
  else if (pct < 75)  bar.style.background = 'var(--gold)';
  else                bar.style.background = 'var(--red)';
  if (window._comboCount > 0) {
    label.textContent = 'COMBO ×' + window._comboMult.toFixed(1) + '  [' + window._comboCount + '/20]';
    label.style.color = pct > 75 ? 'var(--red)' : pct > 40 ? 'var(--gold)' : 'var(--green)';
  } else {
    label.textContent = '';
  }
}

// Click milestone checkpoints for event triggers
const _CLICK_MILESTONES = [10000, 50000, 100000, 500000, 1000000, 5000000, 10000000, 50000000];

function _flushClicks() {
  _clickFlushTimer = null;
  if (!_db || !_pendingClickReward) return;
  const r = _pendingClickReward, c = _pendingClickCount;
  const ur = _pendingUserCoins,  uc = _pendingUserClicks;
  _pendingClickReward = 0; _pendingClickCount  = 0;
  _pendingUserCoins   = 0; _pendingUserClicks  = 0;

  _db.doc('shared/game').update({
    coins:  firebase.firestore.FieldValue.increment(r),
    earned: firebase.firestore.FieldValue.increment(r),
    clicks: firebase.firestore.FieldValue.increment(c),
  }).catch(() => {
    _db.doc('shared/game').set({
      coins: r, earned: r, clicks: c,
      owned: {}, bought: {}, pacts: {}, gmult: 1, seenms: {}, era: 1
    }).catch(() => {});
  });

  _db.doc('shared/stats').update({
    totalCoins:  firebase.firestore.FieldValue.increment(r),
    totalClicks: firebase.firestore.FieldValue.increment(c),
  }).then(() => {
    // Check for event trigger after stats update
    _db.doc('shared/stats').get().then(snap => {
      if (!snap.exists) return;
      const tc = snap.data().totalClicks || 0;
      _maybeFireEvent(tc);
    }).catch(() => {});
  }).catch(() => {
    _db.doc('shared/stats').set({ totalCoins: r, totalClicks: c, totalVisits: 0 }).catch(() => {});
  });

  // Per-user stats (only when logged in)
  if (_db && _currentUser) {
    _db.doc(`userStats/${_currentUser.uid}`).update({
      coinsEarned:  firebase.firestore.FieldValue.increment(ur),
      totalClicks:  firebase.firestore.FieldValue.increment(uc),
      lastSeen:     firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(() => {
      _db.doc(`userStats/${_currentUser.uid}`).set({
        username:     _currentProfile?.username || 'anon',
        avatarId:     _currentProfile?.avatarId || 'goblin',
        coinsEarned:  ur,
        totalClicks:  uc,
        japingusFed:  0,
        japingusCoinsSpent: 0,
        totalBets:    0,
        totalWagered: 0,
        totalWon:     0,
        biggestWin:   0,
        jackpotsHit:  0,
        freeSpins:    0,
        lastSeen:     firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(() => {});
    });
  }
}

function pushCloudSave() {
  if (!_db) return;
  if (_cloudSaveTimer) clearTimeout(_cloudSaveTimer);
  _cloudSaveTimer = setTimeout(_doCloudSave, 3000);
}

async function _doCloudSave() {
  if (!_db) return;
  try {
    await _db.doc('shared/game').set({
      owned:   owned      ?? {},
      bought:  bought     ?? {},
      pacts:   pacts      ?? {},
      gmult:   globalMult ?? 1,
      seenms:  seenMs     ?? {},
      savedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch(e) {
    console.warn('_doCloudSave failed:', e);
  }
}

// ──────────────────────────────────────────────
// VISITOR COUNTER  —  shared/stats.totalVisits
// ──────────────────────────────────────────────
function _incrementVisitCount() {
  if (!_db) return;
  _db.doc('shared/stats').update({
    totalVisits: firebase.firestore.FieldValue.increment(1),
  }).catch(() => {
    _db.doc('shared/stats').set({
      totalVisits: 1, totalCoins: 0, totalClicks: 0
    }).catch(() => {});
  });
}

function _updateVisitorDisplay(n) {
  const pad = String(n).padStart(6, '0');
  ['home-views','footer-visitor'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = pad; });
  ['home-visitor-num','hdr-views'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = n; });
}

// ──────────────────────────────────────────────
// ISLAND STATS DISPLAY  —  shared/stats
// ──────────────────────────────────────────────
function _startStatsSync() {
  if (!_db) return;
  _statsSnapUnsub = _db.doc('shared/stats').onSnapshot(snap => {
    if (!snap.exists) return;
    const data  = snap.data();
    const fmtFn = typeof fmt === 'function' ? fmt : (v => v);

    const el1 = document.getElementById('island-total-coins');
    const el2 = document.getElementById('island-total-clicks');
    if (el1) el1.textContent = fmtFn(data.totalCoins  || 0);
    if (el2) el2.textContent = fmtFn(data.totalClicks || 0);

    if (data.totalVisits) _updateVisitorDisplay(data.totalVisits);

    // Leaderboard island totals
    _updateLbIslandStats(data);

    // Casino island stats
    const ciW = document.getElementById('ci-wagered');
    const ciJ = document.getElementById('ci-jackpots');
    if (ciW) ciW.textContent = fmtFn(data.totalWagered || 0);
    if (ciJ) ciJ.textContent = (data.totalJackpots || 0);

    _checkAscension(data);
  });
}

function _updateLbIslandStats(data) {
  const fmtFn = typeof fmt === 'function' ? fmt : (v => v);
  const ids = {
    'lb-total-coins':  () => fmtFn(data.totalCoins  || 0),
    'lb-total-clicks': () => fmtFn(data.totalClicks || 0),
    'lb-total-visits': () => (data.totalVisits || 0),
    'lb-era':          () => (data.era || 1),
  };
  Object.entries(ids).forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = fn();
  });
}

// ──────────────────────────────────────────────
// MESSAGE BOARD  —  messages collection
// ──────────────────────────────────────────────
function _startMsgSync() {
  if (!_db) return;

  _db.collection('messages')
    .orderBy('time', 'desc')
    .limit(100)
    .onSnapshot(snap => {
      _msgCache = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (typeof renderBoard === 'function') {
        renderBoard('home-msgs');
        renderBoard('full-msgs');
      }
    });

  const _origGetMsgs = getMsgs;
  getMsgs = function() {
    if (_msgCache.length > 0) {
      return [...SEED, ..._msgCache].sort((a, b) => b.time - a.time);
    }
    return _origGetMsgs();
  };

  const _origPostMsg = postMsg;
  postMsg = function(full) {
    const nId  = full ? 'fb-name' : 'hb-name';
    const mId  = full ? 'fb-msg'  : 'hb-msg';
    const name = document.getElementById(nId)?.value.trim() || 'anonymous';
    const text = document.getElementById(mId)?.value.trim();
    if (!text) return;

    const msg = { name, text, time: Date.now() };

    if (_db) {
      _db.collection('messages').add(msg).catch(() => {
        _origPostMsg && _origPostMsg(full);
        return;
      });
    } else {
      _origPostMsg && _origPostMsg(full);
    }

    const nEl = document.getElementById(nId);
    const mEl = document.getElementById(mId);
    if (nEl) nEl.value = '';
    if (mEl) mEl.value = '';

    _msgCache.unshift(msg);
    if (typeof renderBoard === 'function') {
      renderBoard('home-msgs');
      renderBoard('full-msgs');
    }
  };
}

// ──────────────────────────────────────────────
// REACTIONS SYNC  —  reactions/{msgId} collection
// ──────────────────────────────────────────────
function _startReactionsSync() {
  if (!_db) return;
  _db.collection('reactions').onSnapshot(snap => {
    snap.docChanges().forEach(change => {
      if (change.type === 'removed') {
        delete window._rxCache[change.doc.id];
      } else {
        window._rxCache[change.doc.id] = change.doc.data();
      }
    });
    if (typeof renderBoard === 'function') {
      renderBoard('home-msgs');
      renderBoard('full-msgs');
    }
  }, () => {});
  window._loadReactions = () => {}; // already listening via onSnapshot
}

// ──────────────────────────────────────────────
// SHARED JAPINGUS
// ──────────────────────────────────────────────
function _startJapingusSync() {
  if (!_db) return;

  _db.doc('shared/japingus').get().then(snap => {
    if (!snap.exists) {
      if (window._jap) {
        const state = window._jap.get();
        if (state) _db.doc('shared/japingus').set({ ...state, lastFedBy: '' }).catch(() => {});
      }
      return;
    }
    const data = snap.data();
    if (window._jap) {
      const localJap = window._jap.get();
      if (localJap) Object.assign(localJap, data);
      if (window._jap.applyOfflineDecay) window._jap.applyOfflineDecay();
      if (window._jap.render) window._jap.render();
    }
    _updateFedByDisplay(data.lastFedBy);
  }).catch(() => {});

  _japSnapUnsub = _db.doc('shared/japingus').onSnapshot(snap => {
    if (!snap.exists || snap.metadata.hasPendingWrites) return;
    const data   = snap.data();
    const myName = _currentProfile ? _currentProfile.username : null;
    if (!myName || data.lastFedBy !== myName) {
      if (window._jap) {
        const localJap = window._jap.get();
        if (localJap) Object.assign(localJap, data);
        if (window._jap.render) window._jap.render();
      }
    }
    _updateFedByDisplay(data.lastFedBy);
  });

  const _origJapBuy = window.japBuy;
  window.japBuy = function(id) {
    _origJapBuy && _origJapBuy(id);
    _pushJapState();
    // Track japingus spend in userStats
    if (_db && _currentUser) {
      const jState = window._jap ? window._jap.get() : null;
      _db.doc(`userStats/${_currentUser.uid}`).update({
        japingusFed:       firebase.firestore.FieldValue.increment(1),
        japingusCoinsSpent: firebase.firestore.FieldValue.increment(0),
      }).catch(() => {});
    }
  };

  const _origJapRevive = window.japRevive;
  window.japRevive = function() {
    _origJapRevive && _origJapRevive();
    _pushJapState('revived');
  };
}

function _pushJapState(suffix) {
  if (!_db || !window._jap) return;
  const state    = window._jap.get();
  const username = (_currentProfile ? _currentProfile.username : 'anon') + (suffix ? ' (' + suffix + ')' : '');
  _db.doc('shared/japingus').set({ ...state, lastFedBy: username }).catch(() => {});
}

function _updateFedByDisplay(name) {
  const el = document.getElementById('jap-lastfed');
  if (el) el.textContent = name ? '\uD83C\uDF7A last fed by: ' + _esc(name) : '';
}

// ──────────────────────────────────────────────
// GLOBAL EVENTS SYSTEM  —  shared/events
// ──────────────────────────────────────────────
const _EVENT_TYPES = [
  { type:'bajookie_surge',  label:'\u26A1 BAJOOKIE SURGE',                    cps:2,   click:1,   dur:90000 },
  { type:'void_storm',      label:'\uD83C\uDF00 VOID STORM',                  cps:5,   click:0.1, dur:60000 },
  { type:'island_festival', label:'\uD83C\uDF89 ISLAND FESTIVAL',              cps:3,   click:3,   dur:60000 },
  { type:'newman_incident', label:'\uD83D\uDCEC NEWMAN INCIDENT',              cps:0.1, click:1,   dur:30000 },
  { type:'bajookie_tide',   label:'\uD83C\uDF0A BAJOOKIE TIDE',                cps:1,   click:10,  dur:45000 },
];

function _startEventsSync() {
  if (!_db) return;
  _eventsSnapUnsub = _db.doc('shared/events').onSnapshot(snap => {
    if (!snap.exists) { _clearEvent(); return; }
    const d = snap.data();
    if (d.active && d.endsAt > Date.now()) {
      _applyEvent(d);
    } else {
      _clearEvent();
    }
  });
}

function _applyEvent(d) {
  window._eventCpsMultiplier   = d.multiplierCps   || 1;
  window._eventClickMultiplier = d.multiplierClick || 1;
  if (typeof recalc === 'function') recalc();

  const banner = document.getElementById('event-banner');
  if (banner) {
    banner.style.display = 'flex';
    const icon  = document.getElementById('event-icon');
    const name  = document.getElementById('event-name');
    const desc  = document.getElementById('event-desc');
    if (icon) icon.textContent = d.icon  || '\u26A1';
    if (name) name.textContent = d.label || 'EVENT';
    if (desc) desc.textContent = `CPS ×${d.multiplierCps} · Click ×${d.multiplierClick}`;
  }

  // Start countdown
  if (_eventTimerInterval) clearInterval(_eventTimerInterval);
  _eventTimerInterval = setInterval(() => {
    const remain = Math.max(0, Math.ceil((d.endsAt - Date.now()) / 1000));
    const el = document.getElementById('event-timer');
    if (el) el.textContent = remain + 's';
    if (remain <= 0) { clearInterval(_eventTimerInterval); _clearEvent(); }
  }, 1000);
}

function _clearEvent() {
  window._eventCpsMultiplier   = 1;
  window._eventClickMultiplier = 1;
  if (typeof recalc === 'function') recalc();
  const banner = document.getElementById('event-banner');
  if (banner) banner.style.display = 'none';
  if (_eventTimerInterval) { clearInterval(_eventTimerInterval); _eventTimerInterval = null; }
}

function _maybeFireEvent(totalClicks) {
  if (!_db) return;
  const milestone = _CLICK_MILESTONES.find(m => totalClicks >= m && !_crossedMilestones[m]);
  if (!milestone) return;
  _crossedMilestones[milestone] = true;

  // Check if an event is already active
  _db.doc('shared/events').get().then(snap => {
    if (snap.exists && snap.data().active && snap.data().endsAt > Date.now()) return;

    // Pick a random event
    const ev = _EVENT_TYPES[Math.floor(Math.random() * _EVENT_TYPES.length)];
    const now = Date.now();
    _db.doc('shared/events').set({
      active:          true,
      type:            ev.type,
      label:           ev.label,
      icon:            ev.label.split(' ')[0],
      endsAt:          now + ev.dur,
      startedAt:       now,
      multiplierCps:   ev.cps,
      multiplierClick: ev.click,
      startedBy:       _currentProfile?.username || 'island',
    }).catch(() => {});
  }).catch(() => {});
}

// ──────────────────────────────────────────────
// PRESTIGE / ISLAND ASCENSION
// ──────────────────────────────────────────────
const _ERA_THRESHOLDS = [0, 0, 1e12, 1e14, 1e16, 1e18, 1e20, 1e22, 1e24, 1e26, 1e28];

function _checkAscension(data) {
  const era       = data.era       || 1;
  const totalCoins = data.totalCoins || data.earned || 0;
  const nextEra   = era + 1;
  const threshold = _ERA_THRESHOLDS[nextEra];

  const btn = document.getElementById('ascend-btn');
  if (!btn) return;

  if (threshold && totalCoins >= threshold && _currentUser && era < 10) {
    btn.style.display = 'block';
    btn.textContent   = '⬆ ASCEND THE ISLAND (Era ' + nextEra + ')';
  } else {
    btn.style.display = 'none';
  }
}

function _updateEraBadge(era) {
  const badge = document.getElementById('era-badge');
  const num   = document.getElementById('era-num');
  if (!badge || !num) return;
  if (era && era > 1) {
    badge.style.display = 'block';
    num.textContent = era;
  } else {
    badge.style.display = 'none';
  }
  // Also update leaderboard era
  const lbEra = document.getElementById('lb-era');
  if (lbEra) lbEra.textContent = era || 1;
}

window.triggerAscension = async function() {
  if (!_currentUser) { alert('You must be logged in to trigger ascension.'); return; }
  if (!_db) return;

  const snap = await _db.doc('shared/game').get().catch(() => null);
  if (!snap) return;
  const d   = snap.data() || {};
  const era = (d.era || 1) + 1;
  if (era > 10) { alert('Maximum era reached!'); return; }

  const threshold = _ERA_THRESHOLDS[era];
  const statsSnap = await _db.doc('shared/stats').get().catch(() => null);
  const totalCoins = statsSnap?.data()?.totalCoins || 0;
  if (totalCoins < threshold) { alert('Island has not earned enough coins yet.'); return; }

  if (!confirm(`ISLAND ASCENSION to Era ${era}!\n\nThis resets ALL coins, producers and upgrades for everyone on the island.\nThe island gains a permanent ×${(1.5**era).toFixed(2)} multiplier.\n\nAre you sure?`)) return;

  const newGmult = Math.pow(1.5, era);
  try {
    await _db.doc('shared/game').set({
      coins: 0, earned: 0, clicks: 0,
      owned: {}, bought: {}, pacts: {}, gmult: newGmult, seenms: {},
      era:   era,
      lastAscendedBy: _currentProfile?.username || 'anon',
      ascendedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await _db.doc('shared/stats').update({ era });
    alert(`The island has ascended to Era ${era}! ×${newGmult.toFixed(2)} permanent bonus applied.`);
  } catch(e) {
    alert('Ascension failed: ' + e.message);
  }
};

// ──────────────────────────────────────────────
// LEADERBOARD
// ──────────────────────────────────────────────
const _LB_FIELDS = {
  earners:  { field: 'coinsEarned',  label: 'coins earned' },
  clickers: { field: 'totalClicks',  label: 'clicks' },
  feeders:  { field: 'japingusFed',  label: 'japingus fed' },
  rollers:  { field: 'totalWon',     label: 'total won' },
};

window.lbTab = function(tab, btn) {
  document.querySelectorAll('#page-leaderboard .upg-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  _loadLeaderboard(tab);
};

window._loadLeaderboard = async function(tab) {
  if (!_db) { document.getElementById('lb-list').innerHTML = '<div style="padding:20px;color:var(--dim);">Firebase not connected.</div>'; return; }
  const cfg = _LB_FIELDS[tab] || _LB_FIELDS.earners;
  const el  = document.getElementById('lb-list');
  if (!el) return;
  el.innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted);">loading...</div>';

  try {
    const snap = await _db.collection('userStats')
      .orderBy(cfg.field, 'desc')
      .limit(20)
      .get();

    const fmtFn = typeof fmt === 'function' ? fmt : (v => String(Math.floor(v)));
    const medals = ['\uD83E\uDD47','\uD83E\uDD48','\uD83E\uDD49'];
    const myUid  = _currentUser?.uid;

    el.innerHTML = snap.docs.map((doc, i) => {
      const d    = doc.data();
      const av   = AVATARS.find(a => a.id === d.avatarId) || AVATARS[0];
      const isMe = doc.id === myUid;
      const val  = d[cfg.field] || 0;
      const rank = i < 3 ? medals[i] : (i + 1);
      return `<div class="lb-row${isMe ? ' lb-me' : ''}">
        <div class="lb-rank">${rank}</div>
        <div class="lb-avatar" style="background:${av.bg};border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">${av.emoji}</div>
        <div class="lb-name">${_esc(d.username || 'anon')}${isMe ? ' <span style="color:var(--blue2);font-size:10px;">(you)</span>' : ''}</div>
        <div class="lb-val">${fmtFn(val)} <span style="font-size:10px;color:var(--muted);">${cfg.label}</span></div>
      </div>`;
    }).join('') || '<div style="padding:20px;color:var(--dim);text-align:center;">no data yet. be the first!</div>';

    // Personal stats
    if (myUid) {
      const mySnap = await _db.doc(`userStats/${myUid}`).get().catch(() => null);
      const myEl   = document.getElementById('lb-my-stats');
      if (myEl && mySnap?.exists) {
        const m = mySnap.data();
        const fN = fmtFn;
        myEl.style.display = 'block';
        myEl.innerHTML = `<div class="box-header"><span>\uD83D\uDCCA your stats</span></div>
          <div style="padding:12px 14px;display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;">
            <div>coins earned: <span style="color:var(--gold);">${fN(m.coinsEarned||0)}</span></div>
            <div>clicks: <span style="color:var(--blue2);">${fN(m.totalClicks||0)}</span></div>
            <div>japingus fed: <span style="color:var(--green);">${m.japingusFed||0}</span></div>
            <div>casino won: <span style="color:var(--gold);">${fN(m.totalWon||0)}</span></div>
            <div>biggest win: <span style="color:var(--pink);">${fN(m.biggestWin||0)}</span></div>
            <div>jackpots: <span style="color:var(--yellow);">${m.jackpotsHit||0}</span></div>
          </div>`;
      }
    }
  } catch(e) {
    el.innerHTML = `<div style="padding:20px;color:var(--red);">Error loading leaderboard: ${e.message}</div>`;
  }
};

// ──────────────────────────────────────────────
// DRIBZYBOT FEED
// ──────────────────────────────────────────────
let _dribzyUnsub = null;
let _dribzyLikes = {};
try { _dribzyLikes = JSON.parse(localStorage.getItem('tk_dribzy_likes') || '{}'); } catch(e) {}

function _relTime(ts) {
  if (!ts) return 'just now';
  const secs = Math.floor((Date.now() - (ts.toMillis ? ts.toMillis() : ts)) / 1000);
  if (secs < 60)   return secs + 's';
  if (secs < 3600) return Math.floor(secs/60) + 'm';
  if (secs < 86400)return Math.floor(secs/3600) + 'h';
  return Math.floor(secs/86400) + 'd';
}

// Text-safe escaper for innerHTML content — only escapes < > & (not quotes, which avoids &#39; mangling)
function _escT(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _renderDribzyPost(id, d, isNew) {
  const liked    = !!_dribzyLikes[id];
  const likeCount = (d.likes || 0) + (liked ? 1 : 0);
  const text = _escT(d.text || '').replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
  return `<div class="dribzy-post" id="dz-${id}">
    <div class="dribzy-avatar"><img src="dribzy.gif" alt="Dribzy"></div>
    <div class="dribzy-body">
      <div class="dribzy-header">
        <span class="dribzy-handle">Dribzybot${isNew ? '<span class="dribzy-new-badge">NEW</span>' : ''}</span>
        <span class="dribzy-at">@Dribzybot</span>
        <span class="dribzy-time">${_relTime(d.timestamp)}</span>
      </div>
      <div class="dribzy-text">${text}</div>
      ${d.headline ? `<div class="dribzy-source">↳ re: ${_escT(d.headline)}</div>` : ''}
      <div class="dribzy-footer">
        <span class="dribzy-action ${liked?'liked':''}" onclick="_dribzyLike('${id}',${d.likes||0})">♥ ${likeCount}</span>
        <span class="dribzy-action" onclick="_dribzyRepost('${id}',${d.reposts||0},this)">↩ <span class="repost-count">${d.reposts || 0}</span></span>
        ${d.topic ? `<span style="font-size:10px;color:var(--dim);">#${_escT(d.topic)}</span>` : ''}
        <a href="https://x.com/intent/tweet?text=${encodeURIComponent((d.text||'').slice(0,220))}&via=Dribzybot&url=${encodeURIComponent('https://tonykrink.com')}" target="_blank" rel="noopener" class="dribzy-action" style="margin-left:auto;text-decoration:none;" title="quote tweet this on X">\uD835\uDD4F retweet</a>
      </div>
    </div>
  </div>`;
}

window._dribzyLike = function(id, baseLikes) {
  const el = document.querySelector(`#dz-${id} .dribzy-action`);
  if (!el) return;
  if (_dribzyLikes[id]) {
    delete _dribzyLikes[id];
    el.classList.remove('liked');
    el.textContent = '♥ ' + baseLikes;
  } else {
    _dribzyLikes[id] = true;
    el.classList.add('liked');
    el.textContent = '♥ ' + (baseLikes + 1);
  }
  try { localStorage.setItem('tk_dribzy_likes', JSON.stringify(_dribzyLikes)); } catch(e) {}
};

// Repost — increments local count + opens X to quote tweet
let _dribzyReposts = {};
try { _dribzyReposts = JSON.parse(localStorage.getItem('tk_dribzy_reposts') || '{}'); } catch(e) {}

window._dribzyRepost = function(id, baseReposts, btn) {
  if (_dribzyReposts[id]) return; // already reposted this session
  _dribzyReposts[id] = true;
  try { localStorage.setItem('tk_dribzy_reposts', JSON.stringify(_dribzyReposts)); } catch(e) {}
  const countEl = btn ? btn.querySelector('.repost-count') : null;
  if (countEl) countEl.textContent = baseReposts + 1;
  btn && btn.classList.add('liked');
  // Write increment to Firestore
  if (_db) {
    _db.collection('dribzybot_posts').doc(id)
      .update({ reposts: firebase.firestore.FieldValue.increment(1) })
      .catch(() => {});
  }
};

window._loadDribzyFeed = function() {
  if (!_db) {
    // Retry once Firebase has had a chance to init
    setTimeout(() => { if (_db && !_dribzyUnsub) window._loadDribzyFeed(); }, 2000);
    return;
  }
  if (_dribzyUnsub) return; // already listening

  _dribzyUnsub = _db.collection('dribzybot_posts')
    .orderBy('timestamp', 'desc')
    .limit(30)
    .onSnapshot(snap => {
      const feed = document.getElementById('dribzy-feed');
      if (!feed) return;
      if (snap.empty) {
        feed.innerHTML = '<div style="padding:40px;text-align:center;color:var(--dim);font-size:12px;">dribzy hasn\'t posted yet. check back soon.</div>';
        return;
      }
      const changes = snap.docChanges();
      // First load — render all
      if (changes.every(c => c.type === 'added') && feed.querySelector('.dribzy-post') === null) {
        feed.innerHTML = snap.docs.map((doc, i) => _renderDribzyPost(doc.id, doc.data(), i === 0 && snap.docs.length > 0)).join('');
      } else {
        // Incremental — prepend new posts
        changes.filter(c => c.type === 'added').forEach(c => {
          feed.insertAdjacentHTML('afterbegin', _renderDribzyPost(c.doc.id, c.doc.data(), true));
          // Remove NEW badge after 8s
          setTimeout(() => {
            const b = document.querySelector(`#dz-${c.doc.id} .dribzy-new-badge`);
            if (b) b.remove();
          }, 8000);
        });
      }
    }, err => console.warn('Dribzy feed error:', err));
};

// ──────────────────────────────────────────────
// CASINO
// ──────────────────────────────────────────────
const _SYMBOLS = [
  { icon:'\uD83D\uDFE1', name:'Bajookie',        mult:2,   weight:25 },
  { icon:'\uD83E\uDD78', name:'Jerry',           mult:3,   weight:22 },
  { icon:'\uD83D\uDC3E', name:'Japingus',        mult:5,   weight:16 },
  { icon:'\uD83C\uDF47', name:'Drain Gang',      mult:8,   weight:12 },
  { icon:'\uD83D\uDCEC', name:'Newman',          mult:15,  weight:8  },
  { icon:'\uD83D\uDCA5', name:'Kramer',          mult:20,  weight:6  },
  { icon:'\uD83D\uDD73\uFE0F', name:'Void',      mult:50,  weight:3  },
  { icon:'\u2B50',       name:'BAJOOKIE JACKPOT',mult:500, weight:1  },
];

// Build weighted reel pool
function _buildReelPool() {
  const pool = [];
  _SYMBOLS.forEach(s => { for (let i = 0; i < s.weight; i++) pool.push(s); });
  return pool;
}
const _REEL_POOL = _buildReelPool();

function _spinReel() {
  return _REEL_POOL[Math.floor(Math.random() * _REEL_POOL.length)];
}

// Get current RTP modifier from japingus
function _getJapBonus() {
  if (!window._jap) return 1;
  const state = window._jap.get();
  if (!state) return 1;
  if (!state.alive) return 0.9;  // -10% RTP
  if (state.life > 70) return 1.05;  // +5% RTP
  return 1;
}

// Current casino tier based on total bets
function _getCasinoTier() {
  if (_casino.totalBets >= 1000000) return 'void';
  if (_casino.totalBets >= 10000)   return 'drain';
  return 'classic';
}

function _updateCasinoDisplay() {
  const fmtFn = typeof fmt === 'function' ? fmt : (v => String(Math.floor(v)));
  const profit = _casino.totalWon - _casino.totalWagered;

  const ids = {
    'cs-wagered': fmtFn(_casino.totalWagered),
    'cs-won':     fmtFn(_casino.totalWon),
    'cs-profit':  fmtFn(Math.abs(profit)),
    'cs-winrate': (_casino.spins > 0 ? ((_casino.wins / _casino.spins) * 100).toFixed(1) + '%' : '0%'),
    'cs-biggest': fmtFn(_casino.biggestWin),
    'cs-jackpots':_casino.jackpotsHit,
  };
  Object.entries(ids).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });

  const profitEl = document.getElementById('cs-profit');
  if (profitEl) profitEl.style.color = profit >= 0 ? 'var(--green)' : 'var(--red)';

  const freeEl = document.getElementById('free-spins-display');
  if (freeEl) freeEl.textContent = _casino.freeSpins > 0 ? '\uD83C\uDF81 free spins: ' + _casino.freeSpins : '';

  const balEl = document.getElementById('slot-balance-display');
  if (balEl) balEl.textContent = fmtFn(typeof coins !== 'undefined' ? coins : 0) + ' coins';

  // Tier display
  const tier = _getCasinoTier();
  const tierEl = document.getElementById('slot-tier-label');
  if (tierEl) tierEl.textContent = tier === 'void' ? '\uD83D\uDD73\uFE0F VOID SLOT' : tier === 'drain' ? '\uD83C\uDF47 DRAIN GANG MACHINE' : '\uD83C\uDFB0 CLASSIC SLOT';
  ['tier-classic','tier-drain','tier-void'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.color = (id === 'tier-' + tier) ? 'var(--green)' : 'var(--dim)';
    el.textContent = (id === 'tier-' + tier ? '★ ' : '☆ ') + el.textContent.replace(/^[★☆] /, '');
  });

  // Japingus bonus display
  const japBonusEl = document.getElementById('slot-jap-bonus');
  if (japBonusEl) {
    const jb = _getJapBonus();
    if (jb > 1)      japBonusEl.textContent = '\uD83D\uDC3E Japingus is thriving! +5% RTP bonus';
    else if (jb < 1) japBonusEl.textContent = '\uD83D\uDC80 Japingus is dead... the slots feel cold. -10% RTP';
    else             japBonusEl.textContent = '';
    japBonusEl.style.color = jb >= 1 ? 'var(--green)' : 'var(--red)';
  }
}

window.setBet = function(amount, btn) {
  _casino.bet = amount;
  document.querySelectorAll('.bet-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const betDisplay = document.getElementById('bet-display');
  if (betDisplay) betDisplay.textContent = amount >= 1000 ? (amount/1000) + 'K' : amount;
};

window.spinSlots = async function() {
  if (_casino.spinning) return;
  const bet    = _casino.bet;
  const isFree = _casino.freeSpins > 0;

  if (!isFree) {
    if (typeof coins === 'undefined' || coins < bet) {
      const r = document.getElementById('spin-result');
      if (r) { r.textContent = 'not enough coins!'; r.style.color = 'var(--red)'; }
      return;
    }
    // Deduct bet
    coins       -= bet;
    totalEarned  = totalEarned; // unchanged
    if (typeof updateDisplay === 'function') updateDisplay();
    _casino.totalWagered += bet;
    _casino.totalBets++;
    _casino.spins++;

    // Push to Firestore
    if (_db && _currentUser) {
      _db.doc(`userStats/${_currentUser.uid}`).update({
        totalBets:    firebase.firestore.FieldValue.increment(1),
        totalWagered: firebase.firestore.FieldValue.increment(bet),
      }).catch(() => {});
    }
    if (_db) {
      _db.doc('shared/stats').update({
        totalWagered: firebase.firestore.FieldValue.increment(bet),
      }).catch(() => {});
    }
  } else {
    _casino.freeSpins--;
    _casino.spins++;
  }

  _casino.spinning = true;
  const spinBtn = document.getElementById('spin-btn');
  if (spinBtn) spinBtn.disabled = true;

  // Animate reels
  const reels = [0,1,2].map(i => document.getElementById('reel-' + i));
  reels.forEach(r => { if (r) r.classList.add('spinning'); });

  // Pick results
  const results = [_spinReel(), _spinReel(), _spinReel()];

  // Apply RTP modifier for void/drain tiers
  const tier   = _getCasinoTier();
  const japBonus = _getJapBonus();

  // Stagger reel stops
  const stopTimes = [700, 1100, 1500];
  stopTimes.forEach((t, i) => {
    setTimeout(() => {
      if (reels[i]) {
        reels[i].classList.remove('spinning');
        reels[i].textContent = results[i].icon;
      }
    }, t);
  });

  setTimeout(() => {
    _casino.spinning = false;
    if (spinBtn) spinBtn.disabled = false;

    // Evaluate result
    const [a, b, c] = results;
    let payout = 0;
    let resultText = '';
    let isJackpot = false;
    let freeSpin = false;

    // Check for 3 match
    if (a.name === b.name && b.name === c.name) {
      if (a.name === 'BAJOOKIE JACKPOT') {
        payout = bet * a.mult * japBonus;
        isJackpot = true;
        resultText = `\u2B50 BAJOOKIE JACKPOT! \xD7${a.mult} = +${Math.floor(payout)} coins!`;
      } else {
        payout = bet * a.mult * japBonus;
        resultText = `${a.icon}${a.icon}${a.icon} ${a.name}! ×${a.mult} = +${Math.floor(payout)} coins`;
      }
      _casino.wins++;
    }
    // 2 match
    else if (a.name === b.name || b.name === c.name || a.name === c.name) {
      const matched = a.name === b.name ? a : (b.name === c.name ? b : a);
      payout = bet * matched.mult * 0.5 * japBonus;
      resultText = `${matched.icon}${matched.icon} two ${matched.name} — ×${matched.mult / 2} = +${Math.floor(payout)} coins`;
      _casino.wins++;
    }
    else {
      resultText = '— no match. try again.';
    }

    // Scatter: 3 Japingus anywhere = free spin
    const japCount = results.filter(r => r.name === 'Japingus').length;
    if (japCount >= 3) { freeSpin = true; }

    // Apply payout
    if (payout > 0) {
      payout = Math.floor(payout);
      coins       += payout;
      totalEarned += payout;
      _casino.totalWon += payout;
      if (payout > _casino.biggestWin) _casino.biggestWin = payout;
      if (typeof updateDisplay === 'function') updateDisplay();

      // Firestore: update user stats
      if (_db && _currentUser) {
        const updates = {
          totalWon:   firebase.firestore.FieldValue.increment(payout),
          biggestWin: payout, // will overwrite — not ideal but simple
        };
        if (isJackpot) {
          updates.jackpotsHit = firebase.firestore.FieldValue.increment(1);
          _casino.jackpotsHit++;
          _db.doc('shared/stats').update({
            totalJackpots: firebase.firestore.FieldValue.increment(1),
          }).catch(() => {});
        }
        _db.doc(`userStats/${_currentUser.uid}`).update(updates).catch(() => {});
      }

      // Win flash
      const machine = document.getElementById('slot-machine');
      if (machine) { machine.classList.add('win-flash'); setTimeout(() => machine.classList.remove('win-flash'), 1500); }
    }

    if (freeSpin) {
      _casino.freeSpins++;
      resultText += ' \uD83C\uDF81 FREE SPIN!';
    }

    if (isJackpot) {
      const overlay = document.getElementById('jackpot-overlay');
      const amtEl   = document.getElementById('jackpot-amount');
      if (overlay) overlay.classList.add('show');
      if (amtEl)   amtEl.textContent = '+' + payout.toLocaleString() + ' bajookie coins';
    }

    const resultEl = document.getElementById('spin-result');
    if (resultEl) {
      resultEl.textContent = resultText;
      resultEl.style.color = payout > 0 ? 'var(--gold)' : 'var(--dim)';
    }

    _updateCasinoDisplay();
  }, 1600);
};

window._initCasino = function() {
  _updateCasinoDisplay();
};

// ──────────────────────────────────────────────
// AUTH UI
// ──────────────────────────────────────────────
function _showLoginOverlay() {
  const el = document.getElementById('login-overlay');
  if (el) el.style.display = 'flex';
}

function _hideLoginOverlay() {
  const el = document.getElementById('login-overlay');
  if (el) el.style.display = 'none';
}

function _showLoginBtn() {
  const el = document.getElementById('header-login-btn');
  if (el) el.style.display = 'flex';
}

function _hideLoginBtn() {
  const el = document.getElementById('header-login-btn');
  if (el) el.style.display = 'none';
}

function _showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function _clearAuthError() {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}

function _showProfileBadge() {
  if (!_currentProfile) return;
  const av = AVATARS.find(a => a.id === _currentProfile.avatarId) || AVATARS[0];
  const el = document.getElementById('profile-badge');
  if (!el) return;
  el.style.display = 'flex';
  const emojiEl = el.querySelector('.pb-avatar');
  const nameEl  = el.querySelector('.pb-name');
  if (emojiEl) { emojiEl.textContent = av.emoji; emojiEl.style.background = av.bg; }
  if (nameEl)  nameEl.textContent = (_currentProfile.username || 'anon').toUpperCase();
}

window.authShowLogin = function() { _clearAuthError(); _showLoginOverlay(); };
window.authHideLogin = function() { _hideLoginOverlay(); };

// ──────────────────────────────────────────────
// AUTH ACTIONS
// ──────────────────────────────────────────────
window.authSwitchTab = function(tab) {
  document.getElementById('auth-login-form').style.display = tab === 'login'    ? 'block' : 'none';
  document.getElementById('auth-reg-form').style.display   = tab === 'register' ? 'block' : 'none';
  document.getElementById('auth-tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('auth-tab-reg').classList.toggle('active',   tab === 'register');
  _clearAuthError();
};

window.authLogin = async function() {
  _clearAuthError();
  const email = document.getElementById('auth-email').value.trim();
  const pass  = document.getElementById('auth-pass').value;
  if (!email || !pass) { _showAuthError('email and password required.'); return; }
  try {
    await _auth.signInWithEmailAndPassword(email, pass);
  } catch(e) {
    _showAuthError(e.message.replace('Firebase: ', '').replace(/ \(auth\/.*\)/, ''));
  }
};

window.authRegister = async function() {
  _clearAuthError();
  const email    = document.getElementById('auth-reg-email').value.trim();
  const pass     = document.getElementById('auth-reg-pass').value;
  const rawUsername = document.getElementById('auth-reg-username').value.trim();
  const username    = _sanitizeName(rawUsername, 16);
  if (!email || !pass || !rawUsername) { _showAuthError('all fields required.'); return; }
  if (rawUsername !== username) { _showAuthError('username: letters, numbers, spaces, _ - . ! only.'); return; }
  if (username.length < 2) { _showAuthError('username must be at least 2 characters.'); return; }
  try {
    const cred = await _auth.createUserWithEmailAndPassword(email, pass);
    await _db.doc(`users/${cred.user.uid}/data/profile`).set({
      username,
      avatarId:  _selectedAvatarId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch(e) {
    _showAuthError(e.message.replace('Firebase: ', '').replace(/ \(auth\/.*\)/, ''));
  }
};

window.authLogout = async function() {
  if (_japSnapUnsub)   _japSnapUnsub();
  if (_statsSnapUnsub) _statsSnapUnsub();
  if (_gameSnapUnsub)  _gameSnapUnsub();
  if (_eventsSnapUnsub) _eventsSnapUnsub();
  await _auth.signOut();
  location.reload();
};

window.authSelectAvatar = function(id) {
  _selectedAvatarId = id;
  document.querySelectorAll('.avatar-chip').forEach(el => {
    el.classList.toggle('selected', el.dataset.avatarId === id);
  });
};

// ──────────────────────────────────────────────
// AVATAR GRID
// ──────────────────────────────────────────────
function _renderAvatarGrid() {
  const grid = document.getElementById('avatar-grid');
  if (!grid) return;
  grid.innerHTML = AVATARS.map(av =>
    `<div class="avatar-chip${av.id === _selectedAvatarId ? ' selected' : ''}"
          data-avatar-id="${av.id}"
          style="background:${av.bg};"
          onclick="authSelectAvatar('${av.id}')">
      <span class="avatar-emoji">${av.emoji}</span>
      <span class="avatar-label">${av.label}</span>
    </div>`
  ).join('');
}

document.addEventListener('DOMContentLoaded', _renderAvatarGrid);
