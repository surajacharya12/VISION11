"use client";

import { useState } from "react";
import { Tv, ExternalLink, RefreshCw, Radio, ShieldAlert } from "lucide-react";

interface StreamSource {
  id?: string;
  streamNo?: number;
  embedUrl?: string;
  source?: string;
  hd?: boolean;
  language?: string;
}

interface MatchStreamPlayerProps {
  embedUrl?: string;
  sources?: StreamSource[];
  matchTitle?: string;
}

export default function MatchStreamPlayer({
  embedUrl,
  sources = [],
  matchTitle,
}: MatchStreamPlayerProps) {
  // Filter valid sources with embedUrl
  const validSources = sources.filter((s) => s.embedUrl) || [];
  if (validSources.length === 0 && embedUrl) {
    validSources.push({ id: "default", streamNo: 1, embedUrl, source: "Primary Stream" });
  }

  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  const currentSource = validSources[activeSourceIndex] || validSources[0];

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  if (!currentSource || !currentSource.embedUrl) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-xl border border-white/10 flex flex-col items-center justify-center p-6 text-center">
        <Tv className="w-12 h-12 text-gray-600 mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">No Live Stream Available</h3>
        <p className="text-sm text-gray-400 max-w-md">
          There are currently no active live stream sources for this match.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Stream Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900/90 border border-white/10 p-3 rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 mr-1 shrink-0">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            Servers:
          </span>
          {validSources.map((source, idx) => (
            <button
              key={source.id || idx}
              onClick={() => setActiveSourceIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${
                activeSourceIndex === idx
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Server {source.streamNo || idx + 1}
              {source.source && <span className="opacity-75">({source.source})</span>}
              {source.hd && (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1 py-0.2 rounded font-mono">
                  HD
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs flex items-center gap-1.5 transition"
            title="Reload Stream"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reload</span>
          </button>

          <a
            href={currentSource.embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/20 flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Stream
          </a>
        </div>
      </div>

      {/* Main Video Frame */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
        <iframe
          key={`${currentSource.embedUrl}-${reloadKey}`}
          src={currentSource.embedUrl}
          width="100%"
          height="100%"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="no-referrer"
          className="w-full h-full border-0"
        />
      </div>

      {/* Helper Tip Footer */}
      <div className="flex items-start gap-2 bg-gray-900/50 border border-white/5 p-3 rounded-lg text-xs text-gray-400">
        <ShieldAlert className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-gray-300">Tip:</span> If the video displays network mismatch or access error, click <strong className="text-emerald-400">"Open Stream"</strong> to view the live broadcast directly.
        </div>
      </div>
    </div>
  );
}
