import { useMemo, useRef, useState, useEffect } from "react";
import {
  Search,
  Bookmark,
  Heart,
  Star,
  Clock,
  Calendar,
  User,
  Users,
  Clapperboard,
  Disc3,
  ChevronDown,
  X,
  Pencil,
  Check,
  Sparkles,
  Youtube,
  Key,
  LogOut,
  Eye,
  EyeOff,
  Film,
  Compass,
  Flame,
  Globe,
  ShieldCheck,
  LayoutGrid,
  List,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Tv,
  ExternalLink,
  PlayCircle,
  Play,
  Pause,
  Music,
  Radio,
  Volume2,
  RefreshCw,
  Shuffle,
  Mic2,
  FileText,
  Headphones,
} from "lucide-react";
import TasteProfile from "./TasteProfile";
import MusicPlayerApp from "./MusicPlayerApp";

/* --------------------------------------------------------------- */
/* CONSTANTS & SETUP                                               */
/* --------------------------------------------------------------- */

const CINEMA_LANGUAGES = [
  { id: "all", label: "🌐 All Cinema", flag: "🌐" },
  { id: "hindi", label: "🇮🇳 Bollywood (Hindi)", flag: "🇮🇳" },
  { id: "english", label: "🎬 Hollywood (English)", flag: "🎬" },
  { id: "south-indian", label: "🔥 South Indian", flag: "🔥" },
  { id: "world", label: "🌏 World Cinema", flag: "🌏" },
];

const MUSIC_LANGUAGES = [
  { id: "all", label: "🌐 All Music", flag: "🌐" },
  { id: "hindi", label: "🇮🇳 Bollywood / Hindi", flag: "🇮🇳" },
  { id: "punjabi", label: "⚡ Punjabi Hits", flag: "⚡" },
  { id: "english", label: "🎬 English / Global Hits", flag: "🎬" },
  { id: "south-indian", label: "🔥 South Indian (Tamil/Telugu/Malayalam)", flag: "🔥" },
  { id: "korean", label: "🇰🇷 K-Pop & OSTs", flag: "🇰🇷" },
  { id: "spanish", label: "💃 Latin / Spanish", flag: "💃" },
  { id: "instrumental", label: "🎹 Lo-Fi & Soundtracks", flag: "🎹" },
];

const MOODS = [
  { id: "feelgood", label: "🍿 Feel-Good & Warm", prompt: "something warm, joyful, heartwarming, and comforting" },
  { id: "latenight", label: "🌙 Late-Night & Moody", prompt: "atmospheric, neo-noir, moody, perfect for a quiet late night" },
  { id: "cry", label: "🌧️ A Good Cry", prompt: "deeply emotional, bittersweet, heartbreak, something that will make me cry" },
  { id: "highenergy", label: "⚡ High Adrenaline", prompt: "high energy, explosive, adrenaline-fueled, action, fast-paced" },
  { id: "mindbending", label: "🌀 Mind-Bending & Sci-Fi", prompt: "psychological puzzles, time travel, multiverse, mind-bending twists" },
  { id: "darkgritty", label: "🕵️ Dark & Gritty Noir", prompt: "crime thriller, neo-noir, detective, suspenseful, gritty tension" },
  { id: "spooky", label: "👻 Spooky & Thriller", prompt: "psychological horror, eerie suspense, chilling, edge of your seat" },
  { id: "romantic", label: "💖 Romantic & Chemistry", prompt: "captivating romance, deep connection, passionate chemistry, love" },
  { id: "nostalgic", label: "📼 Nostalgic Retro", prompt: "nostalgic coming-of-age, 80s 90s classic cinema, golden hour" },
  { id: "escapist", label: "🌌 Epic Adventure", prompt: "breathtaking fantasy, epic world-building, escapism, grand journey" },
];

const MOOD_SUGGESTIONS = {
  feelgood: [
    { id: "fg-all", label: "✨ All Feel-Good", query: "warm joyful heartwarming comforting feel good" },
    { id: "fg-comedy", label: "😂 Laugh-Out-Loud Comedy", query: "comedy hilarious funny laughter lighthearted" },
    { id: "fg-friendship", label: "🤝 Friendship & Road Trips", query: "friendship buddies road trip college gang friends" },
    { id: "fg-romance", label: "💖 Heartwarming Romance", query: "wholesome romance sweet chemistry charming cute" },
    { id: "fg-underdog", label: "🏆 Inspiring Underdogs", query: "inspiring underdog victory triumph motivation dream" },
    { id: "fg-family", label: "🏡 Family & Cozy Warmth", query: "family heartwarming cozy home togetherness bonding" }
  ],
  latenight: [
    { id: "ln-all", label: "🌙 All Late-Night", query: "atmospheric neo-noir moody quiet late night midnight" },
    { id: "ln-neon", label: "🏙️ Neon Noir & City", query: "neon city skyline cyberpunk nocturnal rain dark streets" },
    { id: "ln-chill", label: "☕ Low-Key & Contemplative", query: "quiet mellow contemplative indie slow burn reflective" },
    { id: "ln-mystery", label: "🕵️ Midnight Mystery", query: "investigation detective puzzle slow mystery secrets" },
    { id: "ln-drives", label: "🚗 Midnight Road Trip", query: "driving road night drive ambient solitude distance" }
  ],
  cry: [
    { id: "cry-all", label: "🌧️ All Tearjerkers", query: "deeply emotional bittersweet heartbreak make me cry tears" },
    { id: "cry-heartbreak", label: "💔 Romantic Heartbreak", query: "heartbreak unrequited separation breakup longing sadness" },
    { id: "cry-loss", label: "🕊️ Grief & Farewell", query: "grief loss terminal farewell memories mourning" },
    { id: "cry-sacrifice", label: "🛡️ Selfless Sacrifice", query: "sacrifice loyalty devotion heroic martyrdom protection" },
    { id: "cry-family", label: "👨‍👩‍👧 Family Tears", query: "family father mother daughter son reunion emotional" }
  ],
  highenergy: [
    { id: "he-all", label: "⚡ All High Adrenaline", query: "high energy explosive adrenaline action fast-paced rush" },
    { id: "he-martial", label: "🥋 Hand-to-Hand & Martial Arts", query: "martial arts hand-to-hand fight combat stunts brawl" },
    { id: "he-heist", label: "🏎️ Supercars & Heists", query: "car chase heist speed racing robbery getaway adrenaline" },
    { id: "he-blockbuster", label: "💥 Explosive Blockbusters", query: "explosions spectacle superhero destruction mission guns" },
    { id: "he-spy", label: "🕶️ Tactical Spy Thriller", query: "secret agent spy espionage assassination undercover sniper" }
  ],
  mindbending: [
    { id: "mb-all", label: "🌀 All Mind-Bending", query: "psychological puzzles time travel multiverse twists sci-fi" },
    { id: "mb-timeloop", label: "⏳ Time Travel & Loops", query: "time loop time travel paradox temporal timeline rewind" },
    { id: "mb-twists", label: "🤯 Shocking Plot Twists", query: "plot twist shocking ending unreliable narrator jaw dropping" },
    { id: "mb-simulation", label: "🖥️ AI & Reality Glitches", query: "simulation virtual reality artificial intelligence glitch matrix" },
    { id: "mb-space", label: "🚀 Cosmic Space Odyssey", query: "space interstellar cosmic black hole dimension universe" }
  ],
  darkgritty: [
    { id: "dg-all", label: "🕵️ All Dark & Gritty", query: "crime thriller neo-noir detective suspenseful gritty tension" },
    { id: "dg-mafia", label: "🥃 Underworld & Mafia", query: "gangster mob mafia underworld cartel crime syndicate" },
    { id: "dg-serial", label: "🔪 Serial Killer Hunt", query: "serial killer manhunt detective forensic homicide mystery" },
    { id: "dg-cops", label: "🚨 Corrupt Cops & Detectives", query: "detective police corruption neo-noir gritty streets hardboiled" },
    { id: "dg-revenge", label: "⚔️ Blood Vengeance", query: "revenge retribution vengeance vendetta payback brutality" }
  ],
  spooky: [
    { id: "sp-all", label: "👻 All Spooky & Thriller", query: "psychological horror eerie suspense chilling edge of seat" },
    { id: "sp-haunted", label: "🏚️ Haunted Houses & Ghosts", query: "haunted house ghost spirits supernatural paranormal apparition" },
    { id: "sp-psych", label: "🧠 Psychological Chiller", query: "psychological dread paranoia insanity creeping suspense mind games" },
    { id: "sp-demons", label: "🕯️ Demonic & Occult", query: "demons possession occult rituals curse exorcism evil" },
    { id: "sp-slasher", label: "🩸 Survival & Slashers", query: "slasher monster creature survival cabin woods chase" }
  ],
  romantic: [
    { id: "ro-all", label: "💖 All Romance", query: "captivating romance deep connection passionate chemistry love" },
    { id: "ro-enemies", label: "⚡ Enemies to Lovers", query: "enemies to lovers rivalry banter fiery tension passionate" },
    { id: "ro-soulmates", label: "✨ Destiny & Soulmates", query: "soulmates destiny eternal love deep connection meant to be" },
    { id: "ro-romcom", label: "🍿 Classic Rom-Com", query: "romantic comedy romcom witty funny charming feel good love" },
    { id: "ro-monsoon", label: "🌧️ Rain & Monsoon Passion", query: "monsoon rain intense passion intimate tender romantic" },
    { id: "ro-college", label: "🎒 First Love & College", query: "first love college youth innocent school crush nostalgia" }
  ],
  nostalgic: [
    { id: "no-all", label: "📼 All Nostalgic Retro", query: "nostalgic coming-of-age 80s 90s classic cinema golden hour" },
    { id: "no-80s90s", label: "📻 80s & 90s Golden Era", query: "80s 90s vintage retro cassette golden era classics" },
    { id: "no-youth", label: "🚲 Coming-of-Age Youth", query: "coming-of-age childhood summer friends growing up nostalgia" },
    { id: "no-college", label: "🎓 College & Hostel Days", query: "college days hostel engineering youthful memories rebellion" },
    { id: "no-classics", label: "🏛️ Golden Age Masterpieces", query: "vintage cinema black and white golden age iconic classic" }
  ],
  escapist: [
    { id: "es-all", label: "🌌 All Epic Adventure", query: "breathtaking fantasy epic world-building escapism grand journey" },
    { id: "es-fantasy", label: "🗡️ High Fantasy & Magic", query: "high fantasy magic swords dragons mythology kingdoms" },
    { id: "es-quest", label: "🗺️ Quests & Treasure Hunts", query: "quest treasure hunt expedition exploration jungle uncharted" },
    { id: "es-scifi", label: "🛸 Grand Space Operas", query: "space opera alien planets galactic empire odyssey exploration" },
    { id: "es-mythology", label: "🏹 Mythological Epics", query: "mythology ancient gods warriors legends folklore epics" }
  ]
};

const NAV_TABS = [
  { id: "discover", label: "Discover", icon: Compass },
  { id: "music", label: "Music & Songs", icon: Music },
  { id: "watchlist", label: "Watchlist", icon: Bookmark },
  { id: "favourites", label: "Favourites", icon: Heart },
  { id: "profile", label: "Taste Profile", icon: User },
];

// DEEP ABYSS GRADIENTS
const GRADIENTS = [
  "linear-gradient(135deg, #09152b, #02040a)",
  "linear-gradient(135deg, #0e1e3e, #040914)",
  "linear-gradient(135deg, #0b2545, #030c17)",
  "linear-gradient(135deg, #13294b, #050d1a)",
  "linear-gradient(135deg, #0f1c3f, #030712)",
  "linear-gradient(135deg, #172a53, #060b17)",
  "linear-gradient(135deg, #081d3d, #02070f)",
  "linear-gradient(135deg, #102447, #040a14)",
];

const BACKEND_URL = "http://localhost:5001";

export const getLyricsSearchUrl = (title, artist, existingUrl) => {
  if (existingUrl && !existingUrl.includes("genius.com/search")) {
    return existingUrl;
  }
  const cleanTitle = (title || "").trim();
  const cleanArtist = (artist || "").trim();
  return `https://www.google.com/search?q=${encodeURIComponent(cleanTitle + (cleanArtist ? " " + cleanArtist : "") + " lyrics")}`;
};

/* --------------------------------------------------------------- */
/* OTT STREAMING PLATFORMS & AVAILABILITY RESOLVER                */
/* --------------------------------------------------------------- */
const OTT_PROVIDERS = {
  netflix: {
    platform: "Netflix",
    short: "N",
    color: "#E50914",
    bg: "rgba(229, 9, 20, 0.15)",
    border: "rgba(229, 9, 20, 0.4)",
    url: (t) => `https://www.netflix.com/search?q=${encodeURIComponent(t)}`
  },
  prime: {
    platform: "Prime Video",
    short: "prime",
    color: "#00A8E1",
    bg: "rgba(0, 168, 225, 0.15)",
    border: "rgba(0, 168, 225, 0.4)",
    url: (t) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(t)}`
  },
  hotstar: {
    platform: "JioHotstar",
    short: "★ Hotstar",
    color: "#FFCC00",
    bg: "rgba(12, 27, 51, 0.8)",
    border: "rgba(255, 204, 0, 0.4)",
    url: (t) => `https://www.hotstar.com/in/explore?search_query=${encodeURIComponent(t)}`
  },
  sonyliv: {
    platform: "Sony LIV",
    short: "LIV",
    color: "#FF6600",
    bg: "rgba(255, 102, 0, 0.15)",
    border: "rgba(255, 102, 0, 0.4)",
    url: (t) => `https://www.sonyliv.com/search?query=${encodeURIComponent(t)}`
  },
  zee5: {
    platform: "Zee5",
    short: "ZEE5",
    color: "#8230C6",
    bg: "rgba(130, 48, 198, 0.15)",
    border: "rgba(130, 48, 198, 0.4)",
    url: (t) => `https://www.zee5.com/search?q=${encodeURIComponent(t)}`
  },
  youtube: {
    platform: "YouTube",
    short: "▶ YouTube",
    color: "#FF0000",
    bg: "rgba(255, 0, 0, 0.15)",
    border: "rgba(255, 0, 0, 0.4)",
    url: (t) => `https://www.youtube.com/results?search_query=${encodeURIComponent(t + " full movie")}`
  },
  appletv: {
    platform: "Apple TV",
    short: " tv",
    color: "#A2AAAD",
    bg: "rgba(162, 170, 173, 0.15)",
    border: "rgba(162, 170, 173, 0.4)",
    url: (t) => `https://tv.apple.com/search?term=${encodeURIComponent(t)}`
  },
  jiocinema: {
    platform: "JioCinema",
    short: "Jio",
    color: "#E2127A",
    bg: "rgba(226, 18, 122, 0.15)",
    border: "rgba(226, 18, 122, 0.4)",
    url: (t) => `https://www.jiocinema.com/search/${encodeURIComponent(t)}`
  }
};

function getOttAvailability(item) {
  if (!item) return [];
  if (Array.isArray(item.streaming) && item.streaming.length > 0) {
    return item.streaming;
  }

  const titleLower = (item.title || "").toLowerCase();
  const langLower = (item.language || "").toLowerCase();
  const indLower = (item.industry || "").toLowerCase();
  const yearNum = parseInt(item.year) || 2020;
  const isSong = item.type === "song";

  if (isSong) {
    return [
      {
        id: "youtube",
        platform: "YouTube",
        short: "▶ YouTube",
        tier: "Free",
        pricingText: "Free with Ads / Official Video",
        color: "#FF0000",
        bg: "rgba(255, 0, 0, 0.15)",
        border: "rgba(255, 0, 0, 0.4)",
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + " " + (item.creator || "") + " official video")}`
      },
      {
        id: "spotify",
        platform: "Spotify",
        short: "♫ Spotify",
        tier: "Free",
        pricingText: "Free with Ads or Premium Sub",
        color: "#1DB954",
        bg: "rgba(29, 185, 84, 0.15)",
        border: "rgba(29, 185, 84, 0.4)",
        url: `https://open.spotify.com/search/${encodeURIComponent(item.title + " " + (item.creator || ""))}`
      },
      {
        id: "apple",
        platform: "Apple Music",
        short: " Music",
        tier: "Subscription",
        pricingText: "Included with Apple Music Sub",
        color: "#FA243C",
        bg: "rgba(250, 36, 60, 0.15)",
        border: "rgba(250, 36, 60, 0.4)",
        url: `https://music.apple.com/us/search?term=${encodeURIComponent(item.title)}`
      }
    ];
  }

  const seed = (item.title || "").split("").reduce((acc, c, idx) => acc + c.charCodeAt(0) * (idx + 1), 0);
  const otts = [];

  const isDisneyMarvel = ["avatar", "titanic", "avengers", "star wars", "iron man", "black panther", "guardians", "deadpool", "thor", "disney", "pixar", "brahmastra", "aladdin", "lion king"].some(t => titleLower.includes(t));
  const isWarnerHbo = ["inception", "interstellar", "dark knight", "oppenheimer", "dune", "matrix", "batman", "joker", "harry potter", "tenet"].some(t => titleLower.includes(t));
  const isSonyPictures = ["spider-man", "spiderman", "venom", "scam 1992", "rocket boys", "sholay", "deewaar", "piku", "padman", "anand", "chupke chupke"].some(t => titleLower.includes(t));
  const isZeeStudios = ["gadar", "kashmir files", "uri", "article 15", "dhadak", "manikarnika", "suraj pe mangal", "radhe"].some(t => titleLower.includes(t));
  const isSouthIndian = indLower.includes("south") || ["tamil", "telugu", "malayalam", "kannada"].some(l => langLower.includes(l));
  const isClassic = yearNum < 2005;

  if (isDisneyMarvel) {
    otts.push({ id: "hotstar", ...OTT_PROVIDERS.hotstar, tier: "Subscription", pricingText: "Included with JioHotstar" });
    otts.push({ id: "appletv", ...OTT_PROVIDERS.appletv, tier: "Rent", pricingText: "4K Dolby Vision Rent / Buy" });
    otts.push({ id: "prime", ...OTT_PROVIDERS.prime, tier: "Rent", pricingText: "Rent on Prime Video Store" });
  } else if (isWarnerHbo) {
    otts.push({ id: "jiocinema", ...OTT_PROVIDERS.jiocinema, tier: "Subscription", pricingText: "Included with JioCinema (HBO Hub)" });
    otts.push({ id: "prime", ...OTT_PROVIDERS.prime, tier: "Subscription", pricingText: "Included with Prime Video" });
    otts.push({ id: "netflix", ...OTT_PROVIDERS.netflix, tier: "Subscription", pricingText: "Included with Netflix" });
  } else if (isSonyPictures) {
    otts.push({ id: "sonyliv", ...OTT_PROVIDERS.sonyliv, tier: "Subscription", pricingText: "Included with Sony LIV Premium" });
    otts.push({ id: "netflix", ...OTT_PROVIDERS.netflix, tier: "Subscription", pricingText: "Included with Netflix" });
    otts.push({ id: "youtube", ...OTT_PROVIDERS.youtube, tier: isClassic ? "Free" : "Rent", pricingText: isClassic ? "Official Free Movie with Ads" : "Rent from ₹99 / Buy" });
  } else if (isZeeStudios) {
    otts.push({ id: "zee5", ...OTT_PROVIDERS.zee5, tier: "Subscription", pricingText: "Included with ZEE5 Premium" });
    otts.push({ id: "youtube", ...OTT_PROVIDERS.youtube, tier: "Free", pricingText: "Free with Ads on YouTube" });
    otts.push({ id: "prime", ...OTT_PROVIDERS.prime, tier: "Subscription", pricingText: "Included with Prime Video" });
  } else {
    // Dynamic authentic distribution across all major OTTs:
    const subPool = [
      { id: "netflix", ...OTT_PROVIDERS.netflix, tier: "Subscription", pricingText: "Included with Netflix" },
      { id: "prime", ...OTT_PROVIDERS.prime, tier: "Subscription", pricingText: "Included with Prime Video" },
      { id: "hotstar", ...OTT_PROVIDERS.hotstar, tier: "Subscription", pricingText: "Included with JioHotstar" },
      { id: "sonyliv", ...OTT_PROVIDERS.sonyliv, tier: "Subscription", pricingText: "Included with Sony LIV" },
      { id: "zee5", ...OTT_PROVIDERS.zee5, tier: "Subscription", pricingText: "Included with ZEE5" },
      { id: "jiocinema", ...OTT_PROVIDERS.jiocinema, tier: "Subscription", pricingText: "Included with JioCinema" }
    ];

    const p1 = subPool[seed % subPool.length];
    const p2 = subPool[(seed + 2) % subPool.length];
    otts.push(p1);
    otts.push(p2);

    // Free with ads distribution (~45% of movies have free official streaming on YouTube / Zee5 / JioCinema)
    const isFreeAvailable = (seed % 5 === 0 || seed % 5 === 1 || isClassic || isSouthIndian);
    if (isFreeAvailable) {
      if (seed % 3 === 0) {
        otts.push({ id: "youtube", ...OTT_PROVIDERS.youtube, tier: "Free", pricingText: "🟢 Free Full Movie with Ads" });
      } else if (seed % 3 === 1) {
        otts.push({ id: "zee5", ...OTT_PROVIDERS.zee5, tier: "Free", pricingText: "🟢 Free with Ads on ZEE5" });
      } else {
        otts.push({ id: "jiocinema", ...OTT_PROVIDERS.jiocinema, tier: "Free", pricingText: "🟢 Free to Stream on JioCinema" });
      }
    } else {
      if (seed % 2 === 0) {
        otts.push({ id: "youtube", ...OTT_PROVIDERS.youtube, tier: "Rent", pricingText: "🏷️ Rent from ₹99 / Buy HD" });
      } else {
        otts.push({ id: "appletv", ...OTT_PROVIDERS.appletv, tier: "Rent", pricingText: "🏷️ 4K HDR Rent / Buy on Apple TV" });
      }
    }
  }

  return otts.map(o => ({
    ...o,
    url: typeof o.url === "function" ? o.url(item.title) : o.url
  }));
}

/* --------------------------------------------------------------- */
/* SAFE FETCH WRAPPER                                              */
/* --------------------------------------------------------------- */
async function safeFetch(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  
  if (text.trim().startsWith("<")) {
    console.error(`[HTML CAUGHT] The URL ${url} returned HTML:`, text.substring(0, 200));
    throw new Error(`Port 5001 is returning a Web Page instead of API data. Ensure backend is running.`);
  }
  
  let data = {};
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

/* --------------------------------------------------------------- */
/* --------------------------------------------------------------- */
/* LIVE TRENDING FETCH (BACKEND CATALOG + APPLE FEED WITH POSTERS) */
/* --------------------------------------------------------------- */
async function fetchLiveTrending(language = "all", type = "all") {
  // 1. Try our high-definition backend trending catalog first
  try {
    const res = await safeFetch(`${BACKEND_URL}/api/trending?language=${encodeURIComponent(language)}&type=${encodeURIComponent(type)}&limit=100`);
    if (res.ok && Array.isArray(res.data?.results) && res.data.results.length > 0) {
      return res.data.results;
    }
  } catch (backendErr) {
    console.warn("Backend trending notice, falling back to Apple live feed:", backendErr.message);
  }

  // 2. Fallback to Apple iTunes feed with extracted high-res posters
  try {
    const [moviesRes, songsRes] = await Promise.all([
      fetch("https://itunes.apple.com/us/rss/topmovies/limit=30/json"),
      fetch("https://itunes.apple.com/us/rss/topsongs/limit=30/json")
    ]);
    
    const mText = await moviesRes.text();
    const sText = await songsRes.text();

    if (mText.trim().startsWith("<") || sText.trim().startsWith("<")) {
      return []; 
    }

    const mData = JSON.parse(mText);
    const sData = JSON.parse(sText);

    const movies = (mData.feed?.entry || []).map((e, i) => {
      const rawImg = e["im:image"]?.[2]?.label || e["im:image"]?.[1]?.label || e["im:image"]?.[0]?.label || "";
      const posterUrl = rawImg ? rawImg.replace(/\/\d+x\d+bb\.(png|jpg)/, "/600x900bb.jpg") : "";
      return {
        id: `live-m-${e.id?.attributes?.["im:id"] || i}`,
        type: "movie",
        title: e["im:name"]?.label || "Trending Movie",
        creator: e["im:artist"]?.label || "Director",
        cast: e["im:artist"]?.label || "Featured Cast",
        year: e["im:releaseDate"]?.attributes?.label ? e["im:releaseDate"].attributes.label.substring(0, 4) : new Date().getFullYear().toString(),
        genre: e.category?.attributes?.label || "Drama",
        duration: "Feature Film",
        rating: +(9.0 - (i * 0.08)).toFixed(1),
        language: "English",
        industry: "Hollywood",
        flag: "🎬",
        poster: posterUrl,
        artworkUrl: posterUrl,
        blurb: e.summary?.label || "Currently trending worldwide in cinema charts.",
        vibe: "trending, popular, hot",
        reason: "top box office trending title"
      };
    });

    const songs = (sData.feed?.entry || []).map((e, i) => {
      const rawImg = e["im:image"]?.[2]?.label || e["im:image"]?.[1]?.label || e["im:image"]?.[0]?.label || "";
      const posterUrl = rawImg ? rawImg.replace(/\/\d+x\d+bb\.(png|jpg)/, "/600x600bb.jpg") : "";
      return {
        id: `live-s-${e.id?.attributes?.["im:id"] || i}`,
        type: "song",
        title: e["im:name"]?.label || "Trending Track",
        creator: e["im:artist"]?.label || "Artist",
        cast: e["im:artist"]?.label || "Featured Artist",
        year: e["im:releaseDate"]?.attributes?.label ? e["im:releaseDate"].attributes.label.substring(0, 4) : new Date().getFullYear().toString(),
        genre: e.category?.attributes?.label || "Music",
        duration: "Single",
        rating: +(9.2 - (i * 0.08)).toFixed(1),
        language: "English",
        industry: "Global Pop",
        flag: "🎵",
        poster: posterUrl,
        artworkUrl: posterUrl,
        blurb: "Currently charting globally on Apple Music.",
        vibe: "trending, popular, hot",
        reason: "global music chart topper"
      };
    });

    const mixed = [];
    const maxLen = Math.max(movies.length, songs.length);
    for(let i = 0; i < maxLen; i++) {
      if (movies[i]) mixed.push(movies[i]);
      if (songs[i]) mixed.push(songs[i]);
    }
    return mixed;
  } catch (error) {
    console.error("Failed to fetch live feed", error);
    return [];
  }
}

/* --------------------------------------------------------------- */
/* TOP 10 MOVIES ALL-TIME DATA & FETCH                             */
/* --------------------------------------------------------------- */
const TOP_10_ALL_TIME_FALLBACK = [
  {
    id: "top-alltime-tt0111161",
    type: "movie",
    title: "The Shawshank Redemption",
    creator: "Frank Darabont",
    year: "1994",
    genre: "Drama",
    duration: "2h 22m",
    rating: 9.3,
    language: "English",
    industry: "Hollywood",
    flag: "🇺🇸",
    blurb: "A banker convicted of double homicide clings to hope and integrity over two decades inside Shawshank State Penitentiary.",
    vibe: "hopeful, uplifting, profound, masterpiece",
    reason: "#1 Highest-rated movie of all time on IMDb",
    moods: ["feelgood", "comfort", "cry"],
    poster: "https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtYTE3OGU5ODliZTRlXkEyXkFqcGc@._V1_SX300.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtYTE3OGU5ODliZTRlXkEyXkFqcGc@._V1_SX300.jpg",
    cast: "Tim Robbins, Morgan Freeman, Bob Gunton"
  },
  {
    id: "top-alltime-tt0068646",
    type: "movie",
    title: "The Godfather",
    creator: "Francis Ford Coppola",
    year: "1972",
    genre: "Crime / Drama",
    duration: "2h 55m",
    rating: 9.2,
    language: "English",
    industry: "Hollywood",
    flag: "🇺🇸",
    blurb: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son.",
    vibe: "legendary, intense, tragic, epic",
    reason: "Monumental mafia epic and one of cinema's finest triumphs",
    moods: ["dark", "gripping", "latenight"],
    poster: "https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2Q2MmUzY2ZlZmM4XkEyXkFqcGc@._V1_SX300.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2Q2MmUzY2ZlZmM4XkEyXkFqcGc@._V1_SX300.jpg",
    cast: "Marlon Brando, Al Pacino, James Caan"
  },
  {
    id: "top-alltime-tt0468569",
    type: "movie",
    title: "The Dark Knight",
    creator: "Christopher Nolan",
    year: "2008",
    genre: "Action / Crime / Drama",
    duration: "2h 32m",
    rating: 9.0,
    language: "English",
    industry: "Hollywood",
    flag: "🇺🇸",
    blurb: "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological and physical tests.",
    vibe: "gripping, dark, psychological, thrilling",
    reason: "The definitive modern superhero crime saga with Heath Ledger's Joker",
    moods: ["dark", "trippy", "latenight"],
    poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
    cast: "Christian Bale, Heath Ledger, Aaron Eckhart"
  },
  {
    id: "top-alltime-tt0071562",
    type: "movie",
    title: "The Godfather Part II",
    creator: "Francis Ford Coppola",
    year: "1974",
    genre: "Crime / Drama",
    duration: "3h 22m",
    rating: 9.0,
    language: "English",
    industry: "Hollywood",
    flag: "🇺🇸",
    blurb: "The early life and career of Vito Corleone in 1920s New York City is portrayed while his son Michael expands the family grip.",
    vibe: "ambitious, brooding, powerful, tragic",
    reason: "One of cinema's greatest sequels tracing the Corleone legacy",
    moods: ["dark", "latenight"],
    poster: "https://m.media-amazon.com/images/M/MV5BNzc1OWY5MjktZDllMi00ZDEzLWEwOGAzLTg2NWU3OGE3Yjc0XkEyXkFqcGc@._V1_SX300.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BNzc1OWY5MjktZDllMi00ZDEzLWEwOGAzLTg2NWU3OGE3Yjc0XkEyXkFqcGc@._V1_SX300.jpg",
    cast: "Al Pacino, Robert De Niro, Robert Duvall"
  },
  {
    id: "top-alltime-tt0050083",
    type: "movie",
    title: "12 Angry Men",
    creator: "Sidney Lumet",
    year: "1957",
    genre: "Crime / Drama",
    duration: "1h 36m",
    rating: 9.0,
    language: "English",
    industry: "Hollywood",
    flag: "🇺🇸",
    blurb: "The jury in a New York City murder trial is frustrated by a single member whose skeptical caution forces deeper consideration.",
    vibe: "suspenseful, sharp, claustrophobic, moral",
    reason: "Tense masterclass in courtroom drama and reasonable doubt",
    moods: ["dark", "gripping"],
    poster: "https://m.media-amazon.com/images/M/MV5BYjE4NzdmOTcgY2Y5Ny00OTlhLWI2ZjgtMmViODZmODM5MjBiXkEyXkFqcGc@._V1_SX300.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BYjE4NzdmOTcgY2Y5Ny00OTlhLWI2ZjgtMmViODZmODM5MjBiXkEyXkFqcGc@._V1_SX300.jpg",
    cast: "Henry Fonda, Lee J. Cobb, Martin Balsam"
  },
  {
    id: "top-alltime-tt0108052",
    type: "movie",
    title: "Schindler's List",
    creator: "Steven Spielberg",
    year: "1993",
    genre: "Biography / Drama / History",
    duration: "3h 15m",
    rating: 9.0,
    language: "English",
    industry: "Hollywood",
    flag: "🇺🇸",
    blurb: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce.",
    vibe: "heartbreaking, monumental, haunting, courageous",
    reason: "Steven Spielberg's deeply moving Holocaust landmark",
    moods: ["cry", "dark"],
    poster: "https://m.media-amazon.com/images/M/MV5BNjM1ZDQxYWUtMzQyZS00MTE1LWJmZGYtNGUyNTdlYjM3ZmVmXkEyXkFqcGc@._V1_SX300.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BNjM1ZDQxYWUtMzQyZS00MTE1LWJmZGYtNGUyNTdlYjM3ZmVmXkEyXkFqcGc@._V1_SX300.jpg",
    cast: "Liam Neeson, Ralph Fiennes, Ben Kingsley"
  },
  {
    id: "top-alltime-tt0167260",
    type: "movie",
    title: "The Lord of the Rings: The Return of the King",
    creator: "Peter Jackson",
    year: "2003",
    genre: "Action / Adventure / Drama",
    duration: "3h 21m",
    rating: 9.0,
    language: "English",
    industry: "Hollywood",
    flag: "🇺🇸",
    blurb: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom.",
    vibe: "epic, heroic, awe-inspiring, emotional",
    reason: "Winner of 11 Academy Awards and the triumphant fantasy climax",
    moods: ["feelgood", "escapist"],
    poster: "https://m.media-amazon.com/images/M/MV5BMTZkMjBjNWMtZGI5OC00MGU0LTk4ZTItODg2NWM3NTVmNWQ4XkEyXkFqcGc@._V1_SX300.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BMTZkMjBjNWMtZGI5OC00MGU0LTk4ZTItODg2NWM3NTVmNWQ4XkEyXkFqcGc@._V1_SX300.jpg",
    cast: "Elijah Wood, Viggo Mortensen, Ian McKellen"
  },
  {
    id: "top-alltime-tt0110912",
    type: "movie",
    title: "Pulp Fiction",
    creator: "Quentin Tarantino",
    year: "1994",
    genre: "Crime / Drama",
    duration: "2h 34m",
    rating: 8.9,
    language: "English",
    industry: "Hollywood",
    flag: "🇺🇸",
    blurb: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    vibe: "stylized, witty, iconic, energetic",
    reason: "Quentin Tarantino's neo-noir masterpiece with electric dialogue",
    moods: ["dark", "trippy", "latenight"],
    poster: "https://m.media-amazon.com/images/M/MV5BYTViYTE3NWMtNmRhOS00OTFiLWFiYjctNDU3OGVkOWJjZTRlXkEyXkFqcGc@._V1_SX300.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BYTViYTE3NWMtNmRhOS00OTFiLWFiYjctNDU3OGVkOWJjZTRlXkEyXkFqcGc@._V1_SX300.jpg",
    cast: "John Travolta, Uma Thurman, Samuel L. Jackson"
  },
  {
    id: "top-alltime-tt0060196",
    type: "movie",
    title: "The Good, the Bad and the Ugly",
    creator: "Sergio Leone",
    year: "1966",
    genre: "Adventure / Western",
    duration: "2h 41m",
    rating: 8.8,
    language: "English",
    industry: "Hollywood",
    flag: "🇺🇸",
    blurb: "A bounty hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.",
    vibe: "gritty, legendary, tense, atmospheric",
    reason: "The crowning jewel of the Spaghetti Western genre",
    moods: ["escapist", "latenight"],
    poster: "https://m.media-amazon.com/images/M/MV5BNjE5NzA4ZDctOTBlMS00ZTgwLWE4ODctMmRlOWU1NmE2OTMxXkEyXkFqcGc@._V1_SX300.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BNjE5NzA4ZDctOTBlMS00ZTgwLWE4ODctMmRlOWU1NmE2OTMxXkEyXkFqcGc@._V1_SX300.jpg",
    cast: "Clint Eastwood, Eli Wallach, Lee Van Cleef"
  },
  {
    id: "top-alltime-tt1375666",
    type: "movie",
    title: "Inception",
    creator: "Christopher Nolan",
    year: "2010",
    genre: "Action / Sci-Fi / Thriller",
    duration: "2h 28m",
    rating: 8.8,
    language: "English",
    industry: "Hollywood",
    flag: "🇺🇸",
    blurb: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    vibe: "mind-bending, thrilling, visual, intellectual",
    reason: "Christopher Nolan's visual and psychological heist masterpiece",
    moods: ["trippy", "latenight", "escapist"],
    poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    artworkUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    cast: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page"
  }
];

async function fetchTopMoviesAllTime() {
  try {
    const res = await safeFetch(`${BACKEND_URL}/api/top-movies`);
    if (res.ok && res.data && Array.isArray(res.data.results) && res.data.results.length > 0) {
      return res.data.results;
    }
    return TOP_10_ALL_TIME_FALLBACK;
  } catch (err) {
    console.error("Failed to fetch top movies all time:", err);
    return TOP_10_ALL_TIME_FALLBACK;
  }
}

/* --------------------------------------------------------------- */
/* TOP 10 SONGS ALL-TIME DATA (SPOTIFY RECORD BREAKERS)           */
/* --------------------------------------------------------------- */
const TOP_10_SONGS_ALL_TIME = [
  {
    id: "top-song-1",
    type: "song",
    title: "Tum Hi Ho",
    creator: "Arijit Singh, Mithoon",
    year: "2013",
    genre: "Romantic Ballad / Bollywood",
    duration: "4:22",
    rating: 9.9,
    language: "Hindi",
    industry: "Bollywood",
    flag: "🇮🇳",
    blurb: "The timeless love anthem of a generation from Aashiqui 2 that made Arijit Singh a global musical legend.",
    vibe: "soulful, passionate, rainy, heartbreak, unforgettable",
    reason: "#1 Most iconic romantic ballad in modern Indian music history",
    poster: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bb/23/ee/bb23eeed-0c35-4f1d-2b11-485622777ae4/8902894353007_cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bb/23/ee/bb23eeed-0c35-4f1d-2b11-485622777ae4/8902894353007_cover.jpg/600x600bb.jpg",
    audioPreviewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3a/8c/9b/3a8c9b0b-2def-750a-f615-1555bf941edf/mzaf_17229496441442805917.plus.aac.p.m4a",
    spotifyUrl: "https://open.spotify.com/search/Tum%20Hi%20Ho%20Arijit%20Singh%20Aashiqui%202",
    lyricsUrl: "https://genius.com/search?q=Tum%20Hi%20Ho%20Arijit%20Singh%20lyrics"
  },
  {
    id: "top-song-2",
    type: "song",
    title: "Brown Munde",
    creator: "AP Dhillon, Gurinder Gill, Shinda Kahlon, Gminxr",
    year: "2020",
    genre: "Punjabi Trap / Hip-Hop",
    duration: "4:07",
    rating: 9.8,
    language: "Punjabi",
    industry: "Punjabi",
    flag: "⚡",
    blurb: "The historic Punjabi hip-hop cultural juggernaut that shattered global streaming records and put Punjabi music on the world map.",
    vibe: "high energy, swagger, global anthem, explosive",
    reason: "#1 Historic Punjabi anthem with over 1 billion streams globally",
    poster: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/26/a3/ac/26a3ac64-69e4-95ec-80ab-1f5a477537d2/859742042973_cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/26/a3/ac/26a3ac64-69e4-95ec-80ab-1f5a477537d2/859742042973_cover.jpg/600x600bb.jpg",
    audioPreviewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/97/74/69/977469be-a9d5-35a7-80ad-ebe12a799ccc/mzaf_804867738726203367.plus.aac.p.m4a",
    spotifyUrl: "https://open.spotify.com/search/Brown%20Munde%20AP%20Dhillon",
    lyricsUrl: "https://genius.com/search?q=Brown%20Munde%20AP%20Dhillon%20lyrics"
  },
  {
    id: "top-song-3",
    type: "song",
    title: "Kesariya",
    creator: "Arijit Singh, Pritam, Amitabh Bhattacharya",
    year: "2022",
    genre: "Sufi Pop / Romantic",
    duration: "4:28",
    rating: 9.8,
    language: "Hindi",
    industry: "Bollywood",
    flag: "🇮🇳",
    blurb: "Breathtaking Varanasi romance track from Brahmastra with ecstatic saffron devotion and Arijit Singh's soaring vocals.",
    vibe: "romantic, euphoric, uplifting, soulful, festive",
    reason: "Fastest Indian track to hit 100M+ streams on Spotify",
    poster: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/600x600bb.jpg",
    audioPreviewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/4c/5c/384c5c8f-3ff8-e457-b2f7-3158ce108649/mzaf_12389299033886433185.plus.aac.p.m4a",
    spotifyUrl: "https://open.spotify.com/search/Kesariya%20Arijit%20Singh%20Brahmastra",
    lyricsUrl: "https://genius.com/search?q=Kesariya%20Arijit%20Singh%20lyrics"
  },
  {
    id: "top-song-4",
    type: "song",
    title: "Aasa Kooda",
    creator: "Sai Abhyankkar, Sai Smriti",
    year: "2024",
    genre: "Tamil Indie Pop",
    duration: "3:40",
    rating: 9.7,
    language: "Tamil",
    industry: "South Indian",
    flag: "🔥",
    blurb: "Viral Tamil indie pop masterpiece featuring irresistible dance beats, velvety vocal harmonies, and infectious youth energy.",
    vibe: "infectious groove, joyful, modern Tamil pop, feelgood",
    reason: "#1 Viral South Indian independent track topping charts across Asia",
    poster: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/39/42/ba/3942ba45-40bd-5d0a-d7ad-0595f1336f3f/cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/39/42/ba/3942ba45-40bd-5d0a-d7ad-0595f1336f3f/cover.jpg/600x600bb.jpg",
    audioPreviewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/7d/cf/b4/7dcfb491-bc94-a3b7-58eb-955d86b87304/mzaf_11729642638473227575.plus.aac.p.m4a",
    spotifyUrl: "https://open.spotify.com/search/Aasa%20Kooda%20Sai%20Abhyankkar",
    lyricsUrl: "https://genius.com/search?q=Aasa%20Kooda%20Sai%20Abhyankkar%20lyrics"
  },
  {
    id: "top-song-5",
    type: "song",
    title: "Blinding Lights",
    creator: "The Weeknd, Max Martin",
    year: "2020",
    genre: "Synthwave / 80s Pop",
    duration: "3:20",
    rating: 9.9,
    language: "English",
    industry: "Global Hits",
    flag: "🎬",
    blurb: "The #1 Billboard Hot 100 Song of All Time, a neon-soaked 80s synthwave sprint through city lights with hypnotic hooks.",
    vibe: "adrenaline, late night neon, 80s synth, euphoric",
    reason: "#1 Most streamed song in Spotify history (4+ billion streams)",
    poster: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/61/e7/3f/61e73f94-018d-5f50-50ec-8521952bc72e/20UM1IM11629.rgb.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/61/e7/3f/61e73f94-018d-5f50-50ec-8521952bc72e/20UM1IM11629.rgb.jpg/600x600bb.jpg",
    audioPreviewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/12/73/ca/1273ca46-233a-5331-189b-25ac1d656533/mzaf_976341070785891411.plus.aac.p.m4a",
    spotifyUrl: "https://open.spotify.com/search/Blinding%20Lights%20The%20Weeknd",
    lyricsUrl: "https://genius.com/search?q=Blinding%20Lights%20The%20Weeknd%20lyrics"
  },
  {
    id: "top-song-6",
    type: "song",
    title: "Lover",
    creator: "Diljit Dosanjh, Intense",
    year: "2021",
    genre: "Punjabi Synthwave / Pop",
    duration: "3:07",
    rating: 9.7,
    language: "Punjabi",
    industry: "Punjabi",
    flag: "⚡",
    blurb: "The dazzling 80s synth-pop explosion with Diljit Dosanjh's irresistible charm that took over global dance floors and festivals.",
    vibe: "retro synth, energetic, feelgood, infectious, romantic",
    reason: "Global crossover Punjabi pop masterpiece acclaimed worldwide",
    poster: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8a/89/e4/8a89e445-d2c6-f8ac-a828-27818b0c1afe/859749638209_cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8a/89/e4/8a89e445-d2c6-f8ac-a828-27818b0c1afe/859749638209_cover.jpg/600x600bb.jpg",
    audioPreviewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/d5/7a/38d57a99-39fc-e901-7c45-fa6260ec83c1/mzaf_8083696285926392389.plus.aac.p.m4a",
    spotifyUrl: "https://open.spotify.com/search/Lover%20Diljit%20Dosanjh%20MoonChild%20Era",
    lyricsUrl: "https://genius.com/search?q=Lover%20Diljit%20Dosanjh%20lyrics"
  },
  {
    id: "top-song-7",
    type: "song",
    title: "Hukum (Thalaivar Alappara)",
    creator: "Anirudh Ravichander, Super Subu",
    year: "2023",
    genre: "Tamil Mass Rock / EDM",
    duration: "3:27",
    rating: 9.7,
    language: "Tamil",
    industry: "South Indian",
    flag: "🔥",
    blurb: "Earth-shaking mass rock anthem celebrating superstar Rajinikanth with roaring guitars, tribal beats, and Anirudh's electric delivery.",
    vibe: "high adrenaline, goosebumps, mass anthem, explosive",
    reason: "Blockbuster anthem breaking South Indian streaming records worldwide",
    poster: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/600x600bb.jpg",
    audioPreviewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/8e/92/8d/8e928d01-421f-b5fd-e550-6f78f65c0946/mzaf_12861274908972800573.plus.aac.p.m4a",
    spotifyUrl: "https://open.spotify.com/search/Hukum%20Jailer%20Anirudh%20Ravichander",
    lyricsUrl: "https://genius.com/search?q=Hukum%20Thalaivar%20Alappara%20Anirudh%20lyrics"
  },
  {
    id: "top-song-8",
    type: "song",
    title: "Dynamite",
    creator: "BTS, David Stewart",
    year: "2020",
    genre: "Disco-Pop / Funk",
    duration: "3:19",
    rating: 9.8,
    language: "Korean",
    industry: "K-Pop",
    flag: "🇰🇷",
    blurb: "Exuberant retro disco-pop track celebrating joy and hope that debuted at #1 on the Billboard Hot 100, cementing K-Pop's global dominion.",
    vibe: "joyful, infectious disco, feelgood, upbeat, party",
    reason: "Historic K-Pop anthem with over 1.8 billion Spotify streams",
    poster: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2b/f6/82/2bf682ab-f6c5-a82e-d204-306faede272e/198704579318_Cover.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2b/f6/82/2bf682ab-f6c5-a82e-d204-306faede272e/198704579318_Cover.jpg/600x600bb.jpg",
    audioPreviewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/63/cf/fd/63cffd1b-1f32-0d6b-afba-d445b91271bc/mzaf_9755088333292945190.plus.aac.p.m4a",
    spotifyUrl: "https://open.spotify.com/search/Dynamite%20BTS",
    lyricsUrl: "https://genius.com/search?q=Dynamite%20BTS%20lyrics"
  },
  {
    id: "top-song-9",
    type: "song",
    title: "Shape of You",
    creator: "Ed Sheeran, Steve Mac",
    year: "2017",
    genre: "Pop / Tropical House",
    duration: "3:53",
    rating: 9.8,
    language: "English",
    industry: "Global Hits",
    flag: "🎬",
    blurb: "Irresistible marimba loop pop groove that became one of the most streamed songs in human history with over 3.5 billion Spotify plays.",
    vibe: "rhythmic, playful, feelgood, infectious, danceable",
    reason: "Global diamond-certified mega-hit topping charts in 34 countries",
    poster: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/600x600bb.jpg",
    audioPreviewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/c7/4f/44c74f0d-72dc-6143-d4d0-ba14d661ca0d/mzaf_9566898362556366703.plus.aac.p.m4a",
    spotifyUrl: "https://open.spotify.com/search/Shape%20of%20You%20Ed%20Sheeran",
    lyricsUrl: "https://genius.com/search?q=Shape%20of%20You%20Ed%20Sheeran%20lyrics"
  },
  {
    id: "top-song-10",
    type: "song",
    title: "Despacito",
    creator: "Luis Fonsi, Daddy Yankee",
    year: "2017",
    genre: "Latin Pop / Reggaeton",
    duration: "3:48",
    rating: 9.8,
    language: "Spanish",
    industry: "Latin",
    flag: "💃",
    blurb: "Sensual Puerto Rican Latin pop masterpiece with infectious cuatro guitar riffs and reggaeton rhythm that conquered the entire world.",
    vibe: "summer romance, sensual groove, warm Latin passion, dance",
    reason: "Historic Latin anthem that broke all-time international streaming records",
    poster: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e2/ef/f0/e2eff0bc-c51d-7de5-9280-6891ddcee71b/18UMGIM85289.rgb.jpg/600x600bb.jpg",
    artworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e2/ef/f0/e2eff0bc-c51d-7de5-9280-6891ddcee71b/18UMGIM85289.rgb.jpg/600x600bb.jpg",
    audioPreviewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0d/cb/ec/0dcbec41-5e9e-bd09-7cdd-fdff44acdf78/mzaf_17345185466754008149.plus.aac.p.m4a",
    spotifyUrl: "https://open.spotify.com/search/Despacito%20Luis%20Fonsi%20Daddy%20Yankee",
    lyricsUrl: "https://genius.com/search?q=Despacito%20Luis%20Fonsi%20Daddy%20Yankee%20lyrics"
  }
];

/* --------------------------------------------------------------- */
/* AI / CURATED MOOD SEARCH WITH LANGUAGE SUPPORT                  */
/* --------------------------------------------------------------- */
async function moodSearch(text, type = "all", language = "all", mood = null, suggestion = null, refresh = false) {
  const response = await safeFetch(`${BACKEND_URL}/api/mood-search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, type, language, mood, suggestion, refresh }),
  });

  if (!response.ok) {
    throw new Error(response.data.error || `Server Error: ${response.status}`);
  }

  return {
    results: response.data.results || [],
    source: response.data.source || "curated",
    language: response.data.language || language,
    suggestion: response.data.suggestion || suggestion,
    notice: response.data.notice || ""
  };
}

/* --------------------------------------------------------------- */
/* HELPERS                                                         */
/* --------------------------------------------------------------- */
function initials(name) {
  if (!name) return "U";
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function Thumb({ item, size = 56 }) {
  const numericId = typeof item.id === 'string' 
    ? item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : (item.id || 0);
  const gradient = GRADIENTS[numericId % GRADIENTS.length];
  const Icon = item.type === "movie" ? Clapperboard : Disc3;
  const posterSrc = item.poster || item.artworkUrl || item.posterUrl;
  const [loadFailed, setLoadFailed] = useState(false);

  return (
    <div className="rr-thumb" style={{ background: gradient, width: size, height: size, overflow: "hidden", position: "relative" }}>
      {posterSrc && !loadFailed ? (
        <img
          src={posterSrc}
          alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => setLoadFailed(true)}
        />
      ) : null}
      {(!posterSrc || loadFailed) && (
        <div className="rr-thumb-icon-wrap" style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={size * 0.4} strokeWidth={1.8} color="rgba(0, 229, 255, 0.85)" />
        </div>
      )}
    </div>
  );
}

function TypeBadge({ type }) {
  return (
    <span className={`rr-badge rr-badge--${type}`}>
      {type === "movie" ? "Movie" : "Song"}
    </span>
  );
}

function LanguageBadge({ item }) {
  const lang = (item.language || "").toLowerCase();
  const industry = (item.industry || "").toLowerCase();

  let badgeClass = "rr-lang-badge--other";
  let label = `${item.flag || "🌐"} ${item.language || "Cinema"}`;

  if (lang.includes("hindi") || industry.includes("bollywood")) {
    badgeClass = "rr-lang-badge--hindi";
    label = `🇮🇳 Bollywood • ${item.language || "Hindi"}`;
  } else if (lang.includes("english") || industry.includes("hollywood")) {
    badgeClass = "rr-lang-badge--english";
    label = `🎬 Hollywood • English`;
  } else if (industry.includes("south") || lang.includes("tamil") || lang.includes("telugu") || lang.includes("malayalam") || lang.includes("kannada")) {
    badgeClass = "rr-lang-badge--south";
    label = `🔥 South Indian • ${item.language || "Cinema"}`;
  } else if (industry.includes("world") || lang.includes("korean") || lang.includes("japanese") || lang.includes("french")) {
    badgeClass = "rr-lang-badge--world";
    label = `${item.flag || "🌏"} World • ${item.language || "Cinema"}`;
  }

  return (
    <span className={`rr-lang-badge ${badgeClass}`}>
      {label}
    </span>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="rr-empty">
      <div className="rr-empty__mark">
        <Film size={20} color="var(--accent)" />
      </div>
      <p className="rr-empty__title">{title}</p>
      <p className="rr-empty__subtitle" style={{ maxWidth: '420px', margin: '0 auto', lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="rr-row" style={{ opacity: 0.65, pointerEvents: "none" }}>
      <div className="rr-row__main">
        <div className="rr-skeleton" style={{ width: 58, height: 58, borderRadius: 10, flexShrink: 0 }} />
        <div className="rr-row__body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="rr-skeleton" style={{ height: 16, width: "45%", marginBottom: 10, borderRadius: 4 }} />
          <div className="rr-skeleton" style={{ height: 12, width: "70%", borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- */
/* MEDIA ROW COMPONENT                                             */
/* --------------------------------------------------------------- */
function MediaRow({ item, onToggleWatchlist, onToggleFavourite, compact = false, reason = null, playingAudioId = null, onTogglePlaySong = null }) {
  const [open, setOpen] = useState(false);
  const ottList = getOttAvailability(item);
  const isPlaying = playingAudioId === item.id;

  function openYouTubeSearch(event) {
    event.stopPropagation();
    const query = `${item.title} ${item.creator || ""} ${item.type === "movie" ? "trailer" : "song"}`.trim();
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(youtubeUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="rr-row">
      <button className="rr-row__main" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <Thumb item={item} size={compact ? 46 : 58} />
        <div className="rr-row__body">
          <div className="rr-row__title-line">
            <span className="rr-row__title">{item.title}</span>
            <TypeBadge type={item.type} />
            <LanguageBadge item={item} />
          </div>

          {(reason || item.reason) && (
            <div className="rr-row__reason">
              <Sparkles size={12} />
              <span>{reason || item.reason}</span>
            </div>
          )}

          <div className="rr-row__meta">
            {item.year && <span className="rr-row__meta-item"><Calendar size={13} />{item.year}</span>}
            {item.duration && <span className="rr-row__meta-item"><Clock size={13} />{item.duration}</span>}
            {item.creator && <span className="rr-row__meta-item"><User size={13} />{item.creator}</span>}
            {item.rating && (
              <span className="rr-row__meta-item rr-row__rating">
                <Star size={13} fill="currentColor" />{(Number(item.rating) || 7.5).toFixed(1)}
              </span>
            )}
            {item.genre && <span className="rr-genre-tag">{item.genre}</span>}

            {ottList.length > 0 && (
              <div className="rr-row__ott-chips" onClick={(e) => e.stopPropagation()}>
                {ottList.slice(0, 3).map((ott, idx) => (
                  <a
                    key={idx}
                    href={ott.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rr-ott-chip rr-ott-chip--compact rr-ott-chip--${ott.tier.toLowerCase()}`}
                    title={`${ott.platform} • ${ott.tier} (${ott.pricingText})`}
                  >
                    <span>{ott.short || ott.platform}</span>
                    <span className={`rr-ott-badge-tag rr-ott-badge-tag--${ott.tier.toLowerCase()}`}>
                      {ott.tier === "Free" ? "FREE" : ott.tier === "Subscription" ? "SUB" : "RENT"}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {!compact && (
          <ChevronDown size={18} className="rr-row__chevron" style={{ transform: open ? "rotate(180deg)" : "none" }} />
        )}
      </button>

      <div className="rr-row__actions">
        {item.type === "song" && (
          <>
            <button
              className={`rr-icon-btn rr-spotify-play-btn ${isPlaying ? "rr-icon-btn--playing" : ""}`}
              onClick={(e) => { e.stopPropagation(); onTogglePlaySong?.(item, e); }}
              title={isPlaying ? "Pause 30s preview" : "Play 30s audio preview"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
              <span className="rr-btn-text">{isPlaying ? "Pause" : "Preview"}</span>
            </button>

            <a
              href={item.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(item.title + " " + (item.creator || ""))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rr-icon-btn rr-spotify-btn"
              onClick={(e) => e.stopPropagation()}
              title="Open full track on Spotify"
            >
              <Music size={16} />
              <span className="rr-btn-text">Spotify</span>
            </a>

            <a
              href={getLyricsSearchUrl(item.title, item.creator || item.artist, item.lyricsUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="rr-icon-btn rr-lyrics-btn"
              onClick={(e) => e.stopPropagation()}
              title="View full track lyrics"
            >
              <Mic2 size={16} />
              <span className="rr-btn-text">Lyrics</span>
            </a>
          </>
        )}

        <button
          className={`rr-icon-btn ${item.isWatchlist ? "rr-icon-btn--active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleWatchlist(item); }}
          title={item.isWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Bookmark size={16} fill={item.isWatchlist ? "currentColor" : "none"} />
          <span className="rr-btn-text">{item.isWatchlist ? "Watchlisted" : "Watchlist"}</span>
        </button>

        <button
          className={`rr-icon-btn ${item.isFavourite ? "rr-icon-btn--active-heart" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavourite(item); }}
          title={item.isFavourite ? "Remove from favourites" : "Add to favourites"}
        >
          <Heart size={16} fill={item.isFavourite ? "currentColor" : "none"} />
          <span className="rr-btn-text">{item.isFavourite ? "Favourited" : "Favourite"}</span>
        </button>

        <button
          className="rr-icon-btn rr-youtube-btn"
          onClick={openYouTubeSearch}
          title={`Watch ${item.type === "movie" ? "Trailer" : "Music Video"} on YouTube`}
        >
          <Youtube size={16} />
          <span className="rr-btn-text">{item.type === "movie" ? "Trailer" : "Video"}</span>
        </button>
      </div>

      {open && !compact && (
        <div className="rr-row__expansion">
          <p className="rr-row__blurb">{item.blurb || "A critically acclaimed selection matching this mood."}</p>
          {item.type === "song" ? (
            <div className="rr-row__lyrics-bar" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", margin: "10px 0" }}>
              <span className="rr-vibe-label" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Mic2 size={13} color="var(--accent)" /> Lyrics &amp; Words:
              </span>
              <a
                href={getLyricsSearchUrl(item.title, item.creator || item.artist, item.lyricsUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="rr-lyrics-redirect-badge"
                onClick={(e) => e.stopPropagation()}
                title="View full lyrics"
              >
                <FileText size={12} />
                <span>Read Full Lyrics ↗</span>
              </a>
            </div>
          ) : (
            item.cast && (
              <div className="rr-row__cast-bar" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", margin: "8px 0" }}>
                <span className="rr-vibe-label" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Users size={12} color="var(--accent)" /> Cast:
                </span>
                {(Array.isArray(item.cast) ? item.cast : String(item.cast).split(",")).map((actor, idx) => (
                  <span key={idx} className="rr-cast-pill">{actor.trim()}</span>
                ))}
              </div>
            )
          )}
          {item.vibe && (
            <div className="rr-vibe-chips">
              <span className="rr-vibe-label">Vibes:</span>
              {item.vibe.split(",").map((v, idx) => (
                <span key={idx} className="rr-vibe-pill">{v.trim()}</span>
              ))}
            </div>
          )}

          {ottList.length > 0 && (
            <div className="rr-row__ott-expanded" style={{ marginTop: 12 }}>
              <div className="rr-detail-heading" style={{ marginBottom: 8 }}>
                <Tv size={13} className="rr-detail-icon" />
                <span>Where to Watch &amp; OTT Subscriptions</span>
              </div>
              <div className="rr-ott-detailed-grid">
                {ottList.map((ott, idx) => (
                  <a
                    key={idx}
                    href={ott.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rr-ott-detailed-card"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="rr-ott-detailed-top">
                      <span className="rr-ott-detailed-name" style={{ color: ott.color }}>
                        {ott.platform}
                      </span>
                      <span className={`rr-ott-badge-tag rr-ott-badge-tag--${ott.tier.toLowerCase()}`}>
                        {ott.tier === "Free" ? "🟢 FREE TO WATCH" : ott.tier === "Subscription" ? "⭐ PAID SUB" : "🏷️ RENT / BUY"}
                      </span>
                    </div>
                    <div className="rr-ott-detailed-price">{ott.pricingText}</div>
                    <div className="rr-ott-detailed-cta">
                      <PlayCircle size={12} />
                      <span>Watch On {ott.platform}</span>
                      <ExternalLink size={10} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- */
/* CINEMATIC CARD COMPONENT (MODERN GRID VIEW)                     */
/* --------------------------------------------------------------- */
function SkeletonCard() {
  return (
    <div className="rr-card rr-card--skeleton">
      <div className="rr-card__poster rr-skeleton" style={{ height: 190 }} />
      <div className="rr-card__body">
        <div className="rr-skeleton" style={{ height: 20, width: "80%", borderRadius: 6, marginBottom: 8 }} />
        <div className="rr-skeleton" style={{ height: 14, width: "55%", borderRadius: 4, marginBottom: 12 }} />
        <div className="rr-skeleton" style={{ height: 32, width: "100%", borderRadius: 8 }} />
      </div>
    </div>
  );
}

function MediaCard({ item, onToggleWatchlist, onToggleFavourite, reason = null, playingAudioId = null, onTogglePlaySong = null }) {
  const [expanded, setExpanded] = useState(false);
  const ottList = getOttAvailability(item);
  const isPlaying = playingAudioId === item.id;

  function openYouTubeSearch(event) {
    event.stopPropagation();
    const query = `${item.title} ${item.creator || ""} ${item.type === "movie" ? "trailer" : "song"}`.trim();
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(youtubeUrl, "_blank", "noopener,noreferrer");
  }

  const posterSrc = item.poster || item.artworkUrl || item.posterUrl;
  const grad = GRADIENTS[(item.title?.length || 0) % GRADIENTS.length];
  const spotifyLink = item.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(item.title + " " + (item.creator || ""))}`;

  return (
    <div className={`rr-card ${expanded ? "rr-card--expanded" : ""} ${isPlaying ? "rr-card--playing" : ""}`}>
      {/* Poster Artwork Container */}
      <div className="rr-card__poster" style={{ background: !posterSrc ? grad : undefined }}>
        {posterSrc ? (
          <img
            src={posterSrc}
            alt={item.title}
            className="rr-card__img"
            loading="lazy"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.rr-card__poster-fallback');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="rr-card__poster-fallback" style={{ display: posterSrc ? 'none' : 'flex' }}>
          {item.type === "movie" ? <Clapperboard size={38} /> : <Disc3 size={38} />}
          <span className="rr-card__poster-initial">{item.title?.charAt(0)}</span>
        </div>
        <div className="rr-card__poster-overlay" />

        {/* Top Badges */}
        <div className="rr-card__top-badges">
          <div className="rr-card__badges-left">
            <TypeBadge type={item.type} />
            <LanguageBadge item={item} />
          </div>
          {item.rating && (
            <div className="rr-card__rating-badge">
              <Star size={11} fill="#f59e0b" color="#f59e0b" />
              <span>{(Number(item.rating) || 7.5).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Live Audio Playing Overlay Badge */}
        {isPlaying && (
          <div className="rr-card__playing-badge">
            <Volume2 size={12} className="rr-volume-pulse" />
            <span>PLAYING PREVIEW</span>
            <div className="rr-audio-waves rr-audio-waves--tiny">
              <span className="rr-audio-bar" />
              <span className="rr-audio-bar" />
              <span className="rr-audio-bar" />
            </div>
          </div>
        )}

        {/* Floating Quick Action Overlay */}
        <div className="rr-card__poster-actions">
          {item.type === "song" && (
            <>
              <button
                type="button"
                className={`rr-card__action-btn rr-card__action-btn--play ${isPlaying ? "rr-card__action-btn--playing" : ""}`}
                onClick={(e) => { e.stopPropagation(); onTogglePlaySong?.(item, e); }}
                title={isPlaying ? "Pause 30s Audio Preview" : "Play 30s Audio Preview"}
                aria-label="Play 30s Audio Preview"
              >
                {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
              </button>
              <a
                href={spotifyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rr-card__action-btn rr-card__action-btn--spotify"
                onClick={(e) => e.stopPropagation()}
                title="Open on Spotify"
                aria-label="Open on Spotify"
              >
                <Music size={15} />
              </a>
              <a
                href={getLyricsSearchUrl(item.title, item.creator || item.artist, item.lyricsUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="rr-card__action-btn rr-card__action-btn--lyrics"
                onClick={(e) => e.stopPropagation()}
                title="Read song lyrics"
                aria-label="Read song lyrics"
              >
                <Mic2 size={15} />
              </a>
            </>
          )}
          <button
            type="button"
            className={`rr-card__action-btn ${item.isWatchlist ? "rr-card__action-btn--active" : ""}`}
            onClick={(e) => { e.stopPropagation(); onToggleWatchlist(item); }}
            title={item.isWatchlist ? "In Watchlist" : "Add to Watchlist"}
            aria-label="Toggle Watchlist"
          >
            <Bookmark size={15} fill={item.isWatchlist ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            className={`rr-card__action-btn ${item.isFavourite ? "rr-card__action-btn--heart" : ""}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavourite(item); }}
            title={item.isFavourite ? "In Favourites" : "Add to Favourites"}
            aria-label="Toggle Favourite"
          >
            <Heart size={15} fill={item.isFavourite ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            className="rr-card__action-btn rr-card__action-btn--yt"
            onClick={openYouTubeSearch}
            title={`Watch ${item.type === "movie" ? "Trailer" : "Music Video"} on YouTube`}
            aria-label="Watch on YouTube"
          >
            <Youtube size={15} />
          </button>
        </div>
      </div>

      {/* Card Details & Info */}
      <div className="rr-card__body">
        <h3 className="rr-card__title" title={item.title}>{item.title}</h3>

        <div className="rr-card__meta">
          {item.year && (
            <span className="rr-card__meta-item">
              <Calendar size={11} />
              {item.year}
            </span>
          )}
          {item.duration && (
            <span className="rr-card__meta-item">
              <Clock size={11} />
              {item.duration}
            </span>
          )}
          {item.genre && <span className="rr-genre-tag">{item.genre}</span>}
        </div>

        {item.creator && (
          <div className="rr-card__creator">
            <User size={12} />
            <span>{item.creator}</span>
          </div>
        )}

        {(reason || item.reason) && (
          <div className="rr-card__reason">
            <Sparkles size={12} className="rr-card__sparkle" />
            <span>{reason || item.reason}</span>
          </div>
        )}

        {/* Dedicated Spotify & Audio Preview Action Strip for Songs */}
        {item.type === "song" && (
          <div className="rr-card__song-actions">
            <button
              type="button"
              className={`rr-song-preview-btn ${isPlaying ? "rr-song-preview-btn--playing" : ""}`}
              onClick={(e) => { e.stopPropagation(); onTogglePlaySong?.(item, e); }}
              title="Play 30-second audio preview"
            >
              {isPlaying ? (
                <>
                  <Pause size={13} />
                  <span>Pause (30s)</span>
                  <div className="rr-audio-waves">
                    <span className="rr-audio-bar" />
                    <span className="rr-audio-bar" />
                    <span className="rr-audio-bar" />
                  </div>
                </>
              ) : (
                <>
                  <Play size={13} fill="currentColor" />
                  <span>30s Preview</span>
                </>
              )}
            </button>

            <a
              href={spotifyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rr-spotify-cta-btn"
              onClick={(e) => e.stopPropagation()}
              title="Listen to full track on Spotify"
            >
              <Music size={13} />
              <span>Spotify</span>
              <ExternalLink size={11} />
            </a>

            <a
              href={getLyricsSearchUrl(item.title, item.creator || item.artist, item.lyricsUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="rr-lyrics-cta-btn"
              onClick={(e) => e.stopPropagation()}
              title="Read complete song lyrics"
            >
              <Mic2 size={13} />
              <span>Lyrics</span>
              <ExternalLink size={11} />
            </a>
          </div>
        )}

        {/* Compact OTT Strip on Card Face (for movies) */}
        {ottList.length > 0 && item.type !== "song" && (
          <div className="rr-card__ott-strip">
            <span className="rr-ott-strip__label">
              <Tv size={11} /> Watch On:
            </span>
            <div className="rr-ott-chip-row">
              {ottList.slice(0, 3).map((ott, idx) => (
                <a
                  key={idx}
                  href={ott.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rr-ott-chip rr-ott-chip--${ott.tier.toLowerCase()}`}
                  onClick={(e) => e.stopPropagation()}
                  title={`${ott.platform} • ${ott.tier} (${ott.pricingText})`}
                >
                  <span className="rr-ott-chip__platform">{ott.short || ott.platform}</span>
                  <span className={`rr-ott-badge-tag rr-ott-badge-tag--${ott.tier.toLowerCase()}`}>
                    {ott.tier === "Free" ? "FREE" : ott.tier === "Subscription" ? "SUB" : "RENT"}
                  </span>
                </a>
              ))}
              {ottList.length > 3 && (
                <span className="rr-ott-chip-more" title={ottList.slice(3).map(o => o.platform).join(", ")}>
                  +{ottList.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {(item.blurb || item.cast || item.vibe || ottList.length > 0 || item.type === "song") && (
          <div className="rr-card__expand-sec">
            <button
              type="button"
              className="rr-card__expand-btn"
              onClick={() => setExpanded(!expanded)}
            >
              <span>{expanded ? "Show less" : (item.type === "song" ? "Story, Lyrics & Vibes" : "Story, Cast, Vibes & OTT")}</span>
              <ChevronDown
                size={13}
                style={{
                  transform: expanded ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s ease"
                }}
              />
            </button>

            {expanded && (
              <div className="rr-card__details">
                {/* 1. OTT Streaming Platforms with Free vs Subscription Breakdown */}
                {ottList.length > 0 && (
                  <div className="rr-card__detail-block">
                    <div className="rr-detail-heading">
                      <Tv size={12} className="rr-detail-icon" />
                      <span>Where to Watch &amp; OTT Subscriptions</span>
                    </div>
                    <div className="rr-ott-detailed-grid">
                      {ottList.map((ott, idx) => (
                        <a
                          key={idx}
                          href={ott.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rr-ott-detailed-card"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="rr-ott-detailed-top">
                            <span className="rr-ott-detailed-name" style={{ color: ott.color }}>
                              {ott.platform}
                            </span>
                            <span className={`rr-ott-badge-tag rr-ott-badge-tag--${ott.tier.toLowerCase()}`}>
                              {ott.tier === "Free" ? "🟢 FREE TO WATCH" : ott.tier === "Subscription" ? "⭐ PAID SUBSCRIPTION" : "🏷️ RENT / BUY"}
                            </span>
                          </div>
                          <div className="rr-ott-detailed-price">{ott.pricingText}</div>
                          <div className="rr-ott-detailed-cta">
                            <PlayCircle size={12} />
                            <span>Watch Now</span>
                            <ExternalLink size={10} />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Accurate Story / Synopsis */}
                {item.blurb && (
                  <div className="rr-card__detail-block">
                    <div className="rr-detail-heading">
                      <Film size={12} className="rr-detail-icon" />
                      <span>{item.type === "song" ? "Song Meaning & Story" : "Story & Synopsis"}</span>
                    </div>
                    <p className="rr-card__blurb">{item.blurb}</p>
                  </div>
                )}

                {/* 3. Lyrics Redirect (for Songs) OR Star Cast (for Movies) */}
                {item.type === "song" ? (
                  <div className="rr-card__detail-block rr-card__lyrics-block">
                    <div className="rr-detail-heading">
                      <Mic2 size={12} className="rr-detail-icon" />
                      <span>Song Lyrics &amp; Words</span>
                    </div>
                    <div className="rr-lyrics-redirect-card">
                      <div className="rr-lyrics-card-info">
                        <FileText size={16} className="rr-lyrics-icon" />
                        <div>
                          <p className="rr-lyrics-prompt">Want to sing along or read the full lyrics?</p>
                          <p className="rr-lyrics-sub">Direct access to verified lyrics, translations &amp; verses.</p>
                        </div>
                      </div>
                      <a
                        href={getLyricsSearchUrl(item.title, item.creator || item.artist, item.lyricsUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rr-lyrics-open-link"
                        onClick={(e) => e.stopPropagation()}
                        title={`Open lyrics for "${item.title}"`}
                      >
                        <Mic2 size={13} />
                        <span>Read "{item.title}" Lyrics ↗</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  item.cast && (
                    <div className="rr-card__detail-block">
                      <div className="rr-detail-heading">
                        <Users size={12} className="rr-detail-icon" />
                        <span>Starring Cast</span>
                      </div>
                      <div className="rr-cast-chips">
                        {(Array.isArray(item.cast) ? item.cast : String(item.cast).split(",")).map((actor, idx) => (
                          <span key={idx} className="rr-cast-pill">
                            {actor.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* 4. Cinematic / Music Vibes */}
                {item.vibe && (
                  <div className="rr-card__detail-block">
                    <div className="rr-detail-heading">
                      <Sparkles size={12} className="rr-detail-icon" />
                      <span>{item.type === "song" ? "Musical Mood & Vibes" : "Cinematic Vibes"}</span>
                    </div>
                    <div className="rr-vibe-chips">
                      {item.vibe.split(",").map((v, idx) => (
                        <span key={idx} className="rr-vibe-pill">{v.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- */
/* PREMIUM AUTHENTICATION SCREEN ("CREATE ACCOUNT FIRST")          */
/* --------------------------------------------------------------- */
function AuthScreen({ onLogin, onGuestExplore, theme = "dark", onToggleTheme }) {
  // Default to CREATE ACCOUNT (Sign Up) as explicitly requested!
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsAccountPrompt, setNeedsAccountPrompt] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    
    setError("");
    setNeedsAccountPrompt(false);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (!isLogin && password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);

    const endpoint = isLogin ? `${BACKEND_URL}/api/auth/login` : `${BACKEND_URL}/api/auth/register`;

    try {
      const response = await safeFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password })
      });

      if (!response.ok) {
        if (response.data.needsAccount || response.status === 404) {
          setNeedsAccountPrompt(true);
        }
        throw new Error(response.data.error || "Authentication failed.");
      }

      onLogin(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchToRegister = () => {
    setIsLogin(false);
    setError("");
    setNeedsAccountPrompt(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setError("");
    setNeedsAccountPrompt(false);
  };

  return (
    <div className="rr-auth-wrap">
      {onToggleTheme && (
        <button
          type="button"
          className="rr-theme-toggle rr-theme-toggle--auth"
          onClick={onToggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          aria-label="Toggle Light and Dark Mode"
        >
          {theme === "dark" ? (
            <>
              <Sun size={14} className="rr-theme-icon--sun" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={14} className="rr-theme-icon--moon" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      )}
      <div className="rr-auth-bg-orb orb-1" />
      <div className="rr-auth-bg-orb orb-2" />

      <div className="rr-auth-card">
        <div className="rr-auth-header">
          <div className="rr-auth-logo-wrap">
            <img src="/vibescape-logo.png" alt="Vibescape Logo" className="rr-auth-logo-img" />
          </div>
          <div className="rr-auth-badge">
            <Sparkles size={16} color="var(--accent)" />
            <span>AI CINEMA &bull; SONGS &bull; LYRICS</span>
          </div>
          <h1 className="rr-auth-title">Vibescape</h1>
          <p className="rr-auth-subtitle">
            {!isLogin 
              ? "Create your account first to curate personalized watchlists and unlock taste profile analytics." 
              : "Sign in to access your saved media, ratings, and custom recommendations."}
          </p>
        </div>

        <div className="rr-auth-tabs">
          <button 
            type="button"
            className={`rr-auth-tab ${!isLogin ? "rr-auth-tab--active" : ""}`}
            onClick={switchToRegister}
          >
            <Sparkles size={14} />
            Create Account
          </button>
          <button 
            type="button"
            className={`rr-auth-tab ${isLogin ? "rr-auth-tab--active" : ""}`}
            onClick={switchToLogin}
          >
            <User size={14} />
            Sign In
          </button>
        </div>

        {!isLogin && (
          <div className="rr-auth-notice">
            <ShieldCheck size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
            <span>Step 1: Set up your profile. No email or verification needed.</span>
          </div>
        )}

        {needsAccountPrompt && (
          <div className="rr-auth-prompt-banner">
            <p><strong>Account Not Found!</strong> You need to create an account first before logging in.</p>
            <button type="button" className="rr-auth-switch-btn" onClick={switchToRegister}>
              ✨ Switch to Create Account
            </button>
          </div>
        )}

        {error && !needsAccountPrompt && (
          <div className="rr-auth-error">
            <span>{error}</span>
          </div>
        )}

        <form className="rr-auth-form" onSubmit={handleSubmit}>
          <div className="rr-field">
            <label className="rr-field-label">Username</label>
            <div className="rr-field-wrap">
              <User size={16} className="rr-field-icon" />
              <input
                className="rr-auth-input"
                type="text"
                placeholder={!isLogin ? "Choose a unique username" : "Enter your username"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="rr-field">
            <label className="rr-field-label">Password</label>
            <div className="rr-field-wrap">
              <Key size={16} className="rr-field-icon" />
              <input
                className="rr-auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password (min 4 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="rr-eye-btn" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="rr-field">
              <label className="rr-field-label">Confirm Password</label>
              <div className="rr-field-wrap">
                <ShieldCheck size={16} className="rr-field-icon" />
                <input
                  className="rr-auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className="rr-auth-submit" disabled={loading}>
            {loading ? "Connecting..." : !isLogin ? "Create Account & Enter" : "Sign In to Account"}
          </button>
        </form>

        <div className="rr-auth-footer">
          {!isLogin ? (
            <p>
              Already registered?{" "}
              <button type="button" className="rr-link-btn" onClick={switchToLogin}>
                Sign in here
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button type="button" className="rr-link-btn" onClick={switchToRegister}>
                Create an account first
              </button>
            </p>
          )}

          <div className="rr-guest-divider">
            <span>or</span>
          </div>

          <button type="button" className="rr-guest-btn" onClick={onGuestExplore}>
            Explore as Guest Preview
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- */
/* DISCOVER COMPONENT WITH BOLLYWOOD & HOLLYWOOD LANGUAGE SELECTOR */
/* --------------------------------------------------------------- */
function Discover({
  query,
  setQuery, 
  typeFilter, 
  setTypeFilter, 
  savedMedia, 
  onToggleWatchlist, 
  onToggleFavourite,
  onOpenApiKeyModal,
  resetTrigger,
  playingAudioId = null,
  onTogglePlaySong = null
}) {
  const inputRef = useRef(null);
  
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [ottFilter, setOttFilter] = useState("all");
  const [liveFeed, setLiveFeed] = useState([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  
  const [aiResults, setAiResults] = useState([]);
  const [resultSource, setResultSource] = useState("curated");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); 
  const [activeMoodId, setActiveMoodId] = useState(null);
  const [activeSuggestionId, setActiveSuggestionId] = useState(null);
  
  // Top 10 Movies All-Time State
  const [top10Movies, setTop10Movies] = useState(TOP_10_ALL_TIME_FALLBACK);
  
  // 20 Movies Per Page Pagination
  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const searchIdRef = useRef(0);

  useEffect(() => {
    fetchTopMoviesAllTime().then((data) => {
      if (data && data.length > 0) {
        setTop10Movies(data);
      }
    });
  }, []);

  useEffect(() => {
    setIsFeedLoading(true);
    fetchLiveTrending(selectedLanguage, typeFilter).then((data) => {
      setLiveFeed(data);
      setIsFeedLoading(false);
    });
  }, [selectedLanguage, typeFilter]);

  // Handle Logo Click Reset Trigger
  useEffect(() => {
    if (resetTrigger > 0) {
      setSelectedLanguage("all");
      setOttFilter("all");
      setAiResults([]);
      setHasSearched(false);
      setActiveMoodId(null);
      setActiveSuggestionId(null);
      setCurrentPage(1);
      setIsFeedLoading(true);
      fetchLiveTrending("all", "all").then((data) => {
        setLiveFeed(data);
        setIsFeedLoading(false);
      });
    }
  }, [resetTrigger]);

  async function runSearch(text, moodId = null, lang = selectedLanguage, suggestionLabel = null, refresh = false) {
    const id = ++searchIdRef.current;
    if (!text.trim()) {
      setAiResults([]);
      setIsSearching(false);
      setHasSearched(false);
      setActiveMoodId(null);
      setActiveSuggestionId(null);
      setCurrentPage(1);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setActiveMoodId(moodId);
    setCurrentPage(1);
    
    try {
      const data = await moodSearch(text, typeFilter, lang, moodId, suggestionLabel, refresh);
      if (id === searchIdRef.current) {
        setAiResults(data.results || []);
        setResultSource(data.source || "imdb");
      }
    } catch (error) {
      console.warn("Search notice:", error);
    } finally {
      if (id === searchIdRef.current) setIsSearching(false);
    }
  }

  const handleLanguageSelect = (langId) => {
    setSelectedLanguage(langId);
    setCurrentPage(1);
    if (hasSearched || activeMoodId) {
      const currentSub = activeMoodId && activeSuggestionId 
        ? MOOD_SUGGESTIONS[activeMoodId]?.find(s => s.id === activeSuggestionId) 
        : null;
      const searchQuery = currentSub
        ? currentSub.query
        : activeMoodId 
          ? (MOODS.find(m => m.id === activeMoodId)?.prompt || query)
          : (query.trim() || "top acclaimed");
      runSearch(searchQuery, activeMoodId, langId, currentSub?.label);
    } else {
      setIsFeedLoading(true);
      fetchLiveTrending(langId, typeFilter).then((data) => {
        setLiveFeed(data);
        setIsFeedLoading(false);
      });
    }
  };

  const handleSelectSuggestion = (sug) => {
    setActiveSuggestionId(sug.id);
    setQuery(sug.label);
    setCurrentPage(1);
    runSearch(sug.query, activeMoodId, selectedLanguage, sug.label);
  };

  const handleAiRefresh = () => {
    const currentSub = MOOD_SUGGESTIONS[activeMoodId]?.find(s => s.id === activeSuggestionId);
    const q = currentSub ? currentSub.query : (query.trim() || MOODS.find(m => m.id === activeMoodId)?.prompt || "feel good");
    runSearch(q, activeMoodId, selectedLanguage, currentSub?.label, true);
  };

  useEffect(() => {
    if (hasSearched) {
      const currentSub = activeMoodId && activeSuggestionId 
        ? MOOD_SUGGESTIONS[activeMoodId]?.find(s => s.id === activeSuggestionId) 
        : null;
      const searchQuery = currentSub
        ? currentSub.query
        : activeMoodId 
          ? (MOODS.find(m => m.id === activeMoodId)?.prompt || query)
          : query.trim();
      if (searchQuery) {
        runSearch(searchQuery, activeMoodId, selectedLanguage, currentSub?.label);
      }
    }
  }, [typeFilter]);

  const showHeadline = !hasSearched && !query.trim();
  const byType = (list) => typeFilter === "all" ? list : list.filter((item) => item.type === typeFilter);

  const byOtt = (list) => {
    if (ottFilter === "all") return list;
    if (ottFilter === "free") {
      return list.filter((item) => {
        const otts = getOttAvailability(item);
        return otts.some(o => o.tier === "Free");
      });
    }
    if (ottFilter === "subscription") {
      return list.filter((item) => {
        const otts = getOttAvailability(item);
        return otts.some(o => o.tier === "Subscription");
      });
    }
    if (ottFilter === "rent") {
      return list.filter((item) => {
        const otts = getOttAvailability(item);
        return otts.some(o => o.tier === "Rent");
      });
    }
    return list.filter((item) => {
      const otts = getOttAvailability(item);
      return otts.some(o => o.id === ottFilter);
    });
  };
  
  const activeList = byOtt(byType(showHeadline ? liveFeed : aiResults));

  const displayList = activeList.map((result) => {
    const saved = savedMedia.find((s) => s.id === result.id || s.media_id === result.id);
    return saved
      ? { ...result, isWatchlist: saved.isWatchlist, isFavourite: saved.isFavourite }
      : { ...result, isWatchlist: false, isFavourite: false };
  });

  const top10DisplayList = top10Movies.map((result) => {
    const saved = savedMedia.find((s) => s.id === result.id || s.media_id === result.id);
    return saved
      ? { ...result, isWatchlist: saved.isWatchlist, isFavourite: saved.isFavourite }
      : { ...result, isWatchlist: false, isFavourite: false };
  });

  const top10SongsDisplayList = TOP_10_SONGS_ALL_TIME.map((result) => {
    const saved = savedMedia.find((s) => s.id === result.id || s.media_id === result.id);
    return saved
      ? { ...result, isWatchlist: saved.isWatchlist, isFavourite: saved.isFavourite }
      : { ...result, isWatchlist: false, isFavourite: false };
  });

  const totalPages = Math.max(1, Math.ceil(displayList.length / PAGE_SIZE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, displayList.length);
  const paginatedList = displayList.slice(startIndex, endIndex);

  const scrollToGrid = () => {
    const el = document.getElementById("rr-list-anchor");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    pages.push(1);
    if (validCurrentPage > 3) {
      pages.push("...");
    }
    const start = Math.max(2, validCurrentPage - 1);
    const end = Math.min(totalPages - 1, validCurrentPage + 1);
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    if (validCurrentPage < totalPages - 2) {
      pages.push("...");
    }
    pages.push(totalPages);
    return pages;
  };
  
  const availableLanguages = typeFilter === "song" ? MUSIC_LANGUAGES : CINEMA_LANGUAGES;
  const selectedLangObj = availableLanguages.find(l => l.id === selectedLanguage) || availableLanguages[0];
  const ottFilterLabel = ottFilter !== "all" 
    ? ` • ${ottFilter === "free" ? "🟢 Free to Watch" : ottFilter === "subscription" ? "⭐ Paid Sub" : ottFilter === "rent" ? "🏷️ Rent/Buy" : (OTT_PROVIDERS[ottFilter]?.platform || ottFilter.toUpperCase())}`
    : "";
  
  const activeMoodObj = MOODS.find(m => m.id === activeMoodId);
  const activeSubObj = activeMoodId && activeSuggestionId ? MOOD_SUGGESTIONS[activeMoodId]?.find(s => s.id === activeSuggestionId) : null;
  const itemTypeLabel = typeFilter === "song" ? "songs" : typeFilter === "movie" ? "movies" : "titles";

  const headerLabel = showHeadline 
    ? `🔥 Trending Worldwide Today (${selectedLangObj.label}${ottFilterLabel})` 
    : activeSubObj
      ? `🎯 Theme: "${activeSubObj.label}" • ${activeMoodObj?.label || "Mood"} (${selectedLangObj.label}${ottFilterLabel})`
      : activeMoodId
        ? `🎬 Mood: "${query.trim() || selectedLangObj.label}" (${selectedLangObj.label}${ottFilterLabel})`
        : `🎬 Search: "${query.trim() || selectedLangObj.label}" (${selectedLangObj.label}${ottFilterLabel})`;

  return (
    <div>
      <div className={`rr-hero ${showHeadline ? "" : "rr-hero--compact"}`}>
        <div className="rr-hero-ambient" />
        {showHeadline && (
          <>
            <div className="rr-hero-badge">
              <Sparkles size={14} color="var(--accent)" />
              <span>BOLLYWOOD &bull; HOLLYWOOD &bull; SOUTH INDIAN &bull; SONGS</span>
            </div>
            <h1 className="rr-hero__title">Explore Cinema &amp; Songs by Mood</h1>
            <p className="rr-hero__desc">
              Discover acclaimed movies and songs tailored to your feeling — across Hindi, Punjabi, South Indian, English, K-Pop, and global cinema.
            </p>
          </>
        )}

        {/* Search Bar Capsule */}
        <div className="rr-search">
          <Search size={18} className="rr-search__icon" />
          <input
            ref={inputRef}
            className="rr-search__input"
            placeholder={typeFilter === "song" 
              ? 'Search any song, artist, album, or vibe (e.g. "Kesariya", "Aasa Kooda", "Arijit Singh", "Brown Munde", "Espresso")...'
              : 'Search any movie, actor, or mood (e.g. "Inception", "Dangal", "Avatar", "Shah Rukh Khan")...'}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveMoodId(null);
              setActiveSuggestionId(null);
              if (e.target.value.trim() === "") {
                setHasSearched(false);
                setAiResults([]);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setActiveMoodId(null);
                setActiveSuggestionId(null);
                runSearch(query.trim(), null, selectedLanguage);
              }
            }}
          />
          {query && (
            <button 
              className="rr-search__clear" 
              onClick={() => {
                setQuery("");
                setHasSearched(false);
                setAiResults([]);
                setActiveMoodId(null);
                setActiveSuggestionId(null);
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
          <button 
            type="button" 
            className="rr-search-submit" 
            onClick={() => {
              setActiveMoodId(null);
              setActiveSuggestionId(null);
              runSearch(query.trim(), null, selectedLanguage);
            }}
            disabled={!query.trim()}
          >
            <Sparkles size={14} />
            <span>Discover</span>
          </button>
        </div>

        {/* CINEMA / MUSIC LANGUAGE SELECTOR BAR */}
        <div className="rr-cinema-section">
          <div className="rr-chips-label">
            {typeFilter === "song" ? "CHOOSE MUSIC REGION / GENRE:" : "CHOOSE CINEMA / REGION:"}
          </div>
          <div className="rr-cinema-bar">
            {availableLanguages.map((lang) => {
              const isActive = selectedLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  className={`rr-cinema-pill ${isActive ? "rr-cinema-pill--active" : ""}`}
                  onClick={() => handleLanguageSelect(lang.id)}
                >
                  <span className="rr-pill-flag">{lang.flag}</span>
                  <span>{lang.label.split(" ").slice(1).join(" ") || lang.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 10 Visual Mood Chips */}
        <div className="rr-chips-section">
          <div className="rr-chips-label">SELECT YOUR MOOD:</div>
          <div className="rr-chips">
            {MOODS.map((mood) => {
              const isSelected = activeMoodId === mood.id;
              return (
                <button 
                  key={mood.id} 
                  className={`rr-chip ${isSelected ? "rr-chip--active" : ""}`} 
                  onClick={() => {
                    if (isSelected) {
                      setActiveMoodId(null);
                      setActiveSuggestionId(null);
                      setQuery("");
                      setHasSearched(false);
                      setAiResults([]);
                      setCurrentPage(1);
                    } else {
                      const moodTitle = mood.label.split(" ").slice(1).join(" ");
                      setQuery(moodTitle);
                      setActiveMoodId(mood.id);
                      const firstSub = MOOD_SUGGESTIONS[mood.id]?.[0];
                      setActiveSuggestionId(firstSub?.id || null);
                      setCurrentPage(1);
                      runSearch(firstSub ? firstSub.query : mood.prompt, mood.id, selectedLanguage, firstSub?.label);
                    }
                  }}
                >
                  {mood.label}
                </button>
              );
            })}
          </div>

          {/* DYNAMIC SUB-THEME & SUGGESTION CHIPS WITH AI REFRESH */}
          {activeMoodId && MOOD_SUGGESTIONS[activeMoodId] && (
            <div className="rr-subsuggestions-section">
              <div className="rr-subsuggestions-header">
                <div className="rr-subsuggestions-title">
                  <Sparkles size={13} color="var(--accent)" />
                  <span>THEMES FOR {MOODS.find(m => m.id === activeMoodId)?.label}:</span>
                </div>
                <button 
                  type="button" 
                  className="rr-refresh-ai-btn"
                  onClick={handleAiRefresh}
                  title="Generate fresh, diversified AI recommendations for this theme"
                >
                  <RefreshCw size={12} className={isSearching ? "rr-spin" : ""} />
                  <span>Fresh AI Picks</span>
                </button>
              </div>
              <div className="rr-subchips">
                {MOOD_SUGGESTIONS[activeMoodId].map((sug) => {
                  const isSugActive = activeSuggestionId === sug.id;
                  return (
                    <button
                      key={sug.id}
                      type="button"
                      className={`rr-subchip ${isSugActive ? "rr-subchip--active" : ""}`}
                      onClick={() => handleSelectSuggestion(sug)}
                    >
                      <span>{sug.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* List Header, Type Filters, and View Switcher */}
      <div className="rr-listhead" id="rr-list-anchor">
        <div className="rr-listhead__left">
          <span className="rr-listhead__title">{headerLabel}</span>
          {!isSearching && !isFeedLoading && (
            <span className="rr-listhead__count">
              {displayList.length > 0 
                ? `Showing ${startIndex + 1}–${endIndex} of ${displayList.length} ${itemTypeLabel} (Page ${validCurrentPage} of ${totalPages})`
                : "0 items"}
            </span>
          )}
          {(isSearching || (showHeadline && isFeedLoading)) && (
            <span className="rr-listhead__loading">
              <Sparkles size={14} className="rr-spin" /> {showHeadline ? "Loading charts..." : "Curating recommendations..."}
            </span>
          )}
        </div>
        <div className="rr-listhead__controls">
          <div className="rr-pillgroup">
            {["all", "movie", "song"].map((type) => (
              <button 
                key={type} 
                className={`rr-pill ${typeFilter === type ? "rr-pill--active" : ""}`} 
                onClick={() => {
                  setTypeFilter(type);
                  setCurrentPage(1);
                }}
              >
                {type === "all" ? "All Media" : type === "movie" ? "Movies Only" : "Songs Only (Spotify)"}
              </button>
            ))}
          </div>

          <div className="rr-ott-filter-wrap">
            <Tv size={13} className="rr-ott-filter-icon" />
            <select
              className="rr-ott-select"
              value={ottFilter}
              onChange={(e) => {
                setOttFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by OTT Platform or Subscription"
            >
              <option value="all">📺 All Platforms</option>
              <optgroup label="Access & Pricing">
                <option value="free">🟢 Free to Watch (No Sub)</option>
                <option value="subscription">⭐ Paid Subscription</option>
                <option value="rent">🏷️ Rent / Buy</option>
              </optgroup>
              <optgroup label="Streaming Platforms">
                <option value="netflix">Netflix</option>
                <option value="prime">Prime Video</option>
                <option value="hotstar">JioHotstar</option>
                <option value="sonyliv">Sony LIV</option>
                <option value="zee5">Zee5</option>
                <option value="youtube">YouTube</option>
                <option value="jiocinema">JioCinema</option>
                <option value="appletv">Apple TV</option>
              </optgroup>
            </select>
          </div>

          <div className="rr-view-toggle">
            <button
              type="button"
              className={`rr-view-btn ${viewMode === "grid" ? "rr-view-btn--active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              className={`rr-view-btn ${viewMode === "list" ? "rr-view-btn--active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
              aria-label="List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Media Recommendations Display (20 Items Per Page) */}
      {typeFilter === "song" ? (
        <MusicPlayerApp 
          savedMedia={savedMedia}
          onToggleWatchlist={onToggleWatchlist}
          onToggleFavourite={onToggleFavourite}
          embedded={true}
          externalQuery={query}
          selectedGenreProp={selectedLanguage}
          selectedMoodProp={activeMoodId}
        />
      ) : viewMode === "grid" ? (
        <div className="rr-card-grid">
          {isSearching || (showHeadline && isFeedLoading) ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : displayList.length > 0 ? (
            <>
              {paginatedList.map((item) => (
                <MediaCard 
                  item={item} 
                  key={item.id} 
                  onToggleFavourite={onToggleFavourite} 
                  onToggleWatchlist={onToggleWatchlist} 
                  reason={item.reason} 
                  playingAudioId={playingAudioId}
                  onTogglePlaySong={onTogglePlaySong}
                />
              ))}
            </>
          ) : query.trim() && !hasSearched ? (
            <div className="rr-grid-empty-span">
              <EmptyState title="Ready to discover" subtitle="Click on any mood chip or theme above to explore recommendations." />
            </div>
          ) : ottFilter !== "all" ? (
            <div className="rr-grid-empty-span" style={{ textAlign: "center", padding: "20px 0" }}>
              <EmptyState 
                title="No titles match this OTT filter" 
                subtitle={`No titles match "${OTT_PROVIDERS[ottFilter]?.platform || ottFilter}" in this section. Reset the OTT filter to view all available recommendations.`} 
              />
              <button 
                type="button" 
                className="rr-page-btn" 
                style={{ marginTop: 14 }}
                onClick={() => { setOttFilter("all"); setCurrentPage(1); }}
              >
                Reset to All Platforms
              </button>
            </div>
          ) : (
            <div className="rr-grid-empty-span">
              <EmptyState title="No matches found" subtitle="Try selecting a different language or mood theme." />
            </div>
          )}
        </div>
      ) : (
        <div className="rr-list">
          {isSearching || (showHeadline && isFeedLoading) ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : displayList.length > 0 ? (
            <>
              {paginatedList.map((item) => (
                <MediaRow 
                  item={item} 
                  key={item.id} 
                  onToggleFavourite={onToggleFavourite} 
                  onToggleWatchlist={onToggleWatchlist} 
                  reason={item.reason} 
                  playingAudioId={playingAudioId}
                  onTogglePlaySong={onTogglePlaySong}
                />
              ))}
            </>
          ) : query.trim() && !hasSearched ? (
            <EmptyState title="Ready to discover" subtitle="Click on any mood chip or theme above to explore recommendations." />
          ) : ottFilter !== "all" ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <EmptyState 
                title="No titles match this OTT filter" 
                subtitle={`No titles match "${OTT_PROVIDERS[ottFilter]?.platform || ottFilter}" in this section. Reset the OTT filter to view all available recommendations.`} 
              />
              <button 
                type="button" 
                className="rr-page-btn" 
                style={{ marginTop: 14 }}
                onClick={() => { setOttFilter("all"); setCurrentPage(1); }}
              >
                Reset to All Platforms
              </button>
            </div>
          ) : (
            <EmptyState title="No matches found" subtitle="Try selecting a different language or mood theme." />
          )}
        </div>
      )}

      {/* 20 Items Per Page Pagination Component */}
      {typeFilter !== "song" && totalPages > 1 && !isSearching && !(showHeadline && isFeedLoading) && (
        <div className="rr-pagination" id="rr-pagination-bar">
          <button
            type="button"
            className="rr-page-btn rr-page-btn--prev"
            onClick={() => {
              if (validCurrentPage > 1) {
                setCurrentPage(validCurrentPage - 1);
                scrollToGrid();
              }
            }}
            disabled={validCurrentPage === 1}
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="rr-page-numbers">
            {getPageNumbers().map((p, idx) => (
              p === "..." ? (
                <span key={`dots-${idx}`} className="rr-page-ellipsis">&hellip;</span>
              ) : (
                <button
                  key={`page-${p}`}
                  type="button"
                  className={`rr-page-num ${p === validCurrentPage ? "rr-page-num--active" : ""}`}
                  onClick={() => {
                    setCurrentPage(p);
                    scrollToGrid();
                  }}
                  aria-label={`Go to page ${p}`}
                >
                  {p}
                </button>
              )
            ))}
          </div>

          <button
            type="button"
            className="rr-page-btn rr-page-btn--next"
            onClick={() => {
              if (validCurrentPage < totalPages) {
                setCurrentPage(validCurrentPage + 1);
                scrollToGrid();
              }
            }}
            disabled={validCurrentPage === totalPages}
            aria-label="Next Page"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Top 10 All-Time Trending Songs Section (shown in Songs Only mode below results even when searched) */}
      {typeFilter === "song" && (
        <section className="rr-top10-section rr-top10-songs-section" aria-label="Top 10 All-Time Trending Songs" style={{ marginTop: 52, marginBottom: 20 }}>
          <div className="rr-listhead">
            <div className="rr-listhead__left">
              <span className="rr-listhead__title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Headphones size={20} color="var(--accent)" />
                Top 10 All-Time Trending Songs Worldwide
              </span>
              <span className="rr-listhead__count">Billboard &amp; Spotify All-Time Record Breakers &bull; Instant Lyrics &amp; Audio Previews</span>
            </div>
          </div>
          <div className="rr-card-grid">
            {top10SongsDisplayList.map((item) => (
              <MediaCard 
                item={item} 
                key={item.id} 
                onToggleFavourite={onToggleFavourite} 
                onToggleWatchlist={onToggleWatchlist} 
                reason={item.reason} 
                playingAudioId={playingAudioId}
                onTogglePlaySong={onTogglePlaySong}
              />
            ))}
          </div>
        </section>
      )}

      {/* Top 10 Movies All-Time Section */}
      {showHeadline && typeFilter !== "song" && (
        <section className="rr-top10-section" aria-label="Top 10 Movies All-Time" style={{ marginTop: 52, marginBottom: 20 }}>
          <div className="rr-listhead">
            <div className="rr-listhead__left">
              <span className="rr-listhead__title">Top 10 Movies All-Time</span>
              <span className="rr-listhead__count">Showing 1-10 of 10 movies</span>
            </div>
          </div>
          <div className="rr-card-grid">
            {top10DisplayList.map((item) => (
              <MediaCard 
                item={item} 
                key={item.id} 
                onToggleFavourite={onToggleFavourite} 
                onToggleWatchlist={onToggleWatchlist} 
                reason={item.reason} 
                playingAudioId={playingAudioId}
                onTogglePlaySong={onTogglePlaySong}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- */
/* SAVED LIST COMPONENT (WATCHLIST / FAVOURITES) WITH LANGUAGE FILTER*/
/* --------------------------------------------------------------- */
const SORT_OPTIONS = [
  { value: "recent",  label: "Recently Added" },
  { value: "rating",  label: "Highest Rated" },
  { value: "year",    label: "Newest Release" },
  { value: "title",   label: "Title (A-Z)" },
];

function SavedList({ items, heading, emptyTitle, emptySubtitle, onToggleWatchlist, onToggleFavourite, playingAudioId = null, onTogglePlaySong = null }) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");

  const filtered = items.filter((i) => {
    if (typeFilter !== "all" && i.type !== typeFilter) return false;
    if (langFilter === "all") return true;

    const itemLang = (i.language || "").toLowerCase();
    const itemInd = (i.industry || "").toLowerCase();

    if (langFilter === "hindi") {
      return itemLang.includes("hindi") || itemInd.includes("bollywood");
    }
    if (langFilter === "english") {
      return itemLang.includes("english") || itemInd.includes("hollywood");
    }
    if (langFilter === "south-indian") {
      return itemInd.includes("south") || itemLang.includes("tamil") || itemLang.includes("telugu") || itemLang.includes("malayalam");
    }
    if (langFilter === "world") {
      return itemInd.includes("world") || itemLang.includes("korean") || itemLang.includes("japanese") || itemLang.includes("french");
    }
    return true;
  });

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case "rating":  return list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
      case "year":    return list.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
      case "title":   return list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      default:        return list;
    }
  }, [filtered, sortBy]);

  return (
    <div>
      <div className="rr-listhead">
        <div className="rr-listhead__left">
          <span className="rr-listhead__title">{heading}</span>
          <span className="rr-listhead__count">{sorted.length} saved</span>
        </div>
        <div className="rr-listhead__controls">
          {/* Cinema Language Filter */}
          <div className="rr-dropdown">
            <select
              className="rr-dropdown__trigger rr-dropdown__trigger--select"
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
            >
              <option value="all">All Languages</option>
              <option value="hindi">🇮🇳 Bollywood (Hindi)</option>
              <option value="english">🎬 Hollywood (English)</option>
              <option value="south-indian">🔥 South Indian</option>
              <option value="world">🌏 World Cinema</option>
            </select>
            <ChevronDown size={13} className="rr-dropdown__select-icon" />
          </div>

          {/* Media Type Filter */}
          <div className="rr-dropdown">
            <select
              className="rr-dropdown__trigger rr-dropdown__trigger--select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="movie">Movies</option>
              <option value="song">Songs</option>
            </select>
            <ChevronDown size={13} className="rr-dropdown__select-icon" />
          </div>

          {/* Sort Dropdown */}
          <div className="rr-dropdown">
            <select
              className="rr-dropdown__trigger rr-dropdown__trigger--select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="rr-dropdown__select-icon" />
          </div>

          {/* View Toggle */}
          <div className="rr-view-toggle">
            <button
              type="button"
              className={`rr-view-btn ${viewMode === "grid" ? "rr-view-btn--active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              className={`rr-view-btn ${viewMode === "list" ? "rr-view-btn--active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
              aria-label="List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="rr-card-grid">
          {sorted.length ? (
            sorted.map((item) => (
              <MediaCard 
                item={item} 
                key={item.id} 
                onToggleFavourite={onToggleFavourite} 
                onToggleWatchlist={onToggleWatchlist} 
                playingAudioId={playingAudioId}
                onTogglePlaySong={onTogglePlaySong}
              />
            ))
          ) : (
            <div className="rr-grid-empty-span">
              <EmptyState title={emptyTitle} subtitle={emptySubtitle} />
            </div>
          )}
        </div>
      ) : (
        <div className="rr-list">
          {sorted.length ? (
            sorted.map((item) => (
              <MediaRow 
                item={item} 
                key={item.id} 
                onToggleFavourite={onToggleFavourite} 
                onToggleWatchlist={onToggleWatchlist} 
                playingAudioId={playingAudioId}
                onTogglePlaySong={onTogglePlaySong}
              />
            ))
          ) : (
            <EmptyState title={emptyTitle} subtitle={emptySubtitle} />
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- */
/* API KEY SETTINGS MODAL                                          */
/* --------------------------------------------------------------- */
function ApiKeyModal({ isOpen, onClose }) {
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setLoading(true);
    setStatusMsg("");

    try {
      const res = await safeFetch(`${BACKEND_URL}/api/config/api-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() })
      });

      if (!res.ok) throw new Error(res.data.error || "Failed to update key");
      setStatusMsg("✓ Gemini API Key successfully saved and activated!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setStatusMsg(`⚠️ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rr-modal-overlay" onClick={onClose}>
      <div className="rr-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="rr-modal-header">
          <div className="rr-modal-title">
            <Key size={18} color="var(--accent)" />
            <span>Gemini AI Configuration</span>
          </div>
          <button className="rr-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <p className="rr-modal-desc">
          Vibescape comes with a built-in catalog of 60+ handpicked Bollywood, Hollywood, and World cinema movies and millions of Spotify tracks across all moods. If you'd like custom real-time AI prompt generation, you can enter your Google Gemini API key below:
        </p>

        <form onSubmit={handleSave}>
          <div className="rr-field">
            <label className="rr-field-label">Gemini API Key</label>
            <input 
              type="text" 
              className="rr-auth-input" 
              placeholder="AIzaSy..." 
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              required
            />
          </div>

          {statusMsg && (
            <div style={{ marginTop: '10px', fontSize: '13px', color: statusMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>
              {statusMsg}
            </div>
          )}

          <div className="rr-modal-actions">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="rr-link-btn"
              style={{ fontSize: '12.5px' }}
            >
              Get a free API key at Google AI Studio &rarr;
            </a>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="rr-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="rr-btn rr-btn--primary" disabled={loading}>
                {loading ? "Saving..." : "Save Key"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- */
/* MAIN APP COMPONENT                                              */
/* --------------------------------------------------------------- */
export default function App() {
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem("echo_abyss_user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(profile && profile.id);
  });

  const [savedMedia, setSavedMedia] = useState([]);
  const [activeTab, setActiveTab] = useState("discover");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleLogoClick = () => {
    setActiveTab("discover");
    setQuery("");
    setTypeFilter("all");
    setResetTrigger((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (profile && profile.id && !profile.isGuest) {
      safeFetch(`${BACKEND_URL}/api/media/${profile.id}`)
        .then(response => {
          if (response.data.items) {
            const mapped = response.data.items.map(i => ({ ...i, id: i.media_id }));
            setSavedMedia(mapped);
          }
        })
        .catch(err => console.error("Failed to load saved data", err));
    }
  }, [profile]);

  const handleLoginSuccess = (userData) => {
    setProfile(userData);
    setIsAuthenticated(true);
    localStorage.setItem("echo_abyss_user", JSON.stringify(userData));
  };

  const handleGuestExplore = () => {
    const guestUser = {
      id: "guest-user",
      name: "Guest Explorer",
      username: "guest",
      bio: "Browsing cinema in preview mode.",
      isGuest: true
    };
    setProfile(guestUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setProfile(null);
    setSavedMedia([]); 
    setActiveTab("discover");
    localStorage.removeItem("echo_abyss_user");
  };

  async function toggleWatchlist(targetItem) {
    setSavedMedia((prev) => {
      const exists = prev.find(i => i.id === targetItem.id);
      if (exists) return prev.map(i => i.id === targetItem.id ? { ...i, isWatchlist: !i.isWatchlist } : i);
      return [{ ...targetItem, isWatchlist: true, isFavourite: false }, ...prev];
    });

    if (profile && !profile.isGuest) {
      await safeFetch(`${BACKEND_URL}/api/media/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.id, item: targetItem, field: "is_watchlist" })
      }).catch(err => console.error(err));
    }
  }

  async function toggleFavourite(targetItem) {
    setSavedMedia((prev) => {
      const exists = prev.find(i => i.id === targetItem.id);
      if (exists) return prev.map(i => i.id === targetItem.id ? { ...i, isFavourite: !i.isFavourite } : i);
      return [{ ...targetItem, isWatchlist: false, isFavourite: true }, ...prev];
    });

    if (profile && !profile.isGuest) {
      await safeFetch(`${BACKEND_URL}/api/media/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.id, item: targetItem, field: "is_favourite" })
      }).catch(err => console.error(err));
    }
  }

  const watchlist = savedMedia.filter((item) => item.isWatchlist);
  const favourites = savedMedia.filter((item) => item.isFavourite);

  // Global Audio Preview Player State for 30s playback
  const [playingSongId, setPlayingSongId] = useState(null);
  const audioRef = useRef(null);

  const handleTogglePlaySong = (item, e) => {
    if (e) e.stopPropagation();
    if (!item) return;

    const previewUrl = item.audioPreviewUrl || item.previewUrl;
    if (!previewUrl) {
      const spotUrl = item.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(item.title + " " + (item.creator || ""))}`;
      window.open(spotUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (playingSongId === item.id) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
          setPlayingSongId(null);
        }
      }
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.pause();
    audioRef.current.src = previewUrl;
    audioRef.current.currentTime = 0;
    setPlayingSongId(item.id);

    audioRef.current.play().catch((err) => {
      console.warn("Audio playback issue:", err);
      setPlayingSongId(null);
    });

    audioRef.current.onended = () => setPlayingSongId(null);
    audioRef.current.onerror = () => setPlayingSongId(null);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("echo_abyss_theme") || "dark";
    } catch (e) {
      return "dark";
    }
  });

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("echo_abyss_theme", next);
    } catch (e) {}
  };

  return (
    <div className={`rr-app ${theme === "light" ? "rr-app--light" : "rr-app--dark"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        .rr-app {
          --ink: #07090e;
          --ink-subtle: #0d121d;
          --surface: rgba(15, 23, 42, 0.72);
          --surface-hover: rgba(26, 37, 64, 0.85);
          --surface-raised: rgba(22, 33, 56, 0.85);
          --line: rgba(255, 255, 255, 0.08);
          --line-hover: rgba(0, 229, 255, 0.35);
          --cream: #f8fafc;
          --cream-dim: #cbd5e1;
          --muted: #94a3b8;
          --muted-dark: #64748b;
          --accent: #00e5ff;
          --accent-glow: rgba(0, 229, 255, 0.35);
          --accent-dim: rgba(0, 229, 255, 0.12);
          --accent-grad: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
          --indigo: #6366f1;
          --indigo-glow: rgba(99, 102, 241, 0.35);
          --heart: #ff4d6d;
          --heart-dim: rgba(255, 77, 109, 0.15);
          --gold: #f59e0b;
          --gold-dim: rgba(245, 158, 11, 0.15);
          --card-bg: rgba(13, 20, 36, 0.68);
          --card-border: rgba(255, 255, 255, 0.08);
          --card-hover: rgba(18, 28, 50, 0.88);
          --card-hover-border: rgba(0, 229, 255, 0.35);
          --radius-sm: 8px;
          --radius-md: 12px;
          --radius-lg: 18px;
          --radius-full: 999px;
          --font-heading: 'Outfit', -apple-system, sans-serif;
          --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;

          font-family: var(--font-body);
          background: var(--ink);
          background-image: 
            radial-gradient(circle at 14% 12%, rgba(0, 229, 255, 0.07) 0%, transparent 40%),
            radial-gradient(circle at 86% 22%, rgba(99, 102, 241, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 50% 88%, rgba(255, 77, 109, 0.04) 0%, transparent 50%);
          color: var(--cream);
          min-height: 100vh;
          position: relative;
        }

        .rr-app * { box-sizing: border-box; }

        @keyframes rr-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .rr-skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: rr-shimmer 1.8s infinite linear;
        }

        /* ------------------------------------------------------------- */
        /* AUTH SCREEN                                                  */
        /* ------------------------------------------------------------- */
        .rr-auth-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          position: relative;
          overflow: hidden;
          background: radial-gradient(circle at 50% 15%, #0f1c3f 0%, #07090e 75%);
        }

        .rr-auth-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          opacity: 0.3;
        }
        .orb-1 { width: 500px; height: 500px; background: #00e5ff; top: -120px; left: -120px; }
        .orb-2 { width: 520px; height: 520px; background: #6366f1; bottom: -160px; right: -160px; }

        .rr-auth-card {
          position: relative;
          z-index: 10;
          background: rgba(13, 20, 36, 0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7), 0 0 50px rgba(0, 229, 255, 0.1);
          border-radius: 24px;
          padding: 42px 38px;
          width: 100%;
          max-width: 460px;
          text-align: center;
        }

        .rr-auth-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          background: var(--accent-dim);
          border: 1px solid rgba(0, 229, 255, 0.3);
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--accent);
          margin-bottom: 16px;
        }

        .rr-auth-title {
          font-family: var(--font-heading);
          font-size: 34px;
          font-weight: 800;
          margin: 0 0 8px;
          color: #ffffff;
          letter-spacing: -0.02em;
          background: linear-gradient(180deg, #ffffff 40%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .rr-auth-subtitle {
          color: var(--muted);
          font-size: 13.5px;
          line-height: 1.55;
          margin: 0 0 24px;
        }

        .rr-auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: rgba(7, 11, 20, 0.8);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          padding: 4px;
          margin-bottom: 22px;
          gap: 4px;
        }

        .rr-auth-tab {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: none;
          background: transparent;
          color: var(--muted);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rr-auth-tab--active {
          background: var(--surface-raised);
          color: var(--accent);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        }

        .rr-auth-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 229, 255, 0.07);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          font-size: 12.5px;
          color: var(--cream);
          margin-bottom: 18px;
          text-align: left;
        }

        .rr-auth-prompt-banner {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          border-radius: var(--radius-md);
          padding: 14px;
          margin-bottom: 18px;
          color: #fbbf24;
          font-size: 13px;
          text-align: left;
        }

        .rr-auth-switch-btn {
          margin-top: 10px;
          width: 100%;
          background: #f59e0b;
          color: #07090e;
          font-weight: 700;
          border: none;
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 13px;
          transition: filter 0.2s;
        }
        .rr-auth-switch-btn:hover { filter: brightness(1.1); }

        .rr-auth-error {
          background: rgba(255, 77, 109, 0.12);
          border: 1px solid rgba(255, 77, 109, 0.35);
          color: #ff6b85;
          padding: 11px 14px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          margin-bottom: 18px;
          text-align: left;
          line-height: 1.45;
        }

        .rr-auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: left;
        }

        .rr-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .rr-field-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .rr-field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .rr-field-icon {
          position: absolute;
          left: 14px;
          color: var(--muted);
          pointer-events: none;
        }

        .rr-auth-input {
          width: 100%;
          background: rgba(7, 11, 20, 0.7);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          padding: 12px 42px 12px 42px;
          color: var(--cream);
          font-family: var(--font-body);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .rr-auth-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 16px var(--accent-dim);
        }

        .rr-eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 4px;
        }
        .rr-eye-btn:hover { color: var(--cream); }

        .rr-auth-submit {
          background: var(--accent-grad);
          color: #07090e;
          border: none;
          border-radius: var(--radius-md);
          padding: 14px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-body);
          margin-top: 6px;
          box-shadow: 0 4px 18px var(--accent-glow);
        }

        .rr-auth-submit:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(0, 229, 255, 0.45);
        }

        .rr-auth-footer {
          margin-top: 22px;
          font-size: 13px;
          color: var(--muted);
        }

        .rr-link-btn {
          background: none;
          border: none;
          color: var(--accent);
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
          font-size: inherit;
        }
        .rr-link-btn:hover { color: #ffffff; }

        .rr-guest-divider {
          display: flex;
          align-items: center;
          margin: 18px 0;
          color: var(--muted-dark);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .rr-guest-divider::before, .rr-guest-divider::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid var(--line);
        }
        .rr-guest-divider span { padding: 0 10px; }

        .rr-guest-btn {
          width: 100%;
          background: rgba(15, 23, 42, 0.5);
          border: 1px dashed rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-md);
          padding: 11px;
          color: var(--muted);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rr-guest-btn:hover {
          border-color: var(--accent);
          color: var(--cream);
          background: var(--surface);
        }

        /* ------------------------------------------------------------- */
        /* HEADER & NAVIGATION                                           */
        /* ------------------------------------------------------------- */
        .rr-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 16px 36px;
          background: rgba(7, 9, 14, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--line);
          position: sticky;
          top: 0;
          z-index: 50;
          flex-wrap: wrap;
        }

        .rr-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
        }
        .rr-brand:hover {
          transform: translateY(-1px) scale(1.02);
          opacity: 0.95;
        }
        .rr-brand:active {
          transform: scale(0.98);
        }

        .rr-brand-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(99, 102, 241, 0.2));
          border: 1px solid rgba(0, 229, 255, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          box-shadow: 0 0 16px var(--accent-dim);
        }

        .rr-logo {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 21px;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffffff 30%, #00e5ff 85%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .rr-nav {
          display: flex;
          gap: 4px;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid var(--line);
          border-radius: var(--radius-full);
          padding: 4px;
          backdrop-filter: blur(12px);
        }

        .rr-nav__btn {
          display: flex;
          align-items: center;
          gap: 7px;
          border: none;
          background: transparent;
          color: var(--muted);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          padding: 7px 16px;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rr-nav__btn:hover { color: #ffffff; }
        .rr-nav__btn--active {
          background: var(--surface-raised);
          color: var(--accent);
          font-weight: 600;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4), 0 0 12px var(--accent-dim);
        }

        .rr-user-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rr-user-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--cream);
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid var(--line);
          padding: 6px 14px;
          border-radius: var(--radius-full);
        }

        .rr-user-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--accent-grad);
          color: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10.5px;
          font-weight: 800;
        }

        .rr-logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid var(--line);
          color: var(--muted);
          padding: 7px 13px;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 12.5px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .rr-logout-btn:hover {
          border-color: #ff4d6d;
          color: #ff4d6d;
          background: rgba(255, 77, 109, 0.1);
        }

        /* ------------------------------------------------------------- */
        /* HERO & SEARCH SECTION                                         */
        /* ------------------------------------------------------------- */
        .rr-shell {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 28px 80px;
        }

        .rr-hero {
          position: relative;
          padding: 50px 8px 32px;
          text-align: center;
        }
        .rr-hero--compact { padding: 22px 8px 20px; }

        .rr-hero-ambient {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 650px;
          height: 360px;
          background: radial-gradient(ellipse at center, rgba(0, 229, 255, 0.14) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 75%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .rr-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 16px;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(0, 229, 255, 0.25);
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 16px;
          letter-spacing: 0.06em;
          position: relative;
          z-index: 1;
        }

        .rr-hero__title {
          font-family: var(--font-heading);
          font-style: normal;
          font-weight: 800;
          font-size: 44px;
          line-height: 1.2;
          margin: 0 0 14px;
          letter-spacing: -0.03em;
          background: linear-gradient(180deg, #ffffff 45%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
          z-index: 1;
        }

        .rr-hero__desc {
          color: var(--muted);
          font-size: 15.5px;
          max-width: 640px;
          margin: 0 auto 30px;
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }

        /* Search Capsule */
        .rr-search {
          position: relative;
          max-width: 660px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
          padding: 6px 6px 6px 46px;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
          z-index: 2;
        }
        .rr-search:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 25px var(--accent-dim), 0 16px 40px rgba(0, 0, 0, 0.6);
          transform: translateY(-1px);
        }
        .rr-search__icon {
          position: absolute;
          left: 17px;
          color: var(--muted);
        }
        .rr-search__input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: var(--cream);
          font-family: var(--font-body);
          font-size: 14.5px;
          padding: 8px 4px;
        }
        .rr-search__input::placeholder { color: #5a6e8e; }
        
        .rr-search__clear {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          display: flex;
          padding: 6px;
          margin-right: 4px;
        }
        .rr-search__clear:hover { color: #ffffff; }

        .rr-search-submit {
          background: var(--accent-grad);
          color: #07090e;
          border: none;
          padding: 10px 22px;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          transition: filter 0.2s, transform 0.2s;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 14px var(--accent-glow);
        }
        .rr-search-submit:hover:not(:disabled) {
          filter: brightness(1.12);
          transform: scale(1.02);
        }
        .rr-search-submit:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Cinema / Language selector */
        .rr-cinema-section {
          margin-top: 26px;
          position: relative;
          z-index: 1;
        }

        .rr-cinema-bar {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          max-width: 900px;
          margin: 0 auto;
        }

        .rr-cinema-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(10px);
          border: 1px solid var(--line);
          color: var(--cream);
          padding: 8px 18px;
          border-radius: var(--radius-full);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-body);
        }

        .rr-cinema-pill:hover {
          border-color: var(--accent);
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px var(--accent-dim);
        }

        .rr-cinema-pill--active {
          background: var(--accent-dim);
          border-color: var(--accent);
          color: var(--accent);
          font-weight: 700;
          box-shadow: 0 0 16px var(--accent-dim);
        }

        .rr-pill-flag {
          font-size: 15px;
        }

        /* 10 Visual Mood Chips */
        .rr-chips-section {
          margin-top: 26px;
          position: relative;
          z-index: 1;
        }

        .rr-chips-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--muted-dark);
          letter-spacing: 0.08em;
          margin-bottom: 12px;
        }

        .rr-chips {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          max-width: 900px;
          margin: 0 auto;
        }

        .rr-chip {
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 500;
          color: var(--cream);
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(8px);
          border: 1px solid var(--line);
          padding: 7px 15px;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .rr-chip:hover {
          color: #ffffff;
          border-color: var(--accent);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--accent-dim);
        }
        .rr-chip--active {
          background: var(--accent-dim);
          border-color: var(--accent);
          color: var(--accent);
          font-weight: 600;
          box-shadow: 0 0 14px var(--accent-dim);
        }

        /* DYNAMIC MOOD SUB-SUGGESTIONS & THEMES */
        .rr-subsuggestions-section {
          margin-top: 18px;
          padding: 14px 18px;
          background: rgba(10, 16, 28, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: var(--radius-lg);
          max-width: 920px;
          margin-left: auto;
          margin-right: auto;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
          animation: rr-fade-in 0.3s ease-out;
        }

        @keyframes rr-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .rr-subsuggestions-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .rr-subsuggestions-title {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          color: var(--accent);
          letter-spacing: 0.05em;
        }

        .rr-refresh-ai-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 229, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.3);
          border-radius: var(--radius-full);
          padding: 4px 12px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--cream);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-body);
        }

        .rr-refresh-ai-btn:hover {
          background: var(--accent);
          color: #030712;
          box-shadow: 0 0 14px rgba(0, 229, 255, 0.4);
          transform: translateY(-1px);
        }

        .rr-subchips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }

        .rr-subchip {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 500;
          color: var(--cream-dim);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-body);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .rr-subchip:hover {
          background: rgba(0, 229, 255, 0.12);
          border-color: var(--accent);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .rr-subchip--active {
          background: var(--accent) !important;
          border-color: var(--accent) !important;
          color: #030712 !important;
          font-weight: 700 !important;
          box-shadow: 0 2px 14px rgba(0, 229, 255, 0.45);
        }

        /* Song Audio & Spotify Action Buttons */
        .rr-card__song-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
        }

        .rr-song-preview-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 600;
          background: rgba(0, 229, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.3);
          color: var(--accent);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-body);
        }

        .rr-song-preview-btn:hover {
          background: rgba(0, 229, 255, 0.2);
          border-color: var(--accent);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .rr-song-preview-btn--playing {
          background: var(--accent) !important;
          color: #030712 !important;
          border-color: var(--accent) !important;
          font-weight: 700;
          box-shadow: 0 0 16px rgba(0, 229, 255, 0.4);
        }

        .rr-spotify-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 7px 14px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 700;
          background: #1DB954;
          color: #000000;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-body);
        }

        .rr-spotify-cta-btn:hover {
          background: #1ed760;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(29, 185, 84, 0.4);
          color: #000000;
        }

        .rr-card__playing-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(0, 229, 255, 0.95);
          color: #030712;
          font-size: 10.5px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 5;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 10px rgba(0, 229, 255, 0.5);
        }

        .rr-volume-pulse {
          animation: rr-pulse-icon 1s infinite alternate;
        }

        @keyframes rr-pulse-icon {
          from { transform: scale(0.9); }
          to { transform: scale(1.2); }
        }

        /* Equalizer Sound Waves Animation */
        .rr-audio-waves {
          display: inline-flex;
          align-items: flex-end;
          gap: 2px;
          height: 12px;
        }

        .rr-audio-waves--tiny {
          height: 10px;
        }

        .rr-audio-bar {
          width: 2.5px;
          height: 100%;
          background: currentColor;
          border-radius: 1px;
          animation: rr-bar-bounce 0.8s infinite ease-in-out alternate;
        }

        .rr-audio-bar:nth-child(2) {
          animation-delay: 0.25s;
        }

        .rr-audio-bar:nth-child(3) {
          animation-delay: 0.5s;
        }

        @keyframes rr-bar-bounce {
          0% { height: 25%; }
          100% { height: 100%; }
        }

        .rr-card__action-btn--play:hover {
          background: rgba(0, 229, 255, 0.25);
          color: var(--accent);
          border-color: var(--accent);
        }

        .rr-card__action-btn--playing {
          background: var(--accent) !important;
          color: #030712 !important;
          border-color: var(--accent) !important;
        }

        .rr-card__action-btn--spotify:hover {
          background: #1DB954;
          color: #000000;
          border-color: #1DB954;
        }

        .rr-spotify-play-btn {
          color: var(--accent);
          border-color: rgba(0, 229, 255, 0.3);
        }

        .rr-spotify-play-btn:hover {
          border-color: var(--accent);
          background: rgba(0, 229, 255, 0.15);
        }

        .rr-spotify-btn {
          color: #1DB954;
          border-color: rgba(29, 185, 84, 0.3);
        }

        .rr-spotify-btn:hover {
          border-color: #1DB954;
          background: rgba(29, 185, 84, 0.15);
        }

        .rr-card--playing {
          border-color: var(--accent) !important;
          box-shadow: 0 0 25px rgba(0, 229, 255, 0.25) !important;
        }

        /* Lyrics Redirect Buttons & Cards */
        .rr-lyrics-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 7px 12px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 700;
          background: rgba(254, 240, 138, 0.12);
          border: 1px solid rgba(254, 240, 138, 0.35);
          color: #fef08a;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-body);
        }
        .rr-lyrics-cta-btn:hover {
          background: #fef08a;
          color: #030712;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(254, 240, 138, 0.35);
        }

        .rr-lyrics-btn {
          color: #fef08a;
          border-color: rgba(254, 240, 138, 0.3);
        }
        .rr-lyrics-btn:hover {
          border-color: #fef08a;
          background: rgba(254, 240, 138, 0.15);
          color: #ffffff;
        }

        .rr-card__action-btn--lyrics:hover {
          background: #fef08a;
          color: #030712;
          border-color: #fef08a;
        }

        .rr-lyrics-redirect-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: rgba(254, 240, 138, 0.1);
          border: 1px solid rgba(254, 240, 138, 0.3);
          border-radius: var(--radius-full);
          color: #fef08a;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .rr-lyrics-redirect-badge:hover {
          background: #fef08a;
          color: #030712;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(254, 240, 138, 0.3);
        }

        .rr-card__lyrics-block {
          background: rgba(254, 240, 138, 0.04);
          border: 1px solid rgba(254, 240, 138, 0.15);
          border-radius: var(--radius-sm);
          padding: 10px 12px;
        }
        .rr-lyrics-redirect-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rr-lyrics-card-info {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .rr-lyrics-icon {
          color: #fde047;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .rr-lyrics-prompt {
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 2px;
        }
        .rr-lyrics-sub {
          font-size: 11px;
          color: var(--muted);
          margin: 0;
          line-height: 1.4;
        }
        .rr-lyrics-open-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(254, 240, 138, 0.12);
          border: 1px solid rgba(254, 240, 138, 0.35);
          border-radius: var(--radius-sm);
          color: #fef08a;
          font-size: 11.5px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .rr-lyrics-open-link:hover {
          background: #fef08a;
          color: #030712;
          transform: translateY(-1px);
        }

        /* Mode & Source Banner */
        .rr-mode-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          padding: 11px 18px;
          margin: 20px 0 8px;
          font-size: 13px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .rr-mode-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--cream);
          font-weight: 500;
        }

        .rr-api-key-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(7, 11, 20, 0.6);
          border: 1px solid var(--line);
          color: var(--muted);
          font-size: 12px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: 0.2s;
        }
        .rr-api-key-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        /* ------------------------------------------------------------- */
        /* LIST HEAD & CONTROLS                                          */
        /* ------------------------------------------------------------- */
        .rr-listhead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          padding: 28px 2px 16px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 12px;
        }

        .rr-listhead__left {
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rr-listhead__title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 21px;
          letter-spacing: -0.01em;
          color: #ffffff;
        }

        .rr-listhead__count {
          color: var(--accent);
          font-size: 13px;
          font-weight: 600;
        }

        .rr-listhead__loading {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--accent);
          font-size: 13px;
          font-weight: 500;
        }

        .rr-listhead__controls {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rr-pillgroup { display: flex; gap: 6px; }
        .rr-pill {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--muted);
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--line);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all 0.15s;
        }
        .rr-pill:hover { color: var(--cream); border-color: var(--muted); }
        .rr-pill--active {
          color: #07090e;
          background: var(--accent);
          border-color: var(--accent);
          font-weight: 700;
          box-shadow: 0 2px 10px var(--accent-glow);
        }

        /* View Mode Switcher Toggle */
        .rr-view-toggle {
          display: inline-flex;
          align-items: center;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          padding: 3px;
          gap: 2px;
        }

        .rr-view-btn {
          background: transparent;
          border: none;
          color: var(--muted);
          padding: 6px 9px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.18s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rr-view-btn:hover { color: #ffffff; }
        .rr-view-btn--active {
          background: var(--surface-raised);
          color: var(--accent);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        }

        /* Dropdowns */
        .rr-dropdown { position: relative; }
        .rr-dropdown__trigger {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          padding: 7px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--line);
          background: rgba(15, 23, 42, 0.8);
          color: var(--cream);
          cursor: pointer;
        }
        .rr-dropdown__trigger--select { appearance: none; -webkit-appearance: none; padding-right: 32px; }
        .rr-dropdown__select-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--muted); }

        /* OTT Filter Dropdown */
        .rr-ott-filter-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .rr-ott-filter-icon {
          position: absolute;
          left: 10px;
          color: var(--accent);
          pointer-events: none;
        }
        .rr-ott-select {
          appearance: none;
          -webkit-appearance: none;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid var(--line);
          border-radius: var(--radius-full);
          color: var(--cream);
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 600;
          padding: 6px 28px 6px 30px;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
        }
        .rr-ott-select:hover {
          border-color: var(--accent);
          color: #ffffff;
        }
        .rr-ott-select:focus {
          border-color: var(--accent);
          box-shadow: 0 0 12px var(--accent-dim);
        }
        .rr-ott-select option, .rr-ott-select optgroup {
          background: #0f172a;
          color: #f8fafc;
        }

        /* ------------------------------------------------------------- */
        /* OTT STREAMING CHIPS & DETAILED BREAKDOWN                      */
        /* ------------------------------------------------------------- */
        .rr-card__ott-strip {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 8px;
          padding: 5px 8px;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: var(--radius-sm);
          flex-wrap: wrap;
        }
        .rr-ott-strip__label {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .rr-ott-chip-row {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }
        .rr-ott-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--line);
          color: var(--cream);
          transition: all 0.2s ease;
          user-select: none;
        }
        .rr-ott-chip:hover {
          transform: translateY(-1px);
          filter: brightness(1.15);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.35);
        }
        .rr-ott-chip--compact {
          padding: 2px 7px;
          font-size: 10.5px;
        }
        .rr-ott-chip--free {
          background: rgba(16, 185, 129, 0.14);
          border-color: rgba(16, 185, 129, 0.38);
          color: #6ee7b7;
        }
        .rr-ott-chip--subscription {
          background: rgba(59, 130, 246, 0.14);
          border-color: rgba(59, 130, 246, 0.38);
          color: #93c5fd;
        }
        .rr-ott-chip--rent {
          background: rgba(245, 158, 11, 0.14);
          border-color: rgba(245, 158, 11, 0.38);
          color: #fde68a;
        }
        .rr-ott-chip__platform {
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .rr-ott-badge-tag {
          font-size: 9px;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .rr-ott-badge-tag--free {
          background: #10b981;
          color: #022c22;
        }
        .rr-ott-badge-tag--subscription {
          background: #3b82f6;
          color: #030712;
        }
        .rr-ott-badge-tag--rent {
          background: #f59e0b;
          color: #451a03;
        }
        .rr-ott-chip-more {
          font-size: 10px;
          font-weight: 700;
          color: var(--muted);
          background: rgba(255, 255, 255, 0.07);
          padding: 2px 6px;
          border-radius: var(--radius-full);
        }

        .rr-row__ott-chips {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }

        /* Detailed OTT Cards Grid in Expanded View */
        .rr-ott-detailed-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          margin-top: 8px;
        }
        .rr-ott-detailed-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 11px 13px;
          border-radius: var(--radius-md);
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid var(--line);
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rr-ott-detailed-card:hover {
          border-color: var(--accent);
          background: rgba(30, 41, 59, 0.9);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
        }
        .rr-ott-detailed-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        .rr-ott-detailed-name {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 13.5px;
        }
        .rr-ott-detailed-price {
          font-size: 12px;
          color: var(--cream);
          opacity: 0.92;
          line-height: 1.4;
        }
        .rr-ott-detailed-cta {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          color: var(--accent);
          margin-top: 2px;
        }

        /* ------------------------------------------------------------- */
        /* CINEMATIC CARD GRID (MODERN VIEW)                            */
        /* ------------------------------------------------------------- */
        .rr-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 22px;
          margin-top: 14px;
        }

        .rr-grid-empty-span {
          grid-column: 1 / -1;
        }

        .rr-card {
          background: var(--card-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease;
          position: relative;
        }
        .rr-card:hover {
          transform: translateY(-5px);
          border-color: var(--card-hover-border);
          background: var(--card-hover);
          box-shadow: 0 20px 45px -15px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 229, 255, 0.12);
        }

        .rr-card__poster {
          position: relative;
          height: 220px;
          overflow: hidden;
          background: #090f1d;
        }

        .rr-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .rr-card:hover .rr-card__img {
          transform: scale(1.05);
        }

        .rr-card__poster-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.2);
          position: relative;
        }
        .rr-card__poster-initial {
          position: absolute;
          font-family: var(--font-heading);
          font-size: 80px;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.05);
          pointer-events: none;
        }

        .rr-card__poster-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, transparent 45%, rgba(13, 20, 36, 0.95) 100%);
          pointer-events: none;
        }

        .rr-card__top-badges {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 2;
          pointer-events: none;
        }
        .rr-card__badges-left {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }

        .rr-card__rating-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #f59e0b;
          font-size: 11.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: var(--radius-full);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }

        .rr-card__poster-actions {
          position: absolute;
          bottom: 10px;
          right: 10px;
          display: flex;
          gap: 6px;
          z-index: 2;
        }

        .rr-card__action-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(10, 16, 28, 0.8);
          backdrop-filter: blur(8px);
          color: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .rr-card__action-btn:hover {
          color: #ffffff;
          border-color: var(--accent);
          background: rgba(15, 23, 42, 0.95);
          transform: scale(1.08);
        }
        .rr-card__action-btn--active {
          color: var(--accent);
          border-color: var(--accent);
          background: var(--accent-dim);
        }
        .rr-card__action-btn--heart {
          color: var(--heart);
          border-color: var(--heart);
          background: var(--heart-dim);
        }
        .rr-card__action-btn--yt:hover {
          color: #ff4d6d;
          border-color: #ff4d6d;
          background: rgba(255, 77, 109, 0.15);
        }

        .rr-card__body {
          padding: 16px 16px 18px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 10px;
        }

        .rr-card__title {
          font-family: var(--font-heading);
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.3;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .rr-card__meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--muted);
          font-size: 12px;
          flex-wrap: wrap;
        }
        .rr-card__meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rr-card__creator {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--cream-dim);
          font-size: 12.5px;
          font-weight: 500;
        }

        .rr-card__reason {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 12px;
          color: #67e8f9;
          background: rgba(0, 229, 255, 0.07);
          border: 1px solid rgba(0, 229, 255, 0.18);
          padding: 7px 10px;
          border-radius: var(--radius-sm);
          line-height: 1.4;
          margin-top: 2px;
        }
        .rr-card__sparkle {
          flex-shrink: 0;
          margin-top: 2px;
          color: var(--accent);
        }

        .rr-card__expand-sec {
          margin-top: auto;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .rr-card__expand-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: none;
          border: none;
          color: var(--muted);
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 0;
          transition: color 0.18s;
        }
        .rr-card__expand-btn:hover {
          color: var(--accent);
        }
        .rr-card__details {
          padding-top: 6px;
        }
        .rr-card__detail-block {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }
        .rr-card__detail-block:first-child {
          margin-top: 4px;
          padding-top: 0;
          border-top: none;
        }
        .rr-detail-heading {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(0, 229, 255, 0.95);
          margin-bottom: 6px;
        }
        .rr-detail-icon {
          color: var(--accent);
        }
        .rr-card__blurb {
          font-size: 12.5px;
          color: rgba(226, 232, 240, 0.85);
          line-height: 1.55;
          margin: 0;
        }
        .rr-cast-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .rr-cast-pill {
          font-size: 11px;
          font-weight: 500;
          background: rgba(168, 85, 247, 0.12);
          color: #d8b4fe;
          border: 1px solid rgba(168, 85, 247, 0.3);
          padding: 3px 9px;
          border-radius: var(--radius-full);
          transition: all 0.2s ease;
        }
        .rr-cast-pill:hover {
          background: rgba(168, 85, 247, 0.25);
          border-color: rgba(168, 85, 247, 0.5);
          transform: translateY(-1px);
        }

        /* ------------------------------------------------------------- */
        /* COMPACT LIST VIEW (MEDIA ROW)                                */
        /* ------------------------------------------------------------- */
        .rr-list { display: flex; flex-direction: column; gap: 8px; }

        .rr-row {
          border: 1px solid var(--line);
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(12px);
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease;
          border-radius: var(--radius-md);
        }
        .rr-row:hover {
          background: rgba(26, 37, 64, 0.65);
          border-color: rgba(0, 229, 255, 0.3);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
        }

        .rr-row__main {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          background: none;
          border: none;
          text-align: left;
          padding: 0;
          cursor: pointer;
          color: inherit;
          font: inherit;
        }

        .rr-thumb {
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 16px rgba(0,0,0,0.5);
          overflow: hidden;
        }

        .rr-row__body { flex: 1; min-width: 0; }

        .rr-row__title-line {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }

        .rr-row__title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 16.5px;
          color: #ffffff;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Language Badges on Cards */
        .rr-lang-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          flex-shrink: 0;
          letter-spacing: 0.02em;
        }
        .rr-lang-badge--hindi {
          background: rgba(255, 153, 51, 0.16);
          color: #ff9933;
          border: 1px solid rgba(255, 153, 51, 0.35);
        }
        .rr-lang-badge--english {
          background: rgba(59, 130, 246, 0.16);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.35);
        }
        .rr-lang-badge--south {
          background: rgba(234, 88, 12, 0.16);
          color: #fb923c;
          border: 1px solid rgba(234, 88, 12, 0.35);
        }
        .rr-lang-badge--world {
          background: rgba(168, 85, 247, 0.16);
          color: #c084fc;
          border: 1px solid rgba(168, 85, 247, 0.35);
        }
        .rr-lang-badge--other {
          background: rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .rr-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          flex-shrink: 0;
          letter-spacing: 0.02em;
        }
        .rr-badge--movie { background: rgba(0, 229, 255, 0.14); color: #00e5ff; border: 1px solid rgba(0, 229, 255, 0.3); }
        .rr-badge--song { background: rgba(99, 102, 241, 0.16); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.3); }

        .rr-row__reason {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          color: #67e8f9;
          margin-bottom: 6px;
        }

        .rr-row__meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px;
          color: var(--muted);
          font-size: 12.5px;
        }

        .rr-row__meta-item { display: flex; align-items: center; gap: 5px; }
        .rr-row__rating { color: #f59e0b; font-weight: 700; }
        .rr-genre-tag {
          font-size: 11px;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.06);
          padding: 2px 8px;
          border-radius: 4px;
          color: #cbd5e1;
        }

        .rr-row__chevron {
          color: var(--muted);
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .rr-row__actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          margin-left: 74px;
          flex-wrap: wrap;
        }

        .rr-icon-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--line);
          background: rgba(15, 23, 42, 0.6);
          color: var(--muted);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rr-icon-btn:hover {
          border-color: var(--accent);
          color: var(--cream);
          background: var(--surface-raised);
        }
        .rr-icon-btn--active {
          color: var(--accent);
          border-color: var(--accent);
          background: var(--accent-dim);
          font-weight: 600;
        }
        .rr-icon-btn--active-heart {
          color: var(--heart);
          border-color: var(--heart);
          background: var(--heart-dim);
          font-weight: 600;
        }
        .rr-youtube-btn:hover {
          border-color: #ff4d6d;
          color: #ff4d6d;
        }

        .rr-row__expansion {
          margin-left: 74px;
          margin-top: 12px;
          padding: 14px 18px;
          background: rgba(7, 11, 20, 0.85);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
        }

        .rr-row__blurb {
          margin: 0 0 10px;
          color: var(--cream);
          font-size: 13.5px;
          line-height: 1.6;
        }

        .rr-vibe-chips {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .rr-vibe-label {
          font-size: 11.5px;
          color: var(--muted);
          font-weight: 600;
        }
        .rr-vibe-pill {
          font-size: 11px;
          font-weight: 500;
          background: rgba(0, 229, 255, 0.08);
          color: var(--accent);
          border: 1px solid rgba(0, 229, 255, 0.2);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        /* ------------------------------------------------------------- */
        /* LOAD MORE & EMPTY STATE                                       */
        /* ------------------------------------------------------------- */
        .rr-loadmore-wrap {
          text-align: center;
          padding: 36px 0 20px;
        }

        .rr-loadmore-btn {
          padding: 12px 30px;
          font-size: 14px;
          font-weight: 700;
          border-radius: var(--radius-md);
        }

        .rr-empty { padding: 60px 16px; text-align: center; }
        .rr-empty__mark {
          width: 52px;
          height: 52px;
          margin: 0 auto 16px;
          border-radius: 16px;
          border: 1px dashed var(--line);
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rr-empty__title { font-family: var(--font-heading); font-size: 19px; font-weight: 700; margin: 0 0 6px; color: #ffffff; }
        .rr-empty__subtitle { color: var(--muted); font-size: 13.5px; margin: 0; }

        .rr-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          padding: 9px 18px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--line);
          background: var(--surface);
          color: var(--cream);
          cursor: pointer;
          transition: all 0.2s;
        }
        .rr-btn:hover { border-color: var(--accent); }
        .rr-btn--primary {
          background: var(--accent-grad);
          color: #07090e;
          border: none;
          font-weight: 700;
          box-shadow: 0 4px 16px var(--accent-glow);
        }
        .rr-btn--primary:hover {
          filter: brightness(1.12);
          box-shadow: 0 0 20px var(--accent-glow);
        }

        /* ------------------------------------------------------------- */
        /* MODAL                                                         */
        /* ------------------------------------------------------------- */
        .rr-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 16px;
        }
        .rr-modal-card {
          background: rgba(13, 20, 36, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          padding: 32px 30px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.7), 0 0 40px rgba(0, 229, 255, 0.1);
        }
        .rr-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .rr-modal-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-heading);
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
        }
        .rr-modal-close {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 4px;
        }
        .rr-modal-close:hover { color: #ffffff; }
        .rr-modal-desc {
          font-size: 13.5px;
          color: var(--muted);
          line-height: 1.55;
          margin: 0 0 20px;
        }

        .rr-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ------------------------------------------------------------- */
        /* PAGINATION STYLING                                            */
        /* ------------------------------------------------------------- */
        .rr-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 44px auto 16px;
          flex-wrap: wrap;
          padding: 10px 0;
        }

        .rr-page-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--surface);
          border: 1px solid var(--line);
          color: var(--cream);
          padding: 9px 18px;
          border-radius: var(--radius-full);
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .rr-page-btn:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
          transform: translateY(-1px);
        }
        .rr-page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          box-shadow: none;
        }

        .rr-page-numbers {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .rr-page-num {
          min-width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid var(--line);
          background: var(--surface);
          color: var(--muted);
          font-family: var(--font-heading);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .rr-page-num:hover:not(.rr-page-num--active) {
          border-color: var(--accent);
          color: var(--cream);
          background: var(--surface-hover);
        }
        .rr-page-num--active {
          background: var(--accent-grad);
          color: #07090e;
          border-color: transparent;
          font-weight: 800;
          box-shadow: 0 4px 16px var(--accent-glow);
          transform: scale(1.08);
        }

        .rr-page-ellipsis {
          padding: 0 4px;
          color: var(--muted);
          font-size: 16px;
        }

        /* ------------------------------------------------------------- */
        /* THEME TOGGLE BUTTON                                           */
        /* ------------------------------------------------------------- */
        .rr-theme-toggle {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--surface);
          border: 1px solid var(--line);
          color: var(--cream);
          padding: 7px 14px;
          border-radius: var(--radius-full);
          font-family: var(--font-body);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .rr-theme-toggle:hover {
          border-color: var(--accent);
          color: var(--accent);
          transform: translateY(-1px);
        }
        .rr-theme-toggle--auth {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 20;
          backdrop-filter: blur(12px);
        }
        .rr-theme-icon--sun {
          color: #f59e0b;
        }
        .rr-theme-icon--moon {
          color: #38bdf8;
        }

        /* ------------------------------------------------------------- */
        /* LIGHT MODE AESTHETICS                                         */
        /* ------------------------------------------------------------- */
        .rr-app--light {
          --ink: #f8fafc;
          --ink-subtle: #ffffff;
          --surface: rgba(255, 255, 255, 0.95);
          --surface-hover: #f1f5f9;
          --surface-raised: #ffffff;
          --line: rgba(0, 0, 0, 0.08);
          --line-hover: rgba(2, 132, 199, 0.5);
          --cream: #0f172a;
          --cream-dim: #334155;
          --muted: #64748b;
          --muted-dark: #94a3b8;
          --accent: #0284c7;
          --accent-glow: rgba(2, 132, 199, 0.25);
          --accent-dim: rgba(2, 132, 199, 0.12);
          --accent-grad: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          --indigo: #4f46e5;
          --indigo-glow: rgba(79, 70, 229, 0.25);
          --card-bg: #ffffff;
          --card-border: rgba(0, 0, 0, 0.08);
          --card-hover: #ffffff;
          --card-hover-border: rgba(2, 132, 199, 0.45);
          background: #f8fafc !important;
          background-image: 
            radial-gradient(circle at 14% 12%, rgba(2, 132, 199, 0.07) 0%, transparent 40%),
            radial-gradient(circle at 86% 22%, rgba(79, 70, 229, 0.07) 0%, transparent 45%),
            radial-gradient(circle at 50% 88%, rgba(255, 77, 109, 0.04) 0%, transparent 50%) !important;
          color: var(--cream) !important;
        }

        .rr-app--light .rr-header {
          background: rgba(255, 255, 255, 0.88);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }

        .rr-app--light .rr-logo {
          background: linear-gradient(135deg, #0f172a 30%, #0284c7 85%, #4f46e5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .rr-app--light .rr-nav {
          background: rgba(241, 245, 249, 0.85);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        .rr-app--light .rr-nav__btn:hover {
          color: #0f172a;
        }
        .rr-app--light .rr-nav__btn--active {
          background: #ffffff;
          color: var(--accent);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .rr-app--light .rr-hero__title {
          background: linear-gradient(180deg, #0f172a 45%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .rr-app--light .rr-search {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.12);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
        }
        .rr-app--light .rr-search__input {
          color: #0f172a;
        }
        .rr-app--light .rr-search__input::placeholder {
          color: #94a3b8;
        }

        .rr-app--light .rr-search-submit {
          color: #ffffff;
        }

        .rr-app--light .rr-cinema-pill {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #334155;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        }
        .rr-app--light .rr-cinema-pill:hover {
          background: #f8fafc;
          border-color: var(--accent);
          color: var(--accent);
        }
        .rr-app--light .rr-cinema-pill--active {
          background: var(--accent);
          color: #ffffff;
          border-color: var(--accent);
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
        }

        .rr-app--light .rr-chip {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #334155;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        }
        .rr-app--light .rr-chip:hover {
          background: #f8fafc;
          border-color: var(--accent);
          color: var(--accent);
        }
        .rr-app--light .rr-chip--active {
          background: var(--accent-grad);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
        }

        .rr-app--light .rr-subsuggestions-section {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
        }
        .rr-app--light .rr-subchip {
          background: #f1f5f9;
          border-color: rgba(0, 0, 0, 0.08);
          color: #334155;
        }
        .rr-app--light .rr-subchip:hover {
          background: #e2e8f0;
          color: #0f172a;
          border-color: var(--accent);
        }
        .rr-app--light .rr-subchip--active {
          background: var(--accent) !important;
          color: #ffffff !important;
          border-color: var(--accent) !important;
        }
        .rr-app--light .rr-refresh-ai-btn {
          background: #f0fdf4;
          border-color: rgba(0, 0, 0, 0.12);
          color: #15803d;
        }

        .rr-app--light .rr-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
        }
        .rr-app--light .rr-card:hover {
          border-color: var(--accent);
          box-shadow: 0 12px 32px rgba(2, 132, 199, 0.12);
        }

        .rr-app--light .rr-card__title {
          color: #0f172a;
        }

        .rr-app--light .rr-card__poster-overlay {
          background: linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, transparent 45%, rgba(0, 0, 0, 0.72) 100%);
        }

        .rr-app--light .rr-card__details {
          background: #f8fafc;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .rr-app--light .rr-row {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
        }
        .rr-app--light .rr-row:hover {
          border-color: var(--accent);
          box-shadow: 0 8px 24px rgba(2, 132, 199, 0.08);
        }

        .rr-app--light .rr-pill {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #475569;
        }
        .rr-app--light .rr-pill--active {
          background: var(--accent);
          color: #ffffff;
          border-color: var(--accent);
        }

        .rr-app--light .rr-view-btn {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #64748b;
        }
        .rr-app--light .rr-view-btn--active {
          background: var(--accent);
          color: #ffffff;
          border-color: var(--accent);
        }

        .rr-app--light .rr-user-pill {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #0f172a;
        }

        /* Light Mode OTT Elements */
        .rr-app--light .rr-ott-select {
          background-color: #ffffff;
          border-color: rgba(0, 0, 0, 0.12);
          color: #0f172a;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        }
        .rr-app--light .rr-ott-select option,
        .rr-app--light .rr-ott-select optgroup {
          background: #ffffff;
          color: #0f172a;
        }

        .rr-app--light .rr-card__ott-strip {
          background: #f1f5f9;
          border-color: rgba(0, 0, 0, 0.06);
        }

        .rr-app--light .rr-ott-chip {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.1);
          color: #1e293b;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .rr-app--light .rr-ott-chip--free {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.35);
          color: #047857;
        }
        .rr-app--light .rr-ott-chip--subscription {
          background: rgba(2, 132, 199, 0.1);
          border-color: rgba(2, 132, 199, 0.35);
          color: #0369a1;
        }
        .rr-app--light .rr-ott-chip--rent {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.35);
          color: #b45309;
        }

        .rr-app--light .rr-ott-detailed-card {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        .rr-app--light .rr-ott-detailed-card:hover {
          background: #f8fafc;
          border-color: var(--accent);
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.15);
        }
        .rr-app--light .rr-ott-detailed-price {
          color: #475569;
        }

        .rr-app--light .rr-icon-btn,
        .rr-app--light .rr-logout-btn {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #334155;
        }

        .rr-app--light .rr-modal-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.1);
          color: #0f172a;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }
        .rr-app--light .rr-modal-title {
          color: #0f172a;
        }

        .rr-app--light .rr-auth-wrap {
          background: radial-gradient(circle at 50% 15%, #e0f2fe 0%, #f8fafc 75%);
        }
        .rr-app--light .rr-auth-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #0f172a;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
        }
        .rr-app--light .rr-auth-title {
          background: linear-gradient(180deg, #0f172a 40%, #334155 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .rr-app--light .rr-auth-tabs {
          background: #f1f5f9;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        .rr-app--light .rr-auth-tab {
          color: #64748b;
        }
        .rr-app--light .rr-auth-tab--active {
          background: #ffffff;
          color: var(--accent);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        .rr-app--light .rr-auth-input {
          background: #f8fafc;
          border: 1px solid rgba(0, 0, 0, 0.12);
          color: #0f172a;
        }
        .rr-app--light .rr-guest-btn {
          background: #f8fafc;
          border-color: rgba(0, 0, 0, 0.15);
          color: #475569;
        }

        /* Light Mode Lyrics Elements */
        .rr-app--light .rr-lyrics-cta-btn {
          background: #fef9c3;
          border-color: #eab308;
          color: #854d0e;
        }
        .rr-app--light .rr-lyrics-cta-btn:hover {
          background: #ca8a04;
          color: #ffffff;
        }
        .rr-app--light .rr-lyrics-btn {
          color: #854d0e;
          border-color: rgba(202, 138, 4, 0.4);
        }
        .rr-app--light .rr-lyrics-btn:hover {
          background: #fef08a;
          color: #713f12;
        }
        .rr-app--light .rr-card__action-btn--lyrics:hover {
          background: #fef08a;
          color: #713f12;
        }
        .rr-app--light .rr-card__lyrics-block {
          background: #fefce8;
          border-color: rgba(234, 179, 8, 0.25);
        }
        .rr-app--light .rr-lyrics-prompt {
          color: #0f172a;
        }
        .rr-app--light .rr-lyrics-open-link {
          background: #fef08a;
          border-color: #ca8a04;
          color: #713f12;
        }
        .rr-app--light .rr-lyrics-open-link:hover {
          background: #ca8a04;
          color: #ffffff;
        }
        .rr-app--light .rr-lyrics-redirect-badge {
          background: #fef08a;
          border-color: #ca8a04;
          color: #713f12;
        }
        .rr-brand-icon--logo {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rr-brand-logo-img {
          width: 36px;
          height: 36px;
          object-fit: contain;
          border-radius: 8px;
          filter: drop-shadow(0 0 8px rgba(0, 229, 255, 0.7));
          transition: transform 0.25s ease;
        }
        .rr-brand:hover .rr-brand-logo-img {
          transform: scale(1.08) rotate(-2deg);
        }
        .rr-auth-logo-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 16px;
        }
        .rr-auth-logo-img {
          width: 88px;
          height: 88px;
          object-fit: contain;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(168, 85, 247, 0.45), 0 0 20px rgba(0, 229, 255, 0.35);
          animation: rr-pulse-glow 3s ease-in-out infinite alternate;
        }
        @keyframes rr-pulse-glow {
          0% {
            box-shadow: 0 8px 32px rgba(168, 85, 247, 0.4), 0 0 15px rgba(0, 229, 255, 0.3);
            transform: translateY(0);
          }
          100% {
            box-shadow: 0 12px 40px rgba(168, 85, 247, 0.7), 0 0 28px rgba(0, 229, 255, 0.6);
            transform: translateY(-3px);
          }
        }

        /* ------------------------------------------------------------- */
        /* RESPONSIVE BREAKPOINTS                                        */
        /* ------------------------------------------------------------- */
        @media (max-width: 768px) {
          .rr-header { padding: 14px 18px; }
          .rr-shell { padding: 0 16px 60px; }
          .rr-hero__title { font-size: 30px; }
          .rr-card-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
          .rr-row__actions, .rr-row__expansion { margin-left: 0; }
          .rr-row__main { gap: 12px; }
          .rr-auth-card { padding: 32px 22px; }
          .rr-user-actions { display: none; }
          .rr-cinema-bar { gap: 6px; }
          .rr-cinema-pill { font-size: 12px; padding: 7px 13px; }
        }
      `}</style>

      {!isAuthenticated ? (
        <AuthScreen 
          onLogin={handleLoginSuccess}
          onGuestExplore={handleGuestExplore}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <>
          <header className="rr-header">
            <div 
              className="rr-brand" 
              onClick={handleLogoClick}
              role="button"
              tabIndex={0}
              title="Vibescape — Return to Home & Reset All Filters"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleLogoClick(); }}
            >
              <div className="rr-brand-icon rr-brand-icon--logo">
                <img src="/vibescape-logo.png" alt="Vibescape Logo" className="rr-brand-logo-img" />
              </div>
              <span className="rr-logo">Vibescape</span>
              <span className="rr-brand-tag">AI CINEMA &amp; SONGS</span>
            </div>

            <nav className="rr-nav">
              {NAV_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`rr-nav__btn ${activeTab === tab.id ? "rr-nav__btn--active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="rr-user-actions">
              <button
                type="button"
                className="rr-theme-toggle"
                onClick={toggleTheme}
                title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                aria-label="Toggle Light and Dark Mode"
              >
                {theme === "dark" ? (
                  <>
                    <Sun size={14} className="rr-theme-icon--sun" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} className="rr-theme-icon--moon" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>

              <div className="rr-user-pill">
                <div className="rr-user-avatar">
                  {initials(profile?.name || "U")}
                </div>
                <span>{profile?.name || "Explorer"}</span>
                {profile?.isGuest && <span style={{ fontSize: '11px', color: 'var(--accent)' }}>(Guest)</span>}
              </div>

              <button className="rr-logout-btn" onClick={handleLogout} title="Sign Out">
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </header>

          <div className="rr-shell">
            {activeTab === "discover" && (
              <Discover 
                onToggleFavourite={toggleFavourite} 
                onToggleWatchlist={toggleWatchlist} 
                query={query} 
                savedMedia={savedMedia} 
                setQuery={setQuery} 
                setTypeFilter={setTypeFilter} 
                typeFilter={typeFilter} 
                onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
                resetTrigger={resetTrigger}
                playingAudioId={playingSongId}
                onTogglePlaySong={handleTogglePlaySong}
              />
            )}

            {activeTab === "music" && (
              <MusicPlayerApp 
                savedMedia={savedMedia}
                onToggleWatchlist={toggleWatchlist}
                onToggleFavourite={toggleFavourite}
              />
            )}

            {activeTab === "watchlist" && (
              <SavedList 
                emptySubtitle="Save any Bollywood, Hollywood, or World movie or song and it'll appear in your personal watchlist." 
                emptyTitle="Nothing queued up yet." 
                heading="Your Watchlist" 
                items={watchlist} 
                onToggleFavourite={toggleFavourite} 
                onToggleWatchlist={toggleWatchlist} 
                playingAudioId={playingSongId}
                onTogglePlaySong={handleTogglePlaySong}
              />
            )}

            {activeTab === "favourites" && (
              <SavedList 
                emptySubtitle="Tap the heart on any movie or song you love to add it to your favourites." 
                emptyTitle="No favourites yet." 
                heading="Your Favourites" 
                items={favourites} 
                onToggleFavourite={toggleFavourite} 
                onToggleWatchlist={toggleWatchlist} 
                playingAudioId={playingSongId}
                onTogglePlaySong={handleTogglePlaySong}
              />
            )}

            {activeTab === "profile" && (
              <TasteProfile user={profile} onUserUpdate={setProfile} />
            )}
          </div>

          <ApiKeyModal 
            isOpen={apiKeyModalOpen} 
            onClose={() => setApiKeyModalOpen(false)} 
          />
        </>
      )}
    </div>
  );
}