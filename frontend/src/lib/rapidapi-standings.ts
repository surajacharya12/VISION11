export interface RapidApiStandingItem {
  id: number;
  name: string;
  shortName: string;
  pageUrl: string;
  deduction: number | null;
  ongoing: any | null;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  scoresStr: string;
  goalConDiff: number;
  goalsScored?: number;
  pts: number;
  idx: number;
  qualColor?: string | null;
}

export interface RapidApiStandingResponse {
  status: string;
  response?: {
    standing?: RapidApiStandingItem[];
  };
}

export interface NormalizedStandingRow {
  rank: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    logo: string;
  };
  played: number;
  win: number;
  draw: number;
  lose: number;
  scoresStr: string;
  goalsFor?: number;
  goalsAgainst?: number;
  goalsDiff: number;
  points: number;
  qualColor?: string | null;
}

const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "free-api-live-football-data.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "a9d59ff3bamsh8d3caccd5dc111bp192953jsn240499919a52";

export type StandingType = "all" | "home" | "away";

export async function fetchRapidApiStanding(
  leagueId: number | string,
  type: StandingType = "all"
): Promise<NormalizedStandingRow[]> {
  let endpointPath = "/football-get-standing-all";
  if (type === "home") {
    endpointPath = "/football-get-standing-home";
  } else if (type === "away") {
    endpointPath = "/football-get-standing-away";
  }

  const url = `https://${RAPIDAPI_HOST}${endpointPath}?leagueid=${leagueId}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 mins
    });

    if (!res.ok) {
      console.error(`[RapidAPI Standings] HTTP error ${res.status} ${res.statusText}`);
      return [];
    }

    const data: RapidApiStandingResponse = await res.json();
    const rawItems = data?.response?.standing ?? [];

    return rawItems.map((item, index) => {
      // Parse goals for/against if available or from scoresStr
      let gf = item.goalsScored;
      let ga: number | undefined = undefined;

      if (item.scoresStr && item.scoresStr.includes("-")) {
        const parts = item.scoresStr.split("-").map((s) => parseInt(s.trim(), 10));
        if (!isNaN(parts[0])) gf = gf ?? parts[0];
        if (!isNaN(parts[1])) ga = parts[1];
      }

      return {
        rank: item.idx ?? index + 1,
        team: {
          id: item.id,
          name: item.name,
          shortName: item.shortName || item.name,
          logo: `https://images.fotmob.com/image_resources/logo/teamlogo/${item.id}.png`,
        },
        played: item.played ?? 0,
        win: item.wins ?? 0,
        draw: item.draws ?? 0,
        lose: item.losses ?? 0,
        scoresStr: item.scoresStr || "0-0",
        goalsFor: gf,
        goalsAgainst: ga,
        goalsDiff: item.goalConDiff ?? 0,
        points: item.pts ?? 0,
        qualColor: item.qualColor || null,
      };
    });
  } catch (error) {
    console.error("[RapidAPI Standings] Fetch error:", error);
    return [];
  }
}
