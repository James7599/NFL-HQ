# NFL HQ

A comprehensive NFL resource featuring all 32 team pages, live standings, stats, rosters, schedules, and the latest news from Pro Football Network.

## Features

- **32 Team Pages**: Complete coverage of all NFL teams
- **Team Information**: Rosters, schedules, stats, and news for each team
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern Tech Stack**: Built with Next.js 15, React 19, TypeScript, and Tailwind CSS
- **SEO Optimized**: Full metadata support for search engines
- **Fast Performance**: Optimized for speed with Next.js App Router

## Tech Stack

- **Framework**: Next.js 15.4.7
- **React**: 19.1.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4.x
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/James7599/NFL-HQ.git
cd NFL-HQ
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
nfl-hq/
├── app/                    # Next.js app directory
│   ├── nfl/
│   │   └── teams/
│   │       └── [teamId]/  # Dynamic team pages
│   ├── teams/             # All teams listing
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   ├── robots.ts          # Robots.txt
│   └── sitemap.ts         # Sitemap
├── components/            # React components
│   ├── tabs/             # Team page tab components
│   ├── NFLTeamsSidebar.tsx # Main navigation sidebar
│   └── TeamPage.tsx      # Team page component
├── data/                 # Data and content
│   └── teams.ts         # NFL team data
└── public/              # Static assets
```

## Team Pages

Each team page includes the following tabs:

- **Overview**: Team information and quick stats
- **Roster**: Complete player roster
- **Schedule**: Game schedule and results
- **Stats**: Team and player statistics
- **News**: Latest team news and updates
- **Injury Report**: Current player injury status

## Data Structure

Team data is stored in `/data/teams.ts` and includes:

- Team identification (name, abbreviation, logo)
- Conference and division information
- Colors and branding
- Management (GM, Head Coach)
- Stadium information
- Search terms for content filtering

## Deployment

This project is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Deploy with zero configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

© 2025 Pro Football Network. All rights reserved.

## Contact

For questions or support, visit [Pro Football Network](https://profootballnetwork.com)
