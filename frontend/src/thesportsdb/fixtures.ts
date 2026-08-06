import { theSportsDBGetV1, type RequestOptions } from "./client";
import type { QueryParams, TheSportsDBResponse, TheSportsDBEvent } from "./types";

export interface FixtureEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
}

export interface FixtureLineup {
  team: { id: number; name: string; logo: string; colors: unknown };
  coach: { id: number; name: string; photo: string };
  formation: string;
  startXI: Array<{ player: { id: number; name: string; number: number; pos: string | null; grid: string | null } }>;
  substitutes: Array<{ player: { id: number; name: string; number: number; pos: string | null; grid: string | null } }>;
}

export interface FixtureTeamStatistics {
  team: { id: number; name: string; logo: string };
  statistics: Array<{ type: string; value: number | string | null }>;
}

export interface FixturePlayerStatsByTeam {
  team: { id: number; name: string; logo: string; update: string };
  players: Array<{ player: { id: number; name: string; photo: string }; statistics: unknown[] }>;
}

export interface Fixture {
  fixture: {
    id: number;
    date: string;
    timestamp: number;
    venue: { name: string | null };
    status: { short: string; long: string; elapsed: number | null };
  };
  league: { id: number; name: string; logo: string };
  teams: { home: { id: number; name: string; logo: string }; away: { id: number; name: string; logo: string } };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
  events?: FixtureEvent[];
  lineups?: FixtureLineup[];
  statistics?: FixtureTeamStatistics[];
  players?: FixturePlayerStatsByTeam[];
}

export interface GetFixturesParams extends QueryParams {
  id?: number;
  league?: number;
  season?: number;
  from?: string;
  to?: string;
}

export interface GetFixtureEventsParams extends QueryParams {
  fixture: number;
}

export interface GetFixtureStatisticsParams extends QueryParams {
  fixture: number;
}

export interface GetFixtureLineupsParams extends QueryParams {
  fixture: number;
}

export interface GetFixturePlayersParams extends QueryParams {
  fixture: number;
}

export interface GetHeadToHeadParams extends QueryParams {
  h2h: string;
}

function mapTSDBEventToFixture(ev: any): Fixture {
  const homeScore = ev.intHomeScore !== null && ev.intHomeScore !== undefined ? Number(ev.intHomeScore) : null;
  const awayScore = ev.intAwayScore !== null && ev.intAwayScore !== undefined ? Number(ev.intAwayScore) : null;

  return {
    fixture: {
      id: Number(ev.idEvent),
      date: ev.dateEvent && ev.strTime ? `${ev.dateEvent}T${ev.strTime}` : ev.strTimestamp || ev.dateEvent || new Date().toISOString(),
      timestamp: ev.strTimestamp ? Date.parse(ev.strTimestamp) : Date.parse(ev.dateEvent || new Date().toISOString()),
      venue: { name: ev.strVenue || null },
      status: {
        short: ev.strStatus === "FT" ? "FT" : ev.strStatus === "NS" ? "NS" : ev.strStatus === "TBD" ? "TBD" : ev.strStatus || "NS",
        long: ev.strStatus || "Not Started",
        elapsed: null,
      },
    },
    league: {
      id: Number(ev.idLeague),
      name: ev.strLeague,
      logo: ev.strLeagueBadge || "",
    },
    teams: {
      home: { id: Number(ev.idHomeTeam), name: ev.strHomeTeam, logo: ev.strHomeTeamBadge || "" },
      away: { id: Number(ev.idAwayTeam), name: ev.strAwayTeam, logo: ev.strAwayTeamBadge || "" },
    },
    goals: { home: homeScore, away: awayScore },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: homeScore, away: awayScore },
      extratime: { home: ev.intHomeScoreExtra ? Number(ev.intHomeScoreExtra) : null, away: ev.intAwayScoreExtra ? Number(ev.intAwayScoreExtra) : null },
      penalty: { home: null, away: null },
    },
  };
}

async function fetchLeagueFixtures(
  leagueId: string,
  options?: RequestOptions
): Promise<TheSportsDBResponse<any[]>> {
  const [nextRes, pastRes] = await Promise.all([
    theSportsDBGetV1<any>("eventsnextleague.php", { id: leagueId }, options),
    theSportsDBGetV1<any>("eventspastleague.php", { id: leagueId }, options),
  ]);

  const nextEvents = Array.isArray((nextRes as any)?.response) ? (nextRes as any).response : [];
  const pastEvents = Array.isArray((pastRes as any)?.response) ? (pastRes as any).response : [];

  return {
    get: "",
    parameters: {},
    errors: [],
    results: nextEvents.length + pastEvents.length,
    paging: { current: 1, total: 1 },
    response: [...nextEvents, ...pastEvents],
  } as TheSportsDBResponse<any[]>;
}

async function discoverFootballLeagues(options?: RequestOptions): Promise<string[]> {
  const curated = [
    "4328","4329","4331","4332","4334","4335",
    "4480","4481","4482","4483","4484","4485","4506","4566",
    "4429","4502","4499","4496","4873","4719","4714","4804",
    "4490","4562","4498","4512",
    "4501","4732","4874","4503",
    "4686","4399","4459","4356","4789",
    "4408","4413","4432","4390",
    "848","45","143","79","62","137","46",
  ];

  const rangeEndpoints: string[] = [];
  const ranges = [
    [4328, 4361],
    [4394, 4405],
    [4480, 4486],
    [4489, 4491],
    [4506, 4513],
    [4562, 4567],
    [4800, 4901],
  ];
  for (const [start, end] of ranges) {
    rangeEndpoints.push(String(start));
    if (end - start > 1) rangeEndpoints.push(String(end - 1));
  }

  const baseCandidates = Array.from(new Set([...curated, ...rangeEndpoints]));

  const results: string[] = [];
  const checked = new Set<string>();

  const checkLeague = async (leagueId: string) => {
    if (checked.has(leagueId)) return;
    checked.add(leagueId);
    try {
      const res = await theSportsDBGetV1<any>("eventsnextleague.php", { id: leagueId }, options);
      const events = Array.isArray((res as any)?.response) ? (res as any).response : [];
      if (events.length > 0) {
        results.push(leagueId);
      }
    } catch {
      // skip
    }
  };

  for (const leagueId of baseCandidates) {
    await checkLeague(leagueId);
  }

  const nameFallbacks = [
    "AFC Asian Cup",
    "UEFA Europa Conference League",
    "CAF Champions League",
    "CONCACAF Champions Cup",
  ];
  for (const name of nameFallbacks) {
    try {
      const res = await theSportsDBGetV1<any[]>("search_all_leagues.php", { l: name });
      const leagues = Array.isArray((res as any)?.response) ? (res as any).response : [];
      for (const league of leagues) {
        const id = String(league.idLeague);
        if (!checked.has(id)) {
          await checkLeague(id);
        }
      }
    } catch {
      // skip
    }
  }

  return results;
}


export async function getFixtures(
  params?: GetFixturesParams,
  options?: RequestOptions
): Promise<TheSportsDBResponse<Fixture[]>> {
  let fixtures: Fixture[] = [];
  const from = params?.from ? new Date(params.from) : null;
  const to = params?.to ? new Date(params.to) : null;

  const filterByDate = (f: Fixture) => {
    if (!from || Number.isNaN(from.getTime())) return true;
    if (!to || Number.isNaN(to.getTime())) return true;
    const d = new Date(f.fixture.date);
    if (Number.isNaN(d.getTime())) return true;
    if (d < from) return false;
    if (d > to) return false;
    return true;
  };

  if (params?.id) {
    try {
      const res = await theSportsDBGetV1<any>("lookupevent.php", { id: String(params.id) }, options);
      const arr = Array.isArray((res as any)?.response) ? (res as any).response : [];
      const ev = arr[0] ?? null;
      if (ev) {
        fixtures = [mapTSDBEventToFixture(ev)];
        return {
          get: "",
          parameters: params ?? {},
          errors: [],
          results: 1,
          paging: { current: 1, total: 1 },
          response: fixtures,
        } as TheSportsDBResponse<Fixture[]>;
      }
      return {
        get: "",
        parameters: params ?? {},
        errors: [],
        results: 0,
        paging: { current: 1, total: 1 },
        response: [],
      } as TheSportsDBResponse<Fixture[]>;
    } catch {
      return {
        get: "",
        parameters: params ?? {},
        errors: [],
        results: 0,
        paging: { current: 1, total: 1 },
        response: [],
      } as TheSportsDBResponse<Fixture[]>;
    }
  }

  if (params?.league) {
    const league = String(params.league);
    const leagueRes = await fetchLeagueFixtures(league, options);
    const events = Array.isArray((leagueRes as any)?.response) ? (leagueRes as any).response : [];
    fixtures = events.map(mapTSDBEventToFixture).filter(filterByDate);
  } else {
    const majorLeagueIds = [
      "4328", "4335", "4332", "4334", "4480",
      "1", "2", "3", "4", "9", "17", "6", "8", "7",
      "4686", "4399", "4459", "4356", "4789",
      "4408", "4413", "4432", "4390",
      "848", "45", "143", "79", "62", "137", "46",
    ];

    const discoveredLeagues = await discoverFootballLeagues(options);
    const allLeagueIds = [...new Set([...majorLeagueIds, ...discoveredLeagues])];

    const allEvents: any[] = [];
    const seen = new Set<string>();

    for (const leagueId of allLeagueIds) {
      try {
        const leagueRes = await fetchLeagueFixtures(leagueId, options);
        const events = Array.isArray((leagueRes as any)?.response) ? (leagueRes as any).response : [];

        for (const ev of events) {
          const id = String(ev.idEvent);
          if (seen.has(id)) continue;
          seen.add(id);
          allEvents.push(ev);
        }
      } catch {
        // skip failed league
      }
    }

    fixtures = allEvents
      .map(mapTSDBEventToFixture)
      .filter(filterByDate);
  }

  return {
    get: "",
    parameters: params ?? {},
    errors: [],
    results: fixtures.length,
    paging: { current: 1, total: 1 },
    response: fixtures,
  } as TheSportsDBResponse<Fixture[]>;
}

export async function getFixtureRounds(
  params: { league: number; season: number },
  options?: RequestOptions
): Promise<TheSportsDBResponse<string[]>> {
  return Promise.resolve({
    get: "",
    parameters: {
      league: String(params.league),
      season: String(params.season),
    },
    errors: [],
    results: 0,
    paging: { current: 1, total: 1 },
    response: [],
  } as TheSportsDBResponse<string[]>);
}

export async function getHeadToHead(
  params: GetHeadToHeadParams,
  options?: RequestOptions
): Promise<TheSportsDBResponse<Fixture[]>> {
  const ids = params.h2h.split("-");
  if (ids.length < 2) {
    return {
      get: "",
      parameters: params,
      errors: [],
      results: 0,
      paging: { current: 1, total: 1 },
      response: [],
    } as TheSportsDBResponse<Fixture[]>;
  }

  const [team1Res] = await Promise.all([
    theSportsDBGetV1<any>("eventslast.php", { id: ids[0] }),
  ]);

  const team1Events = Array.isArray((team1Res as any)?.response) ? (team1Res as any).response : [];

  const filtered = team1Events.filter((ev: any) => {
    const homeId = String(ev.idHomeTeam ?? "");
    const awayId = String(ev.idAwayTeam ?? "");
    const targetIds = ids.map(String);
    return targetIds.includes(homeId) && targetIds.includes(awayId);
  });

  const fixtures = filtered.map(mapTSDBEventToFixture);

  return {
    get: "",
    parameters: params,
    errors: [],
    results: fixtures.length,
    paging: { current: 1, total: 1 },
    response: fixtures,
  } as TheSportsDBResponse<Fixture[]>;
}

export async function getFixtureEvents(
  params: GetFixtureEventsParams,
  options?: RequestOptions
): Promise<TheSportsDBResponse<FixtureEvent[]>> {
  const res = await theSportsDBGetV1<any[]>("lookupeventtimeline.php", { id: String(params.fixture) });
  const items = Array.isArray((res as any)?.response) ? (res as any).response : [];
  const events = items.map((item: any) => ({
    time: { elapsed: Number(item.intTime) || 0, extra: null },
    team: { id: Number(item.idTeam), name: item.strTeam, logo: "" },
    player: { id: Number(item.idPlayer) || null, name: item.strPlayer },
    assist: { id: item.idAssist ? Number(item.idAssist) : null, name: item.strAssist || null },
    type: item.strTimeline === "subst" ? "Subst" : item.strTimeline === "Goal" ? "Goal" : item.strTimeline === "Card" ? "Card" : item.strTimeline || "Var",
    detail: item.strTimelineDetail || item.strComment || "",
    comments: item.strComment || null,
  }));

  return {
    get: "",
    parameters: params,
    errors: [],
    results: events.length,
    paging: { current: 1, total: 1 },
    response: events,
  } as TheSportsDBResponse<FixtureEvent[]>;
}

export async function getFixtureStatistics(
  params: GetFixtureStatisticsParams,
  options?: RequestOptions
): Promise<TheSportsDBResponse<FixtureTeamStatistics[]>> {
  const res = await theSportsDBGetV1<any[]>("lookupeventstats.php", { id: String(params.fixture) });
  const items = Array.isArray((res as any)?.response) ? (res as any).response : [];

  const homeStats: FixtureTeamStatistics = { team: { id: 0, name: "Home", logo: "" }, statistics: [] };
  const awayStats: FixtureTeamStatistics = { team: { id: 0, name: "Away", logo: "" }, statistics: [] };

  items.forEach((item: any) => {
    homeStats.statistics.push({ type: item.strStat, value: Number(item.intHome) || 0 });
    awayStats.statistics.push({ type: item.strStat, value: Number(item.intAway) || 0 });
  });

  return {
    get: "",
    parameters: params,
    errors: [],
    results: 2,
    paging: { current: 1, total: 1 },
    response: [homeStats, awayStats],
  } as TheSportsDBResponse<FixtureTeamStatistics[]>;
}

export async function getFixtureLineups(
  params: GetFixtureLineupsParams,
  options?: RequestOptions
): Promise<TheSportsDBResponse<FixtureLineup[]>> {
  const res = await theSportsDBGetV1<any[]>("lookuplineup.php", { id: String(params.fixture) });
  const items = Array.isArray((res as any)?.response) ? (res as any).response : [];

  const homeXI: any[] = [];
  const awayXI: any[] = [];
  const homeSubs: any[] = [];
  const awaySubs: any[] = [];

  items.forEach((item: any) => {
    const playerEntry = {
      player: {
        id: Number(item.idPlayer) || 0,
        name: item.strPlayer,
        number: Number(item.intSquadNumber) || 0,
        pos: item.strPosition || null,
        grid: null,
      },
    };

    if (item.strSubstitute === "No") {
      if (item.strHome === "Yes") homeXI.push(playerEntry);
      else awayXI.push(playerEntry);
    } else {
      if (item.strHome === "Yes") homeSubs.push(playerEntry);
      else awaySubs.push(playerEntry);
    }
  });

  const firstEvent = items[0];

  return {
    get: "",
    parameters: params,
    errors: [],
    results: 2,
    paging: { current: 1, total: 1 },
    response: [
      {
        team: { id: firstEvent?.idTeam ? Number(firstEvent.idTeam) : 0, name: firstEvent?.strTeam || "Home", logo: "", colors: {} },
        coach: { id: 0, name: "", photo: "" },
        formation: "",
        startXI: homeXI,
        substitutes: homeSubs,
      },
      {
        team: { id: 0, name: "Away", logo: "", colors: {} },
        coach: { id: 0, name: "", photo: "" },
        formation: "",
        startXI: awayXI,
        substitutes: awaySubs,
      },
    ],
  } as TheSportsDBResponse<FixtureLineup[]>;
}

export async function getFixturePlayers(
  params: GetFixturePlayersParams,
  options?: RequestOptions
): Promise<TheSportsDBResponse<FixturePlayerStatsByTeam[]>> {
  const res = await theSportsDBGetV1<any[]>("lookuplineup.php", { id: String(params.fixture) });
  const items = Array.isArray((res as any)?.response) ? (res as any).response : [];

  const homeMap = new Map<number, any>();
  const awayMap = new Map<number, any>();

  items.forEach((item: any) => {
    const entry = {
      player: {
        id: Number(item.idPlayer) || 0,
        name: item.strPlayer,
        photo: item.strThumb || item.strCutout || item.strRender || "",
      },
      statistics: item.strPosition ? [{ position: item.strPosition }] : [],
    };

    if (item.strHome === "Yes") homeMap.set(Number(item.idPlayer) || 0, entry);
    else awayMap.set(Number(item.idPlayer) || 0, entry);
  });

  return {
    get: "",
    parameters: params,
    errors: [],
    results: 2,
    paging: { current: 1, total: 1 },
    response: [
      { team: { id: 0, name: "Home", logo: "", update: "" }, players: Array.from(homeMap.values()) },
      { team: { id: 0, name: "Away", logo: "", update: "" }, players: Array.from(awayMap.values()) },
    ],
  } as TheSportsDBResponse<FixturePlayerStatsByTeam[]>;
}
