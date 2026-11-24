import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

function formatErrorMessage(error: Error): string {
  try {
    const parsed = JSON.parse(error.message) as {
      error?: string;
      operationType?: string;
      path?: string;
    };
    if (parsed && parsed.error) {
      return `${parsed.error}${parsed.path ? ` (Path: ${parsed.path})` : ''}`;
    }
  } catch {
    // plain error message
  }
  return error.message || 'An unexpected application error occurred.';
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: formatErrorMessage(error),
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fbf7f7] px-6 py-20 text-[#071a37]">
          <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-[#8c1539]">
              Application Notice
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-[#07182f]">
              Something interrupted this view
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#8c1539] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#b20f42]"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
