import { useState, useMemo } from "react";

const SEED_MOVIES = [
  { id: "m1", type: "movie", title: "Interstellar", year: 2014, genre: ["Sci-Fi", "Drama"], mood: "Mind-Bending & Sci-Fi", moodEmoji: "??", poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&auto=format&fit=crop&q=80", platforms: [{ name: "Prime Video", url: "https://www.primevideo.com/search/ref=atv_nb_sug?phrase=Interstellar", color: "#00a8e1", bg: "rgba(0,168,225,0.12)" }], addedAt: Date.now() - 86400000 * 2 },
  { id: "m2", type: "movie", title: "Blade Runner 2049", year: 2017, genre: ["Noir", "Sci-Fi"], mood: "Late-Night & Moody", moodEmoji: "??", poster: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&auto=format&fit=crop&q=80", platforms: [{ name: "Netflix", url: "https://www.netflix.com/search?q=Blade+Runner+2049", color: "#e50914", bg: "rgba(229,9,20,0.12)" }], addedAt: Date.now() - 86400000 * 5 },
  { id: "m3", type: "movie", title: "Zindagi Na Milegi Dobara", year: 2011, genre: ["Feel-Good", "Drama"], mood: "Feel-Good & Warm", moodEmoji: "??", poster: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&auto=format&fit=crop&q=80", platforms: [{ name: "Netflix", url: "https://www.netflix.com/search?q=Zindagi+Na+Milegi+Dobara", color: "#e50914", bg: "rgba(229,9,20,0.12)" }], addedAt: Date.now() - 86400000 * 8 },
  { id: "m4", type: "movie", title: "Vikram", year: 2022, genre: ["Action", "Thriller"], mood: "High Adrenaline", moodEmoji: "?", poster: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&auto=format&fit=crop&q=80", platforms: [{ name: "Disney+ Hotstar", url: "https://www.hotstar.com/in/movies/vikram", color: "#0063e5", bg: "rgba(0,99,229,0.12)" }], addedAt: Date.now() - 86400000 * 11 },
];
const SEED_SONGS = [
  { id: "s1", type: "song", title: "Aadat", artist: "Atif Aslam", mood: "Late-Night & Moody", moodEmoji: "??", artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80", spotifyUrl: "https://open.spotify.com/search/Aadat%20Atif%20Aslam", youtubeUrl: "https://www.youtube.com/results?search_query=Aadat+Atif+Aslam+official", addedAt: Date.now() - 86400000 * 1 },
  { id: "s2", type: "song", title: "295", artist: "Sidhu Moose Wala", mood: "High Adrenaline", moodEmoji: "?", artwork: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80", spotifyUrl: "https://open.spotify.com/search/295%20Sidhu%20Moose%20Wala", youtubeUrl: "https://www.youtube.com/results?search_query=295+Sidhu+Moose+Wala+official", addedAt: Date.now() - 86400000 * 3 },
  { id: "s3", type: "song", title: "After Hours", artist: "The Weeknd", mood: "Late-Night & Moody", moodEmoji: "??", artwork: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80", spotifyUrl: "https://open.spotify.com/search/After%20Hours%20The%20Weeknd", youtubeUrl: "https://www.youtube.com/results?search_query=The+Weeknd+After+Hours+official", addedAt: Date.now() - 86400000 * 6 },
  { id: "s4", type: "song", title: "Kesariya", artist: "Arijit Singh", mood: "Romantic & Chemistry", moodEmoji: "??", artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80", spotifyUrl: "https://open.spotify.com/search/Kesariya%20Arijit%20Singh", youtubeUrl: "https://www.youtube.com/results?search_query=Kesariya+Arijit+Singh+official", addedAt: Date.now() - 86400000 * 9 },
];
const SEED_MIXES = [
  { id: "mx1", name: "Cyberpunk Rain Walk", emoji: "???", desc: "For nights when the city glows and the rain never stops.", film: "Blade Runner 2049", tracks: ["Tears in Rain (Vangelis)", "M83 – Outro", "Hans Zimmer – Chest"], tags: ["Late-Night", "Noir", "Synthwave"], gradient: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" },
  { id: "mx2", name: "Late-Night Drive Sessions", emoji: "??", desc: "Warm neon, empty roads, and a playlist that understands you.", film: "Drive (2011)", tracks: ["Aadat – Atif Aslam", "After Hours – The Weeknd", "Tum Se Hi – Arijit Singh", "Blinding Lights – The Weeknd"], tags: ["Moody", "Hindi", "English"], gradient: "linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)" },
];
const LINKED_PLATFORMS = [
  { id: "netflix", name: "Netflix", icon: "??", color: "#e50914", url: "https://netflix.com" },
  { id: "prime", name: "Prime Video", icon: "??", color: "#00a8e1", url: "https://primevideo.com" },
  { id: "hotstar", name: "Disney+ Hotstar", icon: "?", color: "#0063e5", url: "https://hotstar.com" },
  { id: "spotify", name: "Spotify", icon: "??", color: "#1db954", url: "https://open.spotify.com" },
  { id: "youtube", name: "YouTube", icon: "??", color: "#ff0000", url: "https://youtube.com" },
];
const MOOD_DIST = [
  { label: "Late-Night & Moody", emoji: "??", pct: 42, color: "#a855f7" },
  { label: "High Adrenaline", emoji: "?", pct: 28, color: "#f97316" },
  { label: "Romantic", emoji: "??", pct: 18, color: "#ec4899" },
  { label: "Nostalgic", emoji: "??", pct: 12, color: "#00f2fe" },
];
const MOOD_PILLS = [
  { id: "latenight", label: "?? Late-Night & Moody" },
  { id: "adrenaline", label: "? High Adrenaline" },
  { id: "feelgood", label: "?? Feel-Good & Warm" },
  { id: "romantic", label: "?? Romantic" },
  { id: "nostalgic", label: "?? Nostalgic Retro" },
];
const SORT_OPTIONS = ["Recently Added", "Title (A-Z)", "Mood Tag"];

function timeAgo(ts) {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
function sortItems(items, sortBy) {
  return [...items].sort((a, b) => {
    if (sortBy === "Title (A-Z)") return (a.title || a.name || "").localeCompare(b.title || b.name || "");
    if (sortBy === "Mood Tag") return (a.mood || "").localeCompare(b.mood || "");
    return (b.addedAt || 0) - (a.addedAt || 0);
  });
}

function RedirectModal({ info, onClose }) {
  if (!info) return null;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalGlow} />
        <div style={{ fontSize: 38, marginBottom: 10 }}>{info.emoji || "??"}</div>
        <h3 style={S.modalTitle}>Leaving Vibescape</h3>
        <p style={S.modalBody}>
          Opening <strong style={{ color: "#00f2fe" }}>{info.title}</strong> on{" "}
          <strong style={{ color: info.color || "#a855f7" }}>{info.platform}</strong>.<br />
          You are being redirected to an official external streaming service.
        </p>
        <div style={S.modalActions}>
          <a href={info.url} target="_blank" rel="noopener noreferrer" style={{ ...S.btnBase, background: info.color || "#a855f7", color: "#fff", textDecoration: "none" }} onClick={onClose}>
            Continue to Platform ?
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
        <h3 style={{ ...S.modalTitle, textAlign: "center" }}>Edit Persona</h3>
        {[{ label: "Display Name", val: name, set: setName, type: "input" }, { label: "Handle", val: handle, set: setHandle, type: "input", ph: "@username" }, { label: "Bio", val: bio, set: setBio, type: "textarea" }].map((f) => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <label style={S.label}>{f.label}</label>
            {f.type === "textarea"
              ? <textarea style={{ ...S.input, height: 76, resize: "vertical" }} value={f.val} onChange={(e) => f.set(e.target.value)} />
              : <input style={S.input} value={f.val} placeholder={f.ph || ""} onChange={(e) => f.set(e.target.value)} />}
          </div>
        ))}
        <div style={{ ...S.modalActions, marginTop: 20 }}>
          <button style={{ ...S.btnBase, background: "linear-gradient(135deg,#00f2fe,#a855f7)", color: "#0a0e1a" }} onClick={() => { onSave({ name, handle, bio }); onClose(); }}>Save Changes</button>
          <button style={S.btnGhost} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function MovieCard({ m, onR }) {
  return (
    <div style={S.card}>
      <div style={S.imgWrap}>
        <img src={m.poster} alt={m.title} style={S.img} loading="lazy" />
        <div style={S.imgGrad} />
        <span style={S.moodBadge}>{m.moodEmoji} {m.mood}</span>
      </div>
      <div style={S.cardBody}>
        <p style={S.cardTitle}>{m.title}</p>
        <p style={S.cardSub}>{m.year} • {m.genre.join(" / ")}</p>
        <p style={S.cardMeta}>Added {timeAgo(m.addedAt)}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {m.platforms.map((p) => (
            <button key={p.name} style={{ ...S.platBtn, background: p.bg, border: `1px solid ${p.color}55`, color: p.color }} onClick={() => onR({ title: m.title, platform: p.name, url: p.url, color: p.color, emoji: "??" })}>
              Watch on {p.name} ?
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SongCard({ s, onR }) {
  return (
    <div style={S.card}>
      <div style={S.imgWrap}>
        <img src={s.artwork} alt={s.title} style={S.img} loading="lazy" />
        <div style={S.imgGrad} />
        <span style={S.moodBadge}>{s.moodEmoji} {s.mood}</span>
      </div>
      <div style={S.cardBody}>
        <p style={S.cardTitle}>{s.title}</p>
        <p style={S.cardSub}>{s.artist}</p>
        <p style={S.cardMeta}>Added {timeAgo(s.addedAt)}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          <button style={{ ...S.platBtn, background: "rgba(29,185,84,0.12)", border: "1px solid #1db95455", color: "#1db954" }} onClick={() => onR({ title: s.title, platform: "Spotify", url: s.spotifyUrl, color: "#1db954", emoji: "??" })}>?? Spotify ?</button>
          <button style={{ ...S.platBtn, background: "rgba(255,0,0,0.1)", border: "1px solid #ff000055", color: "#ff6b6b" }} onClick={() => onR({ title: s.title, platform: "YouTube", url: s.youtubeUrl, color: "#ff0000", emoji: "??" })}>? YouTube ?</button>
        </div>
      </div>
    </div>
  );
}

function MixCard({ mix }) {
  return (
    <div style={{ ...S.card, background: mix.gradient }}>
      <div style={{ ...S.cardBody, paddingTop: 20 }}>
        <div style={{ fontSize: 30, marginBottom: 6 }}>{mix.emoji}</div>
        <p style={{ ...S.cardTitle, color: "#00f2fe" }}>{mix.name}</p>
        <p style={{ ...S.cardSub, color: "#94a3b8", marginBottom: 8 }}>{mix.desc}</p>
        <p style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>?? {mix.film}</p>
        {mix.tracks.map((t, i) => <p key={i} style={{ fontSize: 12, color: "#a8b3c5", margin: "2px 0" }}>?? {t}</p>)}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
          {mix.tags.map((tag) => <span key={tag} style={S.tagPill}>{tag}</span>)}
        </div>
      </div>
    </div>
  );
}

function PlatToggle({ p, connected, onToggle }) {
  return (
    <div style={{ ...S.platRow, borderColor: connected ? `${p.color}55` : "rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 22 }}>{p.icon}</span>
        <div>
          <p style={{ margin: 0, fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>{p.name}</p>
          <p style={{ margin: 0, fontSize: 11, color: connected ? p.color : "#64748b" }}>{connected ? "? Connected" : "Not linked"}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {connected && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ ...S.platBtn, color: p.color, border: `1px solid ${p.color}55`, background: `${p.color}12`, textDecoration: "none" }}>Open ?</a>}
        <button style={{ ...S.toggleBtn, background: connected ? p.color : "rgba(255,255,255,0.08)" }} onClick={() => onToggle(p.id)}>
          <span style={{ ...S.knob, transform: connected ? "translateX(20px)" : "translateX(0)" }} />
        </button>
      </div>
    </div>
  );
}

function EmptyVault({ q }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "#475569" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>??</div>
      <p style={{ fontSize: 15, color: "#64748b" }}>{q ? `No results for "${q}"` : "Nothing here yet"}</p>
      <p style={{ fontSize: 12 }}>Save movies and songs from Discover to fill your vault.</p>
    </div>
  );
}

export default function ProfileDashboard({ user }) {
  const defaultPersona = {
    name: user?.username || "Vibeseeker",
    handle: `@${(user?.username || "vibeseeker").toLowerCase()}`,
    bio: "Curating sensory journeys across cinema and music.",
    joinedYear: user?.created_at ? new Date(user.created_at).getFullYear() : 2024,
  };
  const [persona, setPersona] = useState(defaultPersona);
  const [editOpen, setEditOpen] = useState(false);
  const [activeMood, setActiveMood] = useState("latenight");
  const [vaultTab, setVaultTab] = useState("all");
  const [vaultSearch, setVaultSearch] = useState("");
  const [sortBy, setSortBy] = useState("Recently Added");
  const [connected, setConnected] = useState({ netflix: true, prime: true, hotstar: false, spotify: true, youtube: true });
  const [redirectInfo, setRedirectInfo] = useState(null);

  const togglePlatform = (id) => setConnected((p) => ({ ...p, [id]: !p[id] }));
  const allSaved = useMemo(() => [...SEED_MOVIES, ...SEED_SONGS], []);

  const filteredItems = useMemo(() => {
    const q = vaultSearch.toLowerCase();
    let base = vaultTab === "all" ? allSaved : vaultTab === "movies" ? SEED_MOVIES : vaultTab === "songs" ? SEED_SONGS : vaultTab === "mixes" ? SEED_MIXES : [];
    if (q) base = base.filter((item) => [item.title, item.name, item.artist, item.mood, ...(item.tags || [])].join(" ").toLowerCase().includes(q));
    return sortItems(base, sortBy);
  }, [vaultTab, vaultSearch, sortBy, allSaved]);

  const activeMoodLabel = MOOD_PILLS.find((m) => m.id === activeMood)?.label || "";

  return (
    <div style={S.root}>
      <RedirectModal info={redirectInfo} onClose={() => setRedirectInfo(null)} />
      {editOpen && <EditModal persona={persona} onSave={(u) => setPersona((p) => ({ ...p, ...u }))} onClose={() => setEditOpen(false)} />}

      {/* -- Profile Header -- */}
      <section style={S.header}>
        <div style={S.headerInner}>
          <div style={S.avatarWrap}>
            <div style={S.avatarRing} />
            <div style={S.avatar}><span style={{ fontSize: 38 }}>??</span></div>
            <div style={S.avatarDot} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={S.profileName}>{persona.name}</h1>
              <span style={S.verifiedBadge}>? Verified Vibe</span>
            </div>
            <p style={{ margin: "4px 0 5px", color: "#00f2fe", fontSize: 13, fontWeight: 500 }}>{persona.handle}</p>
            <p style={{ margin: "0 0 5px", color: "#94a3b8", fontSize: 13, fontStyle: "italic" }}>{persona.bio}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>?? Member since {persona.joinedYear} &nbsp;•&nbsp; <span style={{ color: "#00f2fe" }}>{allSaved.length} items saved</span></p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
            <button style={S.btnGrad} onClick={() => setEditOpen(true)}>?? Edit Persona</button>
            <button style={S.btnOutline} onClick={() => { try { navigator.clipboard.writeText(window.location.href); } catch (_) {} }}>?? Share Profile</button>
          </div>
        </div>
      </section>

      {/* -- Stats Bar -- */}
      <div style={S.statsGrid}>
        {[{ label: "Saved Movies", v: SEED_MOVIES.length, e: "??" }, { label: "Saved Songs", v: SEED_SONGS.length, e: "??" }, { label: "Curated Mixes", v: SEED_MIXES.length, e: "???" }, { label: "Linked Platforms", v: Object.values(connected).filter(Boolean).length, e: "??" }].map((s) => (
          <div key={s.label} style={S.statCard}><p style={S.statVal}>{s.e} {s.v}</p><p style={S.statLabel}>{s.label}</p></div>
        ))}
      </div>

      {/* -- Mood Pulse -- */}
      <section style={S.section}>
        <div style={S.secHead}>
          <span style={S.secTitle}><span style={{ color: "#a855f7" }}>?</span> Active Vibe Pulse</span>
          <span style={S.secSub}>Your 30-day mood fingerprint</span>
        </div>
        <div style={S.pulseGrid}>
          <div>
            <p style={S.pulseLabel}>Current Vibe</p>
            <p style={S.pulseActive}>{activeMoodLabel}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
              {MOOD_PILLS.map((m) => (
                <button key={m.id} style={{ ...S.pill, ...(activeMood === m.id ? S.pillActive : {}) }} onClick={() => setActiveMood(m.id)}>{m.label}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={S.pulseLabel}>30-Day Distribution</p>
            {MOOD_DIST.map((m) => (
              <div key={m.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "#cbd5e1" }}>{m.emoji} {m.label}</span>
                  <span style={{ fontSize: 12, color: m.color, fontWeight: 700 }}>{m.pct}%</span>
                </div>
                <div style={S.barTrack}><div style={{ ...S.barFill, width: `${m.pct}%`, background: m.color }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- Vault -- */}
      <section style={S.section}>
        <div style={S.secHead}><span style={S.secTitle}><span style={{ color: "#00f2fe" }}>?</span> Your Vault</span></div>
        <div style={S.tabBar}>
          {[{ id: "all", label: "All Saved" }, { id: "movies", label: "?? Movies" }, { id: "songs", label: "?? Songs" }, { id: "mixes", label: "??? Mixes" }, { id: "platforms", label: "?? Platforms" }].map((t) => (
            <button key={t.id} style={{ ...S.tab, ...(vaultTab === t.id ? S.tabActive : {}) }} onClick={() => setVaultTab(t.id)}>{t.label}</button>
          ))}
        </div>
        {vaultTab !== "platforms" && (
          <div style={S.controls}>
            <div style={{ flex: 1, position: "relative", minWidth: 180 }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>??</span>
              <input style={S.searchInput} placeholder="Search title, artist, mood..." value={vaultSearch} onChange={(e) => setVaultSearch(e.target.value)} />
              {vaultSearch && <button style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }} onClick={() => setVaultSearch("")}>?</button>}
            </div>
            <select style={S.sortSel} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        )}
        {vaultTab === "platforms" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LINKED_PLATFORMS.map((p) => <PlatToggle key={p.id} p={p} connected={connected[p.id]} onToggle={togglePlatform} />)}
          </div>
        )}
        {vaultTab === "mixes" && (filteredItems.length > 0 ? <div style={S.grid}>{filteredItems.map((m) => <MixCard key={m.id} mix={m} />)}</div> : <EmptyVault q={vaultSearch} />)}
        {(vaultTab === "all" || vaultTab === "movies" || vaultTab === "songs") && (
          filteredItems.length > 0
            ? <div style={S.grid}>{filteredItems.map((item) => item.type === "movie" ? <MovieCard key={item.id} m={item} onR={setRedirectInfo} /> : <SongCard key={item.id} s={item} onR={setRedirectInfo} />)}</div>
            : <EmptyVault q={vaultSearch} />
        )}
      </section>
    </div>
  );
}

const S = {
  root: { maxWidth: 1080, margin: "0 auto", padding: "24px 16px 80px", fontFamily: "'Inter','Outfit',system-ui,sans-serif", color: "#e2e8f0" },
  header: { background: "linear-gradient(135deg,rgba(10,14,30,0.97),rgba(20,14,50,0.92))", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 20, padding: "30px 26px", marginBottom: 18, backdropFilter: "blur(16px)", boxShadow: "0 0 60px rgba(168,85,247,0.07)", position: "relative", overflow: "hidden" },
  headerInner: { display: "flex", alignItems: "flex-start", gap: 22, flexWrap: "wrap", position: "relative", zIndex: 1 },
  avatarWrap: { position: "relative", width: 88, height: 88, flexShrink: 0 },
  avatarRing: { position: "absolute", inset: -4, borderRadius: "50%", background: "linear-gradient(135deg,#00f2fe,#a855f7,#ec4899)", zIndex: 0 },
  avatar: { width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg,#0f0c29,#302b63)", border: "3px solid #090d16", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 },
  avatarDot: { position: "absolute", bottom: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: "#22c55e", border: "2px solid #090d16", zIndex: 2 },
  profileName: { margin: 0, fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#00f2fe,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  verifiedBadge: { fontSize: 10, background: "linear-gradient(135deg,#a855f7,#ec4899)", color: "#fff", padding: "3px 10px", borderRadius: 20, fontWeight: 700, letterSpacing: 0.5 },
  btnGrad: { background: "linear-gradient(135deg,#00f2fe,#a855f7)", border: "none", borderRadius: 10, padding: "9px 16px", color: "#0a0e1a", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  btnOutline: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "9px 16px", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 18 },
  statCard: { background: "rgba(15,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 18px", textAlign: "center", backdropFilter: "blur(10px)" },
  statVal: { margin: "0 0 4px", fontSize: 21, fontWeight: 800, color: "#e2e8f0" },
  statLabel: { margin: 0, fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8 },
  section: { marginBottom: 24, background: "rgba(11,15,25,0.96)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: "22px 20px", backdropFilter: "blur(10px)" },
  secHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 6 },
  secTitle: { fontSize: 14, fontWeight: 700, color: "#e2e8f0", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 7 },
  secSub: { fontSize: 11, color: "#64748b" },
  pulseGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  pulseLabel: { color: "#94a3b8", fontSize: 11, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" },
  pulseActive: { fontSize: 19, fontWeight: 800, background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: 0 },
  pill: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "5px 11px", fontSize: 11, color: "#94a3b8", cursor: "pointer", outline: "none" },
  pillActive: { background: "rgba(168,85,247,0.16)", border: "1px solid rgba(168,85,247,0.5)", color: "#a855f7" },
  barTrack: { height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 10, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 10, transition: "width 0.6s ease" },
  tabBar: { display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" },
  tab: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "7px 14px", fontSize: 12, color: "#64748b", cursor: "pointer", fontWeight: 600, outline: "none" },
  tabActive: { background: "rgba(0,242,254,0.1)", border: "1px solid rgba(0,242,254,0.35)", color: "#00f2fe" },
  controls: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  searchInput: { width: "100%", paddingLeft: 34, paddingRight: 28, paddingTop: 9, paddingBottom: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" },
  sortSel: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "9px 12px", color: "#94a3b8", fontSize: 13, cursor: "pointer", outline: "none", flexShrink: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 16 },
  card: { background: "rgba(15,18,35,0.95)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" },
  imgWrap: { position: "relative", width: "100%", paddingTop: "60%", overflow: "hidden" },
  img: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" },
  imgGrad: { position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(transparent,rgba(10,14,26,0.92))" },
  moodBadge: { position: "absolute", bottom: 8, left: 8, fontSize: 10, color: "#e2e8f0", padding: "3px 8px", borderRadius: 20, background: "rgba(10,12,24,0.85)", border: "1px solid rgba(255,255,255,0.08)", fontWeight: 600 },
  cardBody: { padding: "12px 14px 14px" },
  cardTitle: { margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  cardSub: { margin: "0 0 2px", fontSize: 12, color: "#64748b" },
  cardMeta: { margin: 0, fontSize: 11, color: "#475569" },
  platBtn: { padding: "5px 11px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", outline: "none" },
  tagPill: { fontSize: 10, padding: "3px 9px", borderRadius: 20, background: "rgba(0,242,254,0.08)", border: "1px solid rgba(0,242,254,0.2)", color: "#00f2fe", fontWeight: 600 },
  platRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 17px", background: "rgba(15,18,35,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, transition: "border-color 0.25s" },
  toggleBtn: { width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0 },
  knob: { position: "absolute", top: 3, left: 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "transform 0.3s", display: "block" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.76)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 },
  modalBox: { position: "relative", background: "linear-gradient(135deg,#0a0e1a,#14102e)", border: "1px solid rgba(168,85,247,0.35)", borderRadius: 20, padding: "34px 30px", width: "100%", maxWidth: 420, textAlign: "center", boxShadow: "0 0 80px rgba(168,85,247,0.18)", overflow: "hidden" },
  modalGlow: { position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 200, height: 200, borderRadius: "50%", background: "rgba(168,85,247,0.12)", filter: "blur(40px)", pointerEvents: "none" },
  modalTitle: { margin: "0 0 12px", fontSize: 20, fontWeight: 800, color: "#e2e8f0", position: "relative" },
  modalBody: { margin: "0 0 24px", fontSize: 14, color: "#94a3b8", lineHeight: 1.6, position: "relative" },
  modalActions: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", position: "relative" },
  btnBase: { display: "inline-block", padding: "10px 20px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", textAlign: "center" },
  btnGhost: { padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  label: { display: "block", fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" },
  input: { width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
};
