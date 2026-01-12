/**
 * Shared fetcher utilities for SWR
 *
 * SWR (stale-while-revalidate) caches API responses and provides:
 * - Instant cached data on tab switches
 * - Automatic background revalidation
 * - Request deduplication
 * - Automatic error retry
 */

export class FetchError extends Error {
  status: number;
  info: unknown;

  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.info = info;
  }
}

/**
 * Default fetcher for SWR
 * Handles JSON responses and throws FetchError for non-ok responses
 */
export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);

  if (!res.ok) {
    let errorInfo: unknown;
    try {
      errorInfo = await res.json();
    } catch {
      errorInfo = await res.text();
    }

    if (res.status === 404) {
      throw new FetchError('Data not available', res.status, errorInfo);
    }

    throw new FetchError(
      `Failed to fetch: ${res.status}`,
      res.status,
      errorInfo
    );
  }

  return res.json();
};

/**
 * Fetcher with timeout support
 */
export const fetcherWithTimeout = async <T>(
  url: string,
  timeout = 10000
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new FetchError(`Failed to fetch: ${res.status}`, res.status);
    }

    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FetchError('Request timeout', 408);
    }
    throw error;
  }
};

/**
 * Default SWR configuration options
 * Can be overridden per-hook or via SWRConfig provider
 */
export const defaultSWROptions = {
  // Revalidate on window focus (good for stale data)
  revalidateOnFocus: true,

  // Revalidate when network reconnects
  revalidateOnReconnect: true,

  // Don't retry on error (let user manually retry)
  shouldRetryOnError: false,

  // Dedupe requests within 2 seconds
  dedupingInterval: 2000,

  // Keep previous data while revalidating
  keepPreviousData: true,
};

/**
 * SWR options for data that doesn't change often
 * Good for: team info, hall of famers, historical data
 */
export const staticDataOptions = {
  ...defaultSWROptions,
  revalidateOnFocus: false,
  revalidateIfStale: false,
  // Cache for 5 minutes
  dedupingInterval: 300000,
};

/**
 * SWR options for frequently updated data
 * Good for: schedules, transactions, live stats
 */
export const liveDataOptions = {
  ...defaultSWROptions,
  // Refresh every 60 seconds
  refreshInterval: 60000,
  revalidateOnFocus: true,
};
