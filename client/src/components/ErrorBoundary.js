import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const message = this.state.error?.message || 'Unknown error';
      const stack = (this.state.error?.stack || '').split('\n').slice(0, 3).join('\n');
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 600, textAlign: 'center' }}>
            <h2>Something went wrong.</h2>
            <div style={{ textAlign: 'left', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, margin: '12px 0', color: '#111827' }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Error</div>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{message}</pre>
              {stack && (
                <>
                  <div style={{ fontWeight: 600, margin: '10px 0 6px' }}>Stack (first lines)</div>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{stack}</pre>
                </>
              )}
            </div>
            <p style={{ color: '#6b7280', marginBottom: 16 }}>Please copy the details above if you contact support.</p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;


