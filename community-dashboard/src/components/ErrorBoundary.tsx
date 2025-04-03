import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '../services/errorLogging';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the error logging service
    logError(error, { componentStack: errorInfo.componentStack });
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
          <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Something went wrong</h2>
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <button
                onClick={this.resetErrorBoundary}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}