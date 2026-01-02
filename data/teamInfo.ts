export interface RetiredNumber {
  number: string;
  name: string;
  position: string;
  years: string;
}

export interface HallOfFamer {
  name: string;
  yearInducted: string;
  category: string; // Player, Coach, Contributor, Referee, Team
  role?: string; // Position for players, or specific role
  yearsWithTeam?: string; // Years associated with this team
}

export interface TeamInfo {
  founded: string;
  capacity: string;
  owner: string;
  championships: string;
  championshipYears?: string[];
  conferenceChampionships: string;
  mostRecentConferenceChampionship?: string;
  divisionTitles: string;
  mostRecentDivisionTitle?: string;
  playoffAppearances: string;
  mostRecentPlayoffAppearance?: string;
  retiredNumbers: RetiredNumber[];
  hallOfFamers: HallOfFamer[];
}

export const teamInfo: Record<string, TeamInfo> = {
  'atlanta-hawks': {
    founded: '1946',
    capacity: '16,600',
    owner: 'Tony Ressler',
    championships: '1',
    championshipYears: ['1958'],
    conferenceChampionships: '4',
    mostRecentConferenceChampionship: '2021',
    divisionTitles: '9',
    mostRecentDivisionTitle: '2015',
    playoffAppearances: '49',
    mostRecentPlayoffAppearance: '2023',
    retiredNumbers: [
      { number: '9', name: 'Bob Pettit', position: 'F/C', years: '1954-1965' },
      { number: '21', name: 'Dominique Wilkins', position: 'F', years: '1982-1994' },
      { number: '23', name: 'Lou Hudson', position: 'F/G', years: '1966-1977' },
      { number: '44', name: 'Pete Maravich', position: 'G', years: '1970-1974' },
      { number: '55', name: 'Dikembe Mutombo', position: 'C', years: '1996-2001' }
    ],
    hallOfFamers: [
      { name: "Bob Pettit", yearInducted: "1971", category: "Player", role: "F/C", yearsWithTeam: "1954-1965" },
      { name: "Dominique Wilkins", yearInducted: "2006", category: "Player", role: "F", yearsWithTeam: "1982-1994" },
      { name: "Lou Hudson", yearInducted: "2022", category: "Player", role: "F/G", yearsWithTeam: "1966-1977" },
      { name: "Cliff Hagan", yearInducted: "1978", category: "Player", role: "F", yearsWithTeam: "1956-1966" },
      { name: "Slater Martin", yearInducted: "1982", category: "Player", role: "G", yearsWithTeam: "1956-1960" },
      { name: "Clyde Lovellette", yearInducted: "1988", category: "Player", role: "C", yearsWithTeam: "1958-1962" },
      { name: "Walt Bellamy", yearInducted: "1993", category: "Player", role: "C", yearsWithTeam: "1970-1974" },
      { name: "Pete Maravich", yearInducted: "1987", category: "Player", role: "G", yearsWithTeam: "1970-1974" },
      { name: "Lenny Wilkens", yearInducted: "1989", category: "Player", role: "G", yearsWithTeam: "1960-1968" },
      { name: "Lenny Wilkens", yearInducted: "1998", category: "Coach", role: "Head Coach", yearsWithTeam: "1993-2000" },
      { name: "Dikembe Mutombo", yearInducted: "2015", category: "Player", role: "C", yearsWithTeam: "1996-2001" },
      { name: "Bob Houbregs", yearInducted: "1987", category: "Player", role: "C", yearsWithTeam: "1953-1955" },
      { name: "Ed Macauley", yearInducted: "1960", category: "Player", role: "F/C", yearsWithTeam: "1956-1959" },
      { name: "Moses Malone", yearInducted: "2001", category: "Player", role: "C", yearsWithTeam: "1988-1991" }
    ]
  },
  'boston-celtics': {
    founded: '1946',
    capacity: '19,156',
    owner: 'Wyc Grousbeck',
    championships: '18',
    championshipYears: ['1957', '1959', '1960', '1961', '1962', '1963', '1964', '1965', '1966', '1968', '1969', '1974', '1976', '1981', '1984', '1986', '2008', '2024'],
    conferenceChampionships: '23',
    mostRecentConferenceChampionship: '2024',
    divisionTitles: '32',
    mostRecentDivisionTitle: '2025',
    playoffAppearances: '62',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '00', name: 'Robert Parish', position: 'C', years: '1980-1994' },
      { number: '1', name: 'Walter Brown', position: 'Founder', years: '1946-1964' },
      { number: '2', name: 'Red Auerbach', position: 'Coach', years: '1950-1966' },
      { number: '6', name: 'Bill Russell', position: 'C', years: '1956-1969' },
      { number: '10', name: 'Jo Jo White', position: 'G', years: '1969-1979' },
      { number: '14', name: 'Bob Cousy', position: 'G', years: '1950-1963' },
      { number: '15', name: 'Tom Heinsohn', position: 'F', years: '1956-1965' },
      { number: '16', name: 'Satch Sanders', position: 'F', years: '1960-1973' },
      { number: '17', name: 'John Havlicek', position: 'F/G', years: '1962-1978' },
      { number: '18', name: 'Dave Cowens', position: 'C', years: '1970-1980' },
      { number: '19', name: 'Don Nelson', position: 'F', years: '1965-1976' },
      { number: '21', name: 'Bill Sharman', position: 'G', years: '1951-1961' },
      { number: '22', name: 'Ed Macauley', position: 'C', years: '1950-1956' },
      { number: '23', name: 'Frank Ramsey', position: 'F', years: '1954-1964' },
      { number: '24', name: 'Sam Jones', position: 'G', years: '1957-1969' },
      { number: '25', name: 'K.C. Jones', position: 'G', years: '1958-1967' },
      { number: '31', name: 'Cedric Maxwell', position: 'F', years: '1977-1985' },
      { number: '32', name: 'Kevin McHale', position: 'F', years: '1980-1993' },
      { number: '33', name: 'Larry Bird', position: 'F', years: '1979-1992' },
      { number: '34', name: 'Paul Pierce', position: 'F', years: '1998-2013' },
      { number: '35', name: 'Reggie Lewis', position: 'F', years: '1987-1993' },
      { number: 'LOSCY', name: 'Jim Loscutoff', position: 'F', years: '1955-1964' }
    ],
    hallOfFamers: [
      { name: "Bill Russell", yearInducted: "1975", category: "Player", role: "C", yearsWithTeam: "1956-1969" },
      { name: "Bill Russell", yearInducted: "2021", category: "Coach", role: "Head Coach", yearsWithTeam: "1966-1969" },
      { name: "Bob Cousy", yearInducted: "1971", category: "Player", role: "G", yearsWithTeam: "1950-1963" },
      { name: "Larry Bird", yearInducted: "1998", category: "Player", role: "F", yearsWithTeam: "1979-1992" },
      { name: "John Havlicek", yearInducted: "1984", category: "Player", role: "F/G", yearsWithTeam: "1962-1978" },
      { name: "Tom Heinsohn", yearInducted: "1986", category: "Player", role: "F", yearsWithTeam: "1956-1965" },
      { name: "Tom Heinsohn", yearInducted: "2015", category: "Coach", role: "Head Coach", yearsWithTeam: "1969-1978" },
      { name: "Sam Jones", yearInducted: "1984", category: "Player", role: "G", yearsWithTeam: "1957-1969" },
      { name: "Kevin McHale", yearInducted: "1999", category: "Player", role: "F", yearsWithTeam: "1980-1993" },
      { name: "Robert Parish", yearInducted: "2003", category: "Player", role: "C", yearsWithTeam: "1980-1994" },
      { name: "Dave Cowens", yearInducted: "1991", category: "Player", role: "C", yearsWithTeam: "1970-1980" },
      { name: "Dennis Johnson", yearInducted: "2010", category: "Player", role: "G", yearsWithTeam: "1983-1990" },
      { name: "K.C. Jones", yearInducted: "1989", category: "Player", role: "G", yearsWithTeam: "1958-1967" },
      { name: "Jo Jo White", yearInducted: "2015", category: "Player", role: "G", yearsWithTeam: "1969-1979" },
      { name: "Bill Sharman", yearInducted: "1976", category: "Player", role: "G", yearsWithTeam: "1951-1961" },
      { name: "Ed Macauley", yearInducted: "1960", category: "Player", role: "F/C", yearsWithTeam: "1950-1956" },
      { name: "Frank Ramsey", yearInducted: "1982", category: "Player", role: "F/G", yearsWithTeam: "1954-1964" },
      { name: "Bailey Howell", yearInducted: "1997", category: "Player", role: "F", yearsWithTeam: "1966-1970" },
      { name: "Paul Pierce", yearInducted: "2021", category: "Player", role: "F", yearsWithTeam: "1998-2013" },
      { name: "Ray Allen", yearInducted: "2018", category: "Player", role: "G", yearsWithTeam: "2007-2012" },
      { name: "Kevin Garnett", yearInducted: "2020", category: "Player", role: "F", yearsWithTeam: "2007-2013" },
      { name: "Arnie Risen", yearInducted: "1998", category: "Player", role: "C", yearsWithTeam: "1955-1958" },
      { name: "Red Auerbach", yearInducted: "1969", category: "Coach", role: "Head Coach", yearsWithTeam: "1950-1966" },
      { name: "Tom Sanders", yearInducted: "2011", category: "Contributor", role: "Player", yearsWithTeam: "1960-1973" },
      { name: "Dave Bing", yearInducted: "1990", category: "Player", role: "G", yearsWithTeam: "1977-1978" },
      { name: "Pete Maravich", yearInducted: "1987", category: "Player", role: "G", yearsWithTeam: "1980" },
      { name: "Bill Walton", yearInducted: "1993", category: "Player", role: "C", yearsWithTeam: "1985-1987" }
    ]
  },
  'brooklyn-nets': {
    founded: '1967',
    capacity: '17,732',
    owner: 'Joe Tsai',
    championships: '0',
    conferenceChampionships: '2',
    mostRecentConferenceChampionship: '2003',
    divisionTitles: '5',
    mostRecentDivisionTitle: '2006',
    playoffAppearances: '27',
    mostRecentPlayoffAppearance: '2023',
    retiredNumbers: [
      { number: '3', name: 'Drazen Petrovic', position: 'G', years: '1991-1993' },
      { number: '5', name: 'Jason Kidd', position: 'G', years: '2001-2008' },
      { number: '15', name: 'Vince Carter', position: 'G/F', years: '2004-2009' },
      { number: '23', name: 'John Williamson', position: 'G', years: '1973-1980' },
      { number: '25', name: 'Bill Melchionni', position: 'G', years: '1969-1976' },
      { number: '32', name: 'Julius Erving', position: 'F', years: '1973-1976' },
      { number: '52', name: 'Buck Williams', position: 'F', years: '1981-1989' }
    ],
    hallOfFamers: [
      { name: "Julius Erving", yearInducted: "1993", category: "Player", role: "F", yearsWithTeam: "1973-1976" },
      { name: "Rick Barry", yearInducted: "1987", category: "Player", role: "F", yearsWithTeam: "1970-1972" },
      { name: "Drazen Petrovic", yearInducted: "2002", category: "Player", role: "G", yearsWithTeam: "1991-1993" },
      { name: "Jason Kidd", yearInducted: "2018", category: "Player", role: "G", yearsWithTeam: "2001-2008" },
      { name: "Vince Carter", yearInducted: "2024", category: "Player", role: "G/F", yearsWithTeam: "2004-2009" },
      { name: "Kevin Garnett", yearInducted: "2020", category: "Player", role: "F", yearsWithTeam: "2013-2015" },
      { name: "Paul Pierce", yearInducted: "2021", category: "Player", role: "F", yearsWithTeam: "2013-2014" }
    ]
  },
  'charlotte-hornets': {
    founded: '1988',
    capacity: '19,077',
    owner: 'Rick Schnall & Gabe Plotkin',
    championships: '0',
    conferenceChampionships: '0',
    divisionTitles: '0',
    playoffAppearances: '10',
    mostRecentPlayoffAppearance: '2016',
    retiredNumbers: [
      { number: '13', name: 'Bobby Phills', position: 'G', years: '1997-2000' }
    ],
    hallOfFamers: [
      { name: "Alonzo Mourning", yearInducted: "2014", category: "Player", role: "C", yearsWithTeam: "1992-1995" },
      { name: "Robert Parish", yearInducted: "2003", category: "Player", role: "C", yearsWithTeam: "1994-1996" }
    ]
  },
  'chicago-bulls': {
    founded: '1966',
    capacity: '20,917',
    owner: 'Jerry Reinsdorf',
    championships: '6',
    championshipYears: ['1991', '1992', '1993', '1996', '1997', '1998'],
    conferenceChampionships: '6',
    mostRecentConferenceChampionship: '2011',
    divisionTitles: '9',
    mostRecentDivisionTitle: '2012',
    playoffAppearances: '35',
    mostRecentPlayoffAppearance: '2022',
    retiredNumbers: [
      { number: '4', name: 'Jerry Sloan', position: 'G', years: '1966-1976' },
      { number: '10', name: 'Bob Love', position: 'F', years: '1968-1976' },
      { number: '23', name: 'Michael Jordan', position: 'G', years: '1984-1998' },
      { number: '33', name: 'Scottie Pippen', position: 'F', years: '1987-1998' }
    ],
    hallOfFamers: [
      { name: "Michael Jordan", yearInducted: "2009", category: "Player", role: "G", yearsWithTeam: "1984-1993, 1995-1998" },
      { name: "Scottie Pippen", yearInducted: "2010", category: "Player", role: "F", yearsWithTeam: "1987-1998, 2003-2004" },
      { name: "Dennis Rodman", yearInducted: "2011", category: "Player", role: "F", yearsWithTeam: "1995-1998" },
      { name: "Bob Love", yearInducted: "N/A", category: "Player", role: "F", yearsWithTeam: "1968-1976" },
      { name: "Jerry Sloan", yearInducted: "2009", category: "Coach", role: "Player", yearsWithTeam: "1966-1976" },
      { name: "Artis Gilmore", yearInducted: "2011", category: "Player", role: "C", yearsWithTeam: "1976-1982, 1987" },
      { name: "Dick Motta", yearInducted: "N/A", category: "Coach", role: "Head Coach", yearsWithTeam: "1968-1976" },
      { name: "Phil Jackson", yearInducted: "2007", category: "Coach", role: "Head Coach", yearsWithTeam: "1989-1998" },
      { name: "Jerry Krause", yearInducted: "2017", category: "Contributor", role: "GM", yearsWithTeam: "1985-2003" },
      { name: "Jerry Reinsdorf", yearInducted: "2016", category: "Contributor", role: "Owner", yearsWithTeam: "1985-present" },
      { name: "Toni Kukoc", yearInducted: "2021", category: "Player", role: "F", yearsWithTeam: "1993-2000" },
      { name: "Bob Boozer", yearInducted: "N/A", category: "Player", role: "F", yearsWithTeam: "1966-1969" }
    ]
  },
  'cleveland-cavaliers': {
    founded: '1970',
    capacity: '19,432',
    owner: 'Dan Gilbert',
    championships: '1',
    championshipYears: ['2016'],
    conferenceChampionships: '5',
    mostRecentConferenceChampionship: '2018',
    divisionTitles: '7',
    mostRecentDivisionTitle: '2025',
    playoffAppearances: '23',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '7', name: 'Bingo Smith', position: 'F', years: '1970-1979' },
      { number: '11', name: 'Zydrunas Ilgauskas', position: 'C', years: '1996-2010' },
      { number: '22', name: 'Larry Nance', position: 'F', years: '1988-1994' },
      { number: '25', name: 'Mark Price', position: 'G', years: '1986-1995' },
      { number: '34', name: 'Austin Carr', position: 'G', years: '1971-1980' },
      { number: '42', name: 'Nate Thurmond', position: 'C', years: '1975-1977' },
      { number: '43', name: 'Brad Daugherty', position: 'C', years: '1986-1994' }
    ],
    hallOfFamers: [
      { name: "Nate Thurmond", yearInducted: "1985", category: "Player", role: "C", yearsWithTeam: "1975-1977" },
      { name: "Walt Frazier", yearInducted: "1987", category: "Player", role: "G", yearsWithTeam: "1977-1979" },
      { name: "Bill Fitch", yearInducted: "2019", category: "Coach", role: "Head Coach", yearsWithTeam: "1970-1979" },
      { name: "Lenny Wilkens", yearInducted: "1998", category: "Coach", role: "Head Coach", yearsWithTeam: "1986-1993" },
      { name: "Shaquille O'Neal", yearInducted: "2016", category: "Player", role: "C", yearsWithTeam: "2009-2010" }
    ]
  },
  'dallas-mavericks': {
    founded: '1980',
    capacity: '19,200',
    owner: 'Patrick Dumont & Miriam Adelson',
    championships: '1',
    championshipYears: ['2011'],
    conferenceChampionships: '3',
    mostRecentConferenceChampionship: '2024',
    divisionTitles: '5',
    mostRecentDivisionTitle: '2024',
    playoffAppearances: '24',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '12', name: 'Derek Harper', position: 'G', years: '1983-1997' },
      { number: '15', name: 'Brad Davis', position: 'G', years: '1980-1992' },
      { number: '22', name: 'Rolando Blackman', position: 'G', years: '1981-1992' },
      { number: '24', name: 'Kobe Bryant', position: 'Honorary, Never played for Dallas', years: '' },
      { number: '41', name: 'Dirk Nowitzki', position: 'F', years: '1999-2019' }
    ],
    hallOfFamers: [
      { name: "Dirk Nowitzki", yearInducted: "2023", category: "Player", role: "F", yearsWithTeam: "1998-2019" },
      { name: "Jason Kidd", yearInducted: "2018", category: "Player", role: "G", yearsWithTeam: "1994-1996, 2008-2012" },
      { name: "Steve Nash", yearInducted: "2018", category: "Player", role: "G", yearsWithTeam: "1998-2004" },
      { name: "Dennis Rodman", yearInducted: "2011", category: "Player", role: "F", yearsWithTeam: "2000" }
    ]
  },
  'denver-nuggets': {
    founded: '1967',
    capacity: '19,520',
    owner: 'Stan Kroenke',
    championships: '1',
    championshipYears: ['2023'],
    conferenceChampionships: '1',
    mostRecentConferenceChampionship: '2023',
    divisionTitles: '11',
    mostRecentDivisionTitle: '2024',
    playoffAppearances: '38',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '2', name: 'Alex English', position: 'F', years: '1980-1990' },
      { number: '12', name: 'Fat Lever', position: 'G', years: '1984-1990' },
      { number: '33', name: 'David Thompson', position: 'G', years: '1975-1982' },
      { number: '40', name: 'Byron Beck', position: 'F', years: '1967-1977' },
      { number: '44', name: 'Dan Issel', position: 'C/F', years: '1975-1985' },
      { number: '55', name: 'Dikembe Mutombo', position: 'C', years: '1991-1996' },
      { number: '432', name: 'Doug Moe', position: 'Coach', years: '1980-1990' }
    ],
    hallOfFamers: [
      { name: "Alex English", yearInducted: "1997", category: "Player", role: "F", yearsWithTeam: "1980-1990" },
      { name: "Dan Issel", yearInducted: "1993", category: "Player", role: "F/C", yearsWithTeam: "1975-1985" },
      { name: "David Thompson", yearInducted: "1996", category: "Player", role: "G/F", yearsWithTeam: "1975-1982" },
      { name: "Dikembe Mutombo", yearInducted: "2015", category: "Player", role: "C", yearsWithTeam: "1991-1996" },
      { name: "Carmelo Anthony", yearInducted: "2025", category: "Player", role: "F", yearsWithTeam: "2003-2011" },
      { name: "Allen Iverson", yearInducted: "2016", category: "Player", role: "G", yearsWithTeam: "2006-2008" },
      { name: "George Karl", yearInducted: "2022", category: "Coach", role: "Head Coach", yearsWithTeam: "2005-2013" },
      { name: "Larry Brown", yearInducted: "2002", category: "Coach", role: "Head Coach", yearsWithTeam: "1974-1979" },
      { name: "Doug Moe", yearInducted: "N/A", category: "Coach", role: "Head Coach", yearsWithTeam: "1980-1990" }
    ]
  },
  'detroit-pistons': {
    founded: '1941',
    capacity: '20,332',
    owner: 'Tom Gores',
    championships: '3',
    championshipYears: ['1989', '1990', '2004'],
    conferenceChampionships: '7',
    mostRecentConferenceChampionship: '2008',
    divisionTitles: '11',
    mostRecentDivisionTitle: '2008',
    playoffAppearances: '42',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '1', name: 'Chauncey Billups', position: 'G', years: '2002-2008' },
      { number: '3', name: 'Ben Wallace', position: 'C', years: '2000-2006' },
      { number: '4', name: 'Joe Dumars', position: 'G', years: '1985-1999' },
      { number: '10', name: 'Dennis Rodman', position: 'F', years: '1986-1993' },
      { number: '11', name: 'Isiah Thomas', position: 'G', years: '1981-1994' },
      { number: '15', name: 'Vinnie Johnson', position: 'G', years: '1981-1991' },
      { number: '16', name: 'Bob Lanier', position: 'C', years: '1970-1980' },
      { number: '21', name: 'Dave Bing', position: 'G', years: '1966-1975' },
      { number: '32', name: 'Richard Hamilton', position: 'G', years: '2002-2011' },
      { number: '40', name: 'Bill Laimbeer', position: 'C', years: '1982-1993' }
    ],
    hallOfFamers: [
      { name: "Isiah Thomas", yearInducted: "2000", category: "Player", role: "G", yearsWithTeam: "1981-1994" },
      { name: "Joe Dumars", yearInducted: "2006", category: "Player", role: "G", yearsWithTeam: "1985-1999" },
      { name: "Dennis Rodman", yearInducted: "2011", category: "Player", role: "F", yearsWithTeam: "1986-1993" },
      { name: "Bob Lanier", yearInducted: "1992", category: "Player", role: "C", yearsWithTeam: "1970-1980" },
      { name: "Dave Bing", yearInducted: "1990", category: "Player", role: "G", yearsWithTeam: "1966-1975" },
      { name: "Grant Hill", yearInducted: "2018", category: "Player", role: "F", yearsWithTeam: "1994-2000" },
      { name: "Chuck Daly", yearInducted: "1994", category: "Coach", role: "Head Coach", yearsWithTeam: "1983-1992" },
      { name: "Dave DeBusschere", yearInducted: "1983", category: "Player", role: "F", yearsWithTeam: "1962-1968" },
      { name: "Bailey Howell", yearInducted: "1997", category: "Player", role: "F", yearsWithTeam: "1959-1964" },
      { name: "Bill Davidson", yearInducted: "2008", category: "Contributor", role: "Owner", yearsWithTeam: "1974-2009" },
      { name: "Ben Wallace", yearInducted: "2021", category: "Player", role: "C/F", yearsWithTeam: "2000-2006, 2009-2012" },
      { name: "George Yardley", yearInducted: "1996", category: "Player", role: "F", yearsWithTeam: "1953-1959" },
      { name: "Bob McAdoo", yearInducted: "2000", category: "Player", role: "C/F", yearsWithTeam: "1979-1981" },
      { name: "Adrian Dantley", yearInducted: "2008", category: "Player", role: "F", yearsWithTeam: "1986-1989" }
    ]
  },
  'golden-state-warriors': {
    founded: '1946',
    capacity: '18,064',
    owner: 'Joe Lacob & Peter Guber',
    championships: '7',
    championshipYears: ['1947', '1956', '1975', '2015', '2017', '2018', '2022'],
    conferenceChampionships: '12',
    mostRecentConferenceChampionship: '2022',
    divisionTitles: '12',
    mostRecentDivisionTitle: '2022',
    playoffAppearances: '39',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '9', name: 'Andre Iguodala', position: 'G/F', years: '2013-2019' },
      { number: '13', name: 'Wilt Chamberlain', position: 'C', years: '1959-1965' },
      { number: '14', name: 'Tom Meschery', position: 'F', years: '1961-1971' },
      { number: '16', name: 'Al Attles', position: 'G/Coach', years: '1960-1983' },
      { number: '17', name: 'Chris Mullin', position: 'F', years: '1985-1997' },
      { number: '24', name: 'Rick Barry', position: 'F', years: '1965-1978' },
      { number: '42', name: 'Nate Thurmond', position: 'C', years: '1963-1974' }
    ],
    hallOfFamers: [
      { name: "Wilt Chamberlain", yearInducted: "1979", category: "Player", role: "C", yearsWithTeam: "1959-1965" },
      { name: "Rick Barry", yearInducted: "1987", category: "Player", role: "F", yearsWithTeam: "1965-1967, 1972-1978" },
      { name: "Paul Arizin", yearInducted: "1978", category: "Player", role: "F", yearsWithTeam: "1950-1962" },
      { name: "Joe Fulks", yearInducted: "1978", category: "Player", role: "F", yearsWithTeam: "1946-1954" },
      { name: "Neil Johnston", yearInducted: "1990", category: "Player", role: "C", yearsWithTeam: "1951-1959" },
      { name: "Nate Thurmond", yearInducted: "1985", category: "Player", role: "C", yearsWithTeam: "1963-1974" },
      { name: "Chris Mullin", yearInducted: "2011", category: "Player", role: "F", yearsWithTeam: "1985-1997, 2000-2001" },
      { name: "Tom Gola", yearInducted: "1976", category: "Player", role: "G/F", yearsWithTeam: "1955-1962" },
      { name: "Al Attles", yearInducted: "2019", category: "Contributor", role: "Player/Coach", yearsWithTeam: "1960-1983" },
      { name: "Jamaal Wilkes", yearInducted: "2012", category: "Player", role: "F", yearsWithTeam: "1974-1977" },
      { name: "Andy Phillip", yearInducted: "1961", category: "Player", role: "G", yearsWithTeam: "1952-1956" },
      { name: "Robert Parish", yearInducted: "2003", category: "Player", role: "C", yearsWithTeam: "1976-1980" }
    ]
  },
  'houston-rockets': {
    founded: '1967',
    capacity: '18,055',
    owner: 'Tilman Fertitta',
    championships: '2',
    championshipYears: ['1994', '1995'],
    conferenceChampionships: '4',
    mostRecentConferenceChampionship: '2018',
    divisionTitles: '8',
    mostRecentDivisionTitle: '2025',
    playoffAppearances: '33',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '11', name: 'Yao Ming', position: 'C', years: '2002-2011' },
      { number: '22', name: 'Clyde Drexler', position: 'G', years: '1995-1998' },
      { number: '23', name: 'Calvin Murphy', position: 'G', years: '1970-1983' },
      { number: '24', name: 'Moses Malone', position: 'C', years: '1976-1982' },
      { number: '34', name: 'Hakeem Olajuwon', position: 'C', years: '1984-2001' },
      { number: '44', name: 'Elvin Hayes', position: 'F/C', years: '1968-1972' },
      { number: '45', name: 'Rudy Tomjanovich', position: 'F', years: '1970-1981' }
    ],
    hallOfFamers: [
      { name: "Hakeem Olajuwon", yearInducted: "2008", category: "Player", role: "C", yearsWithTeam: "1984-2001" },
      { name: "Moses Malone", yearInducted: "2001", category: "Player", role: "C", yearsWithTeam: "1976-1982" },
      { name: "Clyde Drexler", yearInducted: "2004", category: "Player", role: "G", yearsWithTeam: "1995-1998" },
      { name: "Elvin Hayes", yearInducted: "1990", category: "Player", role: "F/C", yearsWithTeam: "1968-1972, 1981-1984" },
      { name: "Calvin Murphy", yearInducted: "1993", category: "Player", role: "G", yearsWithTeam: "1970-1983" },
      { name: "Yao Ming", yearInducted: "2016", category: "Player", role: "C", yearsWithTeam: "2002-2011" },
      { name: "Rudy Tomjanovich", yearInducted: "2020", category: "Coach", role: "Head Coach", yearsWithTeam: "1992-2003" },
      { name: "Tracy McGrady", yearInducted: "2017", category: "Player", role: "F/G", yearsWithTeam: "2004-2010" },
      { name: "Scottie Pippen", yearInducted: "2010", category: "Player", role: "F", yearsWithTeam: "1998-1999" },
      { name: "Charles Barkley", yearInducted: "2006", category: "Player", role: "F", yearsWithTeam: "1996-2000" },
      { name: "Ralph Sampson", yearInducted: "2012", category: "Player", role: "C", yearsWithTeam: "1983-1987" },
      { name: "Dikembe Mutombo", yearInducted: "2015", category: "Player", role: "C", yearsWithTeam: "2004-2009" },
      { name: "Steve Nash", yearInducted: "2018", category: "Player", role: "G", yearsWithTeam: "2004" }
    ]
  },
  'indiana-pacers': {
    founded: '1967',
    capacity: '17,923',
    owner: 'Herbert Simon',
    championships: '0',
    conferenceChampionships: '1',
    mostRecentConferenceChampionship: '2025',
    divisionTitles: '9',
    mostRecentDivisionTitle: '2014',
    playoffAppearances: '28',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '30', name: 'George McGinnis', position: 'F', years: '1971-1982' },
      { number: '31', name: 'Reggie Miller', position: 'G', years: '1987-2005' },
      { number: '34', name: 'Mel Daniels', position: 'C', years: '1968-1974' },
      { number: '35', name: 'Roger Brown', position: 'F', years: '1967-1975' },
      { number: '529', name: 'Bobby Leonard', position: 'Coach', years: '1968-1980' }
    ],
    hallOfFamers: [
      { name: "Reggie Miller", yearInducted: "2012", category: "Player", role: "G", yearsWithTeam: "1987-2005" },
      { name: "Mel Daniels", yearInducted: "2012", category: "Player", role: "C/F", yearsWithTeam: "1968-1974" },
      { name: "George McGinnis", yearInducted: "2017", category: "Player", role: "F", yearsWithTeam: "1971-1975, 1980-1982" },
      { name: "Roger Brown", yearInducted: "2013", category: "Player", role: "F", yearsWithTeam: "1967-1975" },
      { name: "Bob Leonard", yearInducted: "2014", category: "Coach", role: "Head Coach", yearsWithTeam: "1968-1980" },
      { name: "Larry Brown", yearInducted: "2002", category: "Coach", role: "Head Coach", yearsWithTeam: "1993-1997" },
      { name: "Herb Simon", yearInducted: "2024", category: "Contributor", role: "Owner", yearsWithTeam: "1983-present" },
      { name: "Jermaine O'Neal", yearInducted: "N/A", category: "Player", role: "F/C", yearsWithTeam: "2000-2008" }
    ]
  },
  'los-angeles-clippers': {
    founded: '1970',
    capacity: '18,000',
    owner: 'Steve Ballmer',
    championships: '0',
    conferenceChampionships: '0',
    divisionTitles: '2',
    mostRecentDivisionTitle: '2025',
    playoffAppearances: '18',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [],
    hallOfFamers: [
      { name: "Bob McAdoo", yearInducted: "2000", category: "Player", role: "C/F", yearsWithTeam: "1972-1976" },
      { name: "Tiny Archibald", yearInducted: "1991", category: "Player", role: "G", yearsWithTeam: "1970-1976" },
      { name: "Gary Payton", yearInducted: "2013", category: "Player", role: "G", yearsWithTeam: "2002-2003" },
      { name: "Dominique Wilkins", yearInducted: "2006", category: "Player", role: "F", yearsWithTeam: "1994" },
      { name: "Adrian Dantley", yearInducted: "2008", category: "Player", role: "F", yearsWithTeam: "1976-1977" }
    ]
  },
  'los-angeles-lakers': {
    founded: '1947',
    capacity: '18,997',
    owner: 'Jeanie Buss',
    championships: '17',
    championshipYears: ['1949', '1950', '1952', '1953', '1954', '1972', '1980', '1982', '1985', '1987', '1988', '2000', '2001', '2002', '2009', '2010', '2020'],
    conferenceChampionships: '32',
    mostRecentConferenceChampionship: '2020',
    divisionTitles: '24',
    mostRecentDivisionTitle: '2025',
    playoffAppearances: '62',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '8', name: 'Kobe Bryant', position: 'G', years: '1996-2006' },
      { number: '13', name: 'Wilt Chamberlain', position: 'C', years: '1968-1973' },
      { number: '16', name: 'Pau Gasol', position: 'F', years: '2008-2014' },
      { number: '21', name: 'Michael Cooper', position: 'G', years: '1978-1990' },
      { number: '22', name: 'Elgin Baylor', position: 'F', years: '1958-1972' },
      { number: '24', name: 'Kobe Bryant', position: 'G', years: '2006-2016' },
      { number: '25', name: 'Gail Goodrich', position: 'G', years: '1965-1976' },
      { number: '32', name: 'Magic Johnson', position: 'G', years: '1979-1996' },
      { number: '33', name: 'Kareem Abdul-Jabbar', position: 'C', years: '1975-1989' },
      { number: '34', name: 'Shaquille O\'Neal', position: 'C', years: '1996-2004' },
      { number: '42', name: 'James Worthy', position: 'F', years: '1982-1994' },
      { number: '44', name: 'Jerry West', position: 'G', years: '1960-1974' },
      { number: '52', name: 'Jamaal Wilkes', position: 'F', years: '1977-1985' },
      { number: '99', name: 'George Mikan', position: 'C', years: '1948-1956' }
    ],
    hallOfFamers: [
      { name: "Kareem Abdul-Jabbar", yearInducted: "1995", category: "Player", role: "C", yearsWithTeam: "1975-1989" },
      { name: "Magic Johnson", yearInducted: "2002", category: "Player", role: "G", yearsWithTeam: "1979-1991, 1996" },
      { name: "Shaquille O'Neal", yearInducted: "2016", category: "Player", role: "C", yearsWithTeam: "1996-2004" },
      { name: "Jerry West", yearInducted: "1980", category: "Player", role: "G", yearsWithTeam: "1960-1974" },
      { name: "Jerry West", yearInducted: "2024", category: "Contributor", role: "Executive", yearsWithTeam: "1982-2002" },
      { name: "Elgin Baylor", yearInducted: "1977", category: "Player", role: "F", yearsWithTeam: "1958-1971" },
      { name: "Wilt Chamberlain", yearInducted: "1979", category: "Player", role: "C", yearsWithTeam: "1968-1973" },
      { name: "James Worthy", yearInducted: "2003", category: "Player", role: "F", yearsWithTeam: "1982-1994" },
      { name: "Kobe Bryant", yearInducted: "2020", category: "Player", role: "G", yearsWithTeam: "1996-2016" },
      { name: "Gail Goodrich", yearInducted: "1996", category: "Player", role: "G", yearsWithTeam: "1965-1968, 1970-1976" },
      { name: "Phil Jackson", yearInducted: "2007", category: "Coach", role: "Head Coach", yearsWithTeam: "1999-2004, 2005-2011" },
      { name: "Pat Riley", yearInducted: "2008", category: "Coach", role: "Head Coach", yearsWithTeam: "1981-1990" },
      { name: "Jerry Buss", yearInducted: "2010", category: "Contributor", role: "Owner", yearsWithTeam: "1979-2013" },
      { name: "Jamaal Wilkes", yearInducted: "2012", category: "Player", role: "F", yearsWithTeam: "1977-1985" },
      { name: "Gary Payton", yearInducted: "2013", category: "Player", role: "G", yearsWithTeam: "2003-2004" },
      { name: "Dennis Rodman", yearInducted: "2011", category: "Player", role: "F", yearsWithTeam: "1999" },
      { name: "Bob McAdoo", yearInducted: "2000", category: "Player", role: "C/F", yearsWithTeam: "1981-1985" },
      { name: "Mitch Richmond", yearInducted: "2014", category: "Player", role: "G", yearsWithTeam: "2001-2002" },
      { name: "Clyde Lovellette", yearInducted: "1988", category: "Player", role: "C", yearsWithTeam: "1953-1957" },
      { name: "George Mikan", yearInducted: "1959", category: "Player", role: "C", yearsWithTeam: "1948-1956" },
      { name: "Vern Mikkelsen", yearInducted: "1995", category: "Player", role: "F", yearsWithTeam: "1949-1959" },
      { name: "Jim Pollard", yearInducted: "1978", category: "Player", role: "F", yearsWithTeam: "1948-1955" },
      { name: "Slater Martin", yearInducted: "1982", category: "Player", role: "G", yearsWithTeam: "1949-1956" },
      { name: "Karl Malone", yearInducted: "2010", category: "Player", role: "F", yearsWithTeam: "2003-2004" },
      { name: "Pau Gasol", yearInducted: "2023", category: "Player", role: "F/C", yearsWithTeam: "2008-2014" },
      { name: "Dwight Howard", yearInducted: "2025", category: "Player", role: "C", yearsWithTeam: "2012-2013, 2019-2020" }
    ]
  },
  'memphis-grizzlies': {
    founded: '1995',
    capacity: '17,794',
    owner: 'Robert Pera',
    championships: '0',
    conferenceChampionships: '0',
    divisionTitles: '3',
    mostRecentDivisionTitle: '2023',
    playoffAppearances: '13',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '9', name: 'Tony Allen', position: 'G/F', years: '2010-2017' },
      { number: '33', name: 'Marc Gasol', position: 'C', years: '2008-2019' },
      { number: '50', name: 'Zach Randolph', position: 'F', years: '2009-2017' }
    ],
    hallOfFamers: [
      { name: "Pau Gasol", yearInducted: "2023", category: "Player", role: "F/C", yearsWithTeam: "2001-2008" },
      { name: "Shareef Abdur-Rahim", yearInducted: "N/A", category: "Player", role: "F", yearsWithTeam: "1996-2001" }
    ]
  },
  'miami-heat': {
    founded: '1988',
    capacity: '19,600',
    owner: 'Micky Arison',
    championships: '3',
    championshipYears: ['2006', '2012', '2013'],
    conferenceChampionships: '7',
    mostRecentConferenceChampionship: '2023',
    divisionTitles: '16',
    mostRecentDivisionTitle: '2023',
    playoffAppearances: '24',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '1', name: 'Chris Bosh', position: 'F/C', years: '2010-2016' },
      { number: '3', name: 'Dwyane Wade', position: 'G', years: '2003-2016' },
      { number: '10', name: 'Tim Hardaway', position: 'G', years: '1996-2001' },
      { number: '23', name: 'Michael Jordan', position: 'Honorary, Never played for Heat', years: '' },
      { number: '32', name: 'Shaquille O\'Neal', position: 'C', years: '2004-2008' },
      { number: '33', name: 'Alonzo Mourning', position: 'C', years: '1995-2008' },
      { number: '40', name: 'Udonis Haslem', position: 'F', years: '2003-2023' }
    ],
    hallOfFamers: [
      { name: "Alonzo Mourning", yearInducted: "2014", category: "Player", role: "C", yearsWithTeam: "1995-2002, 2005-2008" },
      { name: "Shaquille O'Neal", yearInducted: "2016", category: "Player", role: "C", yearsWithTeam: "2004-2008" },
      { name: "Gary Payton", yearInducted: "2013", category: "Player", role: "G", yearsWithTeam: "2005-2007" },
      { name: "Ray Allen", yearInducted: "2018", category: "Player", role: "G", yearsWithTeam: "2012-2014" },
      { name: "Tim Hardaway", yearInducted: "2022", category: "Player", role: "G", yearsWithTeam: "1996-2001" },
      { name: "Dwyane Wade", yearInducted: "2023", category: "Player", role: "G", yearsWithTeam: "2003-2016, 2018-2019" },
      { name: "Chris Bosh", yearInducted: "2021", category: "Player", role: "F/C", yearsWithTeam: "2010-2016" },
      { name: "Micky Arison", yearInducted: "2025", category: "Contributor", role: "Owner", yearsWithTeam: "1995-present" }
    ]
  },
  'milwaukee-bucks': {
    founded: '1968',
    capacity: '17,341',
    owner: 'Marc Lasry, Wes Edens & Jamie Dinan',
    championships: '2',
    championshipYears: ['1971', '2021'],
    conferenceChampionships: '3',
    mostRecentConferenceChampionship: '2021',
    divisionTitles: '17',
    mostRecentDivisionTitle: '2024',
    playoffAppearances: '37',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '1', name: 'Oscar Robertson', position: 'G', years: '1970-1974' },
      { number: '2', name: 'Junior Bridgeman', position: 'F', years: '1975-1987' },
      { number: '4', name: 'Sidney Moncrief', position: 'G', years: '1979-1990' },
      { number: '8', name: 'Marques Johnson', position: 'F', years: '1977-1984' },
      { number: '10', name: 'Bob Dandridge', position: 'F', years: '1969-1977' },
      { number: '14', name: 'Jon McGlocklin', position: 'G', years: '1968-1976' },
      { number: '16', name: 'Bob Lanier', position: 'C', years: '1980-1984' },
      { number: '32', name: 'Brian Winters', position: 'G', years: '1975-1983' },
      { number: '33', name: 'Kareem Abdul-Jabbar', position: 'C', years: '1969-1975' }
    ],
    hallOfFamers: [
      { name: "Kareem Abdul-Jabbar", yearInducted: "1995", category: "Player", role: "C", yearsWithTeam: "1969-1975" },
      { name: "Oscar Robertson", yearInducted: "1980", category: "Player", role: "G", yearsWithTeam: "1970-1974" },
      { name: "Bob Lanier", yearInducted: "1992", category: "Player", role: "C", yearsWithTeam: "1980-1984" },
      { name: "Bob Dandridge", yearInducted: "2021", category: "Player", role: "F", yearsWithTeam: "1969-1977, 1981-1982" },
      { name: "Sidney Moncrief", yearInducted: "2019", category: "Player", role: "G", yearsWithTeam: "1979-1989" },
      { name: "Gary Payton", yearInducted: "2013", category: "Player", role: "G", yearsWithTeam: "2003" },
      { name: "Ray Allen", yearInducted: "2018", category: "Player", role: "G", yearsWithTeam: "1996-2003" },
      { name: "Moses Malone", yearInducted: "2001", category: "Player", role: "C", yearsWithTeam: "1991-1993" },
      { name: "Don Nelson", yearInducted: "2012", category: "Coach", role: "Head Coach", yearsWithTeam: "1976-1987" },
      { name: "Jack Sikma", yearInducted: "2019", category: "Player", role: "C", yearsWithTeam: "1986-1991" }
    ]
  },
  'minnesota-timberwolves': {
    founded: '1989',
    capacity: '18,798',
    owner: 'Glen Taylor & Marc Lore & Alex Rodriguez',
    championships: '0',
    conferenceChampionships: '0',
    divisionTitles: '1',
    mostRecentDivisionTitle: '2004',
    playoffAppearances: '11',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '2', name: 'Malik Sealy', position: 'G/F', years: '1998-2000' }
    ],
    hallOfFamers: [
      { name: "Kevin Garnett", yearInducted: "2020", category: "Player", role: "F", yearsWithTeam: "1995-2007, 2015-2016" },
      { name: "Bill Fitch", yearInducted: "2019", category: "Coach", role: "Head Coach", yearsWithTeam: "1989-1991" }
    ]
  },
  'new-orleans-pelicans': {
    founded: '2002',
    capacity: '16,867',
    owner: 'Gayle Benson',
    championships: '0',
    conferenceChampionships: '0',
    divisionTitles: '1',
    mostRecentDivisionTitle: '2008',
    playoffAppearances: '8',
    mostRecentPlayoffAppearance: '2023',
    retiredNumbers: [
      { number: '7', name: 'Pete Maravich', position: 'G', years: '1974-1980' }
    ],
    hallOfFamers: [
      { name: "Chris Paul", yearInducted: "N/A", category: "Player", role: "G", yearsWithTeam: "2005-2011" },
      { name: "Anthony Davis", yearInducted: "N/A", category: "Player", role: "F/C", yearsWithTeam: "2012-2019" }
    ]
  },
  'new-york-knicks': {
    founded: '1946',
    capacity: '19,812',
    owner: 'Madison Square Garden Sports',
    championships: '2',
    championshipYears: ['1970', '1973'],
    conferenceChampionships: '8',
    mostRecentConferenceChampionship: '2025',
    divisionTitles: '8',
    mostRecentDivisionTitle: '2013',
    playoffAppearances: '44',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '10', name: 'Walt Frazier', position: 'G', years: '1967-1977' },
      { number: '12', name: 'Dick Barnett', position: 'G', years: '1965-1974' },
      { number: '15', name: 'Earl Monroe', position: 'G', years: '1971-1980' },
      { number: '15', name: 'Dick McGuire', position: 'G', years: '1949-1957' },
      { number: '19', name: 'Willis Reed', position: 'C', years: '1964-1974' },
      { number: '22', name: 'Bill Bradley', position: 'F', years: '1967-1977' },
      { number: '24', name: 'Bill DeBusschere', position: 'F', years: '1968-1974' },
      { number: '33', name: 'Patrick Ewing', position: 'C', years: '1985-2000' },
      { number: '613', name: 'Red Holzman', position: 'Coach', years: '1967-1982' }
    ],
    hallOfFamers: [
      { name: "Patrick Ewing", yearInducted: "2008", category: "Player", role: "C", yearsWithTeam: "1985-2000" },
      { name: "Willis Reed", yearInducted: "1982", category: "Player", role: "C/F", yearsWithTeam: "1964-1974" },
      { name: "Walt Frazier", yearInducted: "1987", category: "Player", role: "G", yearsWithTeam: "1967-1977" },
      { name: "Dave DeBusschere", yearInducted: "1983", category: "Player", role: "F", yearsWithTeam: "1968-1974" },
      { name: "Earl Monroe", yearInducted: "1990", category: "Player", role: "G", yearsWithTeam: "1971-1980" },
      { name: "Bernard King", yearInducted: "2013", category: "Player", role: "F", yearsWithTeam: "1982-1987" },
      { name: "Bill Bradley", yearInducted: "1983", category: "Player", role: "F", yearsWithTeam: "1967-1977" },
      { name: "Red Holzman", yearInducted: "1986", category: "Coach", role: "Head Coach", yearsWithTeam: "1967-1977, 1978-1982" },
      { name: "Dick McGuire", yearInducted: "1993", category: "Player", role: "G", yearsWithTeam: "1949-1957" },
      { name: "Harry Gallatin", yearInducted: "1991", category: "Player", role: "F/C", yearsWithTeam: "1948-1957" },
      { name: "Richie Guerin", yearInducted: "2013", category: "Player", role: "G", yearsWithTeam: "1956-1963" },
      { name: "Carmelo Anthony", yearInducted: "2025", category: "Player", role: "F", yearsWithTeam: "2011-2017" },
      { name: "Carl Braun", yearInducted: "2019", category: "Player", role: "G/F", yearsWithTeam: "1947-1962" },
      { name: "Dick Barnett", yearInducted: "2024", category: "Player", role: "G", yearsWithTeam: "1965-1974" },
      { name: "Bill Sharman", yearInducted: "1976", category: "Player", role: "G", yearsWithTeam: "1950-1951" }
    ]
  },
  'oklahoma-city-thunder': {
    founded: '1967',
    capacity: '18,203',
    owner: 'Clay Bennett',
    championships: '1',
    championshipYears: ['1979'],
    conferenceChampionships: '4',
    mostRecentConferenceChampionship: '2025',
    divisionTitles: '11',
    mostRecentDivisionTitle: '2025',
    playoffAppearances: '31',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '1', name: 'Gus Williams', position: 'G', years: '1977-1984' },
      { number: '4', name: 'Nick Collison', position: 'F', years: '2003-2018' },
      { number: '10', name: 'Nate McMillan', position: 'G', years: '1986-1998' },
      { number: '19', name: 'Lenny Wilkens', position: 'G', years: '1968-1972' },
      { number: '24', name: 'Spencer Haywood', position: 'F', years: '1970-1975' },
      { number: '32', name: 'Fred Brown', position: 'G', years: '1971-1984' },
      { number: '43', name: 'Jack Sikma', position: 'C', years: '1977-1986' }
    ],
    hallOfFamers: [
      { name: "Gary Payton", yearInducted: "2013", category: "Player", role: "G", yearsWithTeam: "1990-2003" },
      { name: "Lenny Wilkens", yearInducted: "1989", category: "Player", role: "G", yearsWithTeam: "1968-1972" },
      { name: "Spencer Haywood", yearInducted: "N/A", category: "Player", role: "F/C", yearsWithTeam: "1970-1975" },
      { name: "Dennis Johnson", yearInducted: "2010", category: "Player", role: "G", yearsWithTeam: "1976-1980" },
      { name: "Ray Allen", yearInducted: "2018", category: "Player", role: "G", yearsWithTeam: "2003-2007" },
      { name: "Jack Sikma", yearInducted: "2019", category: "Player", role: "C", yearsWithTeam: "1977-1986" },
      { name: "George Karl", yearInducted: "2022", category: "Coach", role: "Head Coach", yearsWithTeam: "1991-1998" },
      { name: "Nate McMillan", yearInducted: "N/A", category: "Player", role: "G", yearsWithTeam: "1986-1998" }
    ]
  },
  'orlando-magic': {
    founded: '1989',
    capacity: '18,846',
    owner: 'Dan DeVos',
    championships: '0',
    conferenceChampionships: '2',
    mostRecentConferenceChampionship: '2010',
    divisionTitles: '6',
    mostRecentDivisionTitle: '2025',
    playoffAppearances: '17',
    mostRecentPlayoffAppearance: '2025',
    retiredNumbers: [
      { number: '6', name: 'The Sixth Man', position: 'Fans', years: 'Retired 1989' },
      { number: '32', name: 'Shaquille O\'Neal', position: 'C', years: '1992-1996' }
    ],
    hallOfFamers: [
      { name: "Shaquille O'Neal", yearInducted: "2016", category: "Player", role: "C", yearsWithTeam: "1992-1996" },
      { name: "Tracy McGrady", yearInducted: "2017", category: "Player", role: "F/G", yearsWithTeam: "2000-2004" },
      { name: "Grant Hill", yearInducted: "2018", category: "Player", role: "F", yearsWithTeam: "2000-2007" },
      { name: "Dominique Wilkins", yearInducted: "2006", category: "Player", role: "F", yearsWithTeam: "1999" },
      { name: "Dwight Howard", yearInducted: "2025", category: "Player", role: "C", yearsWithTeam: "2004-2012" },
      { name: "Patrick Ewing", yearInducted: "2008", category: "Player", role: "C", yearsWithTeam: "2001-2002" }
    ]
  },
  'philadelphia-76ers': {
    founded: '1946',
    capacity: '21,600',
    owner: 'Josh Harris & David Blitzer',
    championships: '3',
    championshipYears: ['1955', '1967', '1983'],
    conferenceChampionships: '9',
    mostRecentConferenceChampionship: '2001',
    divisionTitles: '12',
    mostRecentDivisionTitle: '2022',
    playoffAppearances: '53',
    mostRecentPlayoffAppearance: '2024',
    retiredNumbers: [
      { number: '2', name: 'Moses Malone', position: 'C', years: '1982-1994' },
      { number: '3', name: 'Allen Iverson', position: 'G', years: '1996-2010' },
      { number: '4', name: 'Dolph Schayes', position: 'F/C', years: '1948-1964' },
      { number: '6', name: 'Julius Erving', position: 'F', years: '1976-1987' },
      { number: '10', name: 'Maurice Cheeks', position: 'G', years: '1978-1989' },
      { number: '13', name: 'Wilt Chamberlain', position: 'C', years: '1965-1968' },
      { number: '15', name: 'Hal Greer', position: 'G', years: '1958-1973' },
      { number: '24', name: 'Bobby Jones', position: 'F', years: '1978-1986' },
      { number: '32', name: 'Billy Cunningham', position: 'F', years: '1965-1976' },
      { number: '34', name: 'Charles Barkley', position: 'F', years: '1984-1992' }
    ],
    hallOfFamers: [
      { name: "Julius Erving", yearInducted: "1993", category: "Player", role: "F", yearsWithTeam: "1976-1987" },
      { name: "Wilt Chamberlain", yearInducted: "1979", category: "Player", role: "C", yearsWithTeam: "1965-1968" },
      { name: "Charles Barkley", yearInducted: "2006", category: "Player", role: "F", yearsWithTeam: "1984-1992" },
      { name: "Allen Iverson", yearInducted: "2016", category: "Player", role: "G", yearsWithTeam: "1996-2006, 2009-2010" },
      { name: "Moses Malone", yearInducted: "2001", category: "Player", role: "C", yearsWithTeam: "1982-1986, 1993-1994" },
      { name: "Dolph Schayes", yearInducted: "1973", category: "Player", role: "F", yearsWithTeam: "1948-1964" },
      { name: "Hal Greer", yearInducted: "1982", category: "Player", role: "G", yearsWithTeam: "1958-1973" },
      { name: "Billy Cunningham", yearInducted: "1986", category: "Player", role: "F", yearsWithTeam: "1965-1972, 1974-1976" },
      { name: "Maurice Cheeks", yearInducted: "2018", category: "Player", role: "G", yearsWithTeam: "1978-1989" },
      { name: "Chet Walker", yearInducted: "2012", category: "Player", role: "F", yearsWithTeam: "1969-1975" },
      { name: "Bobby Jones", yearInducted: "2019", category: "Player", role: "F", yearsWithTeam: "1978-1986" },
      { name: "Dikembe Mutombo", yearInducted: "2015", category: "Player", role: "C", yearsWithTeam: "2001-2002" },
      { name: "George McGinnis", yearInducted: "2017", category: "Player", role: "F", yearsWithTeam: "1975-1978" },
      { name: "Alex Hannum", yearInducted: "1998", category: "Coach", role: "Head Coach", yearsWithTeam: "1966-1968" },
      { name: "Larry Brown", yearInducted: "2002", category: "Coach", role: "Head Coach", yearsWithTeam: "1997-2003" },
      { name: "Jack Ramsay", yearInducted: "1992", category: "Coach", role: "Head Coach", yearsWithTeam: "1968-1972" },
      { name: "Bob McAdoo", yearInducted: "2000", category: "Player", role: "C/F", yearsWithTeam: "1978-1979" },
      { name: "Chris Webber", yearInducted: "2021", category: "Player", role: "F", yearsWithTeam: "2005-2007" }
    ]
  },
  'phoenix-suns': {
    founded: '1968',
    capacity: '17,071',
    owner: 'Mat Ishbia',
    championships: '0',
    conferenceChampionships: '3',
    mostRecentConferenceChampionship: '2021',
    divisionTitles: '9',
    mostRecentDivisionTitle: '2022',
    playoffAppearances: '31',
    mostRecentPlayoffAppearance: '2024',
    retiredNumbers: [
      { number: '5', name: 'Dick Van Arsdale', position: 'G/F', years: '1968-1977' },
      { number: '6', name: 'Walter Davis', position: 'G', years: '1977-1988' },
      { number: '7', name: 'Kevin Johnson', position: 'G', years: '1988-2000' },
      { number: '9', name: 'Dan Majerle', position: 'G/F', years: '1988-1995' },
      { number: '13', name: 'Steve Nash', position: 'G', years: '2004-2012' },
      { number: '24', name: 'Tom Chambers', position: 'F', years: '1988-1993' },
      { number: '31', name: 'Shawn Marion', position: 'F', years: '1999-2008' },
      { number: '32', name: 'Amar\'e Stoudemire', position: 'F/C', years: '2002-2010' },
      { number: '33', name: 'Alvan Adams', position: 'C', years: '1975-1988' },
      { number: '34', name: 'Charles Barkley', position: 'F', years: '1992-1996' },
      { number: '42', name: 'Connie Hawkins', position: 'F', years: '1969-1973' },
      { number: '44', name: 'Paul Westphal', position: 'G', years: '1975-1984' }
    ],
    hallOfFamers: [
      { name: "Charles Barkley", yearInducted: "2006", category: "Player", role: "F", yearsWithTeam: "1992-1996" },
      { name: "Steve Nash", yearInducted: "2018", category: "Player", role: "G", yearsWithTeam: "1996-1998, 2004-2012" },
      { name: "Jason Kidd", yearInducted: "2018", category: "Player", role: "G", yearsWithTeam: "1996-2001" },
      { name: "Connie Hawkins", yearInducted: "1992", category: "Player", role: "F", yearsWithTeam: "1969-1973" },
      { name: "Gail Goodrich", yearInducted: "1996", category: "Player", role: "G", yearsWithTeam: "1968-1970" },
      { name: "Paul Westphal", yearInducted: "2019", category: "Player", role: "G", yearsWithTeam: "1975-1980, 1983-1984" },
      { name: "Dennis Johnson", yearInducted: "2010", category: "Player", role: "G", yearsWithTeam: "1980-1983" },
      { name: "Dick Van Arsdale", yearInducted: "N/A", category: "Player", role: "G/F", yearsWithTeam: "1968-1977" },
      { name: "Shaquille O'Neal", yearInducted: "2016", category: "Player", role: "C", yearsWithTeam: "2008-2009" },
      { name: "Grant Hill", yearInducted: "2018", category: "Player", role: "F", yearsWithTeam: "2007-2012" },
      { name: "Jerry Colangelo", yearInducted: "2004", category: "Contributor", role: "Executive", yearsWithTeam: "1968-2004" }
    ]
  },
  'portland-trail-blazers': {
    founded: '1970',
    capacity: '19,393',
    owner: 'Jody Allen',
    championships: '1',
    championshipYears: ['1977'],
    conferenceChampionships: '3',
    mostRecentConferenceChampionship: '2019',
    divisionTitles: '6',
    mostRecentDivisionTitle: '2018',
    playoffAppearances: '37',
    mostRecentPlayoffAppearance: '2020',
    retiredNumbers: [
      { number: '13', name: 'Dave Twardzik', position: 'G', years: '1976-1980' },
      { number: '14', name: 'Lionel Hollins', position: 'G', years: '1975-1980' },
      { number: '15', name: 'Larry Steele', position: 'G/F', years: '1971-1980' },
      { number: '20', name: 'Maurice Lucas', position: 'F/C', years: '1976-1980' },
      { number: '22', name: 'Clyde Drexler', position: 'G', years: '1983-1995' },
      { number: '30', name: 'Terry Porter', position: 'G', years: '1985-1995' },
      { number: '32', name: 'Bill Walton', position: 'C', years: '1974-1979' },
      { number: '36', name: 'Lloyd Neal', position: 'F/C', years: '1972-1979' },
      { number: '45', name: 'Geoff Petrie', position: 'G', years: '1970-1976' },
      { number: '77', name: 'Jack Ramsay', position: 'Coach', years: '1976-1986' }
    ],
    hallOfFamers: [
      { name: "Clyde Drexler", yearInducted: "2004", category: "Player", role: "G", yearsWithTeam: "1983-1995" },
      { name: "Bill Walton", yearInducted: "1993", category: "Player", role: "C", yearsWithTeam: "1974-1979" },
      { name: "Scottie Pippen", yearInducted: "2010", category: "Player", role: "F", yearsWithTeam: "1999-2003" },
      { name: "Arvydas Sabonis", yearInducted: "2011", category: "Player", role: "C", yearsWithTeam: "1995-2001, 2002-2003" },
      { name: "Jack Ramsay", yearInducted: "1992", category: "Coach", role: "Head Coach", yearsWithTeam: "1976-1986" },
      { name: "Rick Adelman", yearInducted: "2021", category: "Coach", role: "Head Coach", yearsWithTeam: "1989-1994" },
      { name: "Lenny Wilkens", yearInducted: "1998", category: "Coach", role: "Head Coach", yearsWithTeam: "1974-1976" },
      { name: "Gary Payton", yearInducted: "2013", category: "Player", role: "G", yearsWithTeam: "2002-2003" }
    ]
  },
  'sacramento-kings': {
    founded: '1923',
    capacity: '17,608',
    owner: 'Vivek Ranadivé',
    championships: '1',
    championshipYears: ['1951'],
    conferenceChampionships: '1',
    mostRecentConferenceChampionship: '2002',
    divisionTitles: '3',
    mostRecentDivisionTitle: '2023',
    playoffAppearances: '29',
    mostRecentPlayoffAppearance: '2024',
    retiredNumbers: [
      { number: '1', name: 'Nate Archibald', position: 'G', years: '1970-1976' },
      { number: '2', name: 'Mitch Richmond', position: 'G', years: '1991-1998' },
      { number: '4', name: 'Chris Webber', position: 'F/C', years: '1998-2005' },
      { number: '6', name: 'Fans', position: 'Sixth Man', years: 'Retired 1987' },
      { number: '11', name: 'Bob Davies', position: 'G', years: '1948-1955' },
      { number: '12', name: 'Maurice Stokes', position: 'F', years: '1955-1958' },
      { number: '14', name: 'Oscar Robertson', position: 'G', years: '1960-1970' },
      { number: '16', name: 'Peja Stojakovic', position: 'F', years: '1998-2006' },
      { number: '21', name: 'Vlade Divac', position: 'C', years: '1998-2004' },
      { number: '27', name: 'Jack Twyman', position: 'F', years: '1955-1966' },
      { number: '44', name: 'Sam Lacey', position: 'C', years: '1970-1982' }
    ],
    hallOfFamers: [
      { name: "Oscar Robertson", yearInducted: "1980", category: "Player", role: "G", yearsWithTeam: "1960-1970" },
      { name: "Tiny Archibald", yearInducted: "1991", category: "Player", role: "G", yearsWithTeam: "1976-1981" },
      { name: "Mitch Richmond", yearInducted: "2014", category: "Player", role: "G", yearsWithTeam: "1991-1998" },
      { name: "Chris Webber", yearInducted: "2021", category: "Player", role: "F", yearsWithTeam: "1998-2005" },
      { name: "Jack Twyman", yearInducted: "1983", category: "Player", role: "F", yearsWithTeam: "1955-1966" },
      { name: "Maurice Stokes", yearInducted: "2004", category: "Player", role: "F/C", yearsWithTeam: "1955-1958" },
      { name: "Rick Adelman", yearInducted: "2021", category: "Coach", role: "Head Coach", yearsWithTeam: "1998-2006" },
      { name: "Vlade Divac", yearInducted: "2019", category: "Player", role: "C", yearsWithTeam: "1998-2004" },
      { name: "Bob Davies", yearInducted: "1970", category: "Player", role: "G", yearsWithTeam: "1945-1955" },
      { name: "Bobby Wanzer", yearInducted: "1987", category: "Player", role: "G", yearsWithTeam: "1947-1957" },
      { name: "Arnie Risen", yearInducted: "1998", category: "Player", role: "C", yearsWithTeam: "1948-1955" }
    ]
  },
  'san-antonio-spurs': {
    founded: '1967',
    capacity: '18,418',
    owner: 'Peter J. Holt',
    championships: '5',
    championshipYears: ['1999', '2003', '2005', '2007', '2014'],
    conferenceChampionships: '6',
    mostRecentConferenceChampionship: '2017',
    divisionTitles: '22',
    mostRecentDivisionTitle: '2017',
    playoffAppearances: '44',
    mostRecentPlayoffAppearance: '2022',
    retiredNumbers: [
      { number: '00', name: 'Johnny Moore', position: 'G', years: '1980-1990' },
      { number: '6', name: 'Avery Johnson', position: 'G', years: '1991-2001' },
      { number: '9', name: 'Tony Parker', position: 'G', years: '2001-2018' },
      { number: '12', name: 'Bruce Bowen', position: 'F', years: '2001-2009' },
      { number: '13', name: 'James Silas', position: 'G', years: '1972-1981' },
      { number: '20', name: 'Manu Ginobili', position: 'G', years: '2002-2018' },
      { number: '21', name: 'Tim Duncan', position: 'F/C', years: '1997-2016' },
      { number: '32', name: 'Sean Elliott', position: 'F', years: '1989-2001' },
      { number: '44', name: 'George Gervin', position: 'G', years: '1976-1985' },
      { number: '50', name: 'David Robinson', position: 'C', years: '1989-2003' }
    ],
    hallOfFamers: [
      { name: "Tim Duncan", yearInducted: "2020", category: "Player", role: "F/C", yearsWithTeam: "1997-2016" },
      { name: "David Robinson", yearInducted: "2009", category: "Player", role: "C", yearsWithTeam: "1989-2003" },
      { name: "George Gervin", yearInducted: "1996", category: "Player", role: "G/F", yearsWithTeam: "1974-1985" },
      { name: "Manu Ginobili", yearInducted: "2022", category: "Player", role: "G", yearsWithTeam: "2002-2018" },
      { name: "Tony Parker", yearInducted: "2023", category: "Player", role: "G", yearsWithTeam: "2001-2018" },
      { name: "Gregg Popovich", yearInducted: "2023", category: "Player", role: "Head Coach", yearsWithTeam: "1996-present" },
      { name: "Artis Gilmore", yearInducted: "2011", category: "Player", role: "C", yearsWithTeam: "1982-1987" },
      { name: "Dominique Wilkins", yearInducted: "2006", category: "Player", role: "F", yearsWithTeam: "1996-1997" },
      { name: "Larry Brown", yearInducted: "2002", category: "Coach", role: "Head Coach", yearsWithTeam: "1988-1992" },
      { name: "Tracy McGrady", yearInducted: "2017", category: "Player", role: "F/G", yearsWithTeam: "2013" }
    ]
  },
  'toronto-raptors': {
    founded: '1995',
    capacity: '19,800',
    owner: 'Maple Leaf Sports & Entertainment',
    championships: '1',
    championshipYears: ['2019'],
    conferenceChampionships: '1',
    mostRecentConferenceChampionship: '2019',
    divisionTitles: '7',
    mostRecentDivisionTitle: '2020',
    playoffAppearances: '14',
    mostRecentPlayoffAppearance: '2023',
    retiredNumbers: [
      { number: '15', name: 'Vince Carter', position: 'G/F', years: '1998-2004' }
    ],
    hallOfFamers: [
      { name: "Vince Carter", yearInducted: "2024", category: "Player", role: "G/F", yearsWithTeam: "1998-2004" },
      { name: "Tracy McGrady", yearInducted: "2017", category: "Player", role: "F/G", yearsWithTeam: "1997-2000" },
      { name: "Hakeem Olajuwon", yearInducted: "2008", category: "Player", role: "C", yearsWithTeam: "2001-2002" },
      { name: "Alonzo Mourning", yearInducted: "2014", category: "Player", role: "C", yearsWithTeam: "1995, 2004-2005" }
    ]
  },
  'utah-jazz': {
    founded: '1974',
    capacity: '18,306',
    owner: 'Ryan Smith',
    championships: '0',
    conferenceChampionships: '2',
    mostRecentConferenceChampionship: '1998',
    divisionTitles: '11',
    mostRecentDivisionTitle: '2022',
    playoffAppearances: '31',
    mostRecentPlayoffAppearance: '2024',
    retiredNumbers: [
      { number: '1', name: 'Frank Layden', position: 'Coach', years: '1981-1989' },
      { number: '4', name: 'Adrian Dantley', position: 'F', years: '1979-1986' },
      { number: '7', name: 'Pete Maravich', position: 'G', years: '1974-1980' },
      { number: '9', name: 'Larry H. Miller', position: 'Owner', years: '1985-2009' },
      { number: '12', name: 'John Stockton', position: 'G', years: '1984-2003' },
      { number: '14', name: 'Jeff Hornacek', position: 'G', years: '1994-2000' },
      { number: '32', name: 'Karl Malone', position: 'F', years: '1985-2003' },
      { number: '35', name: 'Darrell Griffith', position: 'G', years: '1980-1991' },
      { number: '53', name: 'Mark Eaton', position: 'C', years: '1982-1993' }
    ],
    hallOfFamers: [
      { name: "John Stockton", yearInducted: "2009", category: "Player", role: "G", yearsWithTeam: "1984-2003" },
      { name: "Karl Malone", yearInducted: "2010", category: "Player", role: "F", yearsWithTeam: "1985-2003" },
      { name: "Adrian Dantley", yearInducted: "2008", category: "Player", role: "F", yearsWithTeam: "1979-1986" },
      { name: "Jerry Sloan", yearInducted: "2009", category: "Coach", role: "Head Coach", yearsWithTeam: "1988-2011" },
      { name: "Pete Maravich", yearInducted: "1987", category: "Player", role: "G", yearsWithTeam: "1974-1980" },
      { name: "Gail Goodrich", yearInducted: "1996", category: "Player", role: "G", yearsWithTeam: "1976-1977" },
      { name: "Dominique Wilkins", yearInducted: "2006", category: "Player", role: "F", yearsWithTeam: "1995" }
    ]
  },
  'washington-wizards': {
    founded: '1961',
    capacity: '20,356',
    owner: 'Ted Leonsis',
    championships: '1',
    championshipYears: ['1978'],
    conferenceChampionships: '4',
    mostRecentConferenceChampionship: '1979',
    divisionTitles: '7',
    mostRecentDivisionTitle: '2017',
    playoffAppearances: '28',
    mostRecentPlayoffAppearance: '2021',
    retiredNumbers: [
      { number: '10', name: 'Earl Monroe', position: 'G', years: '1967-1971' },
      { number: '11', name: 'Elvin Hayes', position: 'F/C', years: '1972-1981' },
      { number: '25', name: 'Gus Johnson', position: 'F', years: '1963-1972' },
      { number: '41', name: 'Wes Unseld', position: 'C', years: '1968-1981' }
    ],
    hallOfFamers: [
      { name: "Wes Unseld", yearInducted: "1988", category: "Player", role: "C/F", yearsWithTeam: "1968-1981" },
      { name: "Elvin Hayes", yearInducted: "1990", category: "Player", role: "F/C", yearsWithTeam: "1972-1981" },
      { name: "Earl Monroe", yearInducted: "1990", category: "Player", role: "G", yearsWithTeam: "1967-1971" },
      { name: "Gus Johnson", yearInducted: "2010", category: "Player", role: "F", yearsWithTeam: "1963-1972" },
      { name: "Chris Webber", yearInducted: "2021", category: "Player", role: "F", yearsWithTeam: "1994-1998, 2007-2008" },
      { name: "Bernard King", yearInducted: "2013", category: "Player", role: "F", yearsWithTeam: "1987-1991" },
      { name: "Mitch Richmond", yearInducted: "2014", category: "Player", role: "G", yearsWithTeam: "1999-2001" },
      { name: "Bob Lanier", yearInducted: "1992", category: "Player", role: "C", yearsWithTeam: "1980" },
      { name: "Walt Bellamy", yearInducted: "1993", category: "Player", role: "C", yearsWithTeam: "1961-1965" }
    ]
  }
};

export function getTeamInfo(teamId: string): TeamInfo | undefined {
  return teamInfo[teamId];
}
