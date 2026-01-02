import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      'https://profootballnetwork.com/nba-feed',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NBA-Hub/1.0)',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`RSS feed error: ${response.status}`);
    }

    const rssText = await response.text();

    // Parse RSS XML
    const articles = parseRSSFeed(rssText);

    // Return up to 20 articles
    return NextResponse.json({
      articles: articles.slice(0, 20),
      total: articles.length,
    });

  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news', articles: [] },
      { status: 500 }
    );
  }
}

function parseRSSFeed(xml: string) {
  const articles: any[] = [];

  // Extract items from RSS feed
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const items = xml.match(itemRegex) || [];

  items.forEach(item => {
    const title = extractTag(item, 'title');
    const link = extractTag(item, 'link');
    const description = extractTag(item, 'description');
    const pubDate = extractTag(item, 'pubDate');

    // Extract featured image from description
    const featuredImage = extractImageFromDescription(description);

    if (title && link) {
      articles.push({
        title: cleanHTML(title),
        link,
        description: cleanHTML(description),
        pubDate,
        featuredImage,
      });
    }
  });

  return articles;
}

function extractImageFromDescription(description: string): string | undefined {
  // Match img tag with src attribute
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
  const match = description.match(imgRegex);
  return match ? match[1] : undefined;
}

function extractTag(text: string, tag: string): string {
  const regex = new RegExp(`<${tag}><!\\[CDATA\\[(.*?)\\]\\]><\\/${tag}>|<${tag}>(.*?)<\\/${tag}>`, 's');
  const match = text.match(regex);
  return match ? (match[1] || match[2] || '').trim() : '';
}

function cleanHTML(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}
