import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { debugLogger } from './components/DeveloperDebugModal.jsx';

window.debugLogger = debugLogger;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
  }

  handleResetApp = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8 space-y-6 text-center font-sans">
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-3xl font-serif font-bold">
            ESV Bible Tracker
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-200">Something went wrong while rendering</h2>
          <p className="text-xs text-slate-400 max-w-md">
            {this.state.error?.toString() || "An unexpected error occurred."}
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              Reload Window
            </button>
            <button
              onClick={this.handleResetApp}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
            >
              Reset App Cache & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
