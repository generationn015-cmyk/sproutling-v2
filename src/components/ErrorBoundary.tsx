import { Component, type ReactNode } from "react";
export class ErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state: { err: Error | null } = { err: null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  render() {
    if (this.state.err) {
      return (
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <p className="label">Something snagged</p>
          <h1 className="serif mt-2 text-3xl text-forest">The page hit an error.</h1>
          <p className="mt-3 text-sm text-mute">{this.state.err.message}</p>
          <button className="tap mt-6 rounded-full bg-forest px-5 text-sm text-parchment-2" onClick={() => location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
