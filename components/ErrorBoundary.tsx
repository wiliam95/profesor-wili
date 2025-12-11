import React from 'react';

interface ErrorBoundaryState { hasError: boolean; error?: any }

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any): ErrorBoundaryState { return { hasError: true, error } }
  componentDidCatch(error: any) { try { console.error('UI Error', error) } catch {} }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-200">
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center mx-auto mb-3">!</div>
            <div className="font-bold mb-2">Terjadi kesalahan tampilan</div>
            <div className="text-sm text-slate-400 mb-4">Coba muat ulang halaman atau lanjutkan percakapan.</div>
            <button onClick={() => { try { this.setState({ hasError: false, error: undefined }) } catch {} }} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white">Lanjutkan</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
