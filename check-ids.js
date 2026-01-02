const fs = require('fs');
const content = fs.readFileSync('/Users/frago/Desktop/nba-hub/data/players.ts', 'utf8');

// Extract all player objects
const playerMatches = content.matchAll(/\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',/g);

const mismatches = [];
for (const match of playerMatches) {
  const id = match[1];
  const name = match[2];

  // Convert name to expected ID format
  let expectedId = name.toLowerCase()
    .replace(/\./g, '')
    .replace(/'/g, '')
    .replace(/\s+/g, '-')
    .replace(/ö/g, 'o')
    .replace(/š/g, 's')
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/ž/g, 'z')
    .replace(/ū/g, 'u')
    .replace(/ã/g, 'a')
    .replace(/é/g, 'e')
    .replace(/á/g, 'a')
    .replace(/ñ/g, 'n');

  // Check if ID starts with expected name pattern (allowing for team suffixes)
  const idWithoutSuffix = id.replace(/-[a-z]{2,3}\d*$/i, '');

  if (idWithoutSuffix !== expectedId && id !== expectedId) {
    mismatches.push({ id, name, expectedId });
  }
}

if (mismatches.length > 0) {
  console.log('ID/Name mismatches found:');
  console.log('========================');
  mismatches.forEach(m => {
    console.log('ID: ' + m.id + ' | Name: ' + m.name + ' | Expected: ' + m.expectedId);
  });
  console.log('\nTotal mismatches: ' + mismatches.length);
} else {
  console.log('No ID/name mismatches found!');
}
