// Top 100 All-Time NBA Players
// Realistic ranking based on career achievements, impact, and legacy

export const ALLTIME_TOP_100_IDS = [
  // Top 10
  'michael-jordan',         // 1 - Bulls/Wizards
  'lebron-james',           // 2 - Cavaliers/Heat/Lakers
  'kareem-abdul-jabbar',    // 3 - Bucks/Lakers
  'magic-johnson',          // 4 - Lakers
  'bill-russell',           // 5 - Celtics
  'wilt-chamberlain',       // 6 - Warriors/76ers/Lakers
  'larry-bird',             // 7 - Celtics
  'tim-duncan',             // 8 - Spurs
  'kobe-bryant',            // 9 - Lakers
  'shaquille-oneal',        // 10 - Magic/Lakers/Heat/Suns/Cavaliers/Celtics

  // 11-20
  'hakeem-olajuwon',        // 11 - Rockets
  'oscar-robertson',        // 12 - Royals/Bucks
  'stephen-curry',          // 13 - Warriors
  'kevin-durant',           // 14 - Thunder/Warriors/Nets/Suns
  'jerry-west',             // 15 - Lakers
  'moses-malone',           // 16 - Rockets/76ers/others
  'julius-erving',          // 17 - 76ers/Nets (ABA/NBA)
  'dirk-nowitzki',          // 18 - Mavericks
  'charles-barkley',        // 19 - 76ers/Suns/Rockets
  'karl-malone',            // 20 - Jazz/Lakers

  // 21-30
  'david-robinson',         // 21 - Spurs
  'elgin-baylor',           // 22 - Lakers
  'john-stockton',          // 23 - Jazz
  'dwyane-wade',            // 24 - Heat/Bulls/Cavaliers
  'kevin-garnett',          // 25 - Timberwolves/Celtics/Nets
  'allen-iverson',          // 26 - 76ers/Nuggets/Pistons/Grizzlies
  'giannis-antetokounmpo',  // 27 - Bucks
  'isiah-thomas',           // 28 - Pistons
  'chris-paul',             // 29 - Hornets/Clippers/Rockets/Thunder/Suns/Warriors
  'clyde-drexler',          // 30 - Trail Blazers/Rockets

  // 31-40
  'bob-pettit',             // 31 - Hawks
  'gary-payton',            // 32 - Sonics/Bucks/Lakers/Heat/Celtics
  'john-havlicek',          // 33 - Celtics
  'patrick-ewing',          // 34 - Knicks/Sonics/Magic
  'scottie-pippen',         // 35 - Bulls/Rockets/Trail Blazers
  'ray-allen',              // 36 - Bucks/Sonics/Celtics/Heat
  'steve-nash',             // 37 - Suns/Mavericks/Lakers
  'reggie-miller',          // 38 - Pacers
  'paul-pierce',            // 39 - Celtics/Nets/Wizards/Clippers
  'nikola-jokic',           // 40 - Nuggets

  // 41-50
  'kawhi-leonard',          // 41 - Spurs/Raptors/Clippers
  'dave-cowens',            // 42 - Celtics/Bucks
  'george-gervin',          // 43 - Spurs
  'rick-barry',             // 44 - Warriors
  'pete-maravich',          // 45 - Hawks/Jazz/Celtics
  'jason-kidd',             // 46 - Mavericks/Suns/Nets/Knicks
  'dennis-rodman',          // 47 - Pistons/Spurs/Bulls/Lakers/Mavericks
  'anthony-davis',          // 48 - Pelicans/Lakers
  'carmelo-anthony',        // 49 - Nuggets/Knicks/Thunder/Rockets/Trail Blazers/Lakers
  'james-harden',           // 50 - Thunder/Rockets/Nets/76ers/Clippers

  // 51-60
  'dominique-wilkins',      // 51 - Hawks/Clippers/Celtics/Spurs/Magic
  'russell-westbrook',      // 52 - Thunder/Rockets/Wizards/Lakers/Clippers/Nuggets
  'paul-arizin',            // 53 - Warriors
  'nate-thurmond',          // 54 - Warriors/Bulls/Cavaliers
  'walt-frazier',           // 55 - Knicks/Cavaliers
  'bob-cousy',              // 56 - Celtics
  'willis-reed',            // 57 - Knicks
  'chris-webber',           // 58 - Warriors/Kings/76ers/Pistons
  'vince-carter',           // 59 - Raptors/Nets/Magic/Suns/Mavericks/Grizzlies/Kings/Hawks
  'tracy-mcgrady',          // 60 - Raptors/Magic/Rockets/Knicks/Pistons/Spurs/Hawks

  // 61-70
  'yao-ming',               // 61 - Rockets
  'george-mikan',           // 62 - Lakers
  'bill-walton',            // 63 - Trail Blazers/Clippers/Celtics
  'dave-bing',              // 64 - Pistons/Wizards/Celtics
  'alex-english',           // 65 - Nuggets
  'bernard-king',           // 66 - Nets/Warriors/Knicks/Wizards
  'damian-lillard',         // 67 - Trail Blazers/Bucks
  'james-worthy',           // 68 - Lakers
  'chris-mullin',           // 69 - Warriors/Pacers
  'kyrie-irving',           // 70 - Cavaliers/Celtics/Nets/Mavericks

  // 71-80
  'artis-gilmore',          // 71 - Colonels (ABA)/Bulls/Spurs/Celtics
  'dikembe-mutombo',        // 72 - Nuggets/Hawks/76ers/Nets/Knicks/Rockets
  'grant-hill',             // 73 - Pistons/Magic/Suns
  'lenny-wilkens',          // 74 - Hawks/Sonics/Cavaliers/Trail Blazers
  'joe-dumars',             // 75 - Pistons
  'alonzo-mourning',        // 76 - Hornets/Heat/Nets
  'pau-gasol',              // 77 - Grizzlies/Lakers/Bulls/Spurs/Bucks
  'dwight-howard',          // 78 - Magic/Lakers/Rockets/Hawks/Hornets/Wizards/76ers
  'ben-wallace',            // 79 - Wizards/Magic/Pistons/Bulls/Cavaliers
  'manu-ginobili',          // 80 - Spurs

  // 81-90
  'tony-parker',            // 81 - Spurs/Hornets
  'earl-monroe',            // 82 - Bullets/Knicks
  'wes-unseld',             // 83 - Bullets
  'rajon-rondo',            // 84 - Celtics/Mavericks/Kings/Bulls/Pelicans/Lakers/Clippers/Hawks/Cavaliers
  'chris-bosh',             // 85 - Raptors/Heat
  'sam-jones',              // 86 - Celtics
  'dolph-schayes',          // 87 - Nationals/76ers
  'chauncey-billups',       // 88 - Celtics/Raptors/Nuggets/Timberwolves/Pistons/Knicks/Clippers
  'mitch-richmond',         // 89 - Warriors/Kings/Wizards/Lakers
  'tim-hardaway',           // 90 - Warriors/Heat

  // 91-100
  'robert-parish',          // 91 - Warriors/Celtics/Hornets/Bulls
  'adrian-dantley',         // 92 - Braves/Pacers/Lakers/Jazz/Pistons/Mavericks/Bucks
  'derrick-rose',           // 93 - Bulls/Knicks/Cavaliers/Timberwolves/Pistons/Grizzlies
  'clyde-lovellette',       // 94 - Lakers/Royals/Hawks/Celtics
  'luka-doncic',            // 95 - Mavericks
  'sidney-moncrief',        // 96 - Bucks/Hawks
  'joel-embiid',            // 97 - 76ers
  'jason-terry',            // 98 - Hawks/Mavericks/Celtics/Nets/Rockets/Bucks
  'gail-goodrich',          // 99 - Lakers/Suns/Jazz
  'mark-price',             // 100 - Cavaliers/Wizards/Warriors/Magic
];
