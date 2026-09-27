import React, { useState, useEffect } from 'react';

export default function TasteProfile({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState(null);

  useEffect(() => {
    // Automatically default to localhost if the Vercel env variable isn't set yet
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    
    fetch(`${baseUrl}/api/profile/${user.id}/stats`)
      .then(async (res) => {
        const isJson = res.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await res.json() : null;
        
        if (!res.ok) {
          const error = (data && data.error) || res.statusText || 'Server completely unreachable';
          throw new Error(error);
        }
        return data;
      })
      .then(data => {
        if (!data || data.error) throw new Error(data?.error || "Empty data returned");
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Profile Fetch Error:", err);
        setErrorDetails(err.message);
        setLoading(false);
      });
  }, [user.id]);

  if (loading) return <div className="p-8 text-slate-400">Loading Abyss Data...</div>;
  
  // If the backend threw an error, display it explicitly on the screen
  if (errorDetails) return (
    <div className="p-8 flex justify-center mt-10">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-2">Backend Connection Failed</h2>
        <p className="font-mono text-sm">{errorDetails}</p>
        <p className="mt-4 text-sm text-red-400/70">Ensure your terminal is actively running "npm run dev:full".</p>
      </div>
    </div>
  );

  if (!stats || stats.totalItems === 0) return <div className="p-8 text-slate-400">Save some media to generate your profile!</div>;

  // Safe fallback in case the ratingCurve is missing or malformed
  const curveData = stats.ratingCurve || [];
  const maxRatingCount = Math.max(...curveData.map(r => r.count), 1);
  
  let badge = "Novice Diver";
  if (stats.timeStats?.totalHours > 10) badge = "Abyssal Scholar";
  if (stats.timeStats?.totalHours > 50) badge = "Void Walker";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 text-slate-200">
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-fraunces text-white">{user.name}'s Profile</h1>
          <p className="text-slate-400 mt-1">Total items saved: {stats.totalItems}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400 uppercase tracking-widest">Time in the Abyss</div>
          <div className="text-3xl font-bold text-indigo-400">{stats.timeStats?.totalHours || 0} Hours</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-bold mb-4 text-white">Badges</h3>
            <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-sm">
              🛡️ {badge}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-bold mb-4 text-white">Top Vibes</h3>
            <div className="flex flex-wrap gap-2">
              {(stats.topVibes || []).map((v, i) => (
                <span key={i} className="px-3 py-1 bg-slate-800 rounded text-sm border border-slate-700">
                  {v.vibe} <span className="text-slate-500 text-xs ml-1">({v.count})</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-bold mb-6 text-white">Rating Distribution</h3>
            <div className="flex items-end h-40 gap-2 w-full border-b border-slate-800 pb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => {
                const found = curveData.find(r => r.star === star);
                const count = found ? found.count : 0;
                const heightPercent = (count / maxRatingCount) * 100;
                
                return (
                  <div key={star} className="flex-1 flex flex-col items-center justify-end group">
                    <div 
                      className="w-full bg-indigo-500/80 rounded-t-sm transition-all group-hover:bg-indigo-400 relative"
                      style={{ height: `${heightPercent}%`, minHeight: count > 0 ? '4px' : '0' }}
                    >
                      {count > 0 && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {count}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{star}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-bold mb-4 text-white">Most Explored Genres</h3>
            <div className="space-y-3">
              {(stats.topGenres || []).map((g, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{g.genre}</span>
                  <div className="flex-1 mx-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-500" 
                      style={{ width: `${(g.count / stats.totalItems) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-500 w-8 text-right">{g.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}