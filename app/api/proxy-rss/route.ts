import { NextRequest, NextResponse } from 'next/server';

interface Article {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  image?: string;
}

function extractImageFromContent(content: string): string | undefined {
  // Try to extract image from content:encoded or description
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) {
    return imgMatch[1];
  }

  // Try media:content
  const mediaMatch = content.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch) {
    return mediaMatch[1];
  }

  return undefined;
}

function parseRSSItems(xmlText: string): Article[] {
  const articles: Article[] = [];

  // Simple XML parsing for RSS items
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let itemMatch;

  while ((itemMatch = itemRegex.exec(xmlText)) !== null) {
    const itemContent = itemMatch[1];

    // Extract title
    const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) ||
                       itemContent.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract link
    const linkMatch = itemContent.match(/<link>(.*?)<\/link>/i);
    const link = linkMatch ? linkMatch[1].trim() : '';

    // Extract pubDate
    const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/i);
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';

    // Extract description
    const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) ||
                      itemContent.match(/<description>([\s\S]*?)<\/description>/i);
    const description = descMatch ? descMatch[1].trim().replace(/<[^>]*>/g, '').slice(0, 200) : '';

    // Extract image from content:encoded or media:content
    const contentMatch = itemContent.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i);
    const mediaMatch = itemContent.match(/<media:content[^>]+url=["']([^"']+)["']/i);
    const enclosureMatch = itemContent.match(/<enclosure[^>]+url=["']([^"']+)["']/i);

    let image: string | undefined;
    if (mediaMatch) {
      image = mediaMatch[1];
    } else if (enclosureMatch) {
      image = enclosureMatch[1];
    } else if (contentMatch) {
      image = extractImageFromContent(contentMatch[1]);
    }

    if (title && link) {
      articles.push({
        title,
        link,
        pubDate,
        description,
        image,
      });
    }
  }

  return articles;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rssUrl = searchParams.get('url');

  if (!rssUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // Validate URL is from profootballnetwork.com
  if (!rssUrl.includes('profootballnetwork.com')) {
    return NextResponse.json({ error: 'Invalid RSS feed URL' }, { status: 400 });
  }

  try {
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NFL-HQ/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json({ articles: [] });
    }

    const xmlText = await response.text();
    const articles = parseRSSItems(xmlText);

    return NextResponse.json({
      articles,
      count: articles.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('RSS proxy error:', error);
    return NextResponse.json({ articles: [] });
  }
}
