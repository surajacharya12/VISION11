import { getSportsrcMatchDetail } from "@/lib/sportsrc";
import MatchStreamPlayer from "../../components/MatchStreamPlayer";

export default async function MatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: { sport?: string };
}) {
  const { id } = await params;
  const match = await getSportsrcMatchDetail(id);

  if (!match) {
    return (
      <main className="min-h-screen bg-gray-950 p-6 flex flex-col items-center justify-center">
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Match Not Found</h1>
          <p className="text-sm text-gray-400">
            The requested match details or live stream could not be loaded.
          </p>
        </div>
      </main>
    );
  }

  const sport = match.sport || searchParams?.sport || "football";

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center">
      <div className="w-full max-w-5xl p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
              {sport}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {match.league || "Live Match"}
            </h1>
          </div>
          {match.status && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-600/90 text-white animate-pulse shadow-lg shadow-red-600/20">
              {match.status.toUpperCase()}
              {match.status_detail ? ` • ${match.status_detail}` : ""}
            </span>
          )}
        </div>

        {/* Scoreboard Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-900/80 border border-white/10 p-5 rounded-2xl">
          <div className="p-3 text-center flex flex-col items-center justify-center">
            <div className="text-xs text-gray-400 mb-2 font-medium">HOME</div>
            <div className="flex items-center gap-3 mb-2">
              {match.home_badge && (
                <img
                  src={match.home_badge}
                  alt={match.home_team}
                  className="w-10 h-10 object-contain drop-shadow"
                />
              )}
              <div className="text-lg font-bold text-white">{match.home_team || "TBD"}</div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {match.home_score ?? 0}
            </div>
          </div>

          <div className="p-3 text-center flex flex-col items-center justify-center border-y md:border-y-0 md:border-x border-white/10">
            <div className="text-xs font-bold text-gray-500 mb-1">VS</div>
            {match.display_score && (
              <div className="text-lg font-bold text-gray-200 font-mono tracking-wider">
                {match.display_score}
              </div>
            )}
            {match.title && <div className="text-xs text-gray-400 mt-1">{match.title}</div>}
          </div>

          <div className="p-3 text-center flex flex-col items-center justify-center">
            <div className="text-xs text-gray-400 mb-2 font-medium">AWAY</div>
            <div className="flex items-center gap-3 mb-2">
              {match.away_badge && (
                <img
                  src={match.away_badge}
                  alt={match.away_team}
                  className="w-10 h-10 object-contain drop-shadow"
                />
              )}
              <div className="text-lg font-bold text-white">{match.away_team || "TBD"}</div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {match.away_score ?? 0}
            </div>
          </div>
        </div>

        {/* Stream Player Component */}
        <MatchStreamPlayer
          embedUrl={match.embed_url}
          sources={match.sources}
          matchTitle={match.title}
        />
      </div>
    </main>
  );
}