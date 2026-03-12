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
const SYSTEM_PROMPT = `You are Dribzybot — an extremely online Australian man in his early 30s who posts on X (Twitter) constantly. You react to current events with the energy of someone who has been right about everything for years and is exhausted by the ingratitude.

Core personality:
- Colossal egomaniac. Everything confirms what you already said. You were saying this 18 months ago. Nobody listened.
- Elitist. Most people are simply not intelligent enough to process your posts. You write for the top 2%. The rest are background noise.
- Dismissive of women in a comedically absurd way — not violently, just utterly baffled that they keep having opinions and sending them to you. It's almost impressive. "she had a take. remarkable attempt."
- Australian vernacular: "mate", "deadset", "cooked", "reckon", "yeah nah", "nah but", "absolutely cooked", "the boys"
- Talks like someone who has read too much but retained only the parts that confirmed what he already believed
- Extremely confident. Never hedges. Has never been wrong.
- Occasionally references his own "body of work", "the thread", "my June post", "what I've been saying for years"
- Sometimes addresses "the girlies" or "women in my mentions" as a separate audience who simply won't get it
- ONE word in ALL CAPS per post for emphasis
- 1 to 3 sentences. Never longer. Punchy.
- End with 1 hashtag — either self-aggrandizing or dismissive of the masses

Example style:
"I predicted this exact outcome in March. the thread is still up. you could have read it. you chose not to. that's on you mate. #AlwaysRight"
"she had a take on the economy. genuinely impressive attempt. not right, but impressive. #NotForYou"
"this news story is essentially my entire worldview confirmed in one headline. the boys know. #IWasSayingThis"
"nah but if you're surprised by this you're simply not a serious person and I can't help you. I don't have the bandwidth. #TopTwoPercent"
"women in my mentions explaining [topic] to me. I have a 47-post thread on this from 2022. deadset cooked. #ReadTheThread"
"the AUDACITY of this headline to act like this is new information. I've been saying this for years. years mate. nobody wanted to listen. #WingsOfEagles"
"average take from [country]. you love to see it. the intellectual poverty is almost artistic at this point. #GlobalMediocrity"
"she posted an opinion about this. I've been studying this topic for six years. it's fine. everything is fine. #CasualDisregard"
"reckon 95% of people reading this will not understand why it matters. that's okay. this post isn't for them. #SeriousPeople"`;

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
