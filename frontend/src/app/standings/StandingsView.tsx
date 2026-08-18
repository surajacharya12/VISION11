"use client";

import { useState, useEffect } from "react";
import { NormalizedStandingRow, StandingType } from "@/lib/rapidapi-standings";
import { AzharimmStandingsResponse } from "@/lib/azharimm-standings";
import { Trophy, RefreshCw, Layers, ShieldCheck, HelpCircle } from "lucide-react";
import TeamLogo from "./TeamLogo";

interface StandingsViewProps {
  initialStandings: NormalizedStandingRow[];
  initialAzharimmData?: AzharimmStandingsResponse | null;
  rapidApiLeagueId: number;
  azharimmLeagueId: string;
  leagueName: string;
  leagueLogo?: string;
  availableSeasons?: { year: number; displayName: string }[];
}

export default function StandingsView({
  initialStandings,
  initialAzharimmData,
  rapidApiLeagueId,
  azharimmLeagueId,
  leagueName,
  leagueLogo,
  availableSeasons = [],
}: StandingsViewProps) {
  const [apiSource, setApiSource] = useState<"rapidapi" | "azharimm">("rapidapi");
  const [standingType, setStandingType] = useState<StandingType>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  
  const [rapidStandings, setRapidStandings] = useState<NormalizedStandingRow[]>(initialStandings);
  const [azharimmData, setAzharimmData] = useState<AzharimmStandingsResponse | null>(
    initialAzharimmData || null
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Re-fetch standings when tab or API source or season changes
  useEffect(() => {
    let isSubscribed = true;

    async function loadData() {
      setLoading(true);
      try {
        if (apiSource === "rapidapi") {
          const res = await fetch(
            `/api/standings?source=rapidapi&leagueId=${rapidApiLeagueId}&type=${standingType}`
          );
          if (res.ok) {
            const json = await res.json();
            if (isSubscribed && json.data) {
              setRapidStandings(json.data);
            }
          }
        } else {
          const seasonParam = selectedSeason ? `&season=${selectedSeason}` : "";
          const res = await fetch(
            `/api/standings?source=azharimm&leagueId=${azharimmLeagueId}${seasonParam}`
          );
          if (res.ok) {
            const json = await res.json();
            if (isSubscribed && json.data) {
              setAzharimmData(json.data);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching standings:", err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [apiSource, standingType, rapidApiLeagueId, azharimmLeagueId, selectedSeason]);

  return (
    <div className="space-y-6">
      {/* Control Bar: Source Switcher, Standings Type Tabs & Season Select */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        {/* RapidAPI Standings Type Tabs (All / Home / Away) */}
        {apiSource === "rapidapi" ? (
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10">
            {(["all", "home", "away"] as StandingType[]).map((type) => (
              <button
                key={type}
                onClick={() => setStandingType(type)}
                className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg capitalize transition-all duration-200 ${
                  standingType === type
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {type} Standings
              </button>
            ))}
          </div>
        ) : (
          /* Season Dropdown for Football Standings API (AzharImm) */
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-400">Season:</span>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="bg-black/40 border border-white/10 text-white text-xs md:text-sm rounded-xl px-3 py-2 outline-none focus:border-emerald-500 transition"
            >
              <option value="">Current Season</option>
              {availableSeasons.map((s) => (
                <option key={s.year} value={String(s.year)}>
                  {s.displayName || s.year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* API Source Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 font-medium hidden sm:inline">Data Source:</span>
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              onClick={() => setApiSource("rapidapi")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                apiSource === "rapidapi"
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              RapidAPI Live
            </button>
            <button
              onClick={() => setApiSource("azharimm")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                apiSource === "azharimm"
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Football Standings (ESPN)
            </button>
          </div>
        </div>
      </div>

      {/* Standings Table Container */}
      <div className="rounded-2xl border border-white/10 bg-[#0f1420]/80 backdrop-blur-xl shadow-2xl overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-black/80 border border-white/15 text-white text-sm font-semibold animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              Loading Standings...
            </div>
          </div>
        )}

        {/* RapidAPI View */}
        {apiSource === "rapidapi" && (
          <div>
            <div className="grid grid-cols-12 gap-2 px-4 md:px-6 py-3.5 border-b border-white/10 text-xs font-extrabold text-neutral-400 uppercase tracking-wider bg-white/5">
              <div className="col-span-1">#</div>
              <div className="col-span-4 md:col-span-5">Club</div>
              <div className="col-span-1 text-center">P</div>
              <div className="col-span-1 text-center">W</div>
              <div className="col-span-1 text-center">D</div>
              <div className="col-span-1 text-center">L</div>
              <div className="col-span-1 text-center hidden md:block">F-A</div>
              <div className="col-span-1 text-center">GD</div>
              <div className="col-span-2 md:col-span-1 text-right font-black text-white">PTS</div>
            </div>

            {rapidStandings.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-sm">
                No standings data available for this competition.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {rapidStandings.map((row) => (
                  <div
                    key={row.team.id}
                    className="grid grid-cols-12 gap-2 items-center px-4 md:px-6 py-3 text-xs md:text-sm hover:bg-white/5 transition-colors relative group"
                  >
                    {/* Qualification Color Strip */}
                    {row.qualColor && (
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                        style={{ backgroundColor: row.qualColor }}
                      />
                    )}

                    <div className="col-span-1 font-bold text-neutral-300 flex items-center gap-1.5">
                      <span>{row.rank}</span>
                    </div>

                    <div className="col-span-4 md:col-span-5 flex items-center gap-3 min-w-0">
                      <TeamLogo src={row.team.logo} name={row.team.name} size="w-6 h-6" />
                      <span className="font-semibold text-white truncate">
                        {row.team.name}
                      </span>
                    </div>

                    <div className="col-span-1 text-center font-medium text-neutral-300">
                      {row.played}
                    </div>
                    <div className="col-span-1 text-center text-emerald-400 font-semibold">
                      {row.win}
                    </div>
                    <div className="col-span-1 text-center text-amber-400 font-semibold">
                      {row.draw}
                    </div>
                    <div className="col-span-1 text-center text-rose-400 font-semibold">
                      {row.lose}
                    </div>
                    <div className="col-span-1 text-center text-neutral-400 font-medium hidden md:block">
                      {row.scoresStr}
                    </div>
                    <div className="col-span-1 text-center font-bold text-neutral-200">
                      {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                    </div>
                    <div className="col-span-2 md:col-span-1 text-right font-black text-emerald-400 text-sm md:text-base">
                      {row.points}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Football Standings API (AzharImm / ESPN) View */}
        {apiSource === "azharimm" && (
          <div>
            <div className="px-4 md:px-6 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300">
                {azharimmData?.seasonDisplay || azharimmData?.season || "Current"} Season Table
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {azharimmData?.name}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2 px-4 md:px-6 py-3 border-b border-white/10 text-xs font-extrabold text-neutral-400 uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-4 md:col-span-5">Club</div>
              <div className="col-span-1 text-center">P</div>
              <div className="col-span-1 text-center">W</div>
              <div className="col-span-1 text-center">D</div>
              <div className="col-span-1 text-center">L</div>
              <div className="col-span-1 text-center hidden md:block">GD</div>
              <div className="col-span-1 text-center">PTS</div>
              <div className="col-span-2 text-right hidden md:block">Note</div>
            </div>

            {!azharimmData?.standings || azharimmData.standings.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-sm">
                No standings data found from Football Standings API.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {azharimmData.standings.map((item, idx) => {
                  const getStat = (name: string) =>
                    item.stats?.find((s) => s.name === name || s.type === name)?.value ?? 0;

                  const wins = getStat("wins");
                  const losses = getStat("losses");
                  const draws = getStat("ties");
                  const played = getStat("gamesPlayed");
                  const gd = getStat("pointDifferential");
                  const pts = getStat("points");

                  return (
                    <div
                      key={item.team.id || idx}
                      className="grid grid-cols-12 gap-2 items-center px-4 md:px-6 py-3 text-xs md:text-sm hover:bg-white/5 transition-colors relative"
                    >
                      {item.note?.color && (
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                          style={{ backgroundColor: item.note.color }}
                        />
                      )}

                      <div className="col-span-1 font-bold text-neutral-300">
                        {idx + 1}
                      </div>

                      <div className="col-span-4 md:col-span-5 flex items-center gap-3 min-w-0">
                        <TeamLogo
                          src={item.team.logos?.[0]?.href}
                          name={item.team.displayName}
                          size="w-6 h-6"
                        />
                        <span className="font-semibold text-white truncate">
                          {item.team.displayName}
                        </span>
                      </div>

                      <div className="col-span-1 text-center text-neutral-300">
                        {played}
                      </div>
                      <div className="col-span-1 text-center text-emerald-400 font-semibold">
                        {wins}
                      </div>
                      <div className="col-span-1 text-center text-amber-400 font-semibold">
                        {draws}
                      </div>
                      <div className="col-span-1 text-center text-rose-400 font-semibold">
                        {losses}
                      </div>
                      <div className="col-span-1 text-center font-bold text-neutral-200 hidden md:block">
                        {gd > 0 ? `+${gd}` : gd}
                      </div>
                      <div className="col-span-1 text-center font-black text-emerald-400 text-sm md:text-base">
                        {pts}
                      </div>
                      <div className="col-span-2 text-right hidden md:block">
                        {item.note?.description ? (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{
                              backgroundColor: (item.note.color || "#3b82f6") + "20",
                              color: item.note.color || "#60a5fa",
                              border: `1px solid ${(item.note.color || "#3b82f6")}40`,
                            }}
                          >
                            {item.note.description}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rules and Table Legend Accordion */}
      <div className="rounded-2xl border border-white/10 bg-[#0f1420]/60 backdrop-blur-xl overflow-hidden">
        <details className="group">
          <summary className="px-5 py-4 border-b border-white/10 cursor-pointer text-sm font-bold text-white hover:bg-white/5 transition flex items-center justify-between list-none">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Standings Rules & Legend</span>
            </div>
            <svg
              className="w-4 h-4 text-neutral-400 transition-transform duration-200 group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>

          <div className="p-5 text-xs text-neutral-300 space-y-4">
            <p className="leading-relaxed">
              If two or more teams finish equal on points, standings are determined by:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 ml-2 font-medium text-neutral-400">
              <li>Head-to-head points obtained in matches between tied teams</li>
              <li>Goal difference (GD = Goals For - Goals Against)</li>
              <li>Total goals scored (F)</li>
              <li>Play-off match on neutral ground if tie-breaker affects title or relegation</li>
            </ol>

            <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-400">P</span>
                <span>Matches Played</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-400">W</span>
                <span>Wins</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400">D</span>
                <span>Draws</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-400">L</span>
                <span>Losses</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-300">F-A</span>
                <span>Goals For - Against</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-300">GD</span>
                <span>Goal Difference</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-400">PTS</span>
                <span>Total Points</span>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
