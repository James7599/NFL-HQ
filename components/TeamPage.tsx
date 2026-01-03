'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TeamData, getAllTeams } from '@/data/teams';
import NFLTeamsSidebar from '@/components/NFLTeamsSidebar';
import OverviewTab from '@/components/tabs/OverviewTab';
import NewsTab from '@/components/tabs/NewsTab';
import ScheduleTab from '@/components/tabs/ScheduleTab';
import RosterTab from '@/components/tabs/RosterTab';
import StatsTab from '@/components/tabs/StatsTab';
import TransactionsTab from '@/components/tabs/TransactionsTab';
import DraftPicksTab from '@/components/tabs/DraftPicksTab';
import SalaryCapTab from '@/components/tabs/SalaryCapTab';
import TeamInfoTab from '@/components/tabs/TeamInfoTab';
import InjuriesTab from '@/components/tabs/InjuriesTab';
import TeamStructuredData from '@/components/TeamStructuredData';

interface TeamPageProps {
  team: TeamData;
  initialTab?: string;
}

// Map API team slugs to our team IDs
const teamSlugMapping: Record<string, string> = {
  'la-clippers': 'los-angeles-clippers',
  'portland-trailblazers': 'portland-trail-blazers',
};

interface LiveStandings {
  record: string;
  conferenceRank: string;
  divisionRank: string;
}

function TeamHeroSection({ team, liveStandings }: { team: TeamData; liveStandings?: LiveStandings }) {
  const record = liveStandings?.record || team.record;
  const conferenceRank = liveStandings?.conferenceRank || team.conferenceRank;
  const divisionRank = liveStandings?.divisionRank || team.divisionRank;

  return (
    <div style={{ backgroundColor: team.primaryColor }} className="text-white pt-[57px] lg:pt-0">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white rounded-full flex items-center justify-center shadow-lg p-3 sm:p-4">
              <img
                src={team.logoUrl}
                alt={`${team.fullName} Logo`}
                className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold">{team.fullName}</h1>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl opacity-90 mt-1">
                {conferenceRank} in {team.conference} Conference
              </p>
              <p className="text-xs sm:text-sm lg:text-base opacity-80 mt-1">
                GM: {team.generalManager} • HC: {team.headCoach}
              </p>
            </div>
          </div>

          <div className="bg-white text-gray-800 rounded-lg p-6 w-full lg:w-auto shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-700">2025-26 Season</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{record}</div>
                <div className="text-sm text-gray-600 mt-1">Record</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{divisionRank}</div>
                <div className="text-sm text-gray-600 mt-1">Division</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavigationTabs({ activeTab, onTabChange, team, isLoading }: { activeTab: string; onTabChange: (tab: string) => void; team: TeamData; isLoading?: boolean }) {
  const navRef = useRef<HTMLElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'news', label: 'News' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'roster', label: 'Roster' },
    { id: 'injury-report', label: 'Injury Report' },
    { id: 'stats', label: 'Stats' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'draft-picks', label: 'Draft Picks' },
    { id: 'salary-cap', label: 'Salary Cap' },
    { id: 'team-info', label: 'Team Info' },
  ];

  // Scroll active tab into view when activeTab changes
  useEffect(() => {
    if (activeButtonRef.current && navRef.current) {
      const button = activeButtonRef.current;
      const nav = navRef.current;

      // Calculate button position relative to nav container
      const buttonRect = button.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();

      // Check if button is out of view
      const buttonLeft = buttonRect.left - navRect.left + nav.scrollLeft;
      const buttonRight = buttonLeft + buttonRect.width;
      const navWidth = nav.clientWidth;

      if (buttonLeft < nav.scrollLeft) {
        // Button is to the left of visible area
        nav.scrollTo({
          left: buttonLeft - 20, // Add some padding
          behavior: 'smooth'
        });
      } else if (buttonRight > nav.scrollLeft + navWidth) {
        // Button is to the right of visible area
        nav.scrollTo({
          left: buttonRight - navWidth + 20, // Add some padding
          behavior: 'smooth'
        });
      }
    }
  }, [activeTab]);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-[57px] lg:top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4">
        <nav ref={navRef} className="flex space-x-4 sm:space-x-6 lg:space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={activeTab === tab.id ? activeButtonRef : null}
              onClick={() => onTabChange(tab.id)}
              disabled={isLoading}
              className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                ...(activeTab === tab.id && team ? {
                  borderBottomColor: team.primaryColor,
                  color: team.primaryColor
                } : {})
              }}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              role="tab"
            >
              {tab.label}
              {isLoading && activeTab === tab.id && (
                <svg
                  className="animate-spin h-3 w-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function TeamPageContent({ team, initialTab }: TeamPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [liveStandings, setLiveStandings] = useState<LiveStandings | undefined>(undefined);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else {
      const tabFromUrl = searchParams.get('tab');
      if (tabFromUrl) {
        setActiveTab(tabFromUrl);
      }
    }
  }, [searchParams, initialTab]);

  // Fetch live standings for hero section
  useEffect(() => {
    async function fetchStandings() {
      try {
        const response = await fetch('/nba-hq/api/nba/standings?season=2025&level=conference');
        if (!response.ok) return;

        const data = await response.json();
        const conferences = data.data?.standings?.conferences;

        if (!conferences) return;

        // Find this team in the standings
        for (const conf of conferences) {
          for (let i = 0; i < conf.teams.length; i++) {
            const apiTeam = conf.teams[i];
            const apiTeamId = teamSlugMapping[apiTeam.sk_slug] || apiTeam.sk_slug;

            if (apiTeamId === team.id) {
              // Conference rank is position in conference (1-indexed)
              const confRank = i + 1;
              const suffix = confRank === 1 ? 'st' : confRank === 2 ? 'nd' : confRank === 3 ? 'rd' : 'th';

              // Calculate division rank
              const allTeams = getAllTeams();
              const divisionTeams = conf.teams.filter((t: any) => {
                const tId = teamSlugMapping[t.sk_slug] || t.sk_slug;
                const ourTeamData = allTeams.find((tt: any) => tt.id === tId);
                return ourTeamData?.division === team.division;
              });

              // Sort division teams by wins
              divisionTeams.sort((a: any, b: any) => (b.wins || 0) - (a.wins || 0));
              const divRank = divisionTeams.findIndex((t: any) => {
                const tId = teamSlugMapping[t.sk_slug] || t.sk_slug;
                return tId === team.id;
              }) + 1;
              const divSuffix = divRank === 1 ? 'st' : divRank === 2 ? 'nd' : divRank === 3 ? 'rd' : 'th';

              setLiveStandings({
                record: `${apiTeam.wins || 0}-${apiTeam.losses || 0}`,
                conferenceRank: `${confRank}${suffix}`,
                divisionRank: `${divRank}${divSuffix}`,
              });
              return;
            }
          }
        }
      } catch (err) {
        console.error('Error fetching standings for hero:', err);
      }
    }

    fetchStandings();
  }, [team.id, team.division]);

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return; // Don't reload if same tab

    setIsLoadingTab(true);
    setActiveTab(tab);

    // Simulate loading time for tab content
    setTimeout(() => {
      setIsLoadingTab(false);
    }, 300);

    if (tab === 'overview') {
      router.replace(`/teams/${team.id}`, { scroll: false });
    } else {
      router.replace(`/teams/${team.id}/${tab}`, { scroll: false });
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab team={team} onTabChange={handleTabChange} />;
      case 'news':
        return <NewsTab team={team} />;
      case 'schedule':
        return <ScheduleTab team={team} />;
      case 'roster':
        return <RosterTab team={team} />;
      case 'injury-report':
        return <InjuriesTab team={team} />;
      case 'stats':
        return <StatsTab team={team} />;
      case 'transactions':
        return <TransactionsTab team={team} />;
      case 'draft-picks':
        return <DraftPicksTab team={team} />;
      case 'salary-cap':
        return <SalaryCapTab team={team} />;
      case 'team-info':
        return <TeamInfoTab team={team} />;
      default:
        return <OverviewTab team={team} onTabChange={handleTabChange} />;
    }
  };

  return (
    <>
      <TeamStructuredData team={team} />
      <div className="flex min-h-screen bg-gray-50">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <div className="fixed top-0 left-0 w-64 h-screen z-10">
            <NFLTeamsSidebar currentTeam={team} currentTab={activeTab} />
          </div>
        </div>

        {/* Mobile sidebar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-20">
          <NBATeamsSidebar currentTeam={team} currentTab={activeTab} isMobile={true} />
        </div>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 min-w-0">
          <TeamHeroSection team={team} liveStandings={liveStandings} />
          <NavigationTabs activeTab={activeTab} onTabChange={handleTabChange} team={team} isLoading={isLoadingTab} />

          {/* Raptive Header Ad */}
          <div className="container mx-auto px-4 min-h-[150px]">
            <div className="raptive-pfn-header"></div>
          </div>

          <div className="container mx-auto px-4 py-6">
            {isLoadingTab ? (
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block">
                    <svg
                      className="animate-spin h-12 w-12 mx-auto mb-4"
                      style={{ color: team.primaryColor }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">Loading...</p>
                </div>
              </div>
            ) : (
              renderActiveTab()
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default function TeamPage({ team, initialTab }: TeamPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-skeleton w-32 h-8 rounded"></div>
      </div>
    }>
      <TeamPageContent team={team} initialTab={initialTab} />
    </Suspense>
  );
}
