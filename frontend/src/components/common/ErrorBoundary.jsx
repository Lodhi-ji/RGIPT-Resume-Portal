import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          margin: '40px auto'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px', fontSize: '24px', fontWeight: '600' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '16px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              if (this.props.onReset) {
                this.props.onReset();
              }
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1d4ed8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1e3a8a'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          >
            Try Again
          </button>
          {import.meta.env.DEV && this.state.errorInfo && (
            <details style={{ marginTop: '24px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#6b7280', fontWeight: '500' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                fontSize: '12px',
                overflow: 'auto',
                color: '#374151'
              }}>
                {this.state.error?.stack}
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
