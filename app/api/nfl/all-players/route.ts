import { NextResponse } from 'next/server';
import { getAllRosters } from '@/app/api/nfl/rosters/route';

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

export async function GET() {
  try {
    // Fetch rosters and impact grades in parallel
    const [rostersMap, impactGrades] = await Promise.all([
      getAllRosters(),
      getAllImpactGrades(),
    ]);

    // Convert rosters to flat player list with impact grades
    const allPlayers: Array<{
      id: string;
      name: string;
      position: string;
      team: string;
      teamId: string;
      age: number;
      impactGrade: number;
    }> = [];

    rostersMap.forEach((roster, teamId) => {
      for (const player of roster.players) {
        // Only include active roster players (not practice squad)
        if (!player.isActive || player.isPracticeSquad) continue;

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

        allPlayers.push({
          id: player.slug || player.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: player.name,
          position: player.position,
          team: roster.teamName,
          teamId: teamId,
          age: player.age || 0,
          impactGrade
        });
      }
    });

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
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });

  } catch (error) {
    console.error('All players API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players data' },
      { status: 500 }
    );
  }
}
