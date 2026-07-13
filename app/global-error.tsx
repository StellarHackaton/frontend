"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#DDD9D1",
            padding: "0 24px",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <span style={{ fontSize: 40, fontWeight: 800, color: "#2F2A6B" }}>
            lunas
          </span>
          <div style={{ marginTop: 24, fontSize: 24, fontWeight: 700 }}>
            Something went sideways
          </div>
          <button
            onClick={reset}
            style={{
              marginTop: 28,
              padding: "14px 24px",
              borderRadius: 999,
              background: "#2F2A6B",
              color: "white",
              fontWeight: 600,
              border: "none",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
