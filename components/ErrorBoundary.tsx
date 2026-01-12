'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Optional team color for styled fallback */
  teamColor?: string;
  /** Component name for error reporting */
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors in child components
 * and displays a fallback UI instead of crashing the entire page.
 *
 * Usage:
 * <ErrorBoundary componentName="RosterTab">
 *   <RosterTab team={team} />
 * </ErrorBoundary>
 *
 * Or with custom fallback:
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <SomeComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler (for analytics, error reporting, etc.)
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
          teamColor={this.props.teamColor}
          componentName={this.props.componentName}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 * Styled to match the site's design language
 */
interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
  teamColor?: string;
  componentName?: string;
}

export function ErrorFallback({
  error,
  onReset,
  teamColor = '#0050A0',
  componentName,
}: ErrorFallbackProps): React.ReactElement {
  return (
    <div className="bg-white rounded-lg shadow p-6 min-h-[300px] flex flex-col items-center justify-center">
      <div className="text-red-500 mb-4">
        <svg
          className="h-12 w-12 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {componentName ? `Error Loading ${componentName}` : 'Something went wrong'}
      </h3>

      <p className="text-gray-600 text-center mb-4 max-w-md">
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </p>

      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center px-4 py-2 min-h-[44px] border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
          style={{ backgroundColor: teamColor }}
        >
          Try Again
        </button>
      )}

      {process.env.NODE_ENV === 'development' && error?.stack && (
        <details className="mt-4 w-full max-w-2xl">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            Error Details (Development Only)
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto text-red-600">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * Hook-friendly error fallback for use with SWR errors
 * Use this when you need an error UI but aren't wrapping with ErrorBoundary
 */
interface SWRErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
  teamColor?: string;
  title?: string;
}

export function SWRErrorFallback({
  error,
  onRetry,
  teamColor = '#0050A0',
  title = 'Error Loading Data',
}: SWRErrorFallbackProps): React.ReactElement {
  const errorMessage = error.message.includes('404')
    ? 'Data not available for this team yet'
    : error.message || 'Failed to load data';

  return (
    <div className="text-center py-12">
      <div className="text-red-600 mb-4">
        <svg
          className="mx-auto h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{errorMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 min-h-[44px] border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ backgroundColor: teamColor }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorBoundary;
