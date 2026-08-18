export interface AzharimmLeagueLogo {
  light: string;
  dark: string;
}

export interface AzharimmLeague {
  id: string;
  name: string;
  slug: string;
  abbr: string;
  logos: AzharimmLeagueLogo;
}

export interface AzharimmSeasonsResponse {
  name: string;
  desc: string;
  abbreviation: string;
  seasons: {
    year: number;
    startDate: string;
    endDate: string;
    displayName: string;
    types?: any[];
  }[];
}

export interface AzharimmStandingTeam {
  id: string;
  uid?: string;
  location?: string;
  name: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName?: string;
  isActive?: boolean;
  logos: {
    href: string;
    width?: number;
    height?: number;
    alt?: string;
    rel?: string[];
  }[];
}

export interface AzharimmStat {
  name: string;
  displayName: string;
  shortDisplayName: string;
  description: string;
  type: string;
  value: number;
  displayValue: string;
}

export interface AzharimmStandingItem {
  team: AzharimmStandingTeam;
  note?: {
    color?: string;
    description?: string;
    rank?: number;
  };
  stats: AzharimmStat[];
}

export interface AzharimmStandingsResponse {
  name: string;
  abbreviation: string;
  seasonDisplay: string;
  season: number;
  standings: AzharimmStandingItem[];
}

const PRIMARY_BASE_URL = "https://api-football-standings.azharimm.site";
const ESPN_BASE_URL = "https://site.api.espn.com/apis/v2/sports/soccer";

/** Get list of all available leagues from Football Standings API */
export async function getAzharimmLeagues(): Promise<AzharimmLeague[]> {
  try {
    const res = await fetch(`${PRIMARY_BASE_URL}/leagues`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.status && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    // Fail silently to default leagues list
  }

  // Built-in fallback list of ESPN/Football Standings leagues
  return [
    {
      id: "eng.1",
      name: "English Premier League",
      slug: "english-premier-league",
      abbr: "Prem",
      logos: {
        light: "https://a.espncdn.com/i/leaguelogos/soccer/500/23.png",
        dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/23.png",
      },
    },
    {
      id: "esp.1",
      name: "Spanish La Liga",
      slug: "spanish-la-liga",
      abbr: "LaLiga",
      logos: {
        light: "https://a.espncdn.com/i/leaguelogos/soccer/500/15.png",
        dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/15.png",
      },
    },
    {
      id: "ger.1",
      name: "German Bundesliga",
      slug: "german-bundesliga",
      abbr: "Bun",
      logos: {
        light: "https://a.espncdn.com/i/leaguelogos/soccer/500/10.png",
        dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/10.png",
      },
    },
    {
      id: "ita.1",
      name: "Italian Serie A",
      slug: "italian-serie-a",
      abbr: "SerieA",
      logos: {
        light: "https://a.espncdn.com/i/leaguelogos/soccer/500/12.png",
        dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/12.png",
      },
    },
    {
      id: "fra.1",
      name: "French Ligue 1",
      slug: "french-ligue-1",
      abbr: "Ligue1",
      logos: {
        light: "https://a.espncdn.com/i/leaguelogos/soccer/500/9.png",
        dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/9.png",
      },
    },
    {
      id: "ned.1",
      name: "Dutch Eredivisie",
      slug: "dutch-eredivisie",
      abbr: "Eredivisie",
      logos: {
        light: "https://a.espncdn.com/i/leaguelogos/soccer/500/11.png",
        dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/11.png",
      },
    },
    {
      id: "arg.1",
      name: "Argentine Liga Profesional de Fútbol",
      slug: "argentine-liga-profesional-de-futbol",
      abbr: "Prim A",
      logos: {
        light: "https://a.espncdn.com/i/leaguelogos/soccer/500/1.png",
        dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/1.png",
      },
    },
    {
      id: "eng.3",
      name: "EFL League One",
      slug: "english-league-one",
      abbr: "L1",
      logos: {
        light: "https://a.espncdn.com/i/leaguelogos/soccer/500/25.png",
        dark: "https://a.espncdn.com/i/leaguelogos/soccer/500-dark/25.png",
      },
    },
  ];
}

/** Get details for a specific league */
export async function getAzharimmLeagueDetail(leagueId: string): Promise<AzharimmLeague | null> {
  try {
    const res = await fetch(`${PRIMARY_BASE_URL}/leagues/${leagueId}`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.status && json.data) {
        return json.data;
      }
    }
  } catch {
    // Fallback
  }

  const leagues = await getAzharimmLeagues();
  return leagues.find((l) => l.id === leagueId) || null;
}

/** Get available seasons for a league */
export async function getAzharimmSeasons(leagueId: string): Promise<AzharimmSeasonsResponse | null> {
  try {
    const res = await fetch(`${PRIMARY_BASE_URL}/leagues/${leagueId}/seasons`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.status && json.data) {
        return json.data;
      }
    }
  } catch {
    // Direct ESPN fallback
  }

  try {
    const espnRes = await fetch(`${ESPN_BASE_URL}/${leagueId}/standings`, {
      next: { revalidate: 86400 },
    });
    if (espnRes.ok) {
      const espnData = await espnRes.json();
      const seasonsList = (espnData.seasons || espnData.children?.[0]?.seasons || []).map((s: any) => ({
        year: s.year,
        startDate: s.startDate,
        endDate: s.endDate,
        displayName: s.displayName,
      }));
      return {
        name: espnData.name || leagueId,
        desc: "Available seasons standings data",
        abbreviation: espnData.abbreviation || leagueId,
        seasons: seasonsList,
      };
    }
  } catch (e) {
    console.error("[Azharimm Standings] Seasons fetch error:", e);
  }

  return null;
}

/** Get standings for a league and optional season */
export async function getAzharimmStandings(
  leagueId: string,
  season?: number | string,
  sort: string = "asc"
): Promise<AzharimmStandingsResponse | null> {
  let query = `?sort=${sort}`;
  if (season) query += `&season=${season}`;

  try {
    const res = await fetch(`${PRIMARY_BASE_URL}/leagues/${leagueId}/standings${query}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.status && json.data) {
        return json.data;
      }
    }
  } catch {
    // Fallback to ESPN direct endpoint
  }

  try {
    let espnUrl = `${ESPN_BASE_URL}/${leagueId}/standings`;
    if (season) espnUrl += `?season=${season}`;

    const espnRes = await fetch(espnUrl, {
      next: { revalidate: 300 },
    });

    if (espnRes.ok) {
      const espnData = await espnRes.json();
      const standingsObj = espnData.children?.[0]?.standings || espnData.standings;
      const entries = standingsObj?.entries || [];

      const standings: AzharimmStandingItem[] = entries.map((entry: any) => ({
        team: entry.team,
        note: entry.note,
        stats: entry.stats || [],
      }));

      return {
        name: espnData.name || leagueId,
        abbreviation: espnData.abbreviation || leagueId,
        seasonDisplay: standingsObj?.seasonDisplayName || String(season || ""),
        season: Number(season || standingsObj?.season || new Date().getFullYear()),
        standings,
      };
    }
  } catch (e) {
    console.error("[Azharimm Standings] Direct ESPN standings fetch error:", e);
  }

  return null;
}
