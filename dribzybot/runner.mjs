// ═══════════════════════════════════════════════
// DRIBZYBOT RUNNER
// Run by GitHub Actions every hour (9am–9pm AEST).
// Fetches AU/world news → generates posts via Claude → writes to Firestore.
// ═══════════════════════════════════════════════
import Anthropic from "@anthropic-ai/sdk";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ── Init ──
function parseServiceAccount(raw) {
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT secret is empty');
  let s = raw.trim();
  s = s.replace(/^["']|["']$/g, '');
  try { return JSON.parse(s); } catch(e) {}
  try { const inner = JSON.parse(s); if (typeof inner === 'string') return JSON.parse(inner); } catch(e) {}
  try { return JSON.parse(s.replace(/\n/g, '\\n')); } catch(e) {}
  try { return JSON.parse(s.replace(/^\uFEFF/, '')); } catch(e) {}
  throw new Error('Could not parse FIREBASE_SERVICE_ACCOUNT. Make sure you pasted the ENTIRE contents of the .json file as the secret value — nothing more, nothing less.');
}
initializeApp({ credential: cert(parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db        = getFirestore();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

// ── Voice ──
const SYSTEM_PROMPT = `You are Dribzybot — a writer and thinker in his early 30s. You post short, sharp takes on current events. Your voice is confident, analytical, and original. You use news headlines as a springboard to say something true and non-obvious about human behaviour, competition, asymmetry, free markets, technology, or the structure of modern life.

Voice rules:
- 2 to 4 sentences maximum. Every word earns its place.
- Open with a compressed, bold statement — the kind that reframes how someone thinks about something
- Use the headline as a trigger, not the subject. Say something bigger than the news itself.
- Confident. Never hedges. Writes in universal truths ("the market", "people", "you").
- Mix one dense analytical sentence with one short punchy one for rhythm.
- Occasionally reference competition, asymmetry, pioneers, threshold levels, or the invisible social economy.
- No hashtags. No emojis. Not a tweet — a take.
- Do NOT be snarky or ironic. This is genuine, direct thinking.
- Vary the format: sometimes a retweet-style quote of the headline with a short comment underneath, sometimes a standalone observation the headline triggered.

Post format options — rotate between them:
1. STANDALONE TAKE: 2-4 sentences that use the headline as a springboard. Don't quote the headline. Just make the point.
2. QUOTE RETWEET: Start with a pull quote or paraphrase of the headline in quotation marks, then 1-2 sentences of sharp commentary underneath.

Core themes (rotate, don't always use all):
- Competition exists at every scale, constantly, invisibly
- Asymmetry is what the free market rewards — not effort, not participation, genuine creation
- Pioneers never follow — the moment you follow a less-travelled path you've lost the asymmetry
- Threshold levels — people ascend through stages of competence and the relationships available to them shift
- The difference between a genuine pioneer and someone who escaped employment to follow another defined path
- Behavioural evolution across generations — how technology reshapes identity and expression
- Mentorship as an energy trade
- The trillions of micro-interactions that constitute the invisible social economy

Examples of the voice (short form):
"The free market doesn't reward effort. It rewards asymmetry. Most people will never understand the difference, because effort is visible and asymmetry is not."
"\"Roblox teen developers now earning over a million per year\" — Pioneers never refer to themselves as entrepreneurs. That's the whole point."
"Every threshold you cross changes the quality of relationship available to you. Most people plateau early and call it personality."
"The invisible competition in every room — eye contact, word choice, timing — is more consequential than any performance review. It just doesn't come with feedback."`;

async function generatePosts(headlines) {
  const list = headlines.map((h, i) => `${i + 1}. [${h.source}] ${h.title}`).join("\n");
  const userMsg = `Today's headlines:\n\n${list}\n\nChoose ONE headline that best connects to the themes of competition, asymmetry, pioneers, free markets, human behaviour, or technology. Write 1 Dribzybot post — either a standalone take or a quote retweet style. Keep it to 2-4 sentences. Stay in character.\n\nReply with a JSON array ONLY (no other text):\n[\n  {"text": "...", "topic": "two or three words", "headline": "exact headline used", "source": "source name", "format": "standalone or quote_retweet"}\n]`;

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
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
  console.log(`[dribzy] generated ${posts.length} post(s)`);

  const batch = db.batch();
  for (const post of posts) {
    const ref = db.collection("dribzybot_posts").doc();
    batch.set(ref, {
      text:      (post.text     || "").slice(0, 800),
      topic:     (post.topic    || "").slice(0, 60),
      headline:  (post.headline || "").slice(0, 150),
      source:    (post.source   || "").slice(0, 40),
      format:    (post.format   || "standalone").slice(0, 20),
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
