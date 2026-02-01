import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', fontFamily: 'sans-serif', color: '#333' }}>
                    <h1 style={{ color: '#EF4444' }}>Something went wrong.</h1>
                    <p>The application crashed. Here is the error:</p>
                    <pre style={{
                        background: '#F3F4F6',
                        padding: '20px',
                        borderRadius: '8px',
                        overflow: 'auto',
                        border: '1px solid #E5E7EB',
                        color: '#DC2626'
                    }}>
                        {this.state.error?.toString()}
                    </pre>
                    <p style={{ marginTop: '20px', color: '#6B7280' }}>
                        Check your console (F12) for more details.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
