'use client';

import { TeamData } from '@/data/teams';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NewsTabProps {
  team: TeamData;
}

interface NewsArticle {
  id: number;
  title: string;
  url: string;
  pubDate: string;
  author: string;
  content: string;
  categories: string[];
  players: Array<{
    firstName: string;
    lastName: string;
    team: string;
    position: string;
  }>;
}

export default function NewsTab({ team }: NewsTabProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/nba-hq/api/nba/news?teamId=${team.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(err instanceof Error ? err.message : 'Failed to load news');
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [team.id]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Truncate content for preview - show more text so users get enough info
  const truncateContent = (content: string, maxLength: number = 300) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{team.fullName} News</h2>
          <div className="h-1 rounded-full" style={{ backgroundColor: team.primaryColor, width: 'fit-content', minWidth: '320px' }}></div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
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
            <p className="text-gray-600 font-medium">Loading news...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold mb-1">Failed to load news</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* No Articles State */}
      {!loading && !error && articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No recent news available for the {team.fullName}.</p>
          <p className="text-sm text-gray-400">
            Check back later for the latest updates and articles.
          </p>
        </div>
      )}

      {/* Articles List */}
      {!loading && !error && articles.length > 0 && (
        <div className="space-y-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2" style={{ color: team.primaryColor }}>
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {truncateContent(article.content)}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span>{formatDate(article.pubDate)}</span>
                  {article.author && (
                    <>
                      <span>•</span>
                      <span>By {article.author}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
