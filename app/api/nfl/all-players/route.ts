import { NextResponse } from 'next/server';
import { getAllTeams } from '@/data/teams';

interface SportsKeedaPlayer {
  name: string;
  slug: string;
  jersey_no: string;
  age: number;
  is_active: boolean;
  is_practice_squad: boolean;
  positions: Array<{
    name: string;
    abbreviation: string;
  }>;
}

interface SportsKeedaResponse {
  squad: SportsKeedaPlayer[];
}

// Google Sheets configuration for PFSN Impact Grades
const GOOGLE_SHEETS_CONFIG: Record<string, { spreadsheetId: string; gid: string }> = {
  QB: { spreadsheetId: '17d7EIFBHLChlSoi6vRFArwviQRTJn0P0TOvQUNx8hU8', gid: '1456950409' },
  SAF: { spreadsheetId: '1SKr25H4brSE4dRf7JGpkytwLAKvt4jH-_wlCoqbFPXE', gid: '1216441503' },
  CB: { spreadsheetId: '1fUwD_rShGMrn7ypJyQsy4mCofqP7Q6J0Un8rsGW7h7U', gid: '1146203009' },
  LB: { spreadsheetId: '1mNCbJ8RxNZOSp_DuocR_5C7e_wqfiIPy4Rb9fS7GTBE', gid: '519296058' },
  EDGE: { spreadsheetId: '1RLSAJusOAcjnA1VDROtWFdfKUF4VYUV9JQ6tPinuGAQ', gid: '0' },
  DT: { spreadsheetId: '1N_V-cyIhROKXNatG1F_uPXTyP6BhuoNu_TebgjMQ6YM', gid: '0' },
  OL: { spreadsheetId: '1bKmYM1QyPSsJ9FyPtVZuxV0_HiUBw1o2loyU_55pXKA', gid: '1321084176' },
  TE: { spreadsheetId: '16LsyT1QLP-2ZdG_WNdHjn6ZMrFFu7q13qxDkKyTuseM', gid: '53851653' },
  WR: { spreadsheetId: '1h-HIZVjq1TM8FZ_5FYfxEZ3lPwtw_9ZWeqLzAi0EUIM', gid: '1964031106' },
  RB: { spreadsheetId: '1lXXHd9OzHA6Zp4yW1HZKsIJybLthW7tS93l4y4yCBzE', gid: '0' },
};

// Column mappings for each position sheet
const POSITION_COLUMN_MAPPINGS: Record<string, { playerCol: number; scoreCol: number; rankCol: number; headerRows: number }> = {
  QB: { playerCol: 2, scoreCol: 4, rankCol: 1, headerRows: 1 },
  SAF: { playerCol: 1, scoreCol: -3, rankCol: -4, headerRows: 10 },
  CB: { playerCol: 1, scoreCol: -3, rankCol: -4, headerRows: 10 },
  LB: { playerCol: 2, scoreCol: -3, rankCol: -4, headerRows: 10 },
  EDGE: { playerCol: 1, scoreCol: -3, rankCol: -4, headerRows: 10 },
  DT: { playerCol: 1, scoreCol: -3, rankCol: -4, headerRows: 10 },
  OL: { playerCol: 3, scoreCol: -9, rankCol: -11, headerRows: 10 },
  TE: { playerCol: 1, scoreCol: -3, rankCol: -4, headerRows: 10 },
  WR: { playerCol: 1, scoreCol: -7, rankCol: -2, headerRows: 9 },
  RB: { playerCol: 2, scoreCol: 0, rankCol: -4, headerRows: 10 },
};

// Position to sheet mapping
const POSITION_TO_SHEET: Record<string, string> = {
  'QB': 'QB', 'RB': 'RB', 'FB': 'RB', 'WR': 'WR', 'TE': 'TE',
  'OT': 'OL', 'OG': 'OL', 'OC': 'OL', 'C': 'OL', 'G': 'OL', 'T': 'OL', 'OL': 'OL',
  'DT': 'DT', 'NT': 'DT', 'DE': 'EDGE', 'EDGE': 'EDGE', 'OLB': 'EDGE',
  'LB': 'LB', 'ILB': 'LB', 'MLB': 'LB', 'CB': 'CB',
  'S': 'SAF', 'FS': 'SAF', 'SS': 'SAF', 'SAF': 'SAF', 'DB': 'CB',
};

interface ImpactGrade {
  player: string;
  score: number;
}

// Cache for impact grades
let impactGradesCache: Map<string, number> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function normalizePlayerName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(jr|sr|ii|iii|iv)$/g, '');
}

function generateNameVariations(name: string): string[] {
  const normalized = normalizePlayerName(name);
  const variations = [normalized];
  const withoutPeriods = name.replace(/\./g, '');
  variations.push(normalizePlayerName(withoutPeriods));
  const withoutHyphens = name.replace(/-/g, ' ');
  variations.push(normalizePlayerName(withoutHyphens));
  const withoutSuffix = name.replace(/\s+(jr\.?|sr\.?|ii|iii|iv|v)$/i, '');
  variations.push(normalizePlayerName(withoutSuffix));
  return [...new Set(variations)];
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function fetchPositionGrades(position: string): Promise<ImpactGrade[]> {
  try {
    const config = GOOGLE_SHEETS_CONFIG[position];
    if (!config) return [];
    const mapping = POSITION_COLUMN_MAPPINGS[position];
    if (!mapping) return [];

    const csvUrl = `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/export?format=csv&gid=${config.gid}`;
    const response = await fetch(csvUrl, {
      headers: { 'User-Agent': 'NFL-HQ/1.0' },
      next: { revalidate: 86400 },
    });

    if (!response.ok) return [];

    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    const grades: ImpactGrade[] = [];

    for (let i = mapping.headerRows; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < 3) continue;

      const getCol = (col: number) => col < 0 ? values[values.length + col] : values[col];
      const player = getCol(mapping.playerCol)?.trim() || '';
      const scoreStr = getCol(mapping.scoreCol)?.trim() || '0';
      const rankStr = getCol(mapping.rankCol)?.trim() || '0';
      const score = parseFloat(scoreStr.replace('%', '')) || 0;
      const rank = parseInt(rankStr) || 0;

      if (!player || player.toLowerCase() === 'player' || player.toLowerCase().includes('season')) continue;
      if (score <= 0 && rank <= 0) continue;

      grades.push({ player, score: score > 0 ? score : 50 });
    }

    return grades;
  } catch (error) {
    console.error(`Error fetching ${position} grades:`, error);
    return [];
  }
}

async function getAllImpactGrades(): Promise<Map<string, number>> {
  if (impactGradesCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return impactGradesCache;
  }

  const gradesMap = new Map<string, number>();
  const positions = Object.keys(GOOGLE_SHEETS_CONFIG);
  const allGradesResults = await Promise.all(positions.map(pos => fetchPositionGrades(pos)));

  for (const grades of allGradesResults) {
    for (const grade of grades) {
      const variations = generateNameVariations(grade.player);
      for (const variant of variations) {
        gradesMap.set(variant, grade.score);
      }
    }
  }

  impactGradesCache = gradesMap;
  cacheTimestamp = Date.now();
  return gradesMap;
}

// Team ID to Sportskeeda slug mapping
const teamSlugMap: Record<string, string> = {
  'arizona-cardinals': 'arizona-cardinals',
  'atlanta-falcons': 'atlanta-falcons',
  'baltimore-ravens': 'baltimore-ravens',
  'buffalo-bills': 'buffalo-bills',
  'carolina-panthers': 'carolina-panthers',
  'chicago-bears': 'chicago-bears',
  'cincinnati-bengals': 'cincinnati-bengals',
  'cleveland-browns': 'cleveland-browns',
  'dallas-cowboys': 'dallas-cowboys',
  'denver-broncos': 'denver-broncos',
  'detroit-lions': 'detroit-lions',
  'green-bay-packers': 'green-bay-packers',
  'houston-texans': 'houston-texans',
  'indianapolis-colts': 'indianapolis-colts',
  'jacksonville-jaguars': 'jacksonville-jaguars',
  'kansas-city-chiefs': 'kansas-city-chiefs',
  'las-vegas-raiders': 'las-vegas-raiders',
  'los-angeles-chargers': 'los-angeles-chargers',
  'los-angeles-rams': 'los-angeles-rams',
  'miami-dolphins': 'miami-dolphins',
  'minnesota-vikings': 'minnesota-vikings',
  'new-england-patriots': 'new-england-patriots',
  'new-orleans-saints': 'new-orleans-saints',
  'new-york-giants': 'new-york-giants',
  'new-york-jets': 'new-york-jets',
  'philadelphia-eagles': 'philadelphia-eagles',
  'pittsburgh-steelers': 'pittsburgh-steelers',
  'san-francisco-49ers': 'san-francisco-49ers',
  'seattle-seahawks': 'seattle-seahawks',
  'tampa-bay-buccaneers': 'tampa-bay-buccaneers',
  'tennessee-titans': 'tennessee-titans',
  'washington-commanders': 'washington-commanders'
};

async function fetchTeamRoster(teamId: string, teamName: string, impactGrades: Map<string, number>): Promise<Array<{
  id: string;
  name: string;
  position: string;
  team: string;
  teamId: string;
  age: number;
  impactGrade: number;
}>> {
  try {
    const sportsKeedaSlug = teamSlugMap[teamId];
    if (!sportsKeedaSlug) return [];

    const response = await fetch(
      `https://api.sportskeeda.com/v1/taxonomy/${sportsKeedaSlug}?include=squad`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NFL-HQ/1.0)' },
        next: { revalidate: 86400 }
      }
    );

    if (!response.ok) return [];
    const data: SportsKeedaResponse = await response.json();
    if (!data.squad || !Array.isArray(data.squad)) return [];

    return data.squad
      .filter(player => player.is_active && !player.is_practice_squad)
      .map(player => {
        // Get impact grade
        const nameVariations = generateNameVariations(player.name);
        let impactGrade = 0;
        for (const variant of nameVariations) {
          const score = impactGrades.get(variant);
          if (score && score > 0) {
            impactGrade = score;
            break;
          }
        }

        return {
          id: player.slug || player.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: player.name,
          position: player.positions?.[0]?.abbreviation || 'N/A',
          team: teamName,
          teamId: teamId,
          age: player.age || 0,
          impactGrade
        };
      });
  } catch (error) {
    console.error(`Error fetching roster for ${teamId}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    const allTeams = getAllTeams();

    // Fetch impact grades first
    const impactGrades = await getAllImpactGrades();

    // Fetch all team rosters in parallel
    const rosterPromises = allTeams.map(team =>
      fetchTeamRoster(team.id, team.fullName, impactGrades)
    );

    const allRosters = await Promise.all(rosterPromises);
    const allPlayers = allRosters.flat();

    // Sort by impact grade (highest first), then by name for ties
    allPlayers.sort((a, b) => {
      if (b.impactGrade !== a.impactGrade) {
        return b.impactGrade - a.impactGrade;
      }
      return a.name.localeCompare(b.name);
    });

    // Get top 100 by impact grade
    const top100 = allPlayers.filter(p => p.impactGrade > 0).slice(0, 100);

    return NextResponse.json({
      players: allPlayers,
      top100: top100,
      totalPlayers: allPlayers.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('All players API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players data' },
      { status: 500 }
    );
  }
}

// Suppress unused warning
void POSITION_TO_SHEET;
