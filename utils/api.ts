// Utility to get the correct API base path
// When basePath is set, it applies to ALL routes including API routes
export function getApiPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // In production with basePath, include it in API URLs
  if (typeof window !== 'undefined') {
    // Client-side: use window.location to detect basePath
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'nfl-hq') {
      return `/nfl-hq/${cleanPath}`;
    }
  }

  // Development or server-side without basePath
  return `/${cleanPath}`;
}
