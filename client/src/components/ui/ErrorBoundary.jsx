import { Component } from "react";
import { palette, fonts, cardStyle } from "../../theme";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            background: palette.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: 32,
              maxWidth: 400,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>&#x26A0;&#xFE0F;</div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 900,
                fontFamily: fonts.display,
                marginBottom: 8,
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: 13,
                color: palette.sub,
                marginBottom: 20,
                lineHeight: 1.6,
              }}
            >
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                padding: "12px 24px",
                borderRadius: 12,
                border: "none",
                background: palette.blue,
                color: "#FFF",
                fontWeight: 700,
                fontSize: 14,
                fontFamily: fonts.body,
                cursor: "pointer",
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
