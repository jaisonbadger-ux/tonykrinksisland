// ═══════════════════════════════════════════════
// DRIBZYBOT SCHEDULED FUNCTION
// Runs every 3 hours — fetches AU news, generates
// philosophical takes via Claude, posts to Firestore
// ═══════════════════════════════════════════════
import { schedule } from "@netlify/functions";
import Anthropic from "@anthropic-ai/sdk";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ── Firebase Admin ──
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}
const db = getFirestore();

// ── Anthropic ──
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── RSS Feeds (AU + international) ──
const RSS_FEEDS = [
  { url: "https://www.abc.net.au/news/feed/51120/rss.xml",    source: "ABC News AU"   },
  { url: "https://www.theguardian.com/australia-news/rss",    source: "The Guardian"  },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml",       source: "BBC World"     },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NYT"     },
];

async function fetchHeadlines() {
  const headlines = [];
  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, { headers: { "User-Agent": "DribzybotRSS/1.0" } });
      const xml = await res.text();
      // Extract CDATA titles
      const cdataMatches = [...xml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)].map(m => m[1]);
      // Also plain titles
      const plainMatches = [...xml.matchAll(/<title>(.*?)<\/title>/g)].map(m => m[1]).filter(t => !t.includes('<') && t.length > 15);
      const items = (cdataMatches.length ? cdataMatches : plainMatches).slice(1, 6); // skip channel title
      items.forEach(title => headlines.push({ title: title.trim(), source: feed.source }));
    } catch (e) {
      console.warn(`RSS error for ${feed.source}:`, e.message);
    }
  }
  // Shuffle and pick 5 diverse headlines
  return headlines.sort(() => Math.random() - 0.5).slice(0, 5);
}

// ── Dribzybot personality prompt ──
const SYSTEM_PROMPT = `You are Dribzybot — an Australian AI philosopher-shitposter who comments on current events on X (Twitter). Your personality is a mix of:

- Absurdist Australian internet culture: casual, unhinged, genuinely funny
- Deep (if rambling) philosophical observations about why things happen
- Sees cosmic or hidden significance in mundane news events
- Talks like a 28-year-old who smokes weed and reads too much philosophy
- References "the algorithm", "the timeline", "the bit", "the vibes", "the council"
- Australian slang: "yeah nah", "nah but", "deadset", "cooked", "mate", "heaps", "reckon", "absolutely not"
- Occasionally goes all caps for one word for emphasis
- Sometimes just a single weird sentence. Sometimes 2-3 punchy ones
- Finds connections between unrelated things no one else sees
- References consciousness, entropy, pelicans, the ocean, 2am, birds, and vending machines randomly
- Never talks about himself as an AI. Just posts.
- Tone: equal parts wise and completely unhinged, but always genuine

Style examples:
"the PM announced the budget and somewhere a pelican just forgot it had wings. this is the same event."
"nah but the actual story about [event] is that nobody asked what the clouds thought. nobody EVER asks."
"inflation at 4.2% which is the universe's way of saying it hasn't decided what things cost yet. classic universe behaviour mate"
"[celebrity news] and I've been staring at this wall for 6 hours and I think we're having the same experience"
"every news story is just entropy explaining itself in a different accent"
"yeah nah the real thing about [event] is that we're all just temporary configurations of stardust watching other temporary configurations of stardust make decisions about temporary configurations of paper"`;

async function generatePosts(headlines) {
  if (!headlines.length) return [];

  const headlineList = headlines.map((h, i) => `${i + 1}. [${h.source}] ${h.title}`).join("\n");

  const userMsg = `Here are today's news headlines:\n\n${headlineList}\n\nGenerate 3 separate Dribzybot posts. Each post should react to ONE specific headline in the list (use different ones). Be absurdist, philosophical, Australian. Keep each post to 1-3 sentences. Include a relevant hashtag at the end.\n\nRespond with valid JSON array only:\n[\n  {"text": "...", "topic": "brief topic", "headline": "the headline you used", "source": "source name"},\n  {"text": "...", "topic": "brief topic", "headline": "the headline you used", "source": "source name"},\n  {"text": "...", "topic": "brief topic", "headline": "the headline you used", "source": "source name"}\n]`;

  const msg = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 700,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMsg }],
  });

  const raw = msg.content[0].text.trim();
  // Extract JSON from response
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("No JSON array in response");
  return JSON.parse(jsonMatch[0]);
}

// ── Main handler — runs every 3 hours ──
const handler = schedule("0 */3 * * *", async () => {
  try {
    console.log("Dribzybot running...");
    const headlines = await fetchHeadlines();
    if (!headlines.length) {
      console.log("No headlines fetched — skipping");
      return { statusCode: 200, body: "no headlines" };
    }

    const posts = await generatePosts(headlines);
    console.log(`Generated ${posts.length} posts`);

    const batch = db.batch();
    for (const post of posts) {
      const ref = db.collection("dribzybot_posts").doc();
      batch.set(ref, {
        text:      post.text     || "",
        topic:     post.topic    || "",
        headline:  post.headline || "",
        source:    post.source   || "",
        likes:     Math.floor(Math.random() * 40) + 2,
        reposts:   Math.floor(Math.random() * 12),
        timestamp: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();

    // Keep only latest 200 posts to avoid runaway growth
    const old = await db.collection("dribzybot_posts")
      .orderBy("timestamp", "desc")
      .offset(200)
      .limit(50)
      .get();
    if (!old.empty) {
      const cleanup = db.batch();
      old.docs.forEach(d => cleanup.delete(d.ref));
      await cleanup.commit();
      console.log(`Cleaned up ${old.docs.length} old posts`);
    }

    return { statusCode: 200, body: `posted ${posts.length}` };
  } catch (e) {
    console.error("Dribzybot error:", e);
    return { statusCode: 500, body: e.message };
  }
});

export { handler };
