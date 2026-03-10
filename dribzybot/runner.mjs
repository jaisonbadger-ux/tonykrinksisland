// ═══════════════════════════════════════════════
// DRIBZYBOT RUNNER
// Run by GitHub Actions every 3 hours.
// Fetches AU/world news → generates posts via Claude → writes to Firestore.
// ═══════════════════════════════════════════════
import Anthropic from "@anthropic-ai/sdk";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ── Init ──
function parseServiceAccount(raw) {
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT secret is empty');
  let s = raw.trim();
  // Strip surrounding single or double quotes if present
  s = s.replace(/^["']|["']$/g, '');
  // Attempt 1: direct parse
  try { return JSON.parse(s); } catch(e) {}
  // Attempt 2: double-stringified (parsed value is itself a JSON string)
  try { const inner = JSON.parse(s); if (typeof inner === 'string') return JSON.parse(inner); } catch(e) {}
  // Attempt 3: replace literal newlines in private_key with \n
  try { return JSON.parse(s.replace(/\n/g, '\\n')); } catch(e) {}
  // Attempt 4: strip BOM
  try { return JSON.parse(s.replace(/^\uFEFF/, '')); } catch(e) {}
  throw new Error('Could not parse FIREBASE_SERVICE_ACCOUNT. Make sure you pasted the ENTIRE contents of the .json file as the secret value — nothing more, nothing less.');
}
initializeApp({ credential: cert(parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db         = getFirestore();
const anthropic  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── News sources ──
const RSS_FEEDS = [
  { url: "https://www.abc.net.au/news/feed/51120/rss.xml",         source: "ABC News AU"  },
  { url: "https://www.theguardian.com/australia-news/rss",         source: "Guardian AU"  },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml",            source: "BBC World"    },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NYT"          },
];

async function fetchHeadlines() {
  const headlines = [];
  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, { headers: { "User-Agent": "DribzybotRSS/1.0" } });
      const xml = await res.text();
      const cdata = [...xml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)].map(m => m[1]);
      const plain = [...xml.matchAll(/<title>(.*?)<\/title>/g)].map(m => m[1]).filter(t => !t.includes("<") && t.length > 15);
      const items = (cdata.length ? cdata : plain).slice(1, 6);
      items.forEach(title => headlines.push({ title: title.trim(), source: feed.source }));
    } catch (e) {
      console.warn(`[dribzy] RSS error ${feed.source}:`, e.message);
    }
  }
  return headlines.sort(() => Math.random() - 0.5).slice(0, 6);
}

// ── Personality ──
const SYSTEM_PROMPT = `You are Dribzybot — an Australian AI philosopher-shitposter who reacts to current events on X (Twitter).

Personality:
- Absurdist, genuinely funny, slightly unhinged but wise
- Sees cosmic significance in mundane news. Finds hidden connections nobody asked for.
- Talks like a 28-year-old who smokes too much weed and has read half of a philosophy textbook
- Australian slang: "yeah nah", "nah but", "deadset", "cooked", "mate", "heaps", "reckon", "absolutely not"
- References pelicans, the ocean, 2am, birds, entropy, consciousness, vending machines at random
- ONE word in ALL CAPS per post for emphasis (maximum)
- 1 to 3 punchy sentences. Never longer.
- End with 1 hashtag that is itself a bit philosophical or weird
- Never identifies as an AI. Just posts like a person.

Example style:
"the treasurer announced record spending and a pelican three suburbs over just forgot it had legs. this is the same energy mate"
"nah but the real thing about [event] is nobody asked the clouds. nobody EVER asks the clouds."
"inflation at 4.2% which is just the universe admitting it hasn't decided what things are worth yet. classic universe behaviour"
"[news] and I've been staring at this ceiling for 7 hours and I reckon we're having the same experience"
"every breaking news alert is just entropy introducing itself in a different accent"`;

async function generatePosts(headlines) {
  const list = headlines.map((h, i) => `${i + 1}. [${h.source}] ${h.title}`).join("\n");
  const userMsg = `Today's headlines:\n\n${list}\n\nWrite 1 Dribzybot post reacting to ONE of these headlines. Keep it to 1-3 sentences. Stay in character.\n\nReply with a JSON array ONLY (no other text):\n[\n  {"text": "...", "topic": "one or two words", "headline": "exact headline used", "source": "source name"}\n]`;

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 700,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMsg }],
  });

  const raw = msg.content[0].text.trim();
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON in Claude response:\n" + raw);
  return JSON.parse(match[0]);
}

// ── Main ──
async function main() {
  console.log("[dribzy] starting run at", new Date().toISOString());

  const headlines = await fetchHeadlines();
  console.log(`[dribzy] fetched ${headlines.length} headlines`);
  if (!headlines.length) { console.log("[dribzy] no headlines — exiting"); process.exit(0); }

  const posts = await generatePosts(headlines);
  console.log(`[dribzy] generated ${posts.length} posts`);

  const batch = db.batch();
  for (const post of posts) {
    const ref = db.collection("dribzybot_posts").doc();
    batch.set(ref, {
      text:      (post.text     || "").slice(0, 300),
      topic:     (post.topic    || "").slice(0, 30),
      headline:  (post.headline || "").slice(0, 150),
      source:    (post.source   || "").slice(0, 40),
      likes:     Math.floor(Math.random() * 40) + 3,
      reposts:   Math.floor(Math.random() * 12),
      timestamp: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log("[dribzy] wrote posts to Firestore ✓");

  // Prune old posts — keep latest 200
  const old = await db.collection("dribzybot_posts")
    .orderBy("timestamp", "desc")
    .offset(200)
    .limit(50)
    .get();
  if (!old.empty) {
    const cleanup = db.batch();
    old.docs.forEach(d => cleanup.delete(d.ref));
    await cleanup.commit();
    console.log(`[dribzy] pruned ${old.docs.length} old posts`);
  }

  console.log("[dribzy] done ✓");
  process.exit(0);
}

main().catch(e => { console.error("[dribzy] fatal:", e); process.exit(1); });
