import { useState, useMemo } from "react";
import {
  Film,
  Music,
  Bookmark,
  Heart,
  Search,
  Sparkles,
  ExternalLink,
  Share2,
  Check,
  X,
  Pencil,
  Play,
  Pause,
  ShieldCheck,
  Tv,
  Youtube,
  Layers,
  Activity,
  Compass,
  ArrowRight,
  Disc3,
  SlidersHorizontal,
} from "lucide-react";

const LINKED_PLATFORMS = [
  { id: "netflix", name: "Netflix", tag: "N", color: "#e50914", bg: "rgba(229,9,20,0.12)", url: "https://netflix.com" },
  { id: "prime", name: "Prime Video", tag: "Prime", color: "#00a8e1", bg: "rgba(0,168,225,0.12)", url: "https://primevideo.com" },
  { id: "hotstar", name: "Disney+ Hotstar", tag: "D+", color: "#0063e5", bg: "rgba(0,99,229,0.12)", url: "https://hotstar.com" },
  { id: "spotify", name: "Spotify", tag: "Spotify", color: "#1db954", bg: "rgba(29,185,84,0.12)", url: "https://open.spotify.com" },
  { id: "youtube", name: "YouTube", tag: "YouTube", color: "#ff0000", bg: "rgba(255,0,0,0.12)", url: "https://youtube.com" },
];

const PALETTE = ["#00f2fe", "#a855f7", "#ec4899", "#f97316", "#22c55e", "#eab308"];

function timeAgo(ts) {
  if (!ts) return "Recently";
  const days = Math.floor((Date.now() - Number(ts)) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function getMovieStreamingLinks(m) {
  const q = encodeURIComponent(m.title || "");
  return [
    { name: "Netflix", color: "#e50914", bg: "rgba(229,9,20,0.12)", url: `https://www.netflix.com/search?q=${q}` },
    { name: "Prime Video", color: "#00a8e1", bg: "rgba(0,168,225,0.12)", url: `https://www.primevideo.com/search/ref=atv_nb_sug?phrase=${q}` },
    { name: "Disney+ Hotstar", color: "#0063e5", bg: "rgba(0,99,229,0.12)", url: `https://www.hotstar.com/in/search?q=${q}` },
    { name: "Trailer", color: "#ff0000", bg: "rgba(255,0,0,0.12)", url: `https://www.youtube.com/results?search_query=${encodeURIComponent((m.title || "") + " official trailer")}` },
  ];
}

function getSongStreamingLinks(s) {
  const q = encodeURIComponent(`${s.title || ""} ${s.artist || s.creator || ""}`.trim());
  return [
    { name: "Spotify", color: "#1db954", bg: "rgba(29,185,84,0.12)", url: s.spotifyUrl || `https://open.spotify.com/search/${q}` },
    { name: "YouTube", color: "#ff0000", bg: "rgba(255,0,0,0.12)", url: s.youtubeUrl || `https://www.youtube.com/results?search_query=${q}+official` },
  ];
}

function RedirectModal({ info, onClose }) {
  if (!info) return null;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalGlow} />
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", background: info.bg || "rgba(168,85,247,0.15)", border: `1px solid ${info.color || "#a855f7"}44`, color: info.color || "#a855f7", margin: "0 auto 16px" }}>
          <ExternalLink size={22} />
        </div>
        <h3 style={S.modalTitle}>Redirecting to {info.platform}</h3>
        <p style={S.modalBody}>
          Opening <strong style={{ color: "#00f2fe" }}>{info.title}</strong> on{" "}
          <strong style={{ color: info.color || "#a855f7" }}>{info.platform}</strong>.<br />
          You are safely being redirected to an official, licensed streaming service.
        </p>
        <div style={S.modalActions}>
          <a
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...S.btnBase, background: info.color || "#a855f7", color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
            onClick={onClose}
          >
            <span>Continue to {info.platform}</span>
            <ExternalLink size={14} />
          </a>
          <button style={S.btnGhost} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ persona, onSave, onClose }) {
  const [name, setName] = useState(persona.name);
  const [handle, setHandle] = useState(persona.handle);
  const [bio, setBio] = useState(persona.bio);
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: 480, textAlign: "left" }} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalGlow} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ ...S.modalTitle, margin: 0, textAlign: "left" }}>Edit Profile</h3>
          <button style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }} onClick={onClose}><X size={18} /></button>
        </div>
        {[
          { label: "Display Name", val: name, set: setName, type: "input", ph: "Your name" },
          { label: "Handle", val: handle, set: setHandle, type: "input", ph: "@username" },
          { label: "Bio / Taste Vision", val: bio, set: setBio, type: "textarea", ph: "Describe your cinema and music vibe..." },
        ].map((f) => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <label style={S.label}>{f.label}</label>
            {f.type === "textarea" ? (
              <textarea
                style={{ ...S.input, height: 76, resize: "vertical" }}
                value={f.val}
                placeholder={f.ph}
                onChange={(e) => f.set(e.target.value)}
              />
            ) : (
              <input
                style={S.input}
                value={f.val}
                placeholder={f.ph}
                onChange={(e) => f.set(e.target.value)}
              />
            )}
          </div>
        ))}
        <div style={{ ...S.modalActions, marginTop: 20 }}>
          <button
            style={{ ...S.btnBase, background: "linear-gradient(135deg,#00f2fe,#a855f7)", color: "#0a0e1a", fontWeight: 700 }}
            onClick={() => {
              onSave({ name, handle, bio });
              onClose();
            }}
          >
            Save Changes
          </button>
          <button style={S.btnGhost} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function MovieCard({ m, onRedirect, onToggleWatchlist, onToggleFavourite }) {
  const posterSrc = m.poster || m.posterUrl || m.artworkUrl || m.artwork || m.image;
  const moodText = m.mood || m.moodTag || (Array.isArray(m.genre) ? m.genre[0] : m.genre) || "Cinematic";
  const genres = Array.isArray(m.genre) ? m.genre : (m.genre ? [m.genre] : []);
  const links = getMovieStreamingLinks(m);

  return (
    <div style={S.card}>
      <div style={S.imgWrap}>
        {posterSrc ? (
          <img src={posterSrc} alt={m.title} style={S.img} loading="lazy" onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <div style={{ ...S.img, background: "linear-gradient(135deg, #0f172a, #1e1b4b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
            <Film size={36} />
          </div>
        )}
        <div style={S.imgGrad} />
        <span style={S.moodBadge}>
          <Sparkles size={11} style={{ marginRight: 4 }} />
          {moodText}
        </span>
        <div style={S.quickActions}>
          {onToggleWatchlist && (
            <button
              style={{ ...S.quickBtn, color: m.isWatchlist ? "#00f2fe" : "#fff", background: m.isWatchlist ? "rgba(0,242,254,0.25)" : "rgba(0,0,0,0.6)" }}
              onClick={() => onToggleWatchlist(m)}
              title={m.isWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              <Bookmark size={13} fill={m.isWatchlist ? "currentColor" : "none"} />
            </button>
          )}
          {onToggleFavourite && (
            <button
              style={{ ...S.quickBtn, color: m.isFavourite ? "#ec4899" : "#fff", background: m.isFavourite ? "rgba(236,72,153,0.25)" : "rgba(0,0,0,0.6)" }}
              onClick={() => onToggleFavourite(m)}
              title={m.isFavourite ? "Remove from Favourites" : "Add to Favourites"}
            >
              <Heart size={13} fill={m.isFavourite ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>
      <div style={S.cardBody}>
        <p style={S.cardTitle} title={m.title}>{m.title}</p>
        <p style={S.cardSub}>
          {m.year ? `${m.year} • ` : ""}{genres.length > 0 ? genres.slice(0, 2).join(" / ") : "Cinema"}
        </p>
        <p style={S.cardMeta}>Added {timeAgo(m.addedAt || m.created_at)}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {links.map((p) => (
            <button
              key={p.name}
              style={{ ...S.platBtn, background: p.bg, border: `1px solid ${p.color}44`, color: p.color }}
              onClick={() => onRedirect({ title: m.title, platform: p.name, url: p.url, color: p.color, bg: p.bg })}
            >
              <span>{p.name}</span>
              <ExternalLink size={10} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SongCard({ s, onRedirect, onToggleWatchlist, onToggleFavourite, isPlaying, onTogglePlay }) {
  const artworkSrc = s.artwork || s.artworkUrl || s.poster || s.image;
  const moodText = s.mood || s.moodTag || "Soundtrack";
  const links = getSongStreamingLinks(s);

  return (
    <div style={{ ...S.card, borderColor: isPlaying ? "rgba(0,242,254,0.4)" : "rgba(255,255,255,0.06)" }}>
      <div style={S.imgWrap}>
        {artworkSrc ? (
          <img src={artworkSrc} alt={s.title} style={S.img} loading="lazy" onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <div style={{ ...S.img, background: "linear-gradient(135deg, #18181b, #27272a)", display: "flex", alignItems: "center", justifyContent: "center", color: "#71717a" }}>
            <Music size={36} />
          </div>
        )}
        <div style={S.imgGrad} />
        <span style={S.moodBadge}>
          <Music size={11} style={{ marginRight: 4 }} />
          {moodText}
        </span>
        {onTogglePlay && (
          <button
            style={S.playOverlayBtn}
            onClick={(e) => onTogglePlay(s, e)}
            title={isPlaying ? "Pause Preview" : "Play 30s Preview"}
          >
            {isPlaying ? <Pause size={18} fill="#fff" /> : <Play size={18} fill="#fff" style={{ marginLeft: 2 }} />}
          </button>
        )}
        <div style={S.quickActions}>
          {onToggleWatchlist && (
            <button
              style={{ ...S.quickBtn, color: s.isWatchlist ? "#00f2fe" : "#fff", background: s.isWatchlist ? "rgba(0,242,254,0.25)" : "rgba(0,0,0,0.6)" }}
              onClick={() => onToggleWatchlist(s)}
              title={s.isWatchlist ? "In Watchlist" : "Add to Watchlist"}
            >
              <Bookmark size={13} fill={s.isWatchlist ? "currentColor" : "none"} />
            </button>
          )}
          {onToggleFavourite && (
            <button
              style={{ ...S.quickBtn, color: s.isFavourite ? "#ec4899" : "#fff", background: s.isFavourite ? "rgba(236,72,153,0.25)" : "rgba(0,0,0,0.6)" }}
              onClick={() => onToggleFavourite(s)}
              title={s.isFavourite ? "In Favourites" : "Add to Favourites"}
            >
              <Heart size={13} fill={s.isFavourite ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>
      <div style={S.cardBody}>
        <p style={S.cardTitle} title={s.title}>{s.title}</p>
        <p style={S.cardSub}>{s.artist || s.creator || "Artist"}</p>
        <p style={S.cardMeta}>Added {timeAgo(s.addedAt || s.created_at)}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {links.map((p) => (
            <button
              key={p.name}
              style={{ ...S.platBtn, background: p.bg, border: `1px solid ${p.color}44`, color: p.color }}
              onClick={() => onRedirect({ title: s.title, platform: p.name, url: p.url, color: p.color, bg: p.bg })}
            >
              {p.name === "Spotify" ? <Disc3 size={11} /> : <Youtube size={11} />}
              <span>{p.name}</span>
              <ExternalLink size={10} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlatToggle({ p, connected, onToggle }) {
  return (
    <div style={{ ...S.platRow, borderColor: connected ? `${p.color}44` : "rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: p.bg, border: `1px solid ${p.color}44`, display: "flex", alignItems: "center", justifyContent: "center", color: p.color, fontWeight: 800, fontSize: 13 }}>
          {p.tag}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>{p.name}</p>
          <p style={{ margin: 0, fontSize: 11, color: connected ? "#22c55e" : "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
            {connected ? (
              <>
                <Check size={11} />
                <span>Connected & Ready</span>
              </>
            ) : (
              <span>Not connected</span>
            )}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {connected && (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...S.platBtn, color: p.color, border: `1px solid ${p.color}44`, background: p.bg, textDecoration: "none" }}
          >
            <span>Launch</span>
            <ExternalLink size={11} />
          </a>
        )}
        <button
          style={{ ...S.toggleBtn, background: connected ? p.color : "rgba(255,255,255,0.08)" }}
          onClick={() => onToggle(p.id)}
          aria-label={`Toggle ${p.name}`}
        >
          <span style={{ ...S.knob, transform: connected ? "translateX(20px)" : "translateX(0)" }} />
        </button>
      </div>
    </div>
  );
}

function EmptyVault({ query, activeTab, onNavigateTab }) {
  return (
    <div style={S.emptyBox}>
      <div style={S.emptyIconWrap}>
        <Bookmark size={32} color="#a855f7" />
      </div>
      <h3 style={S.emptyTitle}>
        {query ? `No results found for "${query}"` : "Your Vault is Empty"}
      </h3>
      <p style={S.emptyDesc}>
        {query
          ? "Try a different search keyword or switch filters."
          : activeTab === "movies"
          ? "You haven't saved any movies yet. Explore titles in Discover and bookmark your favorites."
          : activeTab === "songs"
          ? "You haven't saved any songs yet. Discover vibrant tracks across Latin, K-Pop, and Lofi moods."
          : "You haven't saved any movies or songs yet. Tap the bookmark or heart icon on any title to build your personal vault."}
      </p>
      {onNavigateTab && (
        <button
          style={{ ...S.btnBase, background: "linear-gradient(135deg,#00f2fe,#a855f7)", color: "#0a0e1a", display: "inline-flex", alignItems: "center", gap: 8, marginTop: 6 }}
          onClick={() => onNavigateTab("discover")}
        >
          <Compass size={16} />
          <span>Explore Cinema & Music</span>
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

export default function ProfileDashboard({
  user,
  savedMedia = [],
  onToggleWatchlist,
  onToggleFavourite,
  playingAudioId = null,
  onTogglePlaySong = null,
  onNavigateTab = () => {},
}) {
  const [persona, setPersona] = useState(() => {
    try {
      const stored = localStorage.getItem("vibescape_persona");
      if (stored) return JSON.parse(stored);
    } catch (_) {}
    return {
      name: user?.name || user?.username || "Vibeseeker",
      handle: user?.username ? `@${user.username.toLowerCase()}` : "@vibeseeker",
      bio: user?.bio || "Curating sensory journeys across cinema, soundtracks, and emotional landscapes.",
      joinedYear: user?.created_at ? new Date(user.created_at).getFullYear() : 2024,
    };
  });

  const [editOpen, setEditOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [vaultTab, setVaultTab] = useState("all");
  const [vaultSearch, setVaultSearch] = useState("");
  const [sortBy, setSortBy] = useState("Recently Added");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState("all");
  const [connected, setConnected] = useState({ netflix: true, prime: true, hotstar: true, spotify: true, youtube: true });
  const [redirectInfo, setRedirectInfo] = useState(null);

  const togglePlatform = (id) => setConnected((p) => ({ ...p, [id]: !p[id] }));

  const handleSavePersona = (newPersona) => {
    setPersona((prev) => {
      const updated = { ...prev, ...newPersona };
      try {
        localStorage.setItem("vibescape_persona", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const handleShare = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (_) {}
  };

  // Extract saved items strictly from savedMedia passed from App
  const allSaved = useMemo(() => {
    return (savedMedia || []).filter((item) => {
      if (!item) return false;
      if (item.isWatchlist || item.isFavourite) return true;
      if (item.is_watchlist || item.is_favourite) return true;
      return Boolean(item.title || item.name);
    });
  }, [savedMedia]);

  const savedMovies = useMemo(() => {
    return allSaved.filter((item) => item.type === "movie" || item.type === "series" || item.type === "cinema" || (!item.type && !item.artist && !item.creator));
  }, [allSaved]);

  const savedSongs = useMemo(() => {
    return allSaved.filter((item) => item.type === "song" || Boolean(item.artist));
  }, [allSaved]);

  // Dynamic emotional / mood distribution calculated purely from real saved items
  const moodAnalytics = useMemo(() => {
    if (!allSaved.length) return [];
    const counts = {};
    allSaved.forEach((item) => {
      const mood = item.mood || item.moodTag || (Array.isArray(item.genre) ? item.genre[0] : item.genre) || "Cinematic";
      counts[mood] = (counts[mood] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([mood, count], idx) => ({
        label: mood,
        count,
        pct: Math.round((count / allSaved.length) * 100),
        color: PALETTE[idx % PALETTE.length],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [allSaved]);

  // Filtered vault items for current tab
  const filteredItems = useMemo(() => {
    const q = vaultSearch.trim().toLowerCase();
    let base = vaultTab === "movies" ? savedMovies : vaultTab === "songs" ? savedSongs : allSaved;

    if (selectedMoodFilter !== "all") {
      base = base.filter((item) => {
        const itemMood = (item.mood || item.moodTag || (Array.isArray(item.genre) ? item.genre.join(" ") : item.genre) || "").toLowerCase();
        return itemMood.includes(selectedMoodFilter.toLowerCase());
      });
    }

    if (q) {
      base = base.filter((item) => {
        const str = [item.title, item.name, item.artist, item.creator, item.mood, item.moodTag, ...(Array.isArray(item.genre) ? item.genre : [item.genre])].join(" ").toLowerCase();
        return str.includes(q);
      });
    }

    return [...base].sort((a, b) => {
      if (sortBy === "Title (A-Z)") return (a.title || a.name || "").localeCompare(b.title || b.name || "");
      if (sortBy === "Mood / Genre") return (a.mood || "").localeCompare(b.mood || "");
      return (Number(b.addedAt || b.created_at) || 0) - (Number(a.addedAt || a.created_at) || 0);
    });
  }, [vaultTab, savedMovies, savedSongs, allSaved, selectedMoodFilter, vaultSearch, sortBy]);

  const initials = persona.name
    ? persona.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "V";

  return (
    <div style={S.page}>
      {/* Profile Header */}
      <div style={S.hero}>
        <div style={S.heroGlow} />
        <div style={S.heroContent}>
          <div style={S.avatarBox}>
            <div style={S.avatarRing} />
            <div style={S.avatar}>
              <span style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>{initials}</span>
            </div>
            <div style={S.avatarDot} />
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
              <h1 style={S.profileName}>{persona.name}</h1>
              <span style={S.verifiedBadge}>VIP Curator</span>
            </div>
            <p style={{ margin: "0 0 8px", fontSize: 13, color: "#00f2fe", fontWeight: 500 }}>{persona.handle}</p>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#94a3b8", lineHeight: 1.5, maxWidth: 540 }}>{persona.bio}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Member since {persona.joinedYear} • Vibescape AI Cinema & Music</p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
            <button style={S.btnGrad} onClick={() => setEditOpen(true)}>
              <Pencil size={13} style={{ marginRight: 6 }} />
              <span>Edit Profile</span>
            </button>
            <button style={S.btnOutline} onClick={handleShare}>
              {copied ? <Check size={13} style={{ marginRight: 6, color: "#22c55e" }} /> : <Share2 size={13} style={{ marginRight: 6 }} />}
              <span>{copied ? "Link Copied!" : "Share Profile"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Stats Bar */}
      <div style={S.statsGrid}>
        <div style={S.statCard}>
          <p style={S.statVal}>{allSaved.length}</p>
          <p style={S.statLabel}>Total Saved</p>
        </div>
        <div style={S.statCard}>
          <p style={S.statVal}>{savedMovies.length}</p>
          <p style={S.statLabel}>Movies in Vault</p>
        </div>
        <div style={S.statCard}>
          <p style={S.statVal}>{savedSongs.length}</p>
          <p style={S.statLabel}>Songs in Vault</p>
        </div>
        <div style={S.statCard}>
          <p style={S.statVal}>{moodAnalytics.length}</p>
          <p style={S.statLabel}>Moods Identified</p>
        </div>
      </div>

      {/* Emotional Matrix / Mood Pulse */}
      <div style={S.section}>
        <div style={S.secHead}>
          <div>
            <div style={S.secTitle}>
              <Activity size={16} color="#a855f7" />
              <span>Emotional Taste Pulse</span>
            </div>
            <p style={S.secSub}>Dynamic psychological mapping of your saved cinema and soundscapes</p>
          </div>
          {allSaved.length > 0 && (
            <span style={{ fontSize: 11, color: "#94a3b8", background: "rgba(255,255,255,0.04)", padding: "4px 10px", borderRadius: 20 }}>
              Based on {allSaved.length} saved titles
            </span>
          )}
        </div>

        {allSaved.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.08)" }}>
            <Sparkles size={24} color="#a855f7" style={{ marginBottom: 8 }} />
            <p style={{ margin: "0 0 4px", fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>No Emotional Taste Data Yet</p>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
              Save movies or songs from Discover and Songs to generate your real-time emotional spectrum.
            </p>
          </div>
        ) : (
          <div style={S.pulseGrid}>
            <div>
              <p style={S.pulseLabel}>Dominant Psychological State</p>
              <p style={S.pulseActive}>{moodAnalytics[0]?.label || "Eclectic"}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                <button
                  style={{ ...S.pill, ...(selectedMoodFilter === "all" ? S.pillActive : {}) }}
                  onClick={() => setSelectedMoodFilter("all")}
                >
                  All Moods
                </button>
                {moodAnalytics.map((m) => (
                  <button
                    key={m.label}
                    style={{ ...S.pill, ...(selectedMoodFilter === m.label ? S.pillActive : {}) }}
                    onClick={() => setSelectedMoodFilter(selectedMoodFilter === m.label ? "all" : m.label)}
                  >
                    <span>{m.label} ({m.count})</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
              {moodAnalytics.map((m) => (
                <div key={m.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "#cbd5e1", fontWeight: 500 }}>{m.label}</span>
                    <span style={{ color: m.color, fontWeight: 700 }}>{m.pct}%</span>
                  </div>
                  <div style={S.barTrack}>
                    <div style={{ ...S.barFill, width: `${m.pct}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Curated Vault Section */}
      <div style={S.section}>
        <div style={S.secHead}>
          <div>
            <div style={S.secTitle}>
              <Bookmark size={16} color="#00f2fe" />
              <span>Curated Vault</span>
            </div>
            <p style={S.secSub}>Your private repository of saved cinema, soundtracks, and moods</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#00f2fe", fontWeight: 600 }}>{filteredItems.length} items</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={S.tabBar}>
          {[
            { id: "all", label: `All Saved (${allSaved.length})`, icon: Layers },
            { id: "movies", label: `Movies (${savedMovies.length})`, icon: Film },
            { id: "songs", label: `Songs (${savedSongs.length})`, icon: Music },
          ].map((t) => {
            const Icon = t.icon;
            const active = vaultTab === t.id;
            return (
              <button
                key={t.id}
                style={{ ...S.tab, ...(active ? S.tabActive : {}) }}
                onClick={() => { setVaultTab(t.id); setSelectedMoodFilter("all"); }}
              >
                <Icon size={13} style={{ marginRight: 6 }} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Controls: Search and Sort */}
        {allSaved.length > 0 && (
          <div style={S.controls}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
              <input
                style={S.searchInput}
                placeholder="Search saved titles, artists, genres..."
                value={vaultSearch}
                onChange={(e) => setVaultSearch(e.target.value)}
              />
              {vaultSearch && (
                <button
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                  onClick={() => setVaultSearch("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <SlidersHorizontal size={13} color="#64748b" />
              <select
                style={S.sortSel}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Recently Added">Recently Added</option>
                <option value="Title (A-Z)">Title (A-Z)</option>
                <option value="Mood / Genre">Mood / Genre</option>
              </select>
            </div>
          </div>
        )}

        {/* Items Grid or Clean Empty State */}
        {filteredItems.length === 0 ? (
          <EmptyVault
            query={vaultSearch}
            activeTab={vaultTab}
            onNavigateTab={onNavigateTab}
          />
        ) : (
          <div style={S.grid}>
            {filteredItems.map((item) => {
              const isSong = item.type === "song" || Boolean(item.artist);
              if (isSong) {
                return (
                  <SongCard
                    key={item.id || item.title}
                    s={item}
                    onRedirect={setRedirectInfo}
                    onToggleWatchlist={onToggleWatchlist}
                    onToggleFavourite={onToggleFavourite}
                    isPlaying={playingAudioId === item.id}
                    onTogglePlay={onTogglePlaySong}
                  />
                );
              }
              return (
                <MovieCard
                  key={item.id || item.title}
                  m={item}
                  onRedirect={setRedirectInfo}
                  onToggleWatchlist={onToggleWatchlist}
                  onToggleFavourite={onToggleFavourite}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Linked Streaming Platforms */}
      <div style={S.section}>
        <div style={S.secHead}>
          <div>
            <div style={S.secTitle}>
              <Tv size={16} color="#ec4899" />
              <span>Official Streaming Platform Sync</span>
            </div>
            <p style={S.secSub}>Quick-launch and direct safe deep-links to your preferred official streaming apps</p>
          </div>
          <span style={{ fontSize: 11, color: "#22c55e", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", padding: "3px 9px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Check size={11} />
            <span>Direct Official Streaming Only</span>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
          {LINKED_PLATFORMS.map((p) => (
            <PlatToggle
              key={p.id}
              p={p}
              connected={Boolean(connected[p.id])}
              onToggle={togglePlatform}
            />
          ))}
        </div>
      </div>

      {/* Legal & Architectural Compliance Notice */}
      <div style={S.legalBox}>
        <ShieldCheck size={18} color="#00f2fe" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>
            Official Streaming & Anti-Piracy Architecture
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
            Vibescape AI Cinema and Music never hosts, pirates, or stores copyrighted audio or video streams. All "Watch" and "Listen" actions securely redirect to official licensed external destinations including Netflix, Prime Video, Disney+ Hotstar, Spotify, and YouTube.
          </p>
        </div>
      </div>

      {/* Modals */}
      {redirectInfo && <RedirectModal info={redirectInfo} onClose={() => setRedirectInfo(null)} />}
      {editOpen && <EditModal persona={persona} onSave={handleSavePersona} onClose={() => setEditOpen(false)} />}
    </div>
  );
}

const S = {
  page: { padding: "10px 0 40px", maxWidth: 1200, margin: "0 auto", color: "#e2e8f0", fontFamily: "'Inter', -apple-system, sans-serif" },
  hero: { position: "relative", borderRadius: 24, padding: "28px 24px", marginBottom: 20, background: "linear-gradient(135deg,rgba(15,23,42,0.95),rgba(24,15,46,0.95))", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", backdropFilter: "blur(12px)" },
  heroGlow: { position: "absolute", top: -80, right: -40, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,0.18),transparent 70%)", pointerEvents: "none" },
  heroContent: { position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" },
  avatarBox: { position: "relative", width: 88, height: 88, flexShrink: 0 },
  avatarRing: { position: "absolute", inset: -3, borderRadius: "50%", background: "linear-gradient(135deg,#00f2fe,#a855f7,#ec4899)", zIndex: 0 },
  avatar: { width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,#0f172a,#1e1b4b)", border: "3px solid #090d16", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 },
  avatarDot: { position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: "50%", background: "#22c55e", border: "2px solid #090d16", zIndex: 2 },
  profileName: { margin: 0, fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#00f2fe,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  verifiedBadge: { fontSize: 10, background: "linear-gradient(135deg,#a855f7,#ec4899)", color: "#fff", padding: "3px 10px", borderRadius: 20, fontWeight: 700, letterSpacing: 0.5 },
  btnGrad: { background: "linear-gradient(135deg,#00f2fe,#a855f7)", border: "none", borderRadius: 10, padding: "9px 16px", color: "#0a0e1a", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnOutline: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "9px 16px", color: "#e2e8f0", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 },
  statCard: { background: "rgba(15,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 18px", textAlign: "center", backdropFilter: "blur(10px)" },
  statVal: { margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#00f2fe" },
  statLabel: { margin: 0, fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 },
  section: { marginBottom: 24, background: "rgba(11,15,25,0.96)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "22px 20px", backdropFilter: "blur(10px)" },
  secHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 },
  secTitle: { fontSize: 15, fontWeight: 700, color: "#e2e8f0", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 8 },
  secSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  pulseGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 },
  pulseLabel: { color: "#94a3b8", fontSize: 11, marginBottom: 6, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 600 },
  pulseActive: { fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: "0 0 10px" },
  pill: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "6px 12px", fontSize: 11, color: "#94a3b8", cursor: "pointer", outline: "none", transition: "all 0.2s" },
  pillActive: { background: "rgba(168,85,247,0.16)", border: "1px solid rgba(168,85,247,0.5)", color: "#a855f7", fontWeight: 600 },
  barTrack: { height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 10, transition: "width 0.6s ease" },
  tabBar: { display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" },
  tab: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "8px 14px", fontSize: 12, color: "#94a3b8", cursor: "pointer", fontWeight: 600, outline: "none", display: "inline-flex", alignItems: "center" },
  tabActive: { background: "rgba(0,242,254,0.12)", border: "1px solid rgba(0,242,254,0.4)", color: "#00f2fe" },
  controls: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" },
  searchInput: { width: "100%", paddingLeft: 34, paddingRight: 32, paddingTop: 9, paddingBottom: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" },
  sortSel: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 12px", color: "#94a3b8", fontSize: 12, cursor: "pointer", outline: "none" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 },
  card: { background: "rgba(15,18,35,0.95)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s" },
  imgWrap: { position: "relative", width: "100%", paddingTop: "62%", overflow: "hidden" },
  img: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" },
  imgGrad: { position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(transparent,rgba(10,14,26,0.95))" },
  moodBadge: { position: "absolute", bottom: 8, left: 8, fontSize: 10, color: "#e2e8f0", padding: "3px 8px", borderRadius: 20, background: "rgba(10,12,24,0.85)", border: "1px solid rgba(255,255,255,0.1)", fontWeight: 600, display: "inline-flex", alignItems: "center", backdropFilter: "blur(6px)" },
  quickActions: { position: "absolute", top: 8, right: 8, display: "flex", gap: 6, zIndex: 3 },
  quickBtn: { width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" },
  playOverlayBtn: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 42, height: 42, borderRadius: "50%", background: "rgba(0,242,254,0.85)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", cursor: "pointer", zIndex: 2, boxShadow: "0 0 20px rgba(0,242,254,0.5)" },
  cardBody: { padding: "12px 14px 14px" },
  cardTitle: { margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardSub: { margin: "0 0 4px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardMeta: { margin: 0, fontSize: 11, color: "#475569" },
  platBtn: { padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", outline: "none", transition: "all 0.2s" },
  platRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "rgba(15,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, transition: "border-color 0.25s" },
  toggleBtn: { width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0 },
  knob: { position: "absolute", top: 3, left: 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "transform 0.3s", display: "block" },
  emptyBox: { textAlign: "center", padding: "48px 24px", color: "#64748b" },
  emptyIconWrap: { width: 56, height: 56, borderRadius: "50%", background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  emptyTitle: { margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#cbd5e1" },
  emptyDesc: { margin: "0 auto 16px", fontSize: 13, color: "#64748b", maxWidth: 440, lineHeight: 1.5 },
  legalBox: { display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 18px", background: "rgba(0,242,254,0.03)", border: "1px solid rgba(0,242,254,0.12)", borderRadius: 14, marginTop: 10 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.76)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 },
  modalBox: { position: "relative", background: "linear-gradient(135deg,#0a0e1a,#14102e)", border: "1px solid rgba(168,85,247,0.35)", borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 420, textAlign: "center", boxShadow: "0 0 80px rgba(168,85,247,0.18)", overflow: "hidden" },
  modalGlow: { position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 200, height: 200, borderRadius: "50%", background: "rgba(168,85,247,0.12)", filter: "blur(40px)", pointerEvents: "none" },
  modalTitle: { margin: "0 0 10px", fontSize: 19, fontWeight: 800, color: "#e2e8f0" },
  modalBody: { margin: "0 0 22px", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 },
  modalActions: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" },
  btnBase: { display: "inline-block", padding: "10px 18px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "center" },
  btnGhost: { padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  label: { display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 6, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" },
  input: { width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
};
