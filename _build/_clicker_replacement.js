// ═══════════════════════════════════════════════
// CLICKER DATA
// ═══════════════════════════════════════════════
const PRODS = [
  {id:'p1', icon:'👆', name:'Clicking Finger',     base:15,        cps:0.1  },
  {id:'p2', icon:'💧', name:'Yung Lean Teardrop',  base:100,       cps:1    },
  {id:'p3', icon:'🍶', name:'Drain Gang Goblet',   base:500,       cps:5    },
  {id:'p4', icon:'📼', name:'Bajookie VHS Tape',   base:2000,      cps:12   },
  {id:'p5', icon:'☁️', name:'Sad Cloud Server',    base:7000,      cps:25   },
  {id:'p6', icon:'🛋️', name:"Homer's Couch",       base:20000,     cps:50   },
  {id:'p7', icon:'🌐', name:'Geocities Host',      base:75000,     cps:100  },
  {id:'p8', icon:'🌫️', name:'Island Mist Machine', base:200000,    cps:250  },
  {id:'p9', icon:'🏝️', name:'Island Resort',       base:666000,    cps:600  },
  {id:'p0', icon:'🕳️', name:'The Void',            base:5000000,   cps:2000 },
];

const BOOSTS = [
  {id:'c1', icon:'🧤', name:'Rubber Gloves',    desc:'×5 click power',           cost:500,        type:'click', mult:5,  prod:null, reqN:null, req:null,  reqTotal:null},
  {id:'c2', icon:'🥊', name:'Power Fist',       desc:'×10 click power',          cost:25000,      type:'click', mult:10, prod:null, reqN:null, req:'c1',  reqTotal:null},
  {id:'c3', icon:'💎', name:'Bajookie Crystal', desc:'×25 click power',          cost:500000,     type:'click', mult:25, prod:null, reqN:null, req:'c2',  reqTotal:null},
  {id:'c4', icon:'🔮', name:'Void Shard',       desc:'×50 click power',          cost:50000000,   type:'click', mult:50, prod:null, reqN:null, req:'c3',  reqTotal:null},
  {id:'b1a',icon:'👆', name:'Double Tap',       desc:'Clicking Fingers ×2',      cost:100,        type:'prod',  mult:2,  prod:'p1', reqN:1,   req:null,  reqTotal:null},
  {id:'b1b',icon:'👆', name:'Rapid Fire',       desc:'Clicking Fingers ×5',      cost:2000,       type:'prod',  mult:5,  prod:'p1', reqN:10,  req:null,  reqTotal:null},
  {id:'b2a',icon:'💧', name:'Drip Harder',      desc:'Teardrops ×2',             cost:1000,       type:'prod',  mult:2,  prod:'p2', reqN:1,   req:null,  reqTotal:null},
  {id:'b2b',icon:'💧', name:'Ocean of Lean',    desc:'Teardrops ×5',             cost:10000,      type:'prod',  mult:5,  prod:'p2', reqN:10,  req:null,  reqTotal:null},
  {id:'b3a',icon:'🍶', name:'Purple Haze',      desc:'Goblets ×2',               cost:5000,       type:'prod',  mult:2,  prod:'p3', reqN:1,   req:null,  reqTotal:null},
  {id:'b3b',icon:'🍶', name:'Drain King',       desc:'Goblets ×5',               cost:50000,      type:'prod',  mult:5,  prod:'p3', reqN:10,  req:null,  reqTotal:null},
  {id:'b4a',icon:'📼', name:'Rewind',           desc:'VHS Tapes ×2',             cost:20000,      type:'prod',  mult:2,  prod:'p4', reqN:1,   req:null,  reqTotal:null},
  {id:'b4b',icon:'📼', name:'Hi-Fi Bajookie',   desc:'VHS Tapes ×5',             cost:200000,     type:'prod',  mult:5,  prod:'p4', reqN:10,  req:null,  reqTotal:null},
  {id:'b5a',icon:'☁️', name:'Storm Front',      desc:'Cloud Servers ×2',         cost:70000,      type:'prod',  mult:2,  prod:'p5', reqN:1,   req:null,  reqTotal:null},
  {id:'b5b',icon:'☁️', name:'The Mist',         desc:'Cloud Servers ×5',         cost:700000,     type:'prod',  mult:5,  prod:'p5', reqN:10,  req:null,  reqTotal:null},
  {id:'b6a',icon:'🛋️', name:'Snack Stockpile',  desc:"Homer's Couches ×2",       cost:200000,     type:'prod',  mult:2,  prod:'p6', reqN:1,   req:null,  reqTotal:null},
  {id:'b6b',icon:'🛋️', name:'Never Leave',      desc:"Homer's Couches ×5",       cost:2000000,    type:'prod',  mult:5,  prod:'p6', reqN:10,  req:null,  reqTotal:null},
  {id:'b7a',icon:'🌐', name:'Web 2.0',          desc:'Geocities Hosts ×2',       cost:750000,     type:'prod',  mult:2,  prod:'p7', reqN:1,   req:null,  reqTotal:null},
  {id:'b7b',icon:'🌐', name:'GeoBajookie Pro',  desc:'Geocities Hosts ×5',       cost:7500000,    type:'prod',  mult:5,  prod:'p7', reqN:10,  req:null,  reqTotal:null},
  {id:'b8a',icon:'🌫️', name:'Mist Expansion',   desc:'Mist Machines ×2',         cost:2000000,    type:'prod',  mult:2,  prod:'p8', reqN:1,   req:null,  reqTotal:null},
  {id:'b8b',icon:'🌫️', name:'Island Fog',       desc:'Mist Machines ×5',         cost:20000000,   type:'prod',  mult:5,  prod:'p8', reqN:10,  req:null,  reqTotal:null},
  {id:'b9a',icon:'🏝️', name:'5-Star Resort',    desc:'Island Resorts ×2',        cost:6660000,    type:'prod',  mult:2,  prod:'p9', reqN:1,   req:null,  reqTotal:null},
  {id:'b9b',icon:'🏝️', name:'Bajookie Tourism', desc:'Island Resorts ×5',        cost:66600000,   type:'prod',  mult:5,  prod:'p9', reqN:10,  req:null,  reqTotal:null},
  {id:'b0a',icon:'🕳️', name:'Void Tap',         desc:'The Void ×2',              cost:50000000,   type:'prod',  mult:2,  prod:'p0', reqN:1,   req:null,  reqTotal:null},
  {id:'b0b',icon:'🕳️', name:'Bajookie Abyss',   desc:'The Void ×5',              cost:500000000,  type:'prod',  mult:5,  prod:'p0', reqN:10,  req:null,  reqTotal:null},
  {id:'g1', icon:'🌴', name:'Island Alignment', desc:'All producers ×1.5',        cost:1000000,    type:'global',mult:1.5,prod:null, reqN:null, req:null,  reqTotal:50 },
  {id:'g2', icon:'🌊', name:'Bajookie Tide',    desc:'All producers ×3',          cost:1000000000, type:'global',mult:3,  prod:null, reqN:null, req:null,  reqTotal:200},
];

const PACTS = [
  {
    id:'pac1', icon:'📬', name:"Newman's Contract",
    desc:"Newman takes over island logistics. All passive CPS ×5 permanently. In exchange, your click power is permanently divided by 10. Newman takes his cut.",
    warn:"⚠ PERMANENT: Click power ÷10. Conflicts with The George Gambit.",
    cost:10000, conflicts:['pac2'], prereq:null,
  },
  {
    id:'pac2', icon:'🥸', name:'The George Gambit',
    desc:"Start lying. Tell everyone you're a bajookie magnate. Clicks become ×10 more powerful. But your passive generators, embarrassed by the association, produce 80% less.",
    warn:"⚠ PERMANENT: All passive CPS ×0.2. Conflicts with Newman's Contract.",
    cost:5000, conflicts:['pac1'], prereq:null,
  },
  {
    id:'pac3', icon:'🌀', name:'Drain Gang Induction',
    desc:"You are now in the gang. All passive production ×3 globally. The rules: you may never own more than 10 of any single producer going forward. Existing counts above 10 stay.",
    warn:"⚠ PERMANENT: Each producer hard-capped at 10 from this point forward.",
    cost:50000, conflicts:[], prereq:null,
  },
  {
    id:'pac4', icon:'📺', name:"Homer's Bargain",
    desc:"Trade your dignity for double passive income. The tick rate of all generators is permanently doubled. The cost: the displayed coin count will quietly lie to you at random.",
    warn:"⚠ PERMANENT: Passive income ×2. Coin display becomes untrustworthy.",
    cost:100000, conflicts:[], prereq:null,
  },
  {
    id:'pac5', icon:'🕳️', name:'The Void Pact',
    desc:"Offer your entire production to the Void. ALL producers reset to zero. In return you receive a permanent ×10 global multiplier on all future production and click power — forever. Your coins remain untouched.",
    warn:"⚠ IRREVERSIBLE: All producers reset to 0. Gain permanent ×10 everything.",
    cost:1000000, conflicts:[], prereq:{prod:'p0', n:5},
  },
];

const MILESTONES = [
  {at:100,     label:'100 bajookie · the journey begins'},
  {at:1000,    label:'1K · yung lean approves'},
  {at:10000,   label:'10K · the mist thickens'},
  {at:100000,  label:'100K · you are becoming island'},
  {at:1000000, label:'1M · george is humiliated'},
  {at:1e9,     label:'1B · newman is furious'},
  {at:1e12,    label:'1T · the void acknowledges you'},
  {at:1e15,    label:'1Qa · transcendence'},
  {at:1e18,    label:'1Qi · you ARE bajookie'},
];

// ═══════════════════════════════════════════════
// CLICKER STATE
// ═══════════════════════════════════════════════
function _ls(k) { return localStorage.getItem(k); }
let coins      = parseFloat(_ls('tk_coins')  || '0');
let totalEarned= parseFloat(_ls('tk_earned') || '0');
let clicks     = parseInt  (_ls('tk_clicks') || '0');
let owned      = JSON.parse(_ls('tk_owned')  || '{}');
let bought     = JSON.parse(_ls('tk_bought') || '{}');
let pacts      = JSON.parse(_ls('tk_pacts')  || '{}');
let globalMult = parseFloat(_ls('tk_gmult')  || '1');
let seenMs     = JSON.parse(_ls('tk_seenms') || '{}');
let cps = 0, clickPow = 1;

function totalProds() { return PRODS.reduce((s,p) => s + (owned[p.id]||0), 0); }
function prodCost(p)  { return Math.floor(p.base * Math.pow(1.15, owned[p.id]||0)); }

function recalc() {
  clickPow = 1;
  BOOSTS.filter(b => b.type==='click' && bought[b.id]).forEach(b => clickPow *= b.mult);
  let globalBoost = 1;
  BOOSTS.filter(b => b.type==='global' && bought[b.id]).forEach(b => globalBoost *= b.mult);
  cps = 0;
  PRODS.forEach(p => {
    let m = 1;
    BOOSTS.filter(b => b.type==='prod' && b.prod===p.id && bought[b.id]).forEach(b => m *= b.mult);
    cps += p.cps * (owned[p.id]||0) * m;
  });
  cps *= globalBoost;
  if (pacts.pac1) { cps *= 5;   clickPow *= 0.1; }
  if (pacts.pac2) { clickPow *= 10; cps *= 0.2;  }
  if (pacts.pac3) { cps *= 3; }
  cps      *= globalMult;
  clickPow *= globalMult;
}

function fmt(n) {
  n = Math.floor(n);
  if (n >= 1e18) return (n/1e18).toFixed(2)+'Qi';
  if (n >= 1e15) return (n/1e15).toFixed(2)+'Qa';
  if (n >= 1e12) return (n/1e12).toFixed(2)+'T';
  if (n >= 1e9)  return (n/1e9 ).toFixed(2)+'B';
  if (n >= 1e6)  return (n/1e6 ).toFixed(2)+'M';
  if (n >= 1000) return (n/1000).toFixed(1)+'K';
  return String(n);
}

function doClick(e) {
  coins += clickPow; totalEarned += clickPow; clicks++;
  spawnFloat(e.clientX, e.clientY, '+' + fmt(clickPow));
  checkMs(); save(); updateDisplay();
}

function spawnFloat(x, y, txt) {
  const el = document.createElement('div');
  el.className = 'float-num';
  el.textContent = txt;
  el.style.cssText = `left:${x-20}px;top:${y-20}px;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ─── BUY FUNCTIONS ───
function buyProducer(id) {
  const p = PRODS.find(x => x.id===id);
  if (!p) return;
  if (pacts.pac3 && (owned[p.id]||0) >= 10) return;
  const c = prodCost(p);
  if (coins < c) return;
  coins -= c;
  owned[p.id] = (owned[p.id]||0) + 1;
  recalc(); save(); updateDisplay(); renderAll();
}

function buyBoost(id) {
  const b = BOOSTS.find(x => x.id===id);
  if (!b || bought[b.id]) return;
  if (b.req      && !bought[b.req])               return;
  if (b.reqN     && (owned[b.prod]||0) < b.reqN)  return;
  if (b.reqTotal && totalProds() < b.reqTotal)     return;
  if (coins < b.cost) return;
  coins -= b.cost;
  bought[b.id] = true;
  recalc(); save(); updateDisplay(); renderAll();
}

function buyPact(id) {
  const p = PACTS.find(x => x.id===id);
  if (!p || pacts[id]) return;
  if (p.conflicts.some(c => pacts[c])) return;
  if (p.prereq && (owned[p.prereq.prod]||0) < p.prereq.n) return;
  if (coins < p.cost) return;
  if (!confirm('Sign "' + p.name + '"?\n\n' + p.warn + '\n\nThis cannot be undone.')) return;
  coins -= p.cost;
  pacts[id] = true;
  if (id === 'pac5') { PRODS.forEach(pr => { owned[pr.id] = 0; }); globalMult *= 10; }
  recalc(); save(); updateDisplay(); renderAll();
}

function checkMs() {
  MILESTONES.forEach(m => {
    if (!seenMs[m.at] && totalEarned >= m.at) {
      seenMs[m.at] = true;
      const t = document.getElementById('toast');
      t.textContent = '🏆 ' + m.label;
      t.style.animation = 'none';
      void t.offsetWidth;
      t.style.animation = 'fadeInOut 3s ease forwards';
    }
  });
}

function save() {
  localStorage.setItem('tk_coins',  coins);
  localStorage.setItem('tk_earned', totalEarned);
  localStorage.setItem('tk_clicks', clicks);
  localStorage.setItem('tk_owned',  JSON.stringify(owned));
  localStorage.setItem('tk_bought', JSON.stringify(bought));
  localStorage.setItem('tk_pacts',  JSON.stringify(pacts));
  localStorage.setItem('tk_gmult',  globalMult);
  localStorage.setItem('tk_seenms', JSON.stringify(seenMs));
}
window.addEventListener('beforeunload', save);

// ─── DISPLAY UPDATE (fast — no DOM rebuild) ───
function updateDisplay() {
  const disp = pacts.pac4 ? coins * (0.75 + Math.random() * 0.5) : coins;
  document.getElementById('coin-display').textContent = fmt(disp) + ' bajookie coins';
  document.getElementById('cps-display').textContent  = fmt(cps) + '/sec · ' + fmt(totalEarned) + ' total · ' + fmt(clicks) + ' clicks';
  document.getElementById('click-pw').textContent     = fmt(clickPow);
  document.getElementById('cs-total').textContent     = fmt(totalEarned);
  document.getElementById('cs-cps').textContent       = fmt(cps);
  document.getElementById('cs-clicks').textContent    = fmt(clicks);
  document.getElementById('cs-upg').textContent       = Object.keys(bought).length + Object.keys(pacts).length;
  document.getElementById('hdr-coins').textContent    = fmt(coins);
  document.getElementById('stat-coins').textContent   = fmt(coins);
  document.getElementById('stat-cps').textContent     = fmt(cps);
  document.getElementById('stat-total').textContent   = fmt(totalEarned);
  document.getElementById('stat-clicks').textContent  = fmt(clicks);
  document.getElementById('qc-coins').textContent     = fmt(coins);
  document.getElementById('qc-power').textContent     = fmt(clickPow);
}

// ─── RENDER (rebuilds DOM — only on state/affordability change) ───
let _prevSig = '';
function maybeRender() {
  const sig = PRODS.map(p => (owned[p.id]||0) + (coins<prodCost(p)?'L':'U') + (pacts.pac3&&(owned[p.id]||0)>=10?'C':'')).join('')
            + BOOSTS.map(b => bought[b.id]?'O':coins>=b.cost?'1':'0').join('');
  if (sig !== _prevSig) { _prevSig = sig; renderAll(); }
}

function renderAll() {
  renderProducers(); renderBoosts(); renderPacts(); renderMilestones();
}

function renderProducers() {
  const el = document.getElementById('upg-prod');
  if (!el) return;
  el.innerHTML = PRODS.map(p => {
    const n = owned[p.id]||0, c = prodCost(p);
    const capHit = pacts.pac3 && n >= 10;
    const locked = coins < c || capHit;
    let prodMult = 1, gBoost = 1;
    BOOSTS.filter(b => b.type==='prod' && b.prod===p.id && bought[b.id]).forEach(b => prodMult *= b.mult);
    BOOSTS.filter(b => b.type==='global' && bought[b.id]).forEach(b => gBoost *= b.mult);
    const contrib = n > 0 ? fmt(p.cps * n * prodMult * gBoost * globalMult) + '/sec' : p.cps + '/sec each';
    return `<div class="prod-row${locked?' prod-locked':''}" data-prod="${p.id}">
      <div class="prod-icon">${p.icon}</div>
      <div class="prod-info">
        <div class="prod-name">${p.name}${capHit?' <span style="color:var(--red);font-size:9px;letter-spacing:1px;">CAP</span>':''}</div>
        <div class="prod-sub">${contrib}</div>
      </div>
      <div class="prod-right">
        <div class="prod-count">${n}</div>
        <div class="prod-cost" style="color:${locked?'var(--dim)':'var(--gold)'};">${fmt(c)}</div>
      </div>
    </div>`;
  }).join('');
}

function renderBoosts() {
  const el = document.getElementById('upg-boost');
  if (!el) return;
  el.innerHTML = BOOSTS.map(b => {
    const isOwned = !!bought[b.id];
    let locked = false, lockReason = '';
    if (!isOwned) {
      if      (b.req      && !bought[b.req])              { locked=true; lockReason='requires previous boost'; }
      else if (b.reqN     && (owned[b.prod]||0) < b.reqN) { locked=true; lockReason='own '+b.reqN+'+ '+( PRODS.find(p=>p.id===b.prod)?.name||''); }
      else if (b.reqTotal && totalProds() < b.reqTotal)   { locked=true; lockReason='need '+b.reqTotal+' total producers'; }
      else if (coins < b.cost)                            { locked=true; lockReason='not enough bajookie'; }
    }
    const cls = isOwned ? 'boost-owned' : locked ? 'boost-locked' : '';
    return `<div class="boost-row ${cls}" data-boost="${b.id}">
      <div class="prod-icon">${b.icon}</div>
      <div class="prod-info">
        <div class="prod-name">${b.name}${isOwned?' <span class="boost-badge owned-badge">OWNED</span>':''}</div>
        <div class="prod-sub">${b.desc}${locked&&!isOwned?' <span style="color:var(--dim);">· '+lockReason+'</span>':''}</div>
      </div>
      <div class="prod-right">${isOwned?'':'<div class="prod-cost" style="color:'+(locked?'var(--dim)':'var(--gold)')+';">'+fmt(b.cost)+'</div>'}</div>
    </div>`;
  }).join('');
}

function renderPacts() {
  const el = document.getElementById('upg-pact');
  if (!el) return;
  el.innerHTML = PACTS.map(p => {
    const isSigned   = !!pacts[p.id];
    const isConflict = p.conflicts.some(c => pacts[c]);
    const prereqMet  = !p.prereq || (owned[p.prereq.prod]||0) >= p.prereq.n;
    const canAfford  = coins >= p.cost;
    const canSign    = !isSigned && !isConflict && prereqMet && canAfford;
    let cls = isSigned ? 'pact-signed' : isConflict ? 'pact-blocked' : 'pact-available';
    return `<div class="pact-card ${cls}">
      <div class="pact-head">
        <span class="pact-icon">${p.icon}</span>
        <span class="pact-name">${p.name}</span>
        ${isSigned?'<span style="font-size:9px;color:var(--green);border:1px solid var(--green);padding:1px 6px;border-radius:2px;letter-spacing:1px;">SIGNED</span>':''}
        ${isConflict?'<span style="font-size:9px;color:var(--red);">BLOCKED BY CONFLICT</span>':''}
      </div>
      <div class="pact-desc">${p.desc}</div>
      <div class="pact-warn">${p.warn}</div>
      ${p.prereq?'<div style="font-size:10px;color:'+(prereqMet?'var(--green)':'var(--dim)')+';margin-bottom:8px;">prereq: '+p.prereq.n+'+ '+( PRODS.find(x=>x.id===p.prereq.prod)?.name||'')+' · you have '+(owned[p.prereq.prod]||0)+'</div>':''}
      ${!isSigned&&!isConflict?'<div class="pact-footer"><span class="pact-cost-label">cost: '+fmt(p.cost)+' bajookie</span><button class="btn '+(canSign?'btn-red':'btn-dim')+'" style="font-size:11px;padding:4px 12px;" onclick="buyPact(\''+p.id+'\')" '+(canSign?'':'disabled')+'>'+(!prereqMet?'prereq not met':!canAfford?'need more bajookie':'sign pact →')+'</button></div>':''}
    </div>`;
  }).join('');
}

function renderMilestones() {
  const el = document.getElementById('milestone-list');
  if (!el) return;
  el.innerHTML = MILESTONES.map(m =>
    '<div style="color:'+(totalEarned>=m.at?'var(--green)':'var(--dim)')+';">'+(totalEarned>=m.at?'✓':'○')+' '+m.label+'</div>'
  ).join('');
}

// ─── UPGRADE TAB SWITCHER ───
function showUpgTab(name) {
  ['prod','boost','pact'].forEach(t => {
    document.getElementById('upg-'+t).style.display    = t===name ? 'block' : 'none';
    document.getElementById('utab-'+t).classList.toggle('active', t===name);
  });
}

// ─── EVENT DELEGATION (fixes click bugs from DOM rebuilds) ───
document.addEventListener('DOMContentLoaded', function() {
  const prodEl  = document.getElementById('upg-prod');
  const boostEl = document.getElementById('upg-boost');
  if (prodEl)  prodEl.addEventListener ('click', function(e){ const r=e.target.closest('[data-prod]');  if(r) buyProducer(r.dataset.prod);  });
  if (boostEl) boostEl.addEventListener('click', function(e){ const r=e.target.closest('[data-boost]'); if(r) buyBoost(r.dataset.boost);    });
});

// ─── PASSIVE TICK ───
setInterval(function() {
  if (cps > 0) {
    const tickMult = pacts.pac4 ? 2 : 1;
    const gain = cps * tickMult / 20;
    coins += gain; totalEarned += gain;
    checkMs(); updateDisplay(); maybeRender();
  }
}, 50);

setInterval(save, 2000);
