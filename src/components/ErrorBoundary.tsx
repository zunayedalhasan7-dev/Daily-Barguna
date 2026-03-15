import { Component, ErrorInfo, ReactNode } from "react";
import { LanguageContext } from "../context/LanguageContext";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if ((this as any).props.fallback) {
        return (this as any).props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-red-100 dark:border-red-900/30">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <LanguageContext.Consumer>
              {(context) => {
                const t = context?.t || ((key: string) => {
                  const fallbacks: Record<string, string> = {
                    'error.title': 'Something went wrong',
                    'error.message': 'An unexpected error occurred. Please try refreshing the page.',
                    'error.refresh': 'Refresh Page'
                  };
                  return fallbacks[key] || key;
                });

                return (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('error.title')}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                      {t('error.message')}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-600/20"
                    >
                      {t('error.refresh')}
                    </button>
                  </>
                );
              }}
            </LanguageContext.Consumer>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-500">{this.state.error.toString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
