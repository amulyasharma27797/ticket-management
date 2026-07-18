import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";

import ErrorAlert from "./ui/ErrorAlert";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Unhandled UI error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 dark:bg-slate-950">
          <div className="page-card w-full max-w-md space-y-4 text-center">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
            <ErrorAlert message="An unexpected error occurred while rendering this page." />
            <Link to="/" className="btn-primary inline-flex" onClick={() => this.setState({ hasError: false })}>
              Back to dashboard
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
