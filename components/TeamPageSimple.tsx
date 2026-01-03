'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TeamData } from '@/data/teams';
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

interface TeamPageSimpleProps {
  team: TeamData;
  initialTab?: string;
}

function NavigationTabs({ activeTab, onTabChange, team }: { activeTab: string; onTabChange: (tab: string) => void; team: TeamData }) {
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

  useEffect(() => {
    if (activeButtonRef.current && navRef.current) {
      const button = activeButtonRef.current;
      const nav = navRef.current;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;
      const navWidth = nav.offsetWidth;
      const scrollLeft = buttonLeft - (navWidth / 2) + (buttonWidth / 2);

      nav.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
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
              className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
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
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default function TeamPageSimple({ team, initialTab = 'overview' }: TeamPageSimpleProps) {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync active tab with URL param
  useEffect(() => {
    const tab = params?.tab as string;
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('overview');
    }
  }, [params]);

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;

    setActiveTab(tab);

    if (tab === 'overview') {
      router.push(`/teams/${team.id}`, { scroll: false });
    } else {
      router.push(`/teams/${team.id}/${tab}`, { scroll: false });
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

      <NavigationTabs activeTab={activeTab} onTabChange={handleTabChange} team={team} />

      {/* Raptive Header Ad */}
      <div className="container mx-auto px-4 min-h-[150px]">
        <div className="raptive-pfn-header"></div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {renderActiveTab()}
      </div>
    </>
  );
}
