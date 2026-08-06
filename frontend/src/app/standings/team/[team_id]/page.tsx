import { getFootballdataTeam, getFootballdataTeamStats, getFootballdataTeamPlayers } from "@/thesportsdb/footballdata";
import TeamTab from "../../../teams/[team_id]/TeamTab";

interface PageProps {
    params: { team_id: string };
    searchParams?: { tab?: string; opponent?: string };
}

export default async function TeamDetailPage({ params, searchParams }: PageProps) {
    const teamId = params.team_id;
    const initialTab = searchParams?.tab || "overview";

    let team: any = null;
    let error: string | null = null;
    let fdMatches: any[] = [];
    let fdStats: any = null;
    let fdPlayers: any[] = [];
    let fdTeamDetails: any = null;

    try {
        const [detailsRes, statsRes, playersRes] = await Promise.all([
            getFootballdataTeam(teamId),
            getFootballdataTeamStats(teamId),
            getFootballdataTeamPlayers(teamId),
        ]);

        team = detailsRes?.data ?? null;
        if (!team) {
            team = (statsRes as any)?.team ?? null;
        }

        fdTeamDetails = detailsRes?.data ?? null;
        fdMatches = [
            ...(fdTeamDetails?.recent_matches ?? []),
            ...(fdTeamDetails?.upcoming_matches ?? []),
        ];
        fdStats = statsRes;
        fdPlayers = playersRes;
    } catch (e) {
        error = e instanceof Error ? e.message : "Failed to load team details";
    }

    return (
        <main className="min-h-screen bg-[#070b14] text-white py-10">
            <div className="mx-auto max-w-6xl px-4">
                {error ? (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-6 text-red-300">
                        {error}
                    </div>
                ) : team ? (
                    <TeamTab
                        team={team}
                        initialTab={initialTab}
                        fdMatches={fdMatches}
                        fdPlayers={fdPlayers}
                        fdStats={fdStats}
                        fdTeamDetails={fdTeamDetails}
                        opponent={searchParams?.opponent || ""}
                        previousEvents={[]}
                        nextEvents={[]}
                        h2hMatches={[]}
                    />
                ) : null}
            </div>
        </main>
    );
}
