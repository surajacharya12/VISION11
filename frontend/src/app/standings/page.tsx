import { Suspense } from "react";
import { Leagues } from "@/data/leagues";
import { fetchRapidApiStanding } from "@/lib/rapidapi-standings";
import { getAzharimmStandings, getAzharimmSeasons } from "@/lib/azharimm-standings";
import { Trophy } from "lucide-react";
import LeagueSelect from "./LeagueSelect";
import StandingsView from "./StandingsView";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: { league?: string; season?: string };
}

export default async function StandingPage({ searchParams }: PageProps) {
  // Available domestic and international leagues
  const availableLeagues = Leagues.filter(
    (l) => l.rapidApiLeagueId || l.azharimmId || l.theSportsDBId
  );

  const selectedLeagueIdParam = searchParams?.league;
  const leagueIdNum = selectedLeagueIdParam ? Number(selectedLeagueIdParam) : undefined;

  const currentLeague =
    availableLeagues.find(
      (l) =>
        l.theSportsDBId === leagueIdNum ||
        l.rapidApiLeagueId === leagueIdNum ||
        l.id === leagueIdNum
    ) || availableLeagues[0];

  const rapidApiLeagueId = currentLeague?.rapidApiLeagueId || 47;
  const azharimmLeagueId = currentLeague?.azharimmId || "eng.1";

  // Initial SSR Data Fetching
  const initialRapidStandings = await fetchRapidApiStanding(rapidApiLeagueId, "all");
  const initialAzharimmData = await getAzharimmStandings(azharimmLeagueId);
  const seasonsData = await getAzharimmSeasons(azharimmLeagueId);

  const availableSeasons = seasonsData?.seasons
    ? seasonsData.seasons.map((s) => ({
        year: s.year,
        displayName: s.displayName || String(s.year),
      }))
    : [];

  return (
    <main className="min-h-screen text-white py-6 px-4 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              {currentLeague?.name ?? "Football"} Standings
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live league rankings & home/away form tables powered by Vision11
            </p>
          </div>
        </div>

        {/* League Selector */}
        <div className="flex items-center gap-3">
          <Suspense fallback={<div className="h-10 w-44 rounded-xl bg-white/5 animate-pulse" />}>
            <LeagueSelect
              current={currentLeague.theSportsDBId}
              leagues={availableLeagues}
            />
          </Suspense>
        </div>
      </div>

      {/* Main Interactive Standings View (RapidAPI & Football Standings API) */}
      <StandingsView
        initialStandings={initialRapidStandings}
        initialAzharimmData={initialAzharimmData}
        rapidApiLeagueId={rapidApiLeagueId}
        azharimmLeagueId={azharimmLeagueId}
        leagueName={currentLeague.name}
        leagueLogo={currentLeague.logo}
        availableSeasons={availableSeasons}
      />
    </main>
  );
}