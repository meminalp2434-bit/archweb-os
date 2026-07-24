import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ArchWeb OS:', error, errorInfo);
  }

  public handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-mono select-none">
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-white">ArchWeb OS Kurtarma Modu</h1>
              <p className="text-xs text-white/60 leading-relaxed">
                Arayüzde beklenmeyen bir hata oluştu. Sistemi güvenli şekilde yeniden başlatabilirsiniz.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-red-300 font-mono text-left overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Yeniden Yükle</span>
              </button>
              <button
                onClick={this.handleReset}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sıfırla & Başlat</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
