import React, { Component, ErrorInfo, ReactNode } from 'react';
import { User } from '../types';
import { FiveSApp } from './fives/FiveSApp';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  onBack: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class FiveSErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('5S Application Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('sankara_5s_auth_user');
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900">5S Application Notice</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              We encountered an unexpected interface error while loading the 5S audit module.
            </p>
            {this.state.error?.message && (
              <div className="bg-rose-50 text-rose-800 text-[11px] font-mono p-3 rounded-xl border border-rose-200 text-left overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload 5S Workspace</span>
              </button>
              <button
                type="button"
                onClick={this.props.onBack}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Portal Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface FiveSInProgressViewProps {
  currentUser: User;
  onBack: () => void;
}

export const FiveSInProgressView: React.FC<FiveSInProgressViewProps> = ({
  currentUser,
  onBack
}) => {
  return (
    <FiveSErrorBoundary onBack={onBack}>
      <FiveSApp currentUser={currentUser} onBackToPortal={onBack} />
    </FiveSErrorBoundary>
  );
};
