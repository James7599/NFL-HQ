const fs = require('fs');
const content = fs.readFileSync('/Users/frago/Desktop/nba-hub/data/players.ts', 'utf8');

const teams = [
  'Atlanta Hawks',
  'Boston Celtics',
  'Brooklyn Nets',
  'Charlotte Hornets',
  'Chicago Bulls',
  'Cleveland Cavaliers',
  'Dallas Mavericks',
  'Denver Nuggets',
  'Detroit Pistons',
  'Golden State Warriors',
  'Houston Rockets',
  'Indiana Pacers',
  'LA Clippers',
  'LA Lakers',
  'Memphis Grizzlies',
  'Miami Heat',
  'Milwaukee Bucks',
  'Minnesota Timberwolves',
  'New Orleans Pelicans',
  'New York Knicks',
  'Oklahoma City Thunder',
  'Orlando Magic',
  'Philadelphia 76ers',
  'Phoenix Suns',
  'Portland Trail Blazers',
  'Sacramento Kings',
  'San Antonio Spurs',
  'Toronto Raptors',
  'Utah Jazz',
  'Washington Wizards'
];

console.log('Team Player Counts:');
console.log('==================');

let allGood = true;
teams.forEach(team => {
  const regex = new RegExp(`team: '${team.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g');
  const matches = content.match(regex);
  const count = matches ? matches.length : 0;
  const status = count >= 100 ? '✓' : '✗';
  console.log(`${status} ${team}: ${count}`);

  if (count < 100) {
    allGood = false;
  }
});

console.log('\n==================');
if (allGood) {
  console.log('✓ All 30 teams have 100+ players!');
} else {
  console.log('✗ Some teams have fewer than 100 players');
}
