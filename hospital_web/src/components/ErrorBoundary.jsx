// src/components/ErrorBoundary.jsx
// React Error Boundary for graceful error handling

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log to our structured logger (imported dynamically to avoid circular deps)
    import('../lib/logger')
      .then(({ logger }) => {
        logger.error('React Error Boundary caught error', {
          error: error?.message,
          stack: error?.stack,
          componentStack: errorInfo?.componentStack,
        });
      })
      .catch(() => {
        // Fallback if logger fails
        console.error('ErrorBoundary caught:', error, errorInfo);
      });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            borderRadius: '16px',
            margin: '20px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255, 45, 85, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
            }}
          >
            <AlertTriangle size={40} color="var(--accent-red)" />
          </div>

          <h2
            style={{
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '12px',
              color: 'var(--text-main)',
            }}
          >
            Something went wrong
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              marginBottom: '24px',
              maxWidth: '400px',
              lineHeight: 1.6,
            }}
          >
            We encountered an unexpected error. Your data is safe — this is just a display issue.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={this.handleRetry}
              style={{
                padding: '12px 24px',
                background: 'var(--accent-red)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RefreshCw size={18} /> Try Again
            </button>

            <button
              onClick={this.handleHome}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: 'var(--text-main)',
                border: '1px solid var(--border-soft)',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Home size={18} /> Go Home
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details
              style={{
                marginTop: '24px',
                textAlign: 'left',
                maxWidth: '600px',
                width: '100%',
              }}
            >
              <summary style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                Error Details (Development)
              </summary>
              <pre
                style={{
                  marginTop: '12px',
                  padding: '16px',
                  background: 'var(--bg-app)',
                  borderRadius: '8px',
                  overflow: 'auto',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack &&
                  `\n\n${this.state.errorInfo.componentStack}`}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
