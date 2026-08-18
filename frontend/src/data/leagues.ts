export interface LeagueItem {
  id: number;
  name: string;
  category: string;
  href: string;
  imageQuery: string;
  apiFootballId: number;
  theSportsDBId: number;
  footballDataId: number | undefined;
  rapidApiLeagueId?: number;
  azharimmId?: string;
  logo: string;
}

export const Leagues: LeagueItem[] = [
    { 
      id: 1, 
      name: "Premier League", 
      category: "league", 
      href: "premier-league", 
      imageQuery: "Premier League football", 
      apiFootballId: 39, 
      theSportsDBId: 4328, 
      footballDataId: 15, 
      rapidApiLeagueId: 47, 
      azharimmId: "eng.1", 
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/500px-Premier_League_Logo.svg.png" 
    },
    { 
      id: 2, 
      name: "EFL Championship", 
      category: "league", 
      href: "championship", 
      imageQuery: "English Championship football", 
      apiFootballId: 40, 
      theSportsDBId: 4329, 
      footballDataId: 16, 
      rapidApiLeagueId: 48, 
      azharimmId: "eng.2", 
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0f/EFL_Championship_Logo.svg/330px-EFL_Championship_Logo.svg.png" 
    },
    { 
      id: 32, 
      name: "EFL League One", 
      category: "league", 
      href: "league-one", 
      imageQuery: "English League One football", 
      apiFootballId: 41, 
      theSportsDBId: 4396, 
      footballDataId: undefined, 
      rapidApiLeagueId: 49, 
      azharimmId: "eng.3", 
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/EFL_League_One_Logo.svg/330px-EFL_League_One_Logo.svg.png" 
    },
    { 
      id: 3, 
      name: "La Liga", 
      category: "league", 
      href: "la-liga", 
      imageQuery: "La Liga football", 
      apiFootballId: 140, 
      theSportsDBId: 4335, 
      footballDataId: 10, 
      rapidApiLeagueId: 87, 
      azharimmId: "esp.1", 
      logo: "https://imgs.search.brave.com/L0yIcIPzdYBpS-EkwXhiQfmJ-_Z83x5YFkmcAP1uMQo/rs:fit:100:100:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5hcGktc3BvcnRz/LmlvL2Zvb3RiYWxs/L2xlYWd1ZXMvMTQw/LnBuZw" 
    },
    { 
      id: 4, 
      name: "Bundesliga", 
      category: "league", 
      href: "bundesliga", 
      imageQuery: "Bundesliga football", 
      apiFootballId: 78, 
      theSportsDBId: 4331, 
      footballDataId: 20, 
      rapidApiLeagueId: 54, 
      azharimmId: "ger.1", 
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/500px-Bundesliga_logo_%282017%29.svg.png" 
    },
    { 
      id: 5, 
      name: "Serie A", 
      category: "league", 
      href: "serie-a", 
      imageQuery: "Serie A football Italy", 
      apiFootballId: 135, 
      theSportsDBId: 4332, 
      footballDataId: 25, 
      rapidApiLeagueId: 55, 
      azharimmId: "ita.1", 
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ab/Serie_A_ENILIVE_logo.svg/330px-Serie_A_ENILIVE_logo.svg.png" 
    },
    { 
      id: 6, 
      name: "Ligue 1", 
      category: "league", 
      href: "ligue-1", 
      imageQuery: "Ligue 1 football France", 
      apiFootballId: 61, 
      theSportsDBId: 4334, 
      footballDataId: 30, 
      rapidApiLeagueId: 53, 
      azharimmId: "fra.1", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Logo_Ligue_1_McDonald%27s_2024.svg/250px-Logo_Ligue_1_McDonald%27s_2024.svg.png" 
    },
    { 
      id: 7, 
      name: "Eredivisie", 
      category: "league", 
      href: "eredivisie", 
      imageQuery: "Eredivisie football", 
      apiFootballId: 88, 
      theSportsDBId: 4337, 
      footballDataId: 35, 
      rapidApiLeagueId: 57, 
      azharimmId: "ned.1", 
      logo: "https://media.api-sports.io/football/leagues/88.png" 
    },
    { 
      id: 8, 
      name: "Primeira Liga", 
      category: "league", 
      href: "primeira-liga", 
      imageQuery: "Primeira Liga football Portugal", 
      apiFootballId: 94, 
      theSportsDBId: 4344, 
      footballDataId: 40, 
      rapidApiLeagueId: 61, 
      azharimmId: "por.1", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Liga_Portugal_Betclic_logo.svg/330px-Liga_Portugal_Betclic_logo.svg.png" 
    },
    { 
      id: 9, 
      name: "Campeonato Brasileiro Série A", 
      category: "league", 
      href: "brazilian-series-a", 
      imageQuery: "Brazilian football", 
      apiFootballId: 71, 
      theSportsDBId: 4351, 
      footballDataId: 70, 
      rapidApiLeagueId: 71, 
      azharimmId: "bra.1", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Campeonato_Brasileiro_S%C3%A9rie_A_logo_%282024%29.svg/500px-Campeonato_Brasileiro_S%C3%A9rie_A_logo_%282024%29.svg.png" 
    },
    { 
      id: 10, 
      name: "UEFA Champions League", 
      category: "international-club", 
      href: "champions-league", 
      imageQuery: "UEFA Champions League football", 
      apiFootballId: 2, 
      theSportsDBId: 4480, 
      footballDataId: 45, 
      rapidApiLeagueId: 42, 
      azharimmId: "uefa.champions", 
      logo: "https://media.api-sports.io/football/leagues/2.png" 
    },
    { 
      id: 11, 
      name: "UEFA Europa League", 
      category: "international-club", 
      href: "europa-league", 
      imageQuery: "UEFA Europa League football", 
      apiFootballId: 3, 
      theSportsDBId: 4481, 
      footballDataId: 46, 
      rapidApiLeagueId: 73, 
      azharimmId: "uefa.europa", 
      logo: "https://media.api-sports.io/football/leagues/3.png" 
    },
    { 
      id: 12, 
      name: "FIFA World Cup", 
      category: "international-country", 
      href: "world-cup", 
      imageQuery: "FIFA World Cup football", 
      apiFootballId: 1, 
      theSportsDBId: 4429, 
      footballDataId: 50, 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/FIFA_World_Cup_wordmark_%282023%29.svg/500px-FIFA_World_Cup_wordmark_%282023%29.svg.png" 
    },
    { id: 13, name: "UEFA Euro", category: "international-country", href: "uefa-euro", imageQuery: "UEFA Euro football", apiFootballId: 4, theSportsDBId: 4502, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/4.png" },
    { id: 14, name: "Copa América", category: "international-country", href: "copa-america", imageQuery: "Copa America football", apiFootballId: 9, theSportsDBId: 4499, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/9.png" },
    { id: 15, name: "Africa Cup of Nations", category: "international-country", href: "africa-cup-of-nations", imageQuery: "Africa Cup of Nations football", apiFootballId: 6, theSportsDBId: 4496, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/6.png" },
    { id: 16, name: "CONCACAF Gold Cup", category: "international-country", href: "gold-cup", imageQuery: "CONCACAF Gold Cup football", apiFootballId: 8, theSportsDBId: 4873, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/8.png" },
    { id: 17, name: "UEFA Nations League", category: "international-country", href: "nations-league", imageQuery: "UEFA Nations League football", apiFootballId: 5, theSportsDBId: 4490, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/5.png" },
    { id: 18, name: "Confederations Cup", category: "international-country", href: "confederations-cup", imageQuery: "Confederations Cup football", apiFootballId: 11, theSportsDBId: 4498, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/11.png" },
    { id: 19, name: "International Friendlies", category: "friendly", href: "international-friendlies", imageQuery: "International friendly football", apiFootballId: 10, theSportsDBId: 4562, footballDataId: undefined, logo: "https://r2.thesportsdb.com/images/media/league/badge/pdnktx1648659448.png" },
    { id: 27, name: "AFC Asian Cup", category: "international-country", href: "asian-cup", imageQuery: "AFC Asian Cup football", apiFootballId: 17, theSportsDBId: 4719, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/17.png" },
    { id: 28, name: "Copa Libertadores", category: "international-club", href: "copa-libertadores", imageQuery: "Copa Libertadores football", apiFootballId: 13, theSportsDBId: 4501, footballDataId: undefined, logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a1/Copa_Libertadores_logo.svg/500px-Copa_Libertadores_logo.svg.png" },
    { id: 29, name: "CAF Champions League", category: "international-club", href: "caf-champions-league", imageQuery: "CAF Champions League football", apiFootballId: 12, theSportsDBId: 4732, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/12.png" },
    { id: 30, name: "CONCACAF Champions Cup", category: "international-club", href: "concacaf-champions-cup", imageQuery: "CONCACAF Champions Cup football", apiFootballId: 14, theSportsDBId: 4874, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/14.png" },
    { id: 31, name: "FIFA Club World Cup", category: "international-club", href: "club-world-cup", imageQuery: "FIFA Club World Cup football", apiFootballId: 15, theSportsDBId: 4503, footballDataId: undefined, logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/FIFA_Club_World_Cup_logo.svg/500px-FIFA_Club_World_Cup_logo.svg.png" },
    { id: 21, name: "FA Cup", category: "cup", href: "fa-cup", imageQuery: "FA Cup football", apiFootballId: 45, theSportsDBId: 4482, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/45.png" },
    { id: 22, name: "EFL Cup", category: "cup", href: "efl-cup", imageQuery: "EFL Cup Carabao Cup football", apiFootballId: 46, theSportsDBId: 4566, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/46.png" },
    { id: 23, name: "Copa del Rey", category: "cup", href: "copa-del-rey", imageQuery: "Copa del Rey football", apiFootballId: 143, theSportsDBId: 4483, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/143.png" },
    { id: 24, name: "DFB-Pokal", category: "cup", href: "dfb-pokal", imageQuery: "DFB-Pokal German Cup football", apiFootballId: 79, theSportsDBId: 4485, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/79.png" },
    { id: 25, name: "Coupe de France", category: "cup", href: "coupe-de-france", imageQuery: "Coupe de France football", apiFootballId: 62, theSportsDBId: 4484, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/62.png" },
    { id: 26, name: "Coppa Italia", category: "cup", href: "coppa-italia", imageQuery: "Coppa Italia football", apiFootballId: 137, theSportsDBId: 4506, footballDataId: undefined, logo: "https://media.api-sports.io/football/leagues/137.png" }
];