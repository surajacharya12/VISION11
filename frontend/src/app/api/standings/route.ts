import { NextRequest, NextResponse } from "next/server";
import { fetchRapidApiStanding, StandingType } from "@/lib/rapidapi-standings";
import { getAzharimmStandings } from "@/lib/azharimm-standings";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source") || "rapidapi";
  const leagueId = searchParams.get("leagueId") || "47";
  const type = (searchParams.get("type") || "all") as StandingType;
  const season = searchParams.get("season") || undefined;

  try {
    if (source === "azharimm") {
      const azharimmData = await getAzharimmStandings(leagueId, season);
      return NextResponse.json({
        status: true,
        source: "azharimm",
        data: azharimmData,
      });
    } else {
      const numericLeagueId = parseInt(leagueId, 10) || 47;
      const standings = await fetchRapidApiStanding(numericLeagueId, type);
      return NextResponse.json({
        status: true,
        source: "rapidapi",
        type,
        data: standings,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        error: error.message || "Failed to fetch standings data",
      },
      { status: 500 }
    );
  }
}
