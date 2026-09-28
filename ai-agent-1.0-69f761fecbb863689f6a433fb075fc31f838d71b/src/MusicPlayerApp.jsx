import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Search,
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  Music,
  ExternalLink,
  Flame,
  Globe,
  Disc3,
  Layers,
  Heart,
  Bookmark,
  Shuffle,
  Repeat,
  Headphones,
  Sliders,
  Maximize2,
  Youtube,
  Mic2,
  FileText,
  ChevronDown,
  ChevronUp,
  Star,
  Calendar,
  Clock,
  Film
} from "lucide-react";
import { SEED_TRACKS, GENRES, MOODS } from "./musicDatabase";
import { playSynthesizedPreview, stopSynthesizer } from "./audioSynthesizer";

const getLyricsSearchUrl = (title, artist) => {
  const cleanTitle = (title || "").trim();
  const cleanArtist = (artist || "").trim();
  return `https://www.google.com/search?q=${encodeURIComponent(cleanTitle + (cleanArtist ? " " + cleanArtist : "") + " lyrics")}`;
};

export default function MusicPlayerApp({ 
  onSwitchMode, 
  savedMedia = [], 
  onToggleWatchlist, 
  onToggleFavourite, 
  embedded = false,
  externalQuery,
  selectedGenreProp,
  selectedMoodProp,
  theme = "dark"
}) {
  // Normalize IDs between App and MusicPlayerApp
  const normalizeGenreId = (id) => {
    if (!id) return "all";
    if (id === "korean") return "kpop";
    if (id === "spanish") return "latin";
    if (id === "instrumental") return "soundtracks";
    return id;
  };

  const normalizeMoodId = (id) => {
    if (!id) return null;
    if (id === "highenergy") return "adrenaline";
    if (id === "mindbending") return "scifi";
    if (id === "darkgritty") return "noir";
    if (id === "nostalgic") return "retro";
    if (id === "escapist") return "adventure";
    return id;
  };

  // -------------------------------------------------------------
  // Filter & Search State
  // -------------------------------------------------------------
  const [selectedGenre, setSelectedGenre] = useState(() => normalizeGenreId(selectedGenreProp));
  const [selectedMood, setSelectedMood] = useState(() => normalizeMoodId(selectedMoodProp));
  const [searchQuery, setSearchQuery] = useState(externalQuery || "");
  const [debouncedQuery, setDebouncedQuery] = useState(externalQuery || "");

  useEffect(() => {
    if (externalQuery !== undefined) {
      setSearchQuery(externalQuery);
    }
  }, [externalQuery]);

  useEffect(() => {
    if (selectedGenreProp !== undefined) {
      setSelectedGenre(normalizeGenreId(selectedGenreProp));
    }
  }, [selectedGenreProp]);

  useEffect(() => {
    if (selectedMoodProp !== undefined) {
      setSelectedMood(normalizeMoodId(selectedMoodProp));
    }
  }, [selectedMoodProp]);

  // External iTunes Fallback State
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [externalResults, setExternalResults] = useState([]);
  const [searchSource, setSearchSource] = useState("local"); // "local" | "itunes" | "mixed"
  const [externalSearchTriggered, setExternalSearchTriggered] = useState(false);

  // -------------------------------------------------------------
  // Audio Player State
  // -------------------------------------------------------------
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [expandedTrackId, setExpandedTrackId] = useState(null);

  const toggleTrackAccordion = (trackId, e) => {
    e?.stopPropagation();
    setExpandedTrackId((prev) => (prev === trackId ? null : trackId));
  };

  const audioRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const searchInputRef = useRef(null);

  // -------------------------------------------------------------
  // Debounce Search Input (300ms)
  // -------------------------------------------------------------
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  // -------------------------------------------------------------
  // Local In-Memory Search & Filtering Logic
  // -------------------------------------------------------------
  const localFilteredTracks = useMemo(() => {
    const query = debouncedQuery.toLowerCase();

    // Search Priority Mode
    if (query.length > 0) {
      return SEED_TRACKS.filter((track) => {
        const titleMatch = track.title.toLowerCase().includes(query);
        const artistMatch = track.artist.toLowerCase().includes(query);
        const genreMatch = (track.genreName || "").toLowerCase().includes(query);
        const moodMatch = (track.moodName || "").toLowerCase().includes(query);
        return titleMatch || artistMatch || genreMatch || moodMatch;
      });
    }

    // Active Filter Mode (Default)
    return SEED_TRACKS.filter((track) => {
      // Genre filter
      const genreMatches = selectedGenre === "all" || track.genreId === selectedGenre;
      // Mood filter
      const moodMatches = !selectedMood || (track.moodIds && track.moodIds.includes(selectedMood));
      return genreMatches && moodMatches;
    });
  }, [debouncedQuery, selectedGenre, selectedMood]);

  // -------------------------------------------------------------
  // External iTunes Search Fallback
  // Triggered when search query exists and local results are < 3
  // -------------------------------------------------------------
  const fetchExternalTracks = useCallback(async (queryText) => {
    if (!queryText || queryText.length < 2) return;
    setIsSearchingExternal(true);
    setExternalSearchTriggered(true);

    try {
      const endpoint = `https://itunes.apple.com/search?term=${encodeURIComponent(
        queryText
      )}&entity=song&limit=25`;
      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const parsed = data.results.map((item) => {
          const totalSecs = item.trackTimeMillis ? Math.floor(item.trackTimeMillis / 1000) : 210;
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          const durStr = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

          return {
            id: `itunes-${item.trackId}`,
            title: item.trackName || "Unknown Track",
            artist: item.artistName || "Unknown Artist",
            genreId: "global",
            genreName: item.primaryGenreName || "Global Hits",
            moodIds: ["feelgood"],
            moodName: "Live Discovery",
            duration: durStr,
            artworkUrl: item.artworkUrl100
              ? item.artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg")
              : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
            previewUrl: item.previewUrl || "",
            appleMusicUrl: item.trackViewUrl || `https://music.apple.com/us/search?term=${encodeURIComponent(item.trackName)}`,
            spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(
              (item.trackName || "") + " " + (item.artistName || "")
            )}`,
            source: "itunes"
          };
        });
        setExternalResults(parsed);
      } else {
        setExternalResults([]);
      }
    } catch (err) {
      console.warn("iTunes API search error:", err);
      setExternalResults([]);
    } finally {
      setIsSearchingExternal(false);
    }
  }, []);

  // Automatic external trigger when local results < 3 and search text is present
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      if (localFilteredTracks.length < 3) {
        fetchExternalTracks(debouncedQuery);
        setSearchSource(localFilteredTracks.length > 0 ? "mixed" : "itunes");
      } else {
        setExternalResults([]);
        setSearchSource("local");
        setExternalSearchTriggered(false);
      }
    } else {
      setExternalResults([]);
      setSearchSource("local");
      setExternalSearchTriggered(false);
    }
  }, [debouncedQuery, localFilteredTracks.length, fetchExternalTracks]);

  // Combined tracks to display
  const displayTracks = useMemo(() => {
    if (debouncedQuery.length > 0) {
      if (localFilteredTracks.length >= 3) {
        return localFilteredTracks;
      }
      // Deduplicate external results
      const existingIds = new Set(localFilteredTracks.map((t) => t.title.toLowerCase()));
      const filteredExternal = externalResults.filter(
        (ext) => !existingIds.has(ext.title.toLowerCase())
      );
      return [...localFilteredTracks, ...filteredExternal];
    }
    return localFilteredTracks;
  }, [debouncedQuery, localFilteredTracks, externalResults]);

  // -------------------------------------------------------------
  // Pagination (15 tracks per page)
  // -------------------------------------------------------------
  const MUSIC_PAGE_SIZE = 15;
  const [musicPage, setMusicPage] = useState(1);

  // Reset to page 1 whenever filters or search changes
  useEffect(() => { setMusicPage(1); }, [debouncedQuery, selectedGenre, selectedMood]);

  const musicTotalPages = Math.max(1, Math.ceil(displayTracks.length / MUSIC_PAGE_SIZE));
  const musicValidPage = Math.min(musicPage, musicTotalPages);
  const musicStartIdx = (musicValidPage - 1) * MUSIC_PAGE_SIZE;
  const musicEndIdx = Math.min(musicStartIdx + MUSIC_PAGE_SIZE, displayTracks.length);
  const paginatedTracks = displayTracks.slice(musicStartIdx, musicEndIdx);

  const getMusicPageNumbers = () => {
    if (musicTotalPages <= 7) return Array.from({ length: musicTotalPages }, (_, i) => i + 1);
    const pages = [1];
    if (musicValidPage > 3) pages.push("...");
    const start = Math.max(2, musicValidPage - 1);
    const end = Math.min(musicTotalPages - 1, musicValidPage + 1);
    for (let p = start; p <= end; p++) pages.push(p);
    if (musicValidPage < musicTotalPages - 2) pages.push("...");
    pages.push(musicTotalPages);
    return pages;
  };

  // -------------------------------------------------------------
  // Manual Web Search trigger from Empty State or Button
  // -------------------------------------------------------------
  const handleForceGlobalSearch = () => {
    const q = debouncedQuery || (selectedMood ? `${selectedGenre} ${selectedMood} songs` : selectedGenre);
    fetchExternalTracks(q);
  };

  // -------------------------------------------------------------
  // Audio Playback Engine (HTML5 Audio + Web Audio Synth Fallback)
  // -------------------------------------------------------------
  const startSynthFallback = useCallback((track) => {
    stopSynthesizer();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsSynthPlaying(true);
    setIsPlaying(true);
    setDuration(30);

    const moodKey = track.moodIds?.[0] || "feelgood";
    playSynthesizedPreview({
      moodId: moodKey,
      onProgress: (elapsed, dur) => {
        setCurrentTime(elapsed);
        setDuration(dur);
      },
      onEnded: () => {
        setIsPlaying(false);
        setIsSynthPlaying(false);
        setCurrentTime(0);
      }
    });
  }, []);

  const playTrack = useCallback(
    (track) => {
      if (!track) return;

      // Toggle pause if clicked same track
      if (currentTrack?.id === track.id) {
        if (isPlaying) {
          if (isSynthPlaying) {
            stopSynthesizer();
            setIsSynthPlaying(false);
          } else if (audioRef.current) {
            audioRef.current.pause();
          }
          setIsPlaying(false);
        } else {
          if (isSynthPlaying || !track.previewUrl) {
            startSynthFallback(track);
          } else if (audioRef.current) {
            audioRef.current.play().catch(() => startSynthFallback(track));
            setIsPlaying(true);
          }
        }
        return;
      }

      // Switching to a new track
      stopSynthesizer();
      setIsSynthPlaying(false);
      setCurrentTrack(track);
      setCurrentTime(0);

      if (!track.previewUrl) {
        // Automatically generate synth preview fallback
        startSynthFallback(track);
        return;
      }

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.pause();
      audioRef.current.src = track.previewUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.currentTime = 0;

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsSynthPlaying(false);
          })
          .catch((err) => {
            console.warn("Direct preview playback failed, activating procedural audio synth:", err);
            startSynthFallback(track);
          });
      }
    },
    [currentTrack, isPlaying, isSynthPlaying, isMuted, volume, startSynthFallback]
  );

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isSynthPlaying) {
        setCurrentTime(audio.currentTime);
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      }
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleNextTrack();
      }
    };

    const handleError = () => {
      console.warn("Audio element error, falling back to synth preview");
      if (currentTrack) {
        startSynthFallback(currentTrack);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  });

  // Track next / previous navigation
  const handleNextTrack = useCallback(() => {
    if (!currentTrack || displayTracks.length === 0) return;
    const currentIndex = displayTracks.findIndex((t) => t.id === currentTrack.id);
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * displayTracks.length);
    } else {
      nextIndex = (currentIndex + 1) % displayTracks.length;
    }
    playTrack(displayTracks[nextIndex]);
  }, [currentTrack, displayTracks, isShuffle, playTrack]);

  const handlePrevTrack = useCallback(() => {
    if (!currentTrack || displayTracks.length === 0) return;
    const currentIndex = displayTracks.findIndex((t) => t.id === currentTrack.id);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = displayTracks.length - 1;
    playTrack(displayTracks[prevIndex]);
  }, [currentTrack, displayTracks, playTrack]);

  // Volume & scrubber handling
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (!isSynthPlaying && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume || 0.8;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  // Format seconds to mm:ss
  const formatTime = (timeInSecs) => {
    if (isNaN(timeInSecs)) return "0:00";
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Label for counter
  const selectedGenreObj = GENRES.find((g) => g.id === selectedGenre);
  const selectedMoodObj = MOODS.find((m) => m.id === selectedMood);
  const filterSummary = `${selectedGenreObj?.label || "All Music"}${
    selectedMoodObj ? ` • ${selectedMoodObj.label}` : ""
  }`;

  return (
    <div className={`cyber-player-root ${embedded ? "cyber-player-root--embedded" : ""} ${theme === "light" ? "cyber-player-root--light" : "cyber-player-root--dark"}`}>
      {/* ------------------------------------------------------------- */}
      {/* CYBERPUNK / NEON AESTHETICS STYLE SHEET                        */}
      {/* ------------------------------------------------------------- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .cyber-player-root--embedded {
          background-color: transparent !important;
          background-image: none !important;
          min-height: auto !important;
          padding-bottom: 80px !important;
        }
        .cyber-player-root--embedded .cp-main {
          padding: 4px 0 30px !important;
        }

        .cyber-player-root {
          --bg-slate: #0d1117;
          --bg-surface: #161b22;
          --bg-card: rgba(22, 27, 34, 0.75);
          --bg-card-hover: rgba(30, 38, 49, 0.95);
          --pill-border: #1f293d;
          --pill-hover-border: #00f2fe;
          --cyan-glow: #00f2fe;
          --cyan-dim: rgba(0, 242, 254, 0.15);
          --cyan-border: rgba(0, 242, 254, 0.4);
          --pink-glow: #ec4899;
          --purple-glow: #a855f7;
          --pink-dim: rgba(236, 72, 153, 0.18);
          --text-main: #f0f6fc;
          --text-muted: #8b949e;
          --font-heading: 'Outfit', sans-serif;
          --font-body: 'Plus Jakarta Sans', sans-serif;

          background-color: var(--bg-slate);
          background-image: 
            radial-gradient(circle at 10% 10%, rgba(0, 242, 254, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 90% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 90%, rgba(236, 72, 153, 0.05) 0%, transparent 55%);
          color: var(--text-main);
          font-family: var(--font-body);
          min-height: 100vh;
          padding-bottom: 120px;
          position: relative;
          box-sizing: border-box;
        }

        .cyber-player-root * {
          box-sizing: border-box;
        }

        /* ---------------- TOP NAVBAR ---------------- */
        .cp-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(13, 17, 23, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 242, 254, 0.15);
          padding: 16px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }

        .cp-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
        }

        .cp-brand__icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #00f2fe 0%, #a855f7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0d1117;
          box-shadow: 0 0 20px rgba(0, 242, 254, 0.45);
          animation: cp-pulse-cyan 3s ease-in-out infinite alternate;
        }

        @keyframes cp-pulse-cyan {
          0% { box-shadow: 0 0 12px rgba(0, 242, 254, 0.3); }
          100% { box-shadow: 0 0 26px rgba(0, 242, 254, 0.7); }
        }

        .cp-brand__title {
          font-family: var(--font-heading);
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffffff 40%, #00f2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cp-brand__badge {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: rgba(0, 242, 254, 0.12);
          color: #00f2fe;
          border: 1px solid rgba(0, 242, 254, 0.35);
          padding: 2px 8px;
          border-radius: 999px;
          margin-left: 6px;
        }

        /* ---------------- SEARCH BAR ---------------- */
        .cp-search-wrap {
          flex: 1;
          max-width: 620px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .cp-search-input {
          width: 100%;
          background: #161b22;
          border: 1px solid var(--pill-border);
          border-radius: 999px;
          padding: 12px 48px 12px 46px;
          font-family: var(--font-body);
          font-size: 14.5px;
          color: #ffffff;
          outline: none;
          transition: all 0.25s ease;
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
        }

        .cp-search-input:focus {
          border-color: #00f2fe;
          box-shadow: 0 0 20px rgba(0, 242, 254, 0.3), inset 0 2px 6px rgba(0, 0, 0, 0.4);
          background: #1c2128;
        }

        .cp-search-input::placeholder {
          color: #6e7681;
        }

        .cp-search-icon {
          position: absolute;
          left: 16px;
          color: #00f2fe;
          pointer-events: none;
        }

        .cp-search-clear {
          position: absolute;
          right: 14px;
          background: transparent;
          border: none;
          color: #8b949e;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: color 0.15s ease;
        }
        .cp-search-clear:hover {
          color: #ffffff;
        }

        .cp-cinema-switch-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(168, 85, 247, 0.12);
          border: 1px solid rgba(168, 85, 247, 0.35);
          color: #c084fc;
          font-family: var(--font-heading);
          font-size: 13px;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cp-cinema-switch-btn:hover {
          background: rgba(168, 85, 247, 0.25);
          border-color: #c084fc;
          box-shadow: 0 0 16px rgba(168, 85, 247, 0.4);
          transform: translateY(-1px);
        }

        /* ---------------- MAIN CONTAINER ---------------- */
        .cp-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 28px 24px;
        }

        /* ---------------- SECTION HEADERS & PILL BARS ---------------- */
        .cp-filter-section {
          margin-bottom: 24px;
        }

        .cp-section-label {
          font-family: var(--font-heading);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #00f2fe;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cp-section-label--mood {
          color: #ec4899;
        }

        .cp-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }

        /* Genre Pill Buttons */
        .cp-genre-pill {
          background: #161b22;
          border: 1px solid var(--pill-border);
          border-radius: 999px;
          padding: 8px 18px;
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 600;
          color: #c9d1d9;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          user-select: none;
        }

        .cp-genre-pill:hover {
          border-color: var(--cyan-glow);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 242, 254, 0.2);
        }

        .cp-genre-pill--active {
          background: rgba(0, 242, 254, 0.12) !important;
          border-color: #00f2fe !important;
          color: #00f2fe !important;
          font-weight: 700;
          box-shadow: 0 0 18px rgba(0, 242, 254, 0.45) !important;
        }

        /* Mood Pill Buttons */
        .cp-mood-pill {
          background: #161b22;
          border: 1px solid var(--pill-border);
          border-radius: 999px;
          padding: 8px 18px;
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 600;
          color: #c9d1d9;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          user-select: none;
        }

        .cp-mood-pill:hover {
          border-color: #ec4899;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(236, 72, 153, 0.25);
        }

        .cp-mood-pill--active {
          background: rgba(236, 72, 153, 0.14) !important;
          border-color: #ec4899 !important;
          color: #f472b6 !important;
          font-weight: 700;
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.4) !important;
        }

        /* ---------------- STATUS / COUNTER BAR ---------------- */
        .cp-status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 2px;
          margin-top: 10px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
          gap: 14px;
        }

        .cp-status-counter {
          font-family: var(--font-heading);
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cp-status-badge {
          background: rgba(0, 242, 254, 0.12);
          color: #00f2fe;
          border: 1px solid rgba(0, 242, 254, 0.3);
          padding: 2px 10px;
          border-radius: 999px;
          font-size: 13px;
        }

        .cp-source-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #a855f7;
          background: rgba(168, 85, 247, 0.12);
          border: 1px solid rgba(168, 85, 247, 0.3);
          padding: 4px 12px;
          border-radius: 999px;
        }

        /* ---------------- TRACK CARD GRID ---------------- */
        .cp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .cp-card {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--pill-border);
          border-radius: 16px;
          padding: 16px;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .cp-card:hover {
          background: var(--bg-card-hover);
          border-color: rgba(0, 242, 254, 0.4);
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 242, 254, 0.15);
        }

        .cp-card--playing {
          border-color: #00f2fe !important;
          box-shadow: 0 0 25px rgba(0, 242, 254, 0.35) !important;
        }

        .cp-card__art-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
          margin-bottom: 14px;
          cursor: pointer;
        }

        .cp-card__art {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .cp-card:hover .cp-card__art {
          transform: scale(1.05);
        }

        .cp-card__play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(13, 17, 23, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .cp-card:hover .cp-card__play-overlay,
        .cp-card--playing .cp-card__play-overlay {
          opacity: 1;
        }

        .cp-card__play-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #00f2fe;
          color: #0d1117;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 25px rgba(0, 242, 254, 0.8);
          transform: scale(0.9);
          transition: transform 0.2s ease;
        }

        .cp-card:hover .cp-card__play-icon-circle {
          transform: scale(1);
        }

        .cp-card__body {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .cp-card__title {
          font-family: var(--font-heading);
          font-size: 16.5px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cp-card__artist {
          font-size: 13.5px;
          color: var(--text-muted);
          margin: 0 0 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cp-card__badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 14px;
        }

        .cp-card-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          letter-spacing: 0.02em;
        }

        .cp-card-badge--genre {
          background: rgba(0, 242, 254, 0.1);
          color: #00f2fe;
          border: 1px solid rgba(0, 242, 254, 0.25);
        }

        .cp-card-badge--mood {
          background: rgba(236, 72, 153, 0.1);
          color: #f472b6;
          border: 1px solid rgba(236, 72, 153, 0.25);
        }

        .cp-card__footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .cp-card__dur {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }

        /* Inline Play / Pause Button with Visualizer */
        .cp-inline-play-btn {
          background: rgba(0, 242, 254, 0.1);
          border: 1px solid rgba(0, 242, 254, 0.3);
          color: #00f2fe;
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          font-family: var(--font-body);
        }

        .cp-inline-play-btn:hover {
          background: #00f2fe;
          color: #0d1117;
          box-shadow: 0 0 16px rgba(0, 242, 254, 0.5);
        }

        .cp-inline-play-btn--active {
          background: #00f2fe !important;
          color: #0d1117 !important;
          box-shadow: 0 0 20px rgba(0, 242, 254, 0.7) !important;
        }

        /* Animated Audio Visualizer Bars */
        .cp-visualizer {
          display: inline-flex;
          align-items: flex-end;
          gap: 2.5px;
          height: 14px;
        }

        .cp-bar {
          width: 3px;
          background: currentColor;
          border-radius: 999px;
          animation: cp-bounce 1s infinite ease-in-out;
        }

        .cp-bar:nth-child(1) { height: 40%; animation-delay: 0.1s; }
        .cp-bar:nth-child(2) { height: 90%; animation-delay: 0.3s; }
        .cp-bar:nth-child(3) { height: 60%; animation-delay: 0.2s; }
        .cp-bar:nth-child(4) { height: 100%; animation-delay: 0.4s; }

        @keyframes cp-bounce {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }

        /* Quick Action Floating Poster Buttons */
        .cp-card__poster-actions {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 5;
          opacity: 0;
          transform: translateX(4px);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cp-card:hover .cp-card__poster-actions {
          opacity: 1;
          transform: translateX(0);
        }
        .cp-poster-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(13, 17, 23, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #f0f6fc;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
          text-decoration: none;
        }
        .cp-poster-btn:hover {
          transform: scale(1.1);
          border-color: #00f2fe;
          color: #00f2fe;
          box-shadow: 0 0 12px rgba(0, 242, 254, 0.4);
        }
        .cp-poster-btn--active {
          background: #00f2fe !important;
          color: #0d1117 !important;
          border-color: #00f2fe !important;
        }
        .cp-poster-btn--spotify:hover {
          border-color: #1ed760;
          color: #1ed760;
          box-shadow: 0 0 12px rgba(30, 215, 96, 0.4);
        }
        .cp-poster-btn--yt:hover {
          border-color: #ff4444;
          color: #ff4444;
          box-shadow: 0 0 12px rgba(255, 68, 68, 0.4);
        }
        .cp-poster-btn--lyrics:hover {
          border-color: #fde047;
          color: #fde047;
          box-shadow: 0 0 12px rgba(253, 224, 71, 0.4);
        }

        /* Top Badges on Artwork */
        .cp-card__top-badges {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 5;
        }
        .cp-top-chip {
          background: rgba(13, 17, 23, 0.88);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #e2e8f0;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .cp-top-chip--type {
          background: rgba(168, 85, 247, 0.25);
          border-color: rgba(168, 85, 247, 0.5);
          color: #d8b4fe;
        }
        .cp-top-chip--rating {
          background: rgba(234, 179, 8, 0.2);
          border-color: rgba(234, 179, 8, 0.4);
          color: #fde047;
        }

        /* Card Meta & Vibe */
        .cp-card__meta-line {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .cp-card__meta-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .cp-card__vibe-box {
          background: rgba(0, 242, 254, 0.04);
          border: 1px solid rgba(0, 242, 254, 0.15);
          border-radius: 8px;
          padding: 8px 10px;
          margin-bottom: 12px;
          font-size: 11.5px;
          color: #93c5fd;
          line-height: 1.4;
          display: flex;
          align-items: flex-start;
          gap: 6px;
        }

        /* Platforms Strip: Available on Spotify, YouTube, Apple Music */
        .cp-card__platforms-strip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .cp-platforms-label {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--text-muted);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-right: 2px;
        }
        .cp-platform-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 7px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .cp-platform-chip--spotify {
          background: rgba(29, 185, 84, 0.15);
          color: #1ed760;
          border-color: rgba(29, 185, 84, 0.3);
        }
        .cp-platform-chip--spotify:hover {
          background: rgba(29, 185, 84, 0.3);
          box-shadow: 0 0 10px rgba(29, 185, 84, 0.4);
        }
        .cp-platform-chip--yt {
          background: rgba(255, 0, 0, 0.12);
          color: #ff6b6b;
          border-color: rgba(255, 0, 0, 0.25);
        }
        .cp-platform-chip--yt:hover {
          background: rgba(255, 0, 0, 0.25);
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.4);
        }
        .cp-platform-chip--apple {
          background: rgba(250, 45, 72, 0.12);
          color: #fa586a;
          border-color: rgba(250, 45, 72, 0.25);
        }
        .cp-platform-chip--apple:hover {
          background: rgba(250, 45, 72, 0.25);
          box-shadow: 0 0 10px rgba(250, 45, 72, 0.4);
        }

        /* Action Buttons CTA Row (Preview, Spotify, Lyrics, YouTube) */
        .cp-card__cta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .cp-cta-btn {
          flex: 1;
          min-width: 65px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 7px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          font-family: var(--font-body);
        }
        .cp-cta-btn--preview {
          background: rgba(0, 242, 254, 0.12);
          border-color: rgba(0, 242, 254, 0.35);
          color: #00f2fe;
        }
        .cp-cta-btn--preview:hover,
        .cp-cta-btn--preview.cp-cta-btn--active {
          background: #00f2fe;
          color: #0d1117;
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.5);
        }
        .cp-cta-btn--spotify {
          background: rgba(29, 185, 84, 0.14);
          border-color: rgba(29, 185, 84, 0.35);
          color: #1ed760;
        }
        .cp-cta-btn--spotify:hover {
          background: #1ed760;
          color: #0d1117;
          box-shadow: 0 0 15px rgba(29, 185, 84, 0.5);
        }
        .cp-cta-btn--lyrics {
          background: rgba(234, 179, 8, 0.12);
          border-color: rgba(234, 179, 8, 0.35);
          color: #fde047;
        }
        .cp-cta-btn--lyrics:hover {
          background: #fde047;
          color: #0d1117;
          box-shadow: 0 0 15px rgba(234, 179, 8, 0.5);
        }
        .cp-cta-btn--yt {
          background: rgba(255, 0, 0, 0.12);
          border-color: rgba(255, 0, 0, 0.35);
          color: #ff6b6b;
        }
        .cp-cta-btn--yt:hover {
          background: #ff4444;
          color: #ffffff;
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
        }

        /* Accordion Drawer */
        .cp-card__accordion-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 10px 2px 2px;
          margin-top: 12px;
          color: var(--text-muted);
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .cp-card__accordion-toggle:hover {
          color: #00f2fe;
        }
        .cp-card__drawer {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: cpSlideDown 0.25s ease;
        }
        @keyframes cpSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cp-drawer-block {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 10px;
        }
        .cp-drawer-heading {
          font-size: 11px;
          font-weight: 700;
          color: #00f2fe;
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .cp-drawer-desc {
          font-size: 12px;
          color: #c9d1d9;
          line-height: 1.5;
          margin: 0;
        }
        .cp-drawer-lyrics-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(234, 179, 8, 0.15);
          border: 1px solid rgba(234, 179, 8, 0.35);
          color: #fde047;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
          width: 100%;
          justify-content: center;
        }
        .cp-drawer-lyrics-cta:hover {
          background: #fde047;
          color: #0d1117;
          box-shadow: 0 0 12px rgba(234, 179, 8, 0.4);
        }

        /* ---------------- EMPTY STATE CARD ---------------- */
        .cp-empty-card {
          grid-column: 1 / -1;
          background: rgba(22, 27, 34, 0.6);
          border: 1px dashed rgba(0, 242, 254, 0.3);
          border-radius: 20px;
          padding: 60px 24px;
          text-align: center;
          margin: 20px 0;
        }

        .cp-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: rgba(0, 242, 254, 0.1);
          color: #00f2fe;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          box-shadow: 0 0 25px rgba(0, 242, 254, 0.2);
        }

        .cp-empty-title {
          font-family: var(--font-heading);
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 10px;
        }

        .cp-empty-subtitle {
          color: var(--text-muted);
          font-size: 14.5px;
          max-width: 520px;
          margin: 0 auto 24px;
          line-height: 1.6;
        }

        .cp-empty-btn {
          background: linear-gradient(135deg, #00f2fe 0%, #a855f7 100%);
          border: none;
          color: #0d1117;
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 14px;
          padding: 12px 28px;
          border-radius: 999px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 0 25px rgba(0, 242, 254, 0.4);
          transition: all 0.2s ease;
        }

        .cp-empty-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 35px rgba(0, 242, 254, 0.7);
        }

        /* ---------------- PERSISTENT BOTTOM AUDIO DOCK / MINI-PLAYER ---------------- */
        .cp-dock {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 200;
          background: rgba(13, 17, 23, 0.94);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-top: 1px solid rgba(0, 242, 254, 0.35);
          box-shadow: 0 -15px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 242, 254, 0.15);
          padding: 12px 24px;
          animation: cp-slide-up 0.3s ease-out;
        }

        @keyframes cp-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .cp-dock-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 300px 1fr 260px;
          align-items: center;
          gap: 20px;
        }

        /* Dock Left: Track Info */
        .cp-dock-track {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .cp-dock-art {
          width: 52px;
          height: 52px;
          border-radius: 10px;
          object-fit: cover;
          border: 1px solid rgba(0, 242, 254, 0.4);
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
          flex-shrink: 0;
        }

        .cp-dock-meta {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .cp-dock-title {
          font-family: var(--font-heading);
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin: 0;
        }

        .cp-dock-artist {
          font-size: 12px;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin: 2px 0 0;
        }

        .cp-dock-preview-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #00f2fe;
          background: rgba(0, 242, 254, 0.12);
          border: 1px solid rgba(0, 242, 254, 0.3);
          padding: 1px 6px;
          border-radius: 4px;
          width: fit-content;
          margin-top: 4px;
        }

        .cp-dock-preview-pill--synth {
          color: #ec4899;
          background: rgba(236, 72, 153, 0.12);
          border-color: rgba(236, 72, 153, 0.3);
        }

        /* Dock Center: Controls & Scrubber */
        .cp-dock-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .cp-dock-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .cp-dock-btn {
          background: transparent;
          border: none;
          color: #c9d1d9;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 50%;
          transition: all 0.18s ease;
        }

        .cp-dock-btn:hover {
          color: #00f2fe;
          transform: scale(1.15);
        }

        .cp-dock-btn--active {
          color: #00f2fe !important;
        }

        .cp-dock-play-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #00f2fe;
          color: #0d1117;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(0, 242, 254, 0.7);
          transition: transform 0.2s ease;
        }

        .cp-dock-play-circle:hover {
          transform: scale(1.08);
          box-shadow: 0 0 30px rgba(0, 242, 254, 0.9);
        }

        .cp-scrubber-wrap {
          width: 100%;
          max-width: 580px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cp-time {
          font-size: 11.5px;
          font-weight: 600;
          color: #8b949e;
          min-width: 34px;
          text-align: center;
        }

        .cp-slider {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: #30363d;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
          position: relative;
        }

        .cp-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #00f2fe;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 242, 254, 0.8);
          transition: transform 0.1s ease;
        }

        .cp-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }

        /* Dock Right: Volume & External Links */
        .cp-dock-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
        }

        .cp-vol-slider {
          width: 80px;
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: #30363d;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }

        .cp-vol-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #c9d1d9;
          cursor: pointer;
        }

        .cp-dock-ext-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }

        .cp-dock-ext-btn:hover {
          background: rgba(29, 185, 84, 0.2);
          border-color: #1ed760;
          color: #ffffff;
        }

        /* ---------------- RESPONSIVE BREAKPOINTS ---------------- */
        @media (max-width: 900px) {
          .cp-header {
            flex-direction: column;
            align-items: stretch;
            padding: 14px 16px;
          }
          .cp-brand {
            justify-content: space-between;
          }
          .cp-dock-inner {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .cp-dock-right {
            display: none;
          }
          .cyber-player-root {
            padding-bottom: 160px;
          }
        }

        /* ---------------- LIGHT MODE STYLING ---------------- */
        .cyber-player-root--light {
          --bg-slate: #f8fafc;
          --bg-surface: #ffffff;
          --bg-card: #ffffff;
          --bg-card-hover: #f1f5f9;
          --pill-border: rgba(0, 0, 0, 0.12);
          --pill-hover-border: #0284c7;
          --cyan-glow: #0284c7;
          --cyan-dim: rgba(2, 132, 199, 0.12);
          --cyan-border: rgba(2, 132, 199, 0.35);
          color: #0f172a !important;
          background: #f8fafc !important;
        }

        .cyber-player-root--light .cp-header {
          background: rgba(255, 255, 255, 0.92) !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
        }

        .cyber-player-root--light .cp-brand__title {
          color: #0f172a !important;
          background: linear-gradient(135deg, #0f172a 30%, #0284c7 85%, #4f46e5 100%) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        }

        .cyber-player-root--light .cp-brand__badge {
          background: #e0f2fe !important;
          color: #0369a1 !important;
          border: 1px solid #7dd3fc !important;
          font-weight: 700 !important;
        }

        .cyber-player-root--light .cp-search-wrap {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.15) !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04) !important;
        }

        .cyber-player-root--light .cp-search-input {
          color: #0f172a !important;
          font-weight: 500;
        }

        .cyber-player-root--light .cp-search-input::placeholder {
          color: #64748b !important;
        }

        .cyber-player-root--light .cp-search-icon,
        .cyber-player-root--light .cp-search-clear {
          color: #475569 !important;
        }

        .cyber-player-root--light .cp-search-clear:hover {
          color: #0f172a !important;
        }

        .cyber-player-root--light .cp-cinema-switch-btn {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.12) !important;
          color: #334155 !important;
          font-weight: 600 !important;
        }

        .cyber-player-root--light .cp-cinema-switch-btn:hover {
          background: #f1f5f9 !important;
          color: #0284c7 !important;
          border-color: #0284c7 !important;
        }

        .cyber-player-root--light .cp-section-label,
        .cyber-player-root--light .cp-section-label--mood {
          color: #0f172a !important;
          font-weight: 800 !important;
        }

        .cyber-player-root--light .cp-pill {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.12) !important;
          color: #1e293b !important;
          font-weight: 600 !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03) !important;
        }

        .cyber-player-root--light .cp-pill:hover {
          background: #f1f5f9 !important;
          color: #0284c7 !important;
          border-color: #0284c7 !important;
        }

        .cyber-player-root--light .cp-pill--active {
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%) !important;
          color: #ffffff !important;
          border-color: transparent !important;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3) !important;
        }

        .cyber-player-root--light .cp-track-card {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04) !important;
        }

        .cyber-player-root--light .cp-track-card:hover {
          border-color: #0284c7 !important;
          box-shadow: 0 8px 24px rgba(2, 132, 199, 0.12) !important;
        }

        .cyber-player-root--light .cp-track-card__title {
          color: #0f172a !important;
          font-weight: 700 !important;
        }

        .cyber-player-root--light .cp-track-card__artist {
          color: #334155 !important;
          font-weight: 600 !important;
        }

        .cyber-player-root--light .cp-track-card__meta,
        .cyber-player-root--light .cp-track-card__year {
          color: #475569 !important;
          font-weight: 600 !important;
        }

        .cyber-player-root--light .cp-track-card__genre {
          background: #e0f2fe !important;
          color: #0369a1 !important;
          border: 1px solid #bae6fd !important;
          font-weight: 600 !important;
        }

        .cyber-player-root--light .cp-track-card__mood {
          background: #faf5ff !important;
          color: #7e22ce !important;
          border: 1px solid #e9d5ff !important;
          font-weight: 600 !important;
        }

        .cyber-player-root--light .cp-action-btn {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.12) !important;
          color: #334155 !important;
        }

        .cyber-player-root--light .cp-action-btn:hover {
          background: #f1f5f9 !important;
          color: #0f172a !important;
          border-color: #0284c7 !important;
        }

        .cyber-player-root--light .cp-now-playing-bar {
          background: rgba(255, 255, 255, 0.96) !important;
          border-top: 1px solid rgba(0, 0, 0, 0.1) !important;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08) !important;
        }

        .cyber-player-root--light .cp-np__title {
          color: #0f172a !important;
          font-weight: 700 !important;
        }

        .cyber-player-root--light .cp-np__artist {
          color: #334155 !important;
          font-weight: 600 !important;
        }

        .cyber-player-root--light .cp-np__time {
          color: #475569 !important;
          font-weight: 600 !important;
        }

        .cyber-player-root--light .cp-np__ctrl-btn {
          color: #334155 !important;
        }

        .cyber-player-root--light .cp-np__ctrl-btn:hover {
          color: #0284c7 !important;
        }

        .cyber-player-root--light .cp-np__play-btn {
          background: #0284c7 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3) !important;
        }

        .cyber-player-root--light .cp-seek-slider {
          background: #e2e8f0 !important;
        }

        .cyber-player-root--light .cp-lyrics-modal {
          background: #ffffff !important;
          border: 1px solid rgba(0, 0, 0, 0.12) !important;
          color: #0f172a !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
        }

        .cyber-player-root--light .cp-lyrics-title {
          color: #0f172a !important;
          font-weight: 800 !important;
        }

        .cyber-player-root--light .cp-lyrics-artist {
          color: #334155 !important;
          font-weight: 600 !important;
        }

        .cyber-player-root--light .cp-lyrics-content {
          color: #1e293b !important;
          line-height: 1.8 !important;
        }

        .cyber-player-root--light .cp-empty-text {
          color: #475569 !important;
        }
      `}</style>

      {/* ---------------- MAIN VIEW ---------------- */}
      <main className="cp-main">
        {/* Genre & Mood Selector Pills - Only rendered when not embedded to avoid duplicate rows */}
        {!embedded && (
          <>
            <section className="cp-filter-section">
              <div className="cp-section-label">
                <Globe size={14} />
                <span>CHOOSE MUSIC REGION / GENRE:</span>
              </div>
              <div className="cp-pills-row">
                {GENRES.map((genre) => {
                  const isActive = selectedGenre === genre.id;
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      className={`cp-genre-pill ${isActive ? "cp-genre-pill--active" : ""}`}
                      onClick={() => setSelectedGenre(genre.id)}
                    >
                      <span>{genre.flag}</span>
                      <span>{genre.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="cp-filter-section">
              <div className="cp-section-label cp-section-label--mood">
                <Flame size={14} />
                <span>SELECT YOUR MOOD:</span>
              </div>
              <div className="cp-pills-row">
                {MOODS.map((mood) => {
                  const isActive = selectedMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      className={`cp-mood-pill ${isActive ? "cp-mood-pill--active" : ""}`}
                      onClick={() => {
                        setSelectedMood(isActive ? null : mood.id);
                      }}
                    >
                      <span>{mood.icon}</span>
                      <span>{mood.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Counter and Source Status Bar */}
        <div className="cp-status-bar">
          <div className="cp-status-counter">
            {debouncedQuery.length > 0 ? (
              <>
                <span>Search results for "{debouncedQuery}"</span>
                <span className="cp-status-badge">{displayTracks.length} tracks</span>
              </>
            ) : (
              <>
                <span>Showing {musicStartIdx + 1}–{musicEndIdx} of {displayTracks.length} songs for</span>
                <span className="cp-status-badge">{filterSummary}</span>
              </>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isSearchingExternal && (
              <span className="cp-source-badge" style={{ color: "#00f2fe" }}>
                <Sparkles size={12} />
                <span>Searching iTunes Live Catalog...</span>
              </span>
            )}
            {searchSource === "itunes" && (
              <span className="cp-source-badge">
                <Globe size={12} />
                <span>iTunes Live Audio Stream</span>
              </span>
            )}
            {searchSource === "mixed" && (
              <span className="cp-source-badge">
                <Layers size={12} />
                <span>Vault &amp; Global Feed</span>
              </span>
            )}
          </div>
        </div>

        {/* Track Grid */}
        <div className="cp-grid">
          {paginatedTracks.map((track) => {
            const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;
            const isExpanded = expandedTrackId === track.id;

            const spotifyLink = track.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(track.title + " " + track.artist)}`;
            const youtubeLink = track.youtubeUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(track.title + " " + track.artist + " official audio")}`;
            const appleMusicLink = track.appleMusicUrl || `https://music.apple.com/us/search?term=${encodeURIComponent(track.title + " " + track.artist)}`;
            const lyricsLink = getLyricsSearchUrl(track.title, track.artist);
            const isWatchlisted = savedMedia.some((s) => s.id === track.id && s.isWatchlist);
            const isFavourited = savedMedia.some((s) => s.id === track.id && s.isFavourite);

            return (
              <div
                key={track.id}
                className={`cp-card ${isThisTrackPlaying ? "cp-card--playing" : ""}`}
                onClick={() => playTrack(track)}
              >
                {/* Album Art with Floating Poster Actions Overlay */}
                <div className="cp-card__art-wrap">
                  <img
                    src={track.artworkUrl}
                    alt={track.title}
                    className="cp-card__art"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="cp-card__top-badges">
                    <span className="cp-top-chip cp-top-chip--type">
                      <Music size={11} /> Song
                    </span>
                    <span className="cp-top-chip cp-top-chip--rating">
                      <Star size={11} fill="currentColor" /> 9.9
                    </span>
                  </div>

                  {/* Floating Quick Actions Overlay on Poster */}
                  <div className="cp-card__poster-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={`cp-poster-btn ${isThisTrackPlaying ? "cp-poster-btn--active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track);
                      }}
                      title={isThisTrackPlaying ? "Pause 30s Audio Preview" : "Play 30s Audio Preview"}
                      aria-label="Play 30s Audio Preview"
                    >
                      {isThisTrackPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: 2 }} />}
                    </button>
                    <a
                      href={spotifyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-poster-btn cp-poster-btn--spotify"
                      title="Open on Spotify"
                      aria-label="Open on Spotify"
                    >
                      <Music size={14} />
                    </a>
                    <a
                      href={lyricsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-poster-btn cp-poster-btn--lyrics"
                      title="Read song lyrics on Google"
                      aria-label="Read song lyrics"
                    >
                      <Mic2 size={14} />
                    </a>
                    {onToggleWatchlist && (
                      <button
                        type="button"
                        className="cp-poster-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist({ ...track, type: "song" });
                        }}
                        title={isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
                        style={{ color: isWatchlisted ? "#00f2fe" : "#ffffff" }}
                      >
                        <Bookmark size={14} fill={isWatchlisted ? "currentColor" : "none"} />
                      </button>
                    )}
                    {onToggleFavourite && (
                      <button
                        type="button"
                        className="cp-poster-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavourite({ ...track, type: "song" });
                        }}
                        title={isFavourited ? "In Favourites" : "Add to Favourites"}
                        style={{ color: isFavourited ? "#ec4899" : "#ffffff" }}
                      >
                        <Heart size={14} fill={isFavourited ? "currentColor" : "none"} />
                      </button>
                    )}
                    <a
                      href={youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-poster-btn cp-poster-btn--yt"
                      title="Watch music video on YouTube"
                      aria-label="Watch music video on YouTube"
                    >
                      <Youtube size={14} />
                    </a>
                  </div>

                  {/* Center Hover Play Overlay */}
                  <div className="cp-card__play-overlay">
                    <div className="cp-card__play-icon-circle">
                      {isThisTrackPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 3 }} />}
                    </div>
                  </div>
                </div>

                {/* Track Details */}
                <div className="cp-card__body">
                  <h3 className="cp-card__title" title={track.title}>
                    {track.title}
                  </h3>

                  <div className="cp-card__meta-line">
                    <span className="cp-card__meta-item">
                      <Calendar size={11} /> {track.year || 2023}
                    </span>
                    <span>•</span>
                    <span className="cp-card__meta-item">
                      <Clock size={11} /> {track.duration}
                    </span>
                  </div>

                  <p className="cp-card__artist" title={track.artist}>
                    {track.artist}
                  </p>

                  <div className="cp-card__badges">
                    <span className="cp-card-badge cp-card-badge--genre">
                      {track.genreName}
                    </span>
                    <span className="cp-card-badge cp-card-badge--mood">
                      {track.moodName}
                    </span>
                  </div>

                  {/* Vibe Quote */}
                  <div className="cp-card__vibe-box">
                    <Sparkles size={13} style={{ flexShrink: 0, marginTop: 2, color: "#00f2fe" }} />
                    <span>{track.vibe || track.reason || track.blurb || `${track.moodName} rhythm & soundscape by ${track.artist}`}</span>
                  </div>

                  {/* Available On Platforms Strip */}
                  <div className="cp-card__platforms-strip" onClick={(e) => e.stopPropagation()}>
                    <span className="cp-platforms-label">
                      <Headphones size={11} /> Available on:
                    </span>
                    <a
                      href={spotifyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-platform-chip cp-platform-chip--spotify"
                      title="Listen on Spotify"
                    >
                      <Music size={10} /> Spotify
                    </a>
                    <a
                      href={youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-platform-chip cp-platform-chip--yt"
                      title="Watch on YouTube"
                    >
                      <Youtube size={10} /> YouTube
                    </a>
                    <a
                      href={appleMusicLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-platform-chip cp-platform-chip--apple"
                      title="Listen on Apple Music"
                    >
                      <ExternalLink size={10} /> Apple
                    </a>
                  </div>

                  {/* Bottom Action CTA Row */}
                  <div className="cp-card__cta-row" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={`cp-cta-btn cp-cta-btn--preview ${isThisTrackPlaying ? "cp-cta-btn--active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track);
                      }}
                      title={isThisTrackPlaying ? "Pause 30s Preview" : "Play 30s Audio Preview"}
                    >
                      {isThisTrackPlaying ? (
                        <>
                          <div className="cp-visualizer">
                            <span className="cp-bar"></span>
                            <span className="cp-bar"></span>
                            <span className="cp-bar"></span>
                            <span className="cp-bar"></span>
                          </div>
                          <span>Playing</span>
                        </>
                      ) : (
                        <>
                          <Play size={12} fill="currentColor" />
                          <span>30s Preview</span>
                        </>
                      )}
                    </button>

                    <a
                      href={spotifyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-cta-btn cp-cta-btn--spotify"
                      title="Listen to full track on Spotify"
                    >
                      <Music size={12} />
                      <span>Spotify</span>
                      <ExternalLink size={10} />
                    </a>

                    <a
                      href={lyricsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-cta-btn cp-cta-btn--lyrics"
                      title="Read complete song lyrics"
                    >
                      <Mic2 size={12} />
                      <span>Lyrics</span>
                      <ExternalLink size={10} />
                    </a>

                    <a
                      href={youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cp-cta-btn cp-cta-btn--yt"
                      title="Watch music video on YouTube"
                    >
                      <Youtube size={12} />
                      <span>Video</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  {/* Expandable "Story, Lyrics & Vibes ⌵" Accordion */}
                  <button
                    type="button"
                    className="cp-card__accordion-toggle"
                    onClick={(e) => toggleTrackAccordion(track.id, e)}
                    title="Toggle Story, Lyrics & Vibes"
                  >
                    <span>Story, Lyrics &amp; Vibes</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isExpanded && (
                    <div className="cp-card__drawer" onClick={(e) => e.stopPropagation()}>
                      <div className="cp-drawer-block">
                        <div className="cp-drawer-heading">
                          <Film size={12} />
                          <span>Song Meaning &amp; Story</span>
                        </div>
                        <p className="cp-drawer-desc">
                          {track.overview || track.blurb || `"${track.title}" by ${track.artist} is a standout ${track.genreName} track crafted for ${track.moodName} moments.`}
                        </p>
                      </div>

                      <div className="cp-drawer-block">
                        <div className="cp-drawer-heading">
                          <Mic2 size={12} />
                          <span>Song Lyrics &amp; Words</span>
                        </div>
                        <a
                          href={lyricsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cp-drawer-lyrics-cta"
                          title={`Open lyrics for "${track.title}"`}
                        >
                          <FileText size={13} />
                          <span>Read "{track.title}" Lyrics ↗</span>
                        </a>
                      </div>

                      <div className="cp-drawer-block">
                        <div className="cp-drawer-heading">
                          <Headphones size={12} />
                          <span>Stream &amp; Listen Platforms</span>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                          <a
                            href={spotifyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cp-platform-chip cp-platform-chip--spotify"
                            style={{ padding: "6px 10px" }}
                          >
                            <Music size={12} /> Open in Spotify ↗
                          </a>
                          <a
                            href={youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cp-platform-chip cp-platform-chip--yt"
                            style={{ padding: "6px 10px" }}
                          >
                            <Youtube size={12} /> Watch on YouTube ↗
                          </a>
                          <a
                            href={appleMusicLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cp-platform-chip cp-platform-chip--apple"
                            style={{ padding: "6px 10px" }}
                          >
                            <ExternalLink size={12} /> Apple Music ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty State Fallback Card */}
          {displayTracks.length === 0 && !isSearchingExternal && (
            <div className="cp-empty-card">
              <div className="cp-empty-icon">
                <Music size={28} />
              </div>
              <h3 className="cp-empty-title">No exact match found in preset</h3>
              <p className="cp-empty-subtitle">
                We couldn't find any songs matching this combination in the offline seed database.
                Hit the button below or press Enter to query the global live web catalog.
              </p>
              <button
                type="button"
                className="cp-empty-btn"
                onClick={handleForceGlobalSearch}
              >
                <Sparkles size={16} />
                <span>Search Global Web Catalog</span>
              </button>
            </div>
          )}
        </div>

        {/* Songs Pagination */}
        {musicTotalPages > 1 && displayTracks.length > 0 && (
          <div className="rr-pagination" id="cp-pagination-bar" style={{ marginTop: 24, marginBottom: 8 }}>
            <button
              type="button"
              className="rr-page-btn rr-page-btn--prev"
              onClick={() => { if (musicValidPage > 1) { setMusicPage(musicValidPage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
              disabled={musicValidPage === 1}
              aria-label="Previous Page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              <span>Previous</span>
            </button>

            <div className="rr-page-numbers">
              {getMusicPageNumbers().map((p, idx) =>
                p === "..." ? (
                  <span key={`mdots-${idx}`} className="rr-page-ellipsis">&hellip;</span>
                ) : (
                  <button
                    key={`mpage-${p}`}
                    type="button"
                    className={`rr-page-num ${p === musicValidPage ? "rr-page-num--active" : ""}`}
                    onClick={() => { setMusicPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    aria-label={`Go to page ${p}`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              className="rr-page-btn rr-page-btn--next"
              onClick={() => { if (musicValidPage < musicTotalPages) { setMusicPage(musicValidPage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
              disabled={musicValidPage === musicTotalPages}
              aria-label="Next Page"
            >
              <span>Next</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        )}
      </main>

      {/* ---------------- PERSISTENT BOTTOM AUDIO DOCK / MINI-PLAYER ---------------- */}
      {currentTrack && (
        <div className="cp-dock">
          <div className="cp-dock-inner">
            {/* Dock Left: Track info */}
            <div className="cp-dock-track">
              <img
                src={currentTrack.artworkUrl}
                alt={currentTrack.title}
                className="cp-dock-art"
              />
              <div className="cp-dock-meta">
                <p className="cp-dock-title" title={currentTrack.title}>
                  {currentTrack.title}
                </p>
                <p className="cp-dock-artist" title={currentTrack.artist}>
                  {currentTrack.artist}
                </p>
                {isSynthPlaying ? (
                  <span className="cp-dock-preview-pill cp-dock-preview-pill--synth">
                    Ambient Synth Preview
                  </span>
                ) : (
                  <span className="cp-dock-preview-pill">
                    30s Audio Stream
                  </span>
                )}
              </div>
            </div>

            {/* Dock Center: Play Controls & Seek Scrubber */}
            <div className="cp-dock-center">
              <div className="cp-dock-controls">
                <button
                  type="button"
                  className={`cp-dock-btn ${isShuffle ? "cp-dock-btn--active" : ""}`}
                  onClick={() => setIsShuffle(!isShuffle)}
                  title="Shuffle"
                >
                  <Shuffle size={15} />
                </button>
                <button
                  type="button"
                  className="cp-dock-btn"
                  onClick={handlePrevTrack}
                  title="Previous Track"
                >
                  <SkipBack size={18} />
                </button>
                <button
                  type="button"
                  className="cp-dock-play-circle"
                  onClick={() => playTrack(currentTrack)}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
                </button>
                <button
                  type="button"
                  className="cp-dock-btn"
                  onClick={handleNextTrack}
                  title="Next Track"
                >
                  <SkipForward size={18} />
                </button>
                <button
                  type="button"
                  className={`cp-dock-btn ${isRepeat ? "cp-dock-btn--active" : ""}`}
                  onClick={() => setIsRepeat(!isRepeat)}
                  title="Repeat"
                >
                  <Repeat size={15} />
                </button>
              </div>

              {/* Scrubber */}
              <div className="cp-scrubber-wrap">
                <span className="cp-time">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  className="cp-slider"
                  min="0"
                  max={duration || 30}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                />
                <span className="cp-time">{formatTime(duration || 30)}</span>
              </div>
            </div>

            {/* Dock Right: Volume Slider & Streaming links */}
            <div className="cp-dock-right">
              <button
                type="button"
                className="cp-dock-btn"
                onClick={toggleMute}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <input
                type="range"
                className="cp-vol-slider"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
              {currentTrack.spotifyUrl && (
                <a
                  href={currentTrack.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="cp-dock-ext-btn"
                  title="Listen in Spotify"
                >
                  <span>Spotify</span>
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
