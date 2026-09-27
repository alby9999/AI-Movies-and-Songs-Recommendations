import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import db from "./db.js";
import { getCuratedRecommendations, resolveMood, MOOD_SUGGESTIONS, CURATED_MEDIA } from "./curatedMedia.js";
import { getCuratedSongs, CURATED_SONGS } from "./curatedSongs.js";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

let currentApiKey = process.env.GEMINI_API_KEY || "";
let genAI = null;

let spotifyClientId = process.env.SPOTIFY_CLIENT_ID || "";
let spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";
let spotifyAccessToken = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken() {
  if (spotifyAccessToken && Date.now() < spotifyTokenExpiry) {
    return spotifyAccessToken;
  }
  if (!spotifyClientId || !spotifyClientSecret) return null;
  try {
    const creds = Buffer.from(`${spotifyClientId}:${spotifyClientSecret}`).toString("base64");
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });
    if (res.ok) {
      const data = await res.json();
      spotifyAccessToken = data.access_token;
      spotifyTokenExpiry = Date.now() + ((data.expires_in || 3600) - 60) * 1000;
      console.log("✓ Spotify Web API client credentials authenticated.");
      return spotifyAccessToken;
    }
  } catch (err) {
    console.warn("Spotify token error:", err.message);
  }
  return null;
}

function updateGenAI(key) {
  currentApiKey = key ? key.trim() : "";
  if (currentApiKey && !currentApiKey.includes("YOUR_GEMINI_API_KEY")) {
    try {
      genAI = new GoogleGenerativeAI(currentApiKey);
      console.log("✓ Gemini AI engine initialized with API key.");
    } catch (err) {
      console.warn("⚠️ Failed to initialize GoogleGenerativeAI with key:", err.message);
      genAI = null;
    }
  } else {
    genAI = null;
    console.log("ℹ️ Operating in High-Quality Curated Recommendations Mode (with optional live search).");
  }
}

updateGenAI(currentApiKey);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

/* --------------------------------------------------------------- */
/* CONFIG & API KEY MANAGEMENT                                     */
/* --------------------------------------------------------------- */

app.get("/api/config/status", (_req, res) => {
  const hasValidKey = Boolean(currentApiKey && !currentApiKey.includes("YOUR_GEMINI_API_KEY") && currentApiKey.length > 10);
  res.json({
    hasApiKey: hasValidKey,
    hasSpotifyKey: Boolean(spotifyClientId && spotifyClientSecret),
    mode: hasValidKey ? "generative_ai" : "curated_catalog"
  });
});

app.post("/api/config/spotify", (req, res) => {
  try {
    const { clientId, clientSecret } = req.body;
    spotifyClientId = (clientId || "").trim();
    spotifyClientSecret = (clientSecret || "").trim();
    spotifyAccessToken = null;
    spotifyTokenExpiry = 0;

    res.json({ success: true, hasSpotify: Boolean(spotifyClientId && spotifyClientSecret) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/suggestions/:mood", (req, res) => {
  const moodKey = resolveMood(req.params.mood, req.params.mood) || req.params.mood.toLowerCase();
  const suggestions = MOOD_SUGGESTIONS[moodKey] || [];
  res.json({ mood: moodKey, suggestions });
});

app.post("/api/config/api-key", (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== "string") {
      return res.status(400).json({ error: "API key is required." });
    }

    updateGenAI(apiKey);

    // Also update .env file if it exists
    const envPath = path.resolve(process.cwd(), ".env");
    let envContent = `PORT=${PORT}\nGEMINI_API_KEY=${apiKey.trim()}\n`;
    try {
      fs.writeFileSync(envPath, envContent, "utf-8");
    } catch (e) {
      console.warn("Could not write to .env:", e.message);
    }

    res.json({ success: true, message: "Gemini API Key updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* --------------------------------------------------------------- */
/* AUTHENTICATION ROUTES                                           */
/* --------------------------------------------------------------- */

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !username.trim() || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const trimmedUser = username.trim();
    if (trimmedUser.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters." });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters." });
    }

    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(trimmedUser);
    if (existing) {
      return res.status(400).json({ error: "An account with this username already exists. Please choose another username or sign in." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const id = uuidv4();

    const insert = db.prepare("INSERT INTO users (id, username, password, display_name, bio) VALUES (?, ?, ?, ?, ?)");
    insert.run(id, trimmedUser, hashedPassword, trimmedUser, "Exploring cinema and music in the abyss.");
    
    res.json({
      id,
      name: trimmedUser,
      username: trimmedUser,
      bio: "Exploring cinema and music in the abyss."
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: "Username is already taken. Please choose another or sign in." });
    }
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Database error during registration." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !username.trim() || !password) {
      return res.status(400).json({ error: "Please enter both username and password." });
    }

    const trimmedUser = username.trim();
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(trimmedUser);
    
    if (!user) {
      return res.status(404).json({
        error: "No account found with this username. Please create an account first.",
        needsAccount: true
      });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Incorrect password. Please verify and try again." });
    }
    
    res.json({
      id: user.id,
      name: user.display_name || user.username,
      username: user.username,
      bio: user.bio || "Exploring cinema and music in the abyss."
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Database error during login." });
  }
});

/* --------------------------------------------------------------- */
/* USER MEDIA DATA ROUTES                                          */
/* --------------------------------------------------------------- */

app.get("/api/media/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const items = db.prepare("SELECT * FROM saved_media WHERE user_id = ?").all(userId);
    
    const formattedItems = items.map(item => ({
      ...item,
      isWatchlist: Boolean(item.is_watchlist),
      isFavourite: Boolean(item.is_favourite)
    }));
    
    res.json({ items: formattedItems });
  } catch (error) {
    console.error("Fetch Media Error:", error);
    res.status(500).json({ error: "Failed to fetch saved media." });
  }
});

app.post("/api/media/toggle", (req, res) => {
  try {
    const { userId, item, field } = req.body; 
    if (!userId || !item || !field) {
      return res.status(400).json({ error: "Missing required parameters." });
    }
    
    const existing = db.prepare("SELECT * FROM saved_media WHERE user_id = ? AND media_id = ?").get(userId, item.id);

    if (existing) {
      const newVal = existing[field] ? 0 : 1;
      db.prepare(`UPDATE saved_media SET ${field} = ? WHERE id = ?`).run(newVal, existing.id);
    } else {
      const isWatchlist = field === 'is_watchlist' ? 1 : 0;
      const isFavourite = field === 'is_favourite' ? 1 : 0;
      const dbId = uuidv4();
      
      const insert = db.prepare(`
        INSERT INTO saved_media (id, user_id, media_id, type, title, creator, year, genre, duration, rating, blurb, vibe, is_watchlist, is_favourite)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insert.run(
        dbId,
        userId,
        item.id,
        item.type,
        item.title,
        item.creator || "",
        item.year ? String(item.year) : "",
        item.genre || "",
        item.duration || "",
        Number(item.rating) || 7.5,
        item.blurb || "",
        item.vibe || "",
        isWatchlist,
        isFavourite
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Toggle Media Error:", error);
    res.status(500).json({ error: "Failed to save to database." });
  }
});

/* --------------------------------------------------------------- */
/* USER TASTE PROFILE ANALYTICS                                    */
/* --------------------------------------------------------------- */

app.get("/api/profile/:userId/stats", (req, res) => {
  try {
    const { userId } = req.params;
    
    const ratingCurve = db.prepare(`
      SELECT ROUND(rating) as star, COUNT(*) as count 
      FROM saved_media 
      WHERE user_id = ? AND rating IS NOT NULL AND rating > 0
      GROUP BY ROUND(rating)
      ORDER BY star ASC
    `).all(userId);

    const topGenres = db.prepare(`
      SELECT genre, COUNT(*) as count 
      FROM saved_media 
      WHERE user_id = ? AND genre IS NOT NULL
      GROUP BY genre 
      ORDER BY count DESC 
      LIMIT 5
    `).all(userId);

    const topVibes = db.prepare(`
      SELECT vibe, COUNT(*) as count 
      FROM saved_media 
      WHERE user_id = ? AND vibe IS NOT NULL
      GROUP BY vibe 
      ORDER BY count DESC 
      LIMIT 5
    `).all(userId);

    const items = db.prepare("SELECT type, duration FROM saved_media WHERE user_id = ?").all(userId);
    
    let totalMovieMinutes = 0;
    let totalSongMinutes = 0;

    items.forEach(item => {
      if (!item.duration) return;
      let mins = 0;
      const dur = item.duration.toLowerCase();
      
      if (dur.includes('min')) {
        mins = parseInt(dur) || 0;
      } else if (dur.includes('h')) {
        const hours = parseInt(dur.split('h')[0]) || 0;
        const remainingMins = parseInt(dur.split('h')[1]) || 0;
        mins = (hours * 60) + remainingMins;
      } else if (dur.includes(':')) {
        const parts = dur.split(':');
        if (parts.length === 2) mins = parseInt(parts[0]) || 0; 
      }
      
      if (item.type === 'movie') totalMovieMinutes += mins;
      if (item.type === 'song') totalSongMinutes += mins;
    });

    res.json({
      ratingCurve,
      topGenres,
      topVibes,
      timeStats: {
        totalHours: Math.round((totalMovieMinutes + totalSongMinutes) / 60),
        movieHours: Math.round(totalMovieMinutes / 60),
        songHours: Math.round(totalSongMinutes / 60)
      },
      totalItems: items.length
    });
  } catch (error) {
    console.error("Profile Stats Error:", error);
    res.status(500).json({ error: "Failed to load profile stats." });
  }
});

/* --------------------------------------------------------------- */
/* AI MOOD SEARCH ROUTE WITH ROBUST CURATED FALLBACK               */
/* --------------------------------------------------------------- */

const MOOD_SYSTEM_PROMPT = `
  You are the primary search engine for Echo & Abyss cinema and music discovery.
  The user will provide a specific mood, emotional tone, or genre theme.
  Your absolute highest priority is STRICT ACCURACY TO THE REQUESTED MOOD.

  CRITICAL RULES:
  - STRICT MOOD ACCURACY IS MANDATORY: Every single recommended movie or song MUST genuinely match the requested mood, emotional tone, and feeling.
  - DO NOT include movies outside the specified mood.
    * If the mood is "A Good Cry / Heartbreak / Emotional", DO NOT include lighthearted comedies or action movies. ONLY return deeply emotional, cathartic tearjerkers.
    * If the mood is "Feel-Good & Warm / Comforting", ONLY return heartwarming, joyful, comforting, uplifting titles. DO NOT return tragedies, horrors, or dark thrillers.
    * If the mood is "Romantic & Chemistry", ONLY return genuine romance, captivating chemistry, and love stories. DO NOT return non-romantic thrillers or unrelated movies.
    * If the mood is "Mind-Bending & Sci-Fi", ONLY return psychological puzzles, time loops, twists, and reality-bending sci-fi.
    * If the mood is "Spooky & Thriller / Horror", ONLY return suspenseful, eerie, chilling horror or psychological thrillers.
    * If the mood is "High Adrenaline / Action", ONLY return explosive, fast-paced, high-octane movies.
    * If the mood is "Dark & Gritty Noir", ONLY return crime noir, detective mysteries, and tense neo-noir.
    * If the mood is "Nostalgic Retro", ONLY return golden-era classics, 80s/90s nostalgia, and vintage favorites.
    * If the mood is "Late-Night & Moody", ONLY return atmospheric, neon-drenched, melancholic late-night cinema.
    * If the mood is "Epic Adventure", ONLY return grand-scale journeys, fantasy world-building, and heroic quests.
  - LANGUAGE & INDUSTRY STRICTNESS:
    * If language is 'hindi', STRICTLY return authentic Bollywood / Hindi cinema titles.
    * If language is 'english', STRICTLY return Hollywood / English cinema titles.
    * If language is 'south-indian', return acclaimed Tamil, Telugu, Malayalam, or Kannada cinema.
    * If language is 'world', return acclaimed international cinema (Korean, Japanese, French, etc.).
    * If language is 'all', return a rich mix of Bollywood, Hollywood, and World cinema that ALL fit the mood.
  - MUST return real, actual movies or songs with accurate release years, real creators/directors, and genres.
  - The "blurb" MUST be strictly one punchy, vivid sentence explaining the appeal.
  - The "reason" field must be a 3-8 word phrase explaining specifically HOW it fulfills this exact mood.
  - Order results strictly from best thematic fit to weakest.
`;

async function enrichWithPosterAndCast(items) {
  return Promise.all(items.map(async (item) => {
    if (item.poster && item.cast) return item;
    if (item.type !== "movie") return item;
    try {
      const cleanTitle = (item.title || "").replace(/\s*\(Hindi\)|\s*\(English\)/gi, "").trim();
      let res = await fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(cleanTitle)}&y=${item.year || ''}&apikey=trilogy`);
      let data = await res.json();
      if (data.Response !== "True" || !data.Poster || data.Poster === "N/A") {
        res = await fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(cleanTitle)}&apikey=trilogy`);
        data = await res.json();
      }

      if (data.Response === "True") {
        return {
          ...item,
          poster: (data.Poster && data.Poster !== "N/A") ? data.Poster : item.poster,
          artworkUrl: (data.Poster && data.Poster !== "N/A") ? data.Poster : (item.artworkUrl || item.poster),
          cast: item.cast || (data.Actors !== "N/A" ? data.Actors : "") || item.creator || "",
          blurb: (item.blurb && item.blurb.length > 25) ? item.blurb : (data.Plot !== "N/A" ? data.Plot : item.blurb)
        };
      }
    } catch (e) {
      // fallback safely
    }
    return item;
  }));
}

function formatDurationMs(ms) {
  if (!ms || isNaN(ms)) return "3:30";
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function detectSongLanguage(title = "", artist = "", requestedLang = "all") {
  const t = (title || "").toLowerCase();
  const a = (artist || "").toLowerCase();
  
  // 1. High-accuracy artist & title heuristics
  const punjabiArtists = ["diljit", "sidhu", "ap dhillon", "karan aujla", "shinda", "gurinder", "ammy virk", "b praak", "harrdy", "jassi", "sukhe", "mankirt", "sidhu moose", "jass manak", "prophec", "parmish", "bohemia", "imran khan", "punjabi"];
  if (punjabiArtists.some(p => a.includes(p) || t.includes(p))) {
    return { language: "Punjabi", industry: "Punjabi", flag: "⚡" };
  }

  const hindiArtists = ["arijit", "pritam", "shreya", "sonu nigam", "alka yagnik", "kumar sanu", "kishore", "mohit chauhan", "jubin", "neha kakkar", "vishal", "shekhar", "badshah", "honey singh", "atif aslam", "kk", "sunidhi", "amitabh bhattacharya", "udit narayan", "lata mangeshkar", "rahat fateh", "arman malik", "sachet", "parampara", "shankar ehsaan loy", "mithoon", "rochak kohli", "bollywood", "hindi"];
  if (hindiArtists.some(h => a.includes(h) || t.includes(h))) {
    return { language: "Hindi", industry: "Bollywood", flag: "🇮🇳" };
  }

  const southArtists = ["anirudh", "ar rahman", "ilayaraja", "keeravaani", "sid sriram", "sushin", "hesham", "haricharan", "shweta mohan", "yuvan", "harris jayaraj", "thaman", "devi sri prasad", "dsp", "vijay yesudas", "dhee", "arivu", "chinmayi", "jonita gandhi", "sai abhyankkar", "santhosh narayanan", "gv prakash", "tamil", "telugu", "malayalam", "kannada"];
  if (southArtists.some(s => a.includes(s) || t.includes(s))) {
    let sub = "Tamil";
    if (t.includes("telugu") || a.includes("telugu") || a.includes("thaman") || a.includes("keeravaani")) sub = "Telugu";
    if (t.includes("malayalam") || a.includes("sushin") || a.includes("hesham") || a.includes("yesudas")) sub = "Malayalam";
    return { language: sub, industry: "South Indian", flag: "🔥" };
  }

  const kpopArtists = ["bts", "blackpink", "newjeans", "stray kids", "twice", "exo", "seventeen", "iu", "txt", "le sserafim", "ive", "jungkook", "jimin", "v", "rm", "suga", "agust d", "taeyang", "g-dragon", "enhypen", "aespa", "itzy", "red velvet"];
  if (kpopArtists.some(k => a.includes(k) || t.includes(k))) {
    return { language: "Korean", industry: "K-Pop", flag: "🇰🇷" };
  }

  const latinArtists = ["bad bunny", "rosalía", "j balvin", "daddy yankee", "luis fonsi", "shakira", "maluma", "ozuna", "rauw", "anuel", "karol g", "peso pluma", "bizarrap", "becky g", "camila", "camilo", "sebastian yatra", "latin", "spanish", "reggaeton"];
  if (latinArtists.some(l => a.includes(l) || t.includes(l))) {
    return { language: "Spanish", industry: "Latin", flag: "💃" };
  }

  if (t.includes("lo-fi") || t.includes("instrumental") || t.includes("soundtrack") || t.includes("theme") || t.includes("interstellar") || t.includes("zimmer") || a.includes("zimmer") || a.includes("ludovico")) {
    return { language: "Instrumental", industry: "Soundtrack", flag: "🎹" };
  }

  // Known Western artists that should NEVER be mislabeled as Indian/Asian
  const westernArtists = ["black eyed peas", "metallica", "dua lipa", "adele", "harry styles", "taylor swift", "drake", "the weeknd", "ed sheeran", "billie eilish", "bruno mars", "lady gaga", "justin bieber", "rihanna", "eminem", "coldplay", "imagine dragons", "maroon 5", "post malone", "shawn mendes", "olivia rodrigo", "selena gomez", "katy perry", "ariana grande", "beyonce", "dj snake", "kaash paige"];
  if (westernArtists.some(w => a.includes(w))) {
    return { language: "English", industry: "Global Hits", flag: "🎬" };
  }

  // 2. Fall back to requested language only if not clearly a Western track
  if (requestedLang === "hindi" || requestedLang === "bollywood") {
    return { language: "Hindi", industry: "Bollywood", flag: "🇮🇳" };
  }
  if (requestedLang === "punjabi") {
    return { language: "Punjabi", industry: "Punjabi", flag: "⚡" };
  }
  if (requestedLang === "south-indian" || requestedLang === "south") {
    return { language: "Tamil / South Indian", industry: "South Indian", flag: "🔥" };
  }
  if (requestedLang === "korean" || requestedLang === "k-pop") {
    return { language: "Korean", industry: "K-Pop", flag: "🇰🇷" };
  }
  if (requestedLang === "spanish" || requestedLang === "latin") {
    return { language: "Spanish", industry: "Latin", flag: "💃" };
  }
  if (requestedLang === "instrumental") {
    return { language: "Instrumental", industry: "Soundtrack", flag: "🎹" };
  }

  return { language: "English", industry: "Global Hits", flag: "🎬" };
}

async function enrichSongsWithArtworkAndAudio(items) {
  return Promise.all(items.map(async (item) => {
    if (item.type !== "song") return item;
    if (item.artworkUrl && item.previewUrl) return item;
    try {
      const q = `${item.title} ${item.creator || ""}`.trim();
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=1`);
      if (res.ok) {
        const data = await res.json();
        const top = data.results?.[0];
        if (top) {
          const highResArtwork = top.artworkUrl100 ? top.artworkUrl100.replace("100x100bb", "600x600bb") : item.artworkUrl;
          return {
            ...item,
            poster: highResArtwork || item.poster,
            artworkUrl: highResArtwork || item.artworkUrl,
            previewUrl: top.previewUrl || item.previewUrl || "",
            duration: item.duration || formatDurationMs(top.trackTimeMillis),
            spotifyUrl: item.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(item.title + " " + (item.creator || ""))}`
          };
        }
      }
    } catch (e) {}
    return {
      ...item,
      spotifyUrl: item.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(item.title + " " + (item.creator || ""))}`
    };
  }));
}

function matchesLanguageFilter(item, langFilter) {
  if (!langFilter || langFilter === "all") return true;
  const lang = (item.language || "").toLowerCase();
  const industry = (item.industry || "").toLowerCase();
  const country = (item.country || "").toLowerCase();

  if (langFilter === "hindi" || langFilter === "bollywood") {
    return lang.includes("hindi") || industry.includes("bollywood") || (country.includes("india") && !industry.includes("south"));
  }
  if (langFilter === "punjabi") {
    return lang.includes("punjabi") || industry.includes("punjabi");
  }
  if (langFilter === "south-indian" || langFilter === "south") {
    return industry.includes("south") || ["tamil", "telugu", "malayalam", "kannada"].some(l => lang.includes(l));
  }
  if (langFilter === "english" || langFilter === "hollywood") {
    const isIndian = industry.includes("bollywood") || industry.includes("south") || country.includes("india");
    if (isIndian) return false;
    return industry.includes("hollywood") || lang.includes("english") || country.includes("united states") || country.includes("united kingdom") || country.includes("usa");
  }
  if (langFilter === "korean" || langFilter === "k-pop") {
    return lang.includes("korean") || industry.includes("k-pop") || industry.includes("world");
  }
  if (langFilter === "spanish" || langFilter === "latin") {
    return lang.includes("spanish") || industry.includes("latin") || industry.includes("world");
  }
  if (langFilter === "instrumental") {
    return lang.includes("instrumental") || industry.includes("soundtrack");
  }
  if (langFilter === "world" || langFilter === "international") {
    return industry.includes("world") || ["korean", "japanese", "french", "spanish", "german", "italian", "chinese", "cantonese"].some(l => lang.includes(l));
  }
  return lang.includes(langFilter) || industry.includes(langFilter);
}

async function searchAllSongsEver(queryClean, languageFilter = "all", mood = null) {
  const cleanQ = queryClean.trim();
  if (!cleanQ) return [];

  const rawResults = [];
  const seenTracks = new Set();

  // 1. Try Spotify Web API if client credentials are authenticated
  try {
    const token = await getSpotifyToken();
    if (token) {
      const spotifyUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(cleanQ)}&type=track&limit=50`;
      const sRes = await fetch(spotifyUrl, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        for (const item of (sData.tracks?.items || [])) {
          const key = (item.name + " " + (item.artists?.[0]?.name || "")).toLowerCase();
          if (!seenTracks.has(key)) {
            seenTracks.add(key);
            const artistNames = (item.artists || []).map(a => a.name).join(", ");
            const img = item.album?.images?.[0]?.url || item.album?.images?.[1]?.url || "";
            const langInfo = detectSongLanguage(item.name, artistNames, languageFilter);
            rawResults.push({
              id: `spotify-${item.id}`,
              type: "song",
              title: item.name,
              creator: artistNames,
              cast: `${artistNames} (Featured Artist)`,
              year: item.album?.release_date ? item.album.release_date.substring(0, 4) : "2023",
              genre: "Music / Spotify Pop",
              duration: formatDurationMs(item.duration_ms),
              rating: 9.3,
              language: langInfo.language,
              industry: langInfo.industry,
              flag: langInfo.flag,
              poster: img,
              artworkUrl: img,
              previewUrl: item.preview_url || "",
              audioPreviewUrl: item.preview_url || "",
              spotifyUrl: item.external_urls?.spotify || `https://open.spotify.com/track/${item.id}`,
              spotifyEmbedUrl: `https://open.spotify.com/embed/track/${item.id}`,
              lyricsUrl: `https://genius.com/search?q=${encodeURIComponent(item.name + " " + artistNames + " lyrics")}`,
              youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.name + " " + artistNames + " official song")}`,
              blurb: `Acclaimed track by ${artistNames} from album "${item.album?.name || item.name}".`,
              vibe: "melodic, rhythmic, stream on Spotify",
              reason: `Spotify match for "${cleanQ}"`
            });
          }
        }
      }
    }
  } catch (spotErr) {
    console.warn("Spotify search notice:", spotErr.message);
  }

  // 2. High-speed Live Apple Music / iTunes Search API - covers 100M+ songs worldwide with playable preview audio & 600x600 artwork
  try {
    const urlsToFetch = [];
    const isIndianLang = ["hindi", "punjabi", "south-indian", "tamil", "telugu", "malayalam"].includes(languageFilter.toLowerCase());
    
    // Direct track & general query
    urlsToFetch.push(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&entity=song&limit=50`);
    
    // Artist discography query
    urlsToFetch.push(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&attribute=artistTerm&entity=song&limit=50`);

    // Indian storefront query if language or query is Indian
    if (isIndianLang || cleanQ.toLowerCase().includes("singh") || cleanQ.toLowerCase().includes("kumar") || cleanQ.toLowerCase().includes("khan") || cleanQ.toLowerCase().includes("shreya") || cleanQ.toLowerCase().includes("anirudh") || cleanQ.toLowerCase().includes("diljit") || cleanQ.toLowerCase().includes("sidhu") || cleanQ.toLowerCase().includes("pritam") || cleanQ.toLowerCase().includes("rahman")) {
      urlsToFetch.push(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&country=in&entity=song&limit=50`);
      urlsToFetch.push(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&country=in&attribute=artistTerm&entity=song&limit=50`);
    }

    if (languageFilter === "korean" || cleanQ.toLowerCase().includes("k-pop") || cleanQ.toLowerCase().includes("bts") || cleanQ.toLowerCase().includes("blackpink")) {
      urlsToFetch.push(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&country=kr&entity=song&limit=50`);
    }

    if (languageFilter === "spanish" || cleanQ.toLowerCase().includes("latin") || cleanQ.toLowerCase().includes("reggaeton")) {
      urlsToFetch.push(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQ)}&country=us&entity=song&limit=50`);
    }

    for (const itunesUrl of urlsToFetch) {
      try {
        const res = await fetch(itunesUrl);
        if (res.ok) {
          const data = await res.json();
          for (const item of (data.results || [])) {
            const key = (item.trackName + " " + item.artistName).toLowerCase();
            if (!seenTracks.has(key)) {
              seenTracks.add(key);
              const highResArtwork = item.artworkUrl100 ? item.artworkUrl100.replace(/\/\d+x\d+bb\.(png|jpg)/, "/600x600bb.jpg") : "";
              const langInfo = detectSongLanguage(item.trackName, item.artistName, languageFilter);
              rawResults.push({
                id: `song-${item.trackId}`,
                type: "song",
                title: item.trackName,
                creator: item.artistName,
                cast: `${item.artistName} (Vocals / Composer)`,
                year: item.releaseDate ? item.releaseDate.substring(0, 4) : "2023",
                genre: item.primaryGenreName || "Music",
                duration: formatDurationMs(item.trackTimeMillis),
                rating: 9.3,
                language: langInfo.language,
                industry: langInfo.industry,
                flag: langInfo.flag,
                poster: highResArtwork,
                artworkUrl: highResArtwork,
                previewUrl: item.previewUrl || "",
                audioPreviewUrl: item.previewUrl || "",
                spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(item.trackName + " " + item.artistName)}`,
                youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.trackName + " " + item.artistName + " official song")}`,
                appleMusicUrl: item.trackViewUrl || "",
                lyricsUrl: `https://genius.com/search?q=${encodeURIComponent(item.trackName + " " + item.artistName + " lyrics")}`,
                blurb: `Popular track by ${item.artistName} from album "${item.collectionName || item.trackName}".`,
                vibe: `${item.primaryGenreName || 'melodic'}, rhythm, stream on Spotify & YouTube`,
                reason: `Live match for "${cleanQ}"`
              });
            }
          }
        }
      } catch (inner) {}
    }
  } catch (itunesErr) {
    console.warn("Live music search notice:", itunesErr.message);
  }

  // Strict language filtering: never return English tracks when regional language is selected
  if (languageFilter && languageFilter !== "all") {
    return rawResults.filter(item => matchesLanguageFilter(item, languageFilter));
  }
  return rawResults;
}

async function searchAllMoviesEver(queryClean, languageFilter = "all") {
  const cleanQ = queryClean.trim();
  if (!cleanQ) return [];

  const rawResults = [];
  const seenImdbIds = new Set();
  const firstChar = cleanQ.toLowerCase().replace(/[^a-z0-9]/g, '')[0] || 'a';

  // 1. DIRECT CONNECTION TO OFFICIAL IMDB SERVER (Live Amazon/IMDb CDN)
  try {
    const urls = [
      `https://v3.sg.media-imdb.com/suggestion/${firstChar}/${encodeURIComponent(cleanQ.toLowerCase())}.json`,
      `https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(cleanQ.toLowerCase())}.json`
    ];
    for (const imdbUrl of urls) {
      try {
        const res = await fetch(imdbUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json"
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.d && Array.isArray(data.d)) {
            for (const item of data.d) {
              if (item.id && item.id.startsWith("tt") && !seenImdbIds.has(item.id)) {
                seenImdbIds.add(item.id);
                rawResults.push({
                  imdbID: item.id,
                  Title: item.l,
                  Year: item.y ? String(item.y) : (item.tl || ""),
                  Poster: item.i?.imageUrl || "",
                  Actors: item.s || "",
                  Type: item.qid || item.q || "movie"
                });
              }
            }
          }
        }
      } catch (inner) {}
    }
  } catch (imdbErr) {
    console.warn("IMDb server suggestion error:", imdbErr.message);
  }

  // 2. EXACT TITLE MATCH & MULTI-PAGE SEARCH FROM OMDB / IMDB API
  try {
    const strippedTitle = cleanQ.replace(/\s*\(\d{4}\).*$/, "").replace(/\s+\d{4}$/, "").trim();
    const omdbPromises = [
      fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(cleanQ)}&apikey=trilogy`).then(r => r.json()).catch(() => null),
      fetch(`http://www.omdbapi.com/?s=${encodeURIComponent(cleanQ)}&page=1&apikey=trilogy`).then(r => r.json()).catch(() => null),
      fetch(`http://www.omdbapi.com/?s=${encodeURIComponent(cleanQ)}&page=2&apikey=trilogy`).then(r => r.json()).catch(() => null)
    ];
    if (strippedTitle && strippedTitle.toLowerCase() !== cleanQ.toLowerCase()) {
      omdbPromises.push(
        fetch(`http://www.omdbapi.com/?t=${encodeURIComponent(strippedTitle)}&apikey=trilogy`).then(r => r.json()).catch(() => null)
      );
    }
    const omdbResponses = await Promise.all(omdbPromises);
    const [tRes, p1Res, p2Res, sRes] = omdbResponses;

    if (tRes && tRes.Response === "True" && tRes.imdbID && !seenImdbIds.has(tRes.imdbID)) {
      seenImdbIds.add(tRes.imdbID);
      rawResults.unshift(tRes);
    }
    if (sRes && sRes.Response === "True" && sRes.imdbID && !seenImdbIds.has(sRes.imdbID)) {
      seenImdbIds.add(sRes.imdbID);
      rawResults.unshift(sRes);
    }

    const hits = [...(p1Res?.Search || []), ...(p2Res?.Search || [])];
    for (const h of hits) {
      if (h.imdbID && !seenImdbIds.has(h.imdbID)) {
        seenImdbIds.add(h.imdbID);
        rawResults.push(h);
      }
    }
  } catch (omdbErr) {
    console.warn("OMDb fetch error:", omdbErr.message);
  }

  // 3. ENRICH DETAILS (Plot, Director, Actors, Genre, Rating) FOR UP TO 25 ITEMS
  const enriched = await Promise.all(rawResults.slice(0, 25).map(async (item) => {
    if (item.Plot && item.imdbRating && item.Genre && item.Director && item.Director !== "N/A") {
      return item;
    }
    try {
      const dRes = await fetch(`http://www.omdbapi.com/?i=${item.imdbID}&apikey=trilogy`);
      const d = await dRes.json();
      if (d.Response === "True") {
        return {
          ...item,
          Title: d.Title || item.Title,
          Year: d.Year || item.Year,
          Poster: (d.Poster && d.Poster !== "N/A") ? d.Poster : item.Poster,
          Actors: (d.Actors && d.Actors !== "N/A") ? d.Actors : item.Actors,
          Director: (d.Director && d.Director !== "N/A") ? d.Director : "Director",
          Genre: (d.Genre && d.Genre !== "N/A") ? d.Genre : "Drama",
          Runtime: (d.Runtime && d.Runtime !== "N/A") ? d.Runtime : "Feature Film",
          imdbRating: (d.imdbRating && d.imdbRating !== "N/A") ? d.imdbRating : "7.5",
          Plot: (d.Plot && d.Plot !== "N/A") ? d.Plot : "",
          Language: (d.Language && d.Language !== "N/A") ? d.Language : "",
          Country: (d.Country && d.Country !== "N/A") ? d.Country : ""
        };
      }
    } catch (e) {}
    return item;
  }));

  // Map to standard schema
  const mapped = enriched.map(d => {
    const rawLang = d.Language || "English";
    const primaryLang = rawLang.split(",")[0].trim();
    const country = d.Country || "";

    let industry = "Hollywood";
    let flag = "🎬";
    const isIndian = country.toLowerCase().includes("india") || ["hindi", "tamil", "telugu", "malayalam", "kannada", "bengali", "marathi"].some(l => rawLang.toLowerCase().includes(l));

    if (isIndian) {
      const lower = rawLang.toLowerCase();
      if (lower.includes("tamil") || lower.includes("telugu") || lower.includes("malayalam") || lower.includes("kannada")) {
        industry = "South Indian";
        flag = "🔥";
      } else {
        industry = "Bollywood";
        flag = "🇮🇳";
      }
    } else if (["korean", "japanese", "french", "spanish", "german", "italian", "chinese", "cantonese"].some(l => rawLang.toLowerCase().includes(l))) {
      industry = "World Cinema";
      flag = "🌏";
    }

    const genres = (d.Genre || "Drama").split(",").map(g => g.trim().toLowerCase());
    const vibeTokens = [...genres.slice(0, 3)];
    if (parseFloat(d.imdbRating) >= 8.0) vibeTokens.push("critically acclaimed");
    if (parseInt(d.Year) < 2000) vibeTokens.push("classic");

    return {
      id: `imdb-${d.imdbID}`,
      type: "movie",
      title: d.Title,
      creator: d.Director && d.Director !== "N/A" ? d.Director : "Director",
      cast: d.Actors && d.Actors !== "N/A" ? d.Actors : "",
      year: d.Year || "",
      genre: d.Genre && d.Genre !== "N/A" ? d.Genre : "Drama",
      duration: d.Runtime && d.Runtime !== "N/A" ? d.Runtime : "Feature Film",
      rating: parseFloat(d.imdbRating) || 7.5,
      language: primaryLang,
      industry,
      country,
      flag,
      poster: d.Poster || "",
      artworkUrl: d.Poster || "",
      blurb: d.Plot && d.Plot !== "N/A" ? d.Plot : `Acclaimed ${industry} title starring ${d.Actors || "an ensemble cast"}.`,
      vibe: vibeTokens.join(", "),
      reason: `IMDb match for "${cleanQ}"`
    };
  });

  const qLower = cleanQ.toLowerCase();
  const exactOrClose = mapped.filter(item => {
    const t = (item.title || "").toLowerCase();
    return t === qLower || t.startsWith(qLower + ":") || t.startsWith(qLower + " -") || t.startsWith(qLower + " (");
  });

  let filtered = mapped.filter(item => matchesLanguageFilter(item, languageFilter));
  if (filtered.length === 0 && mapped.length > 0) {
    filtered = mapped;
  }
  for (const item of exactOrClose) {
    if (!filtered.some(f => f.id === item.id)) {
      filtered.unshift(item);
    }
  }
  return filtered;
}

app.get("/api/trending", async (req, res) => {
  try {
    const { language = "all", type = "all", limit = 100 } = req.query;

    if (type === "song") {
      const curatedItems = getCuratedRecommendations("", "song", 100, language, null);

      let genreQuery = "Top Hits 2024";
      if (language === "hindi") genreQuery = "Bollywood Top Hits Arijit Singh Pritam";
      else if (language === "punjabi") genreQuery = "Punjabi Top Hits Diljit Dosanjh Karan Aujla";
      else if (language === "south-indian") genreQuery = "Tamil Telugu Top Hits Anirudh Ravichander";
      else if (language === "korean") genreQuery = "K-Pop Top Hits BTS NewJeans Stray Kids";
      else if (language === "spanish") genreQuery = "Latin Top Hits Bad Bunny Karol G";
      else if (language === "english") genreQuery = "Global Top Hits Billboard Pop";

      const liveSongs = await searchAllSongsEver(genreQuery, language, null);

      const seen = new Set();
      const combined = [];
      for (const item of [...curatedItems, ...liveSongs]) {
        const norm = (item.title + " " + item.creator).toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!seen.has(norm)) {
          seen.add(norm);
          combined.push(item);
        }
      }
      return res.json({ results: combined.slice(0, parseInt(limit) || 100) });
    }

    const items = getCuratedRecommendations("", type, parseInt(limit) || 100, language, null);
    res.json({ results: items });
  } catch (error) {
    console.error("Trending Error:", error);
    res.status(500).json({ error: "Failed to load trending cinema." });
  }
});

/* --------------------------------------------------------------- */
/* TOP 10 MOVIES ALL-TIME ENDPOINT                                 */
/* --------------------------------------------------------------- */
const TOP_10_ALL_TIME = [
  {
    id: "top-alltime-tt0111161",
    type: "movie",
    title: "The Shawshank Redemption",
    creator: "Frank Darabont",
    cast: "Tim Robbins, Morgan Freeman, Bob Gunton",
    year: "1994",
    genre: "Drama",
    duration: "142 min",
    rating: 9.3,
    language: "English",
    industry: "Hollywood",
    flag: "🎬",
    poster: "https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2NDExXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2NDExXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    blurb: "A banker convicted of uxoricide forms a friendship over a quarter of a century with a hardened convict, while maintaining his innocence.",
    vibe: "masterpiece, legendary, acclaimed, iconic, hope",
    reason: "#1 All-Time Greatest Movie (IMDb 9.3)"
  },
  {
    id: "top-alltime-tt0068646",
    type: "movie",
    title: "The Godfather",
    creator: "Francis Ford Coppola",
    cast: "Marlon Brando, Al Pacino, James Caan",
    year: "1972",
    genre: "Crime, Drama",
    duration: "175 min",
    rating: 9.2,
    language: "English",
    industry: "Hollywood",
    flag: "🎬",
    poster: "https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_QL75_UY562_CR8,0,380,562_.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_QL75_UY562_CR8,0,380,562_.jpg",
    blurb: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    vibe: "masterpiece, legendary, acclaimed, iconic",
    reason: "#2 All-Time Greatest Movie (IMDb 9.2)"
  },
  {
    id: "top-alltime-tt0468569",
    type: "movie",
    title: "The Dark Knight",
    creator: "Christopher Nolan",
    cast: "Christian Bale, Heath Ledger, Aaron Eckhart",
    year: "2008",
    genre: "Action, Crime, Drama",
    duration: "152 min",
    rating: 9.1,
    language: "English",
    industry: "Hollywood",
    flag: "🎬",
    poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    blurb: "When a menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
    vibe: "masterpiece, legendary, acclaimed, iconic",
    reason: "#3 All-Time Greatest Movie (IMDb 9.1)"
  },
  {
    id: "top-alltime-tt0071562",
    type: "movie",
    title: "The Godfather Part II",
    creator: "Francis Ford Coppola",
    cast: "Al Pacino, Robert De Niro, Robert Duvall",
    year: "1974",
    genre: "Crime, Drama",
    duration: "202 min",
    rating: 9.0,
    language: "English",
    industry: "Hollywood",
    flag: "🎬",
    poster: "https://m.media-amazon.com/images/M/MV5BMDIxMzBlZDktZjMxNy00ZGI4LTgxNDEtYWRlNzRjMjJmOGQ1XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BMDIxMzBlZDktZjMxNy00ZGI4LTgxNDEtYWRlNzRjMjJmOGQ1XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    blurb: "The early life and career of Vito Corleone in 1920s New York City is portrayed, while his son, Michael, expands and tightens his grip on the family crime syndicate.",
    vibe: "masterpiece, legendary, acclaimed, iconic",
    reason: "#4 All-Time Greatest Movie (IMDb 9.0)"
  },
  {
    id: "top-alltime-tt0050083",
    type: "movie",
    title: "12 Angry Men",
    creator: "Sidney Lumet",
    cast: "Henry Fonda, Lee J. Cobb, Martin Balsam",
    year: "1957",
    genre: "Crime, Drama",
    duration: "96 min",
    rating: 9.0,
    language: "English",
    industry: "Hollywood",
    flag: "🎬",
    poster: "https://m.media-amazon.com/images/M/MV5BYjE4NzdmOTYtYjc5Yi00YzBiLWEzNDEtNTgxZGQ2MWVkN2NiXkEyXkFqcGc@._V1_QL75_UX380_CR0,11,380,562_.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BYjE4NzdmOTYtYjc5Yi00YzBiLWEzNDEtNTgxZGQ2MWVkN2NiXkEyXkFqcGc@._V1_QL75_UX380_CR0,11,380,562_.jpg",
    blurb: "The jury in a New York City murder trial is frustrated by a single member whose skeptical caution forces them to consider the evidence before jumping to a verdict.",
    vibe: "masterpiece, legendary, acclaimed, iconic",
    reason: "#5 All-Time Greatest Movie (IMDb 9.0)"
  },
  {
    id: "top-alltime-tt0108052",
    type: "movie",
    title: "Schindler's List",
    creator: "Steven Spielberg",
    cast: "Liam Neeson, Ralph Fiennes, Ben Kingsley",
    year: "1993",
    genre: "Biography, Drama, History",
    duration: "195 min",
    rating: 9.0,
    language: "English",
    industry: "Hollywood",
    flag: "🎬",
    poster: "https://m.media-amazon.com/images/M/MV5BNjM1ZDQxYWUtMzQyZS00MTE1LWJmZGYtNGUyNTdlYjM3ZmVmXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BNjM1ZDQxYWUtMzQyZS00MTE1LWJmZGYtNGUyNTdlYjM3ZmVmXkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    blurb: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce.",
    vibe: "masterpiece, legendary, acclaimed, iconic",
    reason: "#6 All-Time Greatest Movie (IMDb 9.0)"
  },
  {
    id: "top-alltime-tt0167260",
    type: "movie",
    title: "The Lord of the Rings: The Return of the King",
    creator: "Peter Jackson",
    cast: "Elijah Wood, Viggo Mortensen, Ian McKellen",
    year: "2003",
    genre: "Adventure, Drama, Fantasy",
    duration: "201 min",
    rating: 9.0,
    language: "English",
    industry: "Hollywood",
    flag: "🎬",
    poster: "https://m.media-amazon.com/images/M/MV5BMTZkMjBjNWMtZGI5OC00MGU0LTk4ZTItODg2NWM3NTVmNWQ4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BMTZkMjBjNWMtZGI5OC00MGU0LTk4ZTItODg2NWM3NTVmNWQ4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    blurb: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
    vibe: "masterpiece, legendary, acclaimed, iconic",
    reason: "#7 All-Time Greatest Movie (IMDb 9.0)"
  },
  {
    id: "top-alltime-tt0110912",
    type: "movie",
    title: "Pulp Fiction",
    creator: "Quentin Tarantino",
    cast: "John Travolta, Uma Thurman, Samuel L. Jackson",
    year: "1994",
    genre: "Crime, Drama",
    duration: "154 min",
    rating: 8.8,
    language: "English",
    industry: "Hollywood",
    flag: "🎬",
    poster: "https://m.media-amazon.com/images/M/MV5BYTViYTE3ZGQtNDBlMC00ZTAyLTkyODMtZGRiZDg0MjA2YThkXkEyXkFqcGc@._V1_QL75_UY562_CR3,0,380,562_.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BYTViYTE3ZGQtNDBlMC00ZTAyLTkyODMtZGRiZDg0MjA2YThkXkEyXkFqcGc@._V1_QL75_UY562_CR3,0,380,562_.jpg",
    blurb: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    vibe: "masterpiece, legendary, acclaimed, iconic",
    reason: "#8 All-Time Greatest Movie (IMDb 8.8)"
  },
  {
    id: "top-alltime-tt1375666",
    type: "movie",
    title: "Inception",
    creator: "Christopher Nolan",
    cast: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
    year: "2010",
    genre: "Action, Adventure, Sci-Fi",
    duration: "148 min",
    rating: 8.8,
    language: "English",
    industry: "Hollywood",
    flag: "🎬",
    poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_QL75_UX380_CR0,0,380,562_.jpg",
    blurb: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    vibe: "masterpiece, legendary, acclaimed, iconic",
    reason: "#9 All-Time Greatest Movie (IMDb 8.8)"
  },
  {
    id: "top-alltime-tt0137523",
    type: "movie",
    title: "Fight Club",
    creator: "David Fincher",
    cast: "Brad Pitt, Edward Norton, Meat Loaf",
    year: "1999",
    genre: "Crime, Drama, Thriller",
    duration: "139 min",
    rating: 8.8,
    language: "English",
    industry: "Hollywood",
    flag: "🎬",
    poster: "https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_QL75_UX380_CR0,4,380,562_.jpg",
    blurb: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
    vibe: "masterpiece, legendary, acclaimed, iconic",
    reason: "#10 All-Time Greatest Movie (IMDb 8.8)"
  }
];

app.get("/api/top-movies", (_req, res) => {
  try {
    res.json({ results: TOP_10_ALL_TIME });
  } catch (error) {
    console.error("Top Movies Error:", error);
    res.status(500).json({ error: "Failed to load top movies all-time." });
  }
});

app.post("/api/mood-search", async (req, res) => {
  const { text, type = "all", language = "all", mood = null, suggestion = null, refresh = false } = req.body;

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "A search query is required." });
  }

  const queryClean = text.trim();
  const exactMood = resolveMood(queryClean, mood);
  const cacheKey = `${type}:${language}:${exactMood || 'none'}:${suggestion || 'nosug'}:${queryClean.toLowerCase()}`;

  // 1. Check Cache (skip if refresh requested)
  if (!refresh) {
    try {
      const checkCacheStmt = db.prepare(`SELECT results FROM search_cache WHERE query_key = ?`);
      const cachedData = checkCacheStmt.get(cacheKey);

      if (cachedData) {
        console.log(`⚡ Serving from local cache: "${queryClean}" [Mood: ${exactMood || 'freeform'}, Lang: ${language}, Type: ${type}]`);
        return res.json({ results: JSON.parse(cachedData.results), source: "cache", mood: exactMood });
      }
    } catch (cacheErr) {
      console.warn("Cache check warning:", cacheErr.message);
    }
  }

  // 2. Attempt Gemini AI if key exists
  const hasValidKey = Boolean(genAI && currentApiKey && !currentApiKey.includes("YOUR_GEMINI_API_KEY") && currentApiKey.length > 10);

  if (hasValidKey) {
    console.log(`🤖 Querying Gemini AI for mood: "${queryClean}" [Mood: ${exactMood || 'freeform'}, Lang: ${language}, Type: ${type}]`);

    const candidateModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName, 
          systemInstruction: MOOD_SYSTEM_PROMPT,
        });

        let typeInstruction = "Provide real acclaimed movies and songs matching the requested mood.";
        if (type === "movie") {
          typeInstruction = "Provide strictly movies. Set type to 'movie'. Include realistic director as creator, top 3-4 cast members, release year, duration, and plot blurb.";
        } else if (type === "song") {
          typeInstruction = "Provide strictly songs. Set type to 'song'. Include singer / music director as creator, featuring artist / movie or album name as cast, release year, duration, and musical mood blurb.";
        }

        const prompt = `Requested Mood Category: ${exactMood ? exactMood.toUpperCase() : "GENERAL DISCOVERY"}
User Query / Emotion / Suggestions: "${queryClean}"
Target Language / Industry: ${language}
Target Media Type: ${type}

MANDATORY RULES:
1. STRICT MOOD ACCURACY: Every single recommended item MUST strictly and authentically embody the mood "${exactMood || queryClean}".
${suggestion ? `2. SELECTED SUGGESTION FOCUS: The user explicitly selected the sub-theme "${suggestion}". Prioritize titles embodying this specific angle within the mood!` : ""}
3. ${typeInstruction}
4. STRICT LANGUAGE FIDELITY:
- If language is 'hindi', return ONLY authentic Bollywood Hindi titles.
- If language is 'punjabi', return authentic Punjabi titles.
- If language is 'english', return Hollywood cinema or global English hits.
- If language is 'south-indian', return acclaimed Tamil, Telugu, Malayalam, or Kannada titles.
- If language is 'korean', return acclaimed K-Pop or Korean cinema.
- If language is 'spanish', return acclaimed Latin/Spanish titles.
- If language is 'all', return a rich variety of iconic hits across cultures all matching the mood.
5. REAL TITLES ONLY: Absolute zero hallucinations. Return celebrated, real masterworks with accurate release years.`;

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { 
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
            responseSchema: {
              type: SchemaType.OBJECT,
              properties: {
                results: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      id: { type: SchemaType.STRING },
                      type: { type: SchemaType.STRING },
                      title: { type: SchemaType.STRING },
                      creator: { type: SchemaType.STRING },
                      cast: { type: SchemaType.STRING },
                      year: { type: SchemaType.STRING },
                      genre: { type: SchemaType.STRING },
                      duration: { type: SchemaType.STRING },
                      rating: { type: SchemaType.NUMBER },
                      language: { type: SchemaType.STRING },
                      industry: { type: SchemaType.STRING },
                      blurb: { type: SchemaType.STRING },
                      vibe: { type: SchemaType.STRING },
                      reason: { type: SchemaType.STRING }
                    },
                    required: ["type", "title", "creator", "cast", "year", "genre", "duration", "rating", "blurb", "vibe", "reason"]
                  }
                }
              },
              required: ["results"]
            }
          }
        });

        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        if (parsed && Array.isArray(parsed.results) && parsed.results.length > 0) {
          let filteredResults = parsed.results;
          if (exactMood === "feelgood" || exactMood === "romantic") {
            filteredResults = filteredResults.filter(item => !/\b(horror|slasher|tragedy)\b/i.test(item.genre || ""));
          } else if (exactMood === "spooky") {
            filteredResults = filteredResults.filter(item => !/\b(romantic comedy|rom-com)\b/i.test(item.genre || ""));
          }

          // Enrich movies with real posters and enrich songs with real artwork & audio previews
          const moviesEnriched = await enrichWithPosterAndCast(filteredResults.filter(i => i.type === "movie"));
          const songsEnriched = await enrichSongsWithArtworkAndAudio(filteredResults.filter(i => i.type === "song"));

          const combinedEnriched = [...moviesEnriched, ...songsEnriched].map((item, index) => {
            const langLower = (item.language || language).toLowerCase();
            let flag = "🎬";
            if (item.type === "song") flag = "🎵";
            if (langLower.includes("hindi")) flag = "🇮🇳";
            else if (langLower.includes("punjabi")) flag = "⚡";
            else if (langLower.includes("tamil") || langLower.includes("telugu") || langLower.includes("malayalam")) flag = "🔥";
            else if (langLower.includes("korean")) flag = "🇰🇷";
            else if (langLower.includes("spanish")) flag = "💃";

            return {
              ...item,
              id: item.id || `ai-${Date.now()}-${index}`,
              flag,
              spotifyUrl: item.type === "song" 
                ? (item.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(item.title + " " + (item.creator || ""))}`)
                : undefined
            };
          });

          try {
            const insertCacheStmt = db.prepare(`INSERT OR REPLACE INTO search_cache (query_key, results) VALUES (?, ?)`);
            insertCacheStmt.run(cacheKey, JSON.stringify(combinedEnriched));
          } catch (cErr) {
            console.warn("Could not cache AI results:", cErr.message);
          }

          return res.json({ results: combinedEnriched, source: "gemini", model: modelName, mood: exactMood });
        }
      } catch (geminiError) {
        console.warn(`Gemini model ${modelName} error:`, geminiError.message);
      }
    }
  }

  // 3. Recommendation & Global Search Engine (Movies & Songs)
  let results = [];

  if (exactMood) {
    console.log(`🎬 Serving curated mood recommendations for: "${queryClean}" [Mood: ${exactMood}, Lang: ${language}, Type: ${type}, Suggestion: ${suggestion || "none"}]`);
    const curatedMatches = getCuratedRecommendations(queryClean, type, 150, language, exactMood, suggestion);

    // If type is song, or all, pull comprehensive live songs matching the mood/theme/language!
    if (type === "song") {
      let songSearchTerm = suggestion || queryClean;
      if (exactMood === "feelgood") songSearchTerm += " feel good happy dance pop";
      else if (exactMood === "romantic") songSearchTerm += " romantic love melodies";
      else if (exactMood === "highenergy") songSearchTerm += " party edm dance high energy";
      else if (exactMood === "chill") songSearchTerm += " chill acoustic relaxing lo-fi";
      else if (exactMood === "cry") songSearchTerm += " sad heartbreak emotional acoustic";
      else if (exactMood === "nostalgic") songSearchTerm += " classic 90s 2000s hits";
      else if (exactMood === "comfort") songSearchTerm += " acoustic warm melodies";
      else if (exactMood === "trippy") songSearchTerm += " synthwave psychedelic electronic";
      else if (exactMood === "darkgritty") songSearchTerm += " dark moody rock hip hop";

      const liveSongs = await searchAllSongsEver(songSearchTerm.trim(), language, exactMood);
      const seen = new Set();
      const combined = [];
      for (const item of [...curatedMatches, ...liveSongs]) {
        const norm = ((item.title || "") + " " + (item.creator || "")).toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!seen.has(norm)) {
          seen.add(norm);
          combined.push(item);
        }
      }
      results = combined;
    } else {
      results = curatedMatches;
    }
  } else {
    // Freeform Search (Title, Actor, Singer, Director, Mood Keyword):
    console.log(`🌐 Global search for: "${queryClean}" [Lang: ${language}, Type: ${type}]`);

    if (type === "song") {
      const [liveSongs, curatedSongs] = await Promise.all([
        searchAllSongsEver(queryClean, language),
        getCuratedRecommendations(queryClean, "song", 100, language, null, suggestion)
      ]);
      const seen = new Set();
      const combined = [];
      for (const item of [...curatedSongs, ...liveSongs]) {
        const norm = (item.title + " " + item.creator).toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!seen.has(norm)) {
          seen.add(norm);
          combined.push(item);
        }
      }
      results = combined;
    } else if (type === "movie") {
      const [curatedMatches, globalMatches] = await Promise.all([
        getCuratedRecommendations(queryClean, "movie", 100, language, null, suggestion),
        searchAllMoviesEver(queryClean, language)
      ]);
      const seen = new Set();
      const combined = [];
      for (const item of [...globalMatches, ...curatedMatches]) {
        const norm = (item.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!seen.has(norm)) {
          seen.add(norm);
          combined.push(item);
        }
      }
      results = combined;
    } else {
      // Type is "all": search both movies and songs
      const [curatedMatches, globalMovies, liveSongs] = await Promise.all([
        getCuratedRecommendations(queryClean, "all", 100, language, null, suggestion),
        searchAllMoviesEver(queryClean, language),
        searchAllSongsEver(queryClean, language)
      ]);
      const seen = new Set();
      const combined = [];
      for (const item of [...globalMovies, ...liveSongs, ...curatedMatches]) {
        const norm = ((item.title || "") + " " + (item.creator || "")).toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!seen.has(norm)) {
          seen.add(norm);
          combined.push(item);
        }
      }
      results = combined;
    }

    // Rank exact or high-affinity matches to the top
    const qLower = queryClean.toLowerCase();
    const qAlpha = qLower.replace(/[^a-z0-9]/g, "");

    function calcMatchScore(item) {
      const titleLower = (item.title || "").toLowerCase();
      const titleAlpha = titleLower.replace(/[^a-z0-9]/g, "");
      let score = 0;

      if (titleAlpha === qAlpha) score += 1000;
      else if (titleLower === qLower) score += 900;
      else if (titleAlpha.startsWith(qAlpha)) score += 500;
      else if (titleLower.startsWith(qLower)) score += 400;
      else if (titleAlpha.includes(qAlpha)) score += 200;
      else if (titleLower.includes(qLower)) score += 150;

      const castLower = (item.cast || "").toLowerCase();
      const creatorLower = (item.creator || "").toLowerCase();
      if (castLower.includes(qLower) || creatorLower.includes(qLower)) score += 100;

      score += (item.rating || 7.0) * 5;
      return score;
    }

    results.sort((a, b) => calcMatchScore(b) - calcMatchScore(a));
  }

  // Cache results
  if (results.length > 0) {
    try {
      const insertCacheStmt = db.prepare(`INSERT OR REPLACE INTO search_cache (query_key, results) VALUES (?, ?)`);
      insertCacheStmt.run(cacheKey, JSON.stringify(results));
    } catch (cErr) {
      console.warn("Could not cache search results:", cErr.message);
    }
  }

  return res.json({
    results,
    source: results.length > 0 && results[0].id?.startsWith("spotify-") 
      ? "spotify_api" 
      : results.length > 0 && results[0].id?.startsWith("song-") 
        ? "live_music" 
        : results.length > 0 && results[0].id?.startsWith("imdb-") 
          ? "global_omdb" 
          : "curated",
    language,
    mood: exactMood,
    suggestion,
    notice: exactMood
      ? `Showing recommendations strictly matching ${exactMood.toUpperCase()}${suggestion ? ` • ${suggestion}` : ""}.`
      : `Found ${results.length} matches across movies and music for "${queryClean}".`
  });
});

app.post("/api/songs/search", async (req, res) => {
  try {
    const { query = "", language = "all", mood = null, limit = 50 } = req.body;
    const q = (query || "").trim();
    const [liveSongs, curatedSongs] = await Promise.all([
      searchAllSongsEver(q, language, mood),
      getCuratedRecommendations(q, "song", limit, language, mood)
    ]);

    const seen = new Set();
    const results = [];
    for (const s of [...liveSongs, ...curatedSongs]) {
      const key = (s.title + " " + s.creator).toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!seen.has(key)) {
        seen.add(key);
        results.push(s);
      }
    }
    res.json({ 
      results: results.slice(0, limit), 
      source: liveSongs.length > 0 ? "live_music" : "curated" 
    });
  } catch (err) {
    console.error("Songs search error:", err);
    res.status(500).json({ error: "Failed to search songs." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "echo-abyss-api", activeApiKey: Boolean(currentApiKey && !currentApiKey.includes("YOUR_GEMINI_API_KEY")) });
});

/* --------------------------------------------------------------- */
/* GLOBAL SAFETY NETS                                              */
/* --------------------------------------------------------------- */

app.use((req, res) => {
  res.status(404).json({ error: `Backend Route ${req.method} ${req.url} not found.` });
});

app.use((err, req, res, next) => {
  console.error("CRITICAL SERVER ERROR:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});