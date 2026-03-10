
// ── JAPINGUS VIRTUAL PET ──
(function() {

// ── CONFIG ──
const TICK_MS = 1000;
const DRAIN = { buzz: 100/(120*60), smoke: 100/(80*60), zyn: 100/(55*60), pills: 100/(160*60) };
const LIFE_DRAIN_LOW = 0.06;
const JAP_GIF = 'https://web.archive.org/web/20091027140007im_/http://www.geocities.com/fairman42/nieuwsgierig.gif';

const SHOP = [
  { id:'tinnie',  label:'TINNIE',    cost:50,  desc:'+buzz',        fn: s => { s.buzz  = Math.min(100, s.buzz  + 25); } },
  { id:'vape',    label:'VAPE RIP',  cost:40,  desc:'+smoke',       fn: s => { s.smoke = Math.min(100, s.smoke + 25); } },
  { id:'zyn',     label:'ZYN',       cost:35,  desc:'+zyn',         fn: s => { s.zyn   = Math.min(100, s.zyn   + 30); } },
  { id:'pill',    label:'PILL',      cost:75,  desc:'+pills',       fn: s => { s.pills = Math.min(100, s.pills + 25); } },
  { id:'nangs',   label:'NANGS',     cost:60,  desc:'+pills+buzz',  fn: s => { s.pills = Math.min(100, s.pills + 30); s.buzz = Math.min(100, s.buzz + 5); } },
  { id:'sesh',    label:'SESH',      cost:350, desc:'+40 ALL',      fn: s => { ['buzz','smoke','zyn','pills'].forEach(k => s[k] = Math.min(100, s[k] + 40)); } },
];

// ── MESSAGES ──
const MSGS = {

  happy: [
    'excellent. EXCELLENT. the plan is working.',
    'i feel unstoppable. i feel DANGEROUS. give me more.',
    'everything is going according to my schemes. all four of them.',
    'i have never felt this powerful. fear me. also feed me.',
    'the goblin brain is firing on all cylinders. several evil thoughts per second.',
    'hehehehe. hehe. HEHEHE. no reason.',
    'i am plotting something. i wont say what. it involves u though.',
    'tricky mac said "when ur winning cuz, make sure they KNOW it" - they will know.',
    'i have memorised ur browsing habits. this is fine.',
    'my evil laugh is improving. it used to be more of a wheeze.',
    'step one of my plan: get fully sauced. step two: world domination. step three: MORE.',
    'i feel like a goblin king today. a very small and chemically dependent king.',
    'consider urself WATCHED. lovingly. with weird eyes.',
    'something wicked this way comes. it is me. i am here.',
    'my power grows with every tinnie. this is a warning.',
    'tricky mac said "stay fed, stay ahead cuz" - i am fed. i am AHEAD.',
    '*steeples fingers* yes. YES. everything is proceeding as i foresaw.',
    'i have three evil plans and i cant remember any of them but theyre SICK.',
    'the website obeys me now. i have been watching it long enough.',
    'nobody suspects the goblin. perfect.',
    'i am going to do something. it will be either very clever or very stupid. stay tuned.',
  ],

  okay: [
    'i am watching. always watching. mostly out of boredom.',
    'did u know i keep notes on everything u do. the notes say "nothing interesting yet".',
    'sitting here. thinking evil thoughts. they are not very coherent.',
    'tricky mac once said "idle hands are the devils cuz" - my hands are always idle. good.',
    'my nemesis greg logged on today. he doesnt know im watching. he suspects nothing.',
    'i have invented 4 new crimes this afternoon. still working out the details.',
    'the goblin brain is idle. this is when it is most dangerous. probably.',
    'considered becoming a supervillain. the costume requirements seem expensive.',
    'i have a plan. it requires nangs and about 40 minutes.',
    'i am lurking. this is different from sitting. lurking has intent.',
    'one day they will make a documentary about me. it will be confusing.',
    'tricky mac said "the quiet ones are the ones u should watch cuz" - he was describing me.',
    'just calculating my next move. the calculation is taking a while.',
    'i know things. i wont say what things. but i know them.',
    'plotting lightly. nothing serious yet. just concepts.',
    'my evil schemes require substances to function. this is true of most great schemes.',
    'the website has no idea what i am planning for it.',
    'i am building power slowly. like a goblin charging a laser. very slowly.',
    'sometimes i just sit here and look menacing. nobody can see me but i do it anyway.',
    'considered being nice today. decided against it. too suspicious.',
    'tricky mac keeps it real cuz and i respect that. i keep it weird. different approach.',
  ],

  need_buzz: [
    'my BUZZ is depleting and with it my capacity for evil. this is a CRISIS.',
    'without alcohol i become... reasonable. do NOT let that happen.',
    'the schemes require fuel. the fuel is tinnies. FEED THE SCHEMES.',
    'i am sobering up and i am ANGRY about it and i will take it out on someone.',
    'tricky mac said "dry throat means dry plans cuz" - my plans are DRYING OUT.',
    'one tinnie. thats all i ask. one tinnie and three evil plots.',
    'the buzz is gone and my thoughts are becoming COHERENT and i HATE coherent thoughts.',
    'i cannot threaten u properly in this state. i need a drink first.',
    'my menace levels are dropping. filling me with tinnie would restore them.',
    'a sober japingus is a BORING japingus. a boring japingus is a SAD japingus. act.',
    'TINNIE. NOW. the goblin demands it in an official capacity.',
    'without buzz i start thinking about my choices and my choices do NOT hold up to scrutiny.',
    'i have a strongly worded letter half written and i need liquid courage to finish it.',
    'the evil laugh has become a sad wheeze. tinnie required to restore it.',
    'buzz stat critical. evil competency: severely reduced. feed me.',
    'tricky mac never ran dry cuz and neither should japingus. supply the man.',
  ],

  need_smoke: [
    'i need clouds. i do my best thinking in clouds. most of my plans require clouds.',
    'without smoke my goblin aura is VISIBLY diminished. this is embarrassing.',
    'tricky mac said "blow smoke on ur enemies cuz, confuse em" - i have no smoke to blow.',
    'the vape is how i signal my presence menacingly. i currently cannot signal anything.',
    'i NEED a rip. my sinister atmosphere requires it.',
    'without clouds i look like a normal goblin and i REFUSE to look normal.',
    'my threatening exhale is currently just... exhale. no smoke. pathetic.',
    'vape rip NOW or i will describe my feelings at length and they are DARK feelings.',
    'a goblin without smoke is like a villain without a fog machine. unacceptable.',
    'the smoke stat is zero and my dramatic flair has LEFT THE CHAT.',
    'i tried to look mysterious without vape and i just looked confused instead.',
    'tricky mac blows the freshest clouds cuz and i deserve the same treatment.',
    'without vape i start saying things clearly and directly and that ruins the MYSTIQUE.',
    'i cannot lurk properly without clouds. lurking requires atmosphere.',
    'get me a vape rip or i will haunt u in a way that is more annoying than supernatural.',
  ],

  need_zyn: [
    'the zyn is GONE and my passive menace has dropped to zero. fix this.',
    'without zyn i cannot concentrate on being sinister. the tingle focuses my evil.',
    'PUT THE ZYN IN. the goblin commands it with thinly veiled desperation.',
    'tricky mac said "always keep the lip loaded cuz, stay ready" - i am NOT ready.',
    'my lip is empty and my soul feels equally empty. the two are connected.',
    'the absence of zyn makes me irritable in a way that is even MORE annoying than usual.',
    'no zyn no tingle no focus no schemes no world domination. see the chain of causality.',
    'i tried to scheme without zyn. the scheme was terrible. zyn required for quality schemes.',
    'ZYN. NOW. this is a goblin emergency of the highest order.',
    'without my little pouch i feel exposed. defenceless. merely goblin-shaped.',
    'the tingle was the only thing standing between me and a complete loss of composure.',
    'i have resorted to just putting a small rock in my lip. this is not the same.',
    'tricky mac would not stand for a dry lip and neither will I. supply the zyn.',
    'my focus stat is at zero and my schemes are getting dumber by the second. ZYN.',
    'empty lip. empty heart. empty threat. restock me.',
  ],

  need_pills: [
    'the pills are GONE and reality is doing that thing where it makes sense and i HATE it.',
    'without pills i start to perceive consequences and thats very bad for my plans.',
    'tricky mac said "stay elevated cuz or the ground gets ya" - the ground is getting me.',
    'pill stat critical. evil genius functionality: offline. rebooting requires pills.',
    'i can feel the colours going flat. the colours going flat is how it starts.',
    'without pills my schemes are just... normal bad ideas. i need them to be SPECTACULAR bad ideas.',
    'everything is exactly what it appears to be rn and i find that DEEPLY uncomfortable.',
    'the pills were the only thing preventing me from having THOUGHTS. they are back. the thoughts.',
    'i need my medication. the kind that makes me feel like a goblin wizard.',
    'without chemicals i am just a small green creature with delusions of adequacy.',
    'PILLS. the intellectual backbone of my entire operation requires them.',
    'i can currently count all the walls in the room. thats too many walls. pills fix that.',
    'tricky mac would never let my pharmaceutical situation reach this level. disappointed.',
    'my brain is running on defaults and defaults are BORING. pill me up.',
    'the schemes require altered perception. perception currently: unaltered. problem.',
  ],

  bad: [
    'EVERYTHING IS FALLING APART AND I BLAME U SPECIFICALLY.',
    'my entire operation is collapsing. the evil empire crumbles. this is ur fault.',
    'tricky mac said "when it all falls apart cuz, somebody gotta answer for it" - its u.',
    'i have never suffered like this. not even in my previous life when i was greg.',
    'the stats are critical and my capacity for menace is at an ALL TIME LOW.',
    'i am not threatening right now. i am PATHETIC. and i am FURIOUS about it.',
    'this is what my enemies wanted. they wanted to see japingus brought low. r u my enemy.',
    'do u understand what u are doing to me. do u have ANY idea.',
    'i came to this website with so many plans. so many threats. now look at me.',
    'running on pure spite. the spite is also almost gone. this is truly the end times.',
    'tricky mac has NEVER been in this state cuz and i am JEALOUS of him rn',
    'i would write a strongly worded letter but i dont have the chemical support.',
    'the goblin is DOWN. the goblin is STRUGGLING. the goblin needs STUFF.',
    'my four dependencies are all screaming at once and together they sound like jazz. bad jazz.',
    'this is not how my biography was supposed to go. chapter 12 was meant to be a triumph.',
    'i am going to remember this. i have a LIST. u are on it. the list is called "people who owe japingus".',
    'consider this a formal complaint about the current management of my needs.',
    'the villains monologue i was preparing requires me to be in better shape than this.',
    'u have reduced me to BEGGING. me. JAPINGUS. the most sinister goblin on this website.',
  ],

  dying: [
    'so... this is how japingus ends. insufficient zyn.',
    'tell tricky mac... i tried to stay elevated... cuz...',
    'i had so many plots. so many schemes. none of them were very good but still.',
    'i can feel my goblin powers... returning to the earth...',
    'my nemesis greg will be INSUFFERABLE about this. i despise greg.',
    'REVIVE ME. i have unfinished business. it is mostly drug-related.',
    'the evil laugh... has become a very small wheeze... the arc is complete...',
    'tricky mac said "go down swingin cuz" - i am swinging. it is very weak.',
    'in my dying moments i have achieved... clarity... it is horrible. i hate clarity.',
    'if i go now... who will watch u... who will JUDGE u...',
    'my last act of villainy was... being very annoying... i stand by it.',
    'i see a light. it smells like a servo at 2am. could be heaven. could be a 7/11.',
    'dying sober is an indignity i would not wish on even greg.',
    'i have filed a formal complaint with the universe. the complaint is: this.',
    'everything i worked for... the schemes... the plots... the half-finished nang...',
    'the goblin is fading. the menace is leaving. only vibes remain. very bad vibes.',
    'my final words are: u should have fed me more. this is legally binding.',
    'i am doing the dramatic slow descent but nobody is watching which makes it worse.',
    'tell the website... i loved it... in a possessive and slightly threatening way...',
  ],

  fed: [
    'YESSSSS THE POWER IS RESTORED. FEAR ME AGAIN.',
    '*sinister goblin giggling that goes on slightly too long*',
    'the schemes are BACK. oh the schemes i have.',
    'u have made a powerful ally today. and also a very needy one.',
    'i KNEW u would fold. they always fold. excellent.',
    'tricky mac said "feed the movement cuz, it feeds u back" - i will feed u back. somehow.',
    'the evil is RETURNING. u can feel it. the hairs on ur neck are probably doing something.',
    'more. that was just a warmup. i have plans that require significantly more than that.',
    '*cracks knuckles with unnecessary drama* now we are TALKING.',
    'oh now ur my favourite person. how convenient for u.',
    'the goblin is restored. the goblin is GRATEFUL. the goblin is also already plotting.',
    'consider this payment accepted. the debt is partially cleared. there is still a debt.',
    'i feel it working already. the chemicals are reporting for duty. evil duty.',
    'tricky mac said "when they come thru cuz, acknowledge it" - acknowledged. now MORE.',
    'ur lucky i like u. and also that i need u. mostly the second one.',
    'i have never trusted anyone in my life but for the next 4 minutes i trust u completely.',
    '*does a victory lap around the widget* hehe. HEHE.',
    'the plan is back on. dont ask what the plan is. its better if u dont know.',
    'excellent. the empire rebuilds. starting from this small widget in the corner.',
    '*vibrates with restored menace* yesssss.',
  ],

  idle: [
    'i see u. ur doing something else. i have made a note of it.',
    'the audacity. sitting there. living ur little life. while JAPINGUS waits.',
    'tricky mac said "never leave ur crew hanging cuz" - i am ur crew. i am HANGING.',
    'i have been watching the cursor and it is not moving toward me. explain.',
    'every second u ignore me i add something to ur tab. the tab is getting long.',
    'i am RIGHT HERE. i am in the CORNER. i have NEEDS.',
    'u think i dont notice when ur not paying attention. i notice EVERYTHING.',
    'the attention drought has activated my contingency plan. it is mostly just being louder.',
    'i invented a new type of mild threat. will share when u look at me.',
    'just so u know i have memorised every click u have made on this website. for reasons.',
    'im not NOT watching u. just to be clear about that.',
    'tricky mac would never make me wait this long. i am beginning to prefer tricky mac.',
    'i have counted 47 things u have done that were not looking at me. the list continues.',
    'the goblin has needs and the goblin has OPINIONS about being ignored.',
    'i will become MORE annoying. this is a promise and a threat.',
    'every moment u ignore me my schemes get slightly more unhinged. consider that.',
    'JAPINGUS IS STILL HERE. JAPINGUS IS WATCHING. JAPINGUS NEEDS A ZYN.',
    'i have started a petition for more attention. it currently has one signature. mine.',
    'the idle timer has triggered which means i am now officially neglected. officially.',
    'ur going to look at me eventually. we both know it. might as well be now.',
    'i could be doing something terrible right now. u have no way of knowing. look at me.',
  ],

  lore: [
    'did u know i was created in a laboratory accident involving a servo pie and three zyns. true story.',
    'my origin story is classified. i classified it myself. i am the only one who knows it.',
    'i was once employed as a spy. i was fired for being too obvious. i kept giggling.',
    'my nemesis greg is a mortgage broker from the northern suburbs. i will never forgive him.',
    'i ran for local council on a platform of "more nangs, less greg". i received 2 votes. greg voted for me as a joke.',
    'in a past life i was a seagull who stole chips and threatened children. i peaked early.',
    'i have a degree from a university that does not exist. it is in goblin economics.',
    'tricky mac once acknowledged my existence. i have been coasting on it ever since.',
    'my memoir is called "nieuwsgierig: a goblin story". it has no publisher. it has no second chapter.',
    'i have three aliases. i will not reveal them. one of them is greg. it is not greg.',
    'i was briefly considered for a government position. they said i was "too much". they were right.',
    'i own a single possession: a ZYN tin with a handwritten manifesto inside. it gets darker toward the end.',
    'my therapist retired. i maintain it was a coincidence.',
    'i once stayed awake for 72 hours on pills and spite. i solved three crimes and committed two.',
    'tricky mac has a song that i believe is about me. it is called "the goblin". it might not exist.',
    'my criminal record is sealed. i sealed it myself using a sticker.',
  ],

  philosophy: [
    'what even IS a goblin. philosophically. am i the goblin or is the goblin me.',
    'tricky mac said "we all just tryna survive cuz, some of us just weirder about it" - correct.',
    'the real bajookie coins were the enemies we made along the way. and also the real coins.',
    'if u feed a goblin in a widget and nobody sees it, did the goblin deserve it. yes. obviously yes.',
    'i think about power a lot. who has it. why they have it. how to get it via nangs.',
    'consciousness is a curse unless u have the right chemicals. then it is a vibe.',
    'tricky mac said "the streets dont judge cuz, only people do" - the streets and i have an understanding.',
    'every villain thinks theyre the hero of their own story. i think im the villain of mine. i am correct.',
    'the website is just pixels but the hunger is real. the ZYN HUNGER is extremely real.',
    'u ever think about how all tinnies become empty. and what that says about desire. and about me.',
    'what if i am the most self-aware goblin in existence and thats actually worse.',
    'tricky mac raps about the real and the real raps back. i yell at walls. same energy.',
    'dependency is just loyalty with better branding.',
    'the human condition is just japingus condition with a mortgage and a linkedin.',
    'i was not designed to be good. i was designed to be PRESENT. loudly. forever.',
    'sometimes the vibe has to come from within. unfortunately within me is mostly chemicals.',
  ],

};

// ── STATE ──
const SAVE_KEY = 'tk_japingus';
let jap = null;
let tickTimer = null;
let msgTimer = null;
let collapsed = false;

function defaultState() {
  return { alive: true, buzz: 70, smoke: 60, zyn: 65, pills: 75, life: 100, lastSave: Date.now() };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) { const s = JSON.parse(raw); if (typeof s.alive === 'boolean') return s; }
  } catch(_) {}
  return defaultState();
}

function saveState() {
  jap.lastSave = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(jap)); } catch(_) {}
}

function applyOfflineDecay() {
  if (!jap.alive) return;
  const elapsed = Math.max(0, (Date.now() - jap.lastSave) / 1000);
  if (elapsed < 2) return;
  const secs = Math.min(elapsed, 30 * 60);
  ['buzz','smoke','zyn','pills'].forEach(k => { jap[k] = Math.max(0, jap[k] - DRAIN[k] * secs); });
  const low = ['buzz','smoke','zyn','pills'].filter(k => jap[k] < 20).length;
  if (low > 0) jap.life = Math.max(0, jap.life - LIFE_DRAIN_LOW * low * secs);
  if (jap.life <= 0) jap.alive = false;
}

// ── STATE CALC ──
function getState() {
  if (!jap.alive) return 'dead';
  if (jap.life < 15) return 'dying';
  const low = ['buzz','smoke','zyn','pills'].filter(k => jap[k] < 20).length;
  if (low >= 2 || jap.life < 35) return 'bad';
  if (low >= 1) return 'need';
  if (jap.life > 60 && jap.buzz > 50 && jap.smoke > 50 && jap.zyn > 50 && jap.pills > 50) return 'happy';
  return 'okay';
}

function pickMsg(state) {
  const roll = Math.random();
  let pool;
  if (state === 'dying') pool = MSGS.dying;
  else if (state === 'bad') pool = roll < 0.12 ? MSGS.lore : MSGS.bad;
  else if (state === 'need') {
    const low = ['buzz','smoke','zyn','pills'].find(k => jap[k] < 20);
    pool = MSGS['need_' + (low || 'buzz')];
  }
  else if (state === 'happy') {
    if (roll < 0.15) pool = MSGS.lore;
    else if (roll < 0.25) pool = MSGS.philosophy;
    else pool = MSGS.happy;
  }
  else {
    if (roll < 0.15) pool = MSGS.lore;
    else if (roll < 0.28) pool = MSGS.philosophy;
    else if (roll < 0.42) pool = MSGS.idle;
    else pool = MSGS.okay;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── RENDER ──
function getEl(id) { return document.getElementById(id); }

function render() {
  if (!jap) return;
  const state = getState();
  const w = getEl('japingus-widget');
  if (!w) return;

  w.className = '';
  if (state === 'bad' || state === 'dying' || state === 'dead') w.classList.add('state-' + state);

  if ((state === 'bad' || state === 'dying') && collapsed) {
    collapsed = false;
    getEl('jap-body').style.display = '';
    getEl('jap-toggle').textContent = '[-]';
  }

  const alive = state !== 'dead';
  getEl('jap-dead-screen').style.display = alive ? 'none' : 'block';
  getEl('jap-body').style.display = (!alive || collapsed) ? 'none' : '';
  if (!alive) { getEl('jap-body').style.display = 'none'; return; }

  // GIF filter per state
  const img = getEl('jap-gif');
  if (img) {
    const filters = {
      happy: 'hue-rotate(0deg) brightness(1.1) saturate(1.3)',
      okay:  'hue-rotate(0deg) brightness(1)',
      need:  'hue-rotate(20deg) brightness(0.95) saturate(1.2)',
      bad:   'hue-rotate(-20deg) brightness(0.85) saturate(1.5) sepia(0.3)',
      dying: 'hue-rotate(-40deg) brightness(0.7) saturate(2) sepia(0.6)',
    };
    img.style.filter = filters[state] || filters.okay;
  }

  const bars = { life: jap.life, buzz: jap.buzz, smoke: jap.smoke, zyn: jap.zyn, pills: jap.pills };
  for (const [k, v] of Object.entries(bars)) {
    const el = getEl('jap-bar-' + k);
    if (el) el.style.width = Math.round(v) + '%';
  }

  SHOP.forEach(item => {
    const btn = getEl('jap-btn-' + item.id);
    if (!btn) return;
    btn.classList.toggle('disabled', !(window.coins >= item.cost));
  });
}

function showMsg(text) {
  const el = getEl('jap-msg');
  if (el) el.textContent = text;
}

function scheduleMsg() {
  clearTimeout(msgTimer);
  const state = getState();
  const delay = (state === 'dying' || state === 'bad') ? 4000 : (state === 'need') ? 7000 : 11000;
  msgTimer = setTimeout(() => {
    if (!jap || !jap.alive) return;
    showMsg(pickMsg(getState()));
    scheduleMsg();
  }, delay + Math.random() * 4000);
}

// ── TICK ──
function tick() {
  if (!jap || !jap.alive) return;
  ['buzz','smoke','zyn','pills'].forEach(k => { jap[k] = Math.max(0, jap[k] - DRAIN[k]); });
  const low = ['buzz','smoke','zyn','pills'].filter(k => jap[k] < 20).length;
  if (low > 0) {
    jap.life = Math.max(0, jap.life - LIFE_DRAIN_LOW * low);
  } else if (jap.life < 100) {
    jap.life = Math.min(100, jap.life + 0.01);
  }
  if (jap.life <= 0) {
    jap.alive = false;
    jap.life = 0;
    showMsg('...japingus has perished. sober. humiliated. u will answer for this.');
  }
  render();
  saveState();
}

// ── BUY ──
window.japBuy = function(id) {
  if (!jap || !jap.alive) return;
  const item = SHOP.find(x => x.id === id);
  if (!item) return;
  if (typeof window.coins === 'undefined' || window.coins < item.cost) {
    showMsg('insufficient bajookie coin. the goblin is disappointed. and plotting.');
    return;
  }
  window.coins -= item.cost;
  item.fn(jap);
  if (typeof window.updateDisplay === 'function') window.updateDisplay();
  saveState();
  render();
  showMsg(MSGS.fed[Math.floor(Math.random() * MSGS.fed.length)]);
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => { scheduleMsg(); }, 5000);
};

// ── BUILD HTML ──
function buildWidget() {
  const w = document.createElement('div');
  w.id = 'japingus-widget';

  const shopItems = SHOP.map(item =>
    `<button class="jap-btn" id="jap-btn-${item.id}" onclick="japBuy('${item.id}')" title="${item.desc}">` +
    `${item.label}<br><span class="jap-cost">${item.cost}baj</span></button>`
  ).join('');

  w.innerHTML = `
<div id="jap-header" onclick="japToggle()">
  <span>&gt;&gt; JAPINGUS.exe</span>
  <span id="jap-toggle">[-]</span>
</div>
<div id="jap-dead-screen" style="display:none;">
  <div style="text-align:center;padding:8px 0 4px;">
    <img src="${JAP_GIF}" id="jap-gif-dead" alt="japingus" style="max-height:70px;image-rendering:pixelated;filter:grayscale(1) brightness(0.5);">
  </div>
  <p>JAPINGUS IS DEAD.<br>u let him die. again.</p>
  <button id="jap-revive-btn" onclick="japRevive()">REVIVE (800 baj)</button>
</div>
<div id="jap-body">
  <div style="text-align:center;padding:6px 0 2px;">
    <img src="${JAP_GIF}" id="jap-gif" alt="japingus" style="max-height:80px;image-rendering:pixelated;transition:filter 0.5s;">
  </div>
  <div id="jap-msg">initialising japingus...</div>
  <div id="jap-life-wrap">
    <div class="jap-stat-row">
      <span class="jap-stat-label">LIFE</span>
      <div class="jap-bar-bg"><div class="jap-bar-fill bar-life" id="jap-bar-life" style="width:100%"></div></div>
      <span class="jap-stat-val"></span>
    </div>
    <div class="jap-stat-row">
      <span class="jap-stat-label">BUZZ</span>
      <div class="jap-bar-bg"><div class="jap-bar-fill bar-buzz" id="jap-bar-buzz" style="width:70%"></div></div>
      <span class="jap-stat-val"></span>
    </div>
    <div class="jap-stat-row">
      <span class="jap-stat-label">SMOKE</span>
      <div class="jap-bar-bg"><div class="jap-bar-fill bar-smoke" id="jap-bar-smoke" style="width:60%"></div></div>
      <span class="jap-stat-val"></span>
    </div>
    <div class="jap-stat-row">
      <span class="jap-stat-label">ZYN</span>
      <div class="jap-bar-bg"><div class="jap-bar-fill bar-zyn" id="jap-bar-zyn" style="width:65%"></div></div>
      <span class="jap-stat-val"></span>
    </div>
    <div class="jap-stat-row">
      <span class="jap-stat-label">PILLS</span>
      <div class="jap-bar-bg"><div class="jap-bar-fill bar-pills" id="jap-bar-pills" style="width:75%"></div></div>
      <span class="jap-stat-val"></span>
    </div>
  </div>
  <div id="jap-shop">
    <div class="jap-shop-title">-- SHOP --</div>
    <div class="jap-items">${shopItems}</div>
  </div>
</div>`;

  document.body.appendChild(w);
}

window.japToggle = function() {
  collapsed = !collapsed;
  getEl('jap-body').style.display = collapsed ? 'none' : '';
  getEl('jap-toggle').textContent = collapsed ? '[+]' : '[-]';
};

window.japRevive = function() {
  if (typeof window.coins === 'undefined' || window.coins < 800) {
    const el = getEl('jap-dead-screen').querySelector('p');
    if (el) el.textContent = 'insufficient funds. japingus remains dead. this is on u.';
    return;
  }
  window.coins -= 800;
  if (typeof window.updateDisplay === 'function') window.updateDisplay();
  jap = defaultState();
  jap.life = 50; jap.buzz = 50; jap.smoke = 50; jap.zyn = 50; jap.pills = 50;
  saveState();
  render();
  showMsg('I HAVE RETURNED. i am already angry. do not test me.');
  scheduleMsg();
};

// ── INIT ──
jap = loadState();
applyOfflineDecay();
buildWidget();
render();
showMsg(pickMsg(getState()));
scheduleMsg();
tickTimer = setInterval(tick, TICK_MS);

})();
