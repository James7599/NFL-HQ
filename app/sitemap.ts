import { MetadataRoute } from 'next'
import { getAllTeamIds } from '@/data/teams'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.profootballnetwork.com/nfl-hq'
  const teamIds = getAllTeamIds()
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/teams`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/power-rankings-builder`,
      lastModified: yesterday,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/player-rankings-builder`,
      lastModified: yesterday,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/standings`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/salary-cap-tracker`,
      lastModified: yesterday,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/draft-order`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/players`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/schedule`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/stats`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/injuries`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/transactions`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/free-agency-tracker`,
      lastModified: yesterday,
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ]

  // Valid tabs for team pages
  const tabs = [
    'overview',
    'news',
    'schedule',
    'roster',
    'depth-chart',
    'injury-report',
    'stats',
    'transactions',
    'draft-picks',
    'salary-cap',
    'team-info'
  ];

  // Team pages - only include non-overview tabs with explicit URLs
  const teamPages: MetadataRoute.Sitemap = teamIds.flatMap((teamId) => [
    // Team overview page (no tab in URL)
    {
      url: `${baseUrl}/teams/${teamId}/`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    // All other tabs with dynamic frequency and priority
    ...tabs.filter(tab => tab !== 'overview').map(tab => {
      // High-frequency updates for news and injury reports
      const isHighFrequency = tab === 'news' || tab === 'injury-report'
      // Medium-frequency for rosters, transactions, schedule
      const isMediumFrequency = tab === 'roster' || tab === 'transactions' || tab === 'schedule'
      // Important tabs get higher priority
      const isHighPriority = tab === 'news' || tab === 'schedule' || tab === 'stats' || tab === 'roster'

      return {
        url: `${baseUrl}/teams/${teamId}/${tab}/`,
        lastModified: isHighFrequency ? now : (isMediumFrequency ? yesterday : yesterday),
        changeFrequency: isHighFrequency ? 'hourly' as const : (isMediumFrequency ? 'daily' as const : 'weekly' as const),
        priority: isHighPriority ? 0.7 : 0.6,
      }
    })
  ])

  return [...routes, ...teamPages]
}
