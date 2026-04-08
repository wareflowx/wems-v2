import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, Copy, CheckCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ERROR_BOUNDARY] Uncaught error:", error);
    console.error("[ERROR_BOUNDARY] Component stack:", errorInfo.componentStack);
    this.setState({ error, errorInfo });
  }

  private handleReload = (): void => { window.location.reload(); };
  private handleGoHome = (): void => { window.location.href = "/"; };
  private handleCopyError = (): void => {
    const { error, errorInfo } = this.state;
    const text = [error?.message, error?.stack, errorInfo?.componentStack].join(String.fromCharCode(10));
    navigator.clipboard.writeText(text).then(() => { this.setState({ copied: true }); setTimeout(() => this.setState({ copied: false }), 2000); });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, copied } = this.state;
    const { children } = this.props;
    if (hasError && error) { return <FallbackUI error={error} errorInfo={errorInfo} onReload={this.handleReload} onGoHome={this.handleGoHome} onCopyError={this.handleCopyError} copied={copied} />; }
    return children;
  }
}

interface FallbackUIProps {
  error: Error; errorInfo: ErrorInfo | null; onReload: () => void; onGoHome: () => void; onCopyError: () => void; copied: boolean;
}

function FallbackUI({ error, errorInfo, onReload, onGoHome, onCopyError, copied }: FallbackUIProps) {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem", backgroundColor: "#0f0f0f", color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "600px", width: "100%", padding: "2rem", borderRadius: "12px", backgroundColor: "#1a1a1a", border: "1px solid #333", boxShadow: "0 4px 24px rgba(0, 0, 0, 0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(234, 179, 8, 0.15)", marginBottom: "1.5rem" }}>
          <AlertTriangle size={32} color="#eab308" />
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem", color: "#ffffff" }}>{t("error-boundary.title", "Something went wrong")}</h1>
        <p style={{ fontSize: "0.875rem", color: "#a1a1a1", textAlign: "center", marginBottom: "1.5rem", lineHeight: 1.6 }}>{t("error-boundary.description", "An unexpected error occurred. The application caught this error and prevented a crash.")}</p>
        <div style={{ width: "100%", padding: "1rem", borderRadius: "8px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.8125rem", fontFamily: "monospace", color: "#fca5a5", margin: 0, wordBreak: "break-word" }}>{error.message || t("error-boundary.no-message", "No error message")}</p>
        </div>
        {process.env.NODE_ENV === "development" && errorInfo?.componentStack && (
          <details style={{ width: "100%", marginBottom: "1.5rem" }}>
            <summary style={{ fontSize: "0.75rem", color: "#737373", cursor: "pointer", marginBottom: "0.5rem" }}>{t("error-boundary.component-stack", "Component Stack")}</summary>
            <pre style={{ fontSize: "0.6875rem", fontFamily: "monospace", color: "#737373", backgroundColor: "rgba(0, 0, 0, 0.3)", padding: "0.75rem", borderRadius: "6px", overflow: "auto", maxHeight: "200px", margin: 0 }}>{errorInfo.componentStack}</pre>
          </details>
        )}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Button onClick={onReload} style={{ backgroundColor: "#3b82f6", display: "flex", alignItems: "center", gap: "0.5rem" }}><RefreshCw size={16} />{t("error-boundary.reload", "Reload App")}</Button>
          <Button onClick={onGoHome} variant="outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderColor: "#333", color: "#a1a1a1" }}><Home size={16} />{t("error-boundary.go-home", "Go to Home")}</Button>
          <Button onClick={onCopyError} variant="outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem", borderColor: "#333", color: copied ? "#4ade80" : "#a1a1a1" }}>{copied ? <CheckCheck size={16} /> : <Copy size={16} />}{copied ? t("error-boundary.copied", "Copied!") : t("error-boundary.copy-error", "Copy Error")}</Button>
        </div>
      </div>
    </div>
  );
}

export { ErrorBoundary };
export default ErrorBoundary;
