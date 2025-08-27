"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

// Dynamically import the CapWidget to avoid SSR issues.
const CapWidgetWithNoSSR = dynamic(
  () => import("@pitininja/cap-react-widget").then((mod) => mod.CapWidget),
  {
    ssr: false,
    loading: () => <p>Loading Challenge...</p>,
  },
);

type CapStatus = "idle" | "solved" | "error";

/**
 * A hook to manage the state and rendering of the CAP challenge widget.
 * It encapsulates all challenge-related state, including user-facing messages.
 *
 * @returns An object containing the challenge status and a component to render.
 */
export function useCapChallenge() {
  const [status, setStatus] = useState<CapStatus>("idle");
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState(
    "Please solve the CAP challenge to enable submission.",
  );

  const handleSolve = useCallback((solvedToken: string) => {
    console.log("Challenge succeeded, received token.");
    setToken(solvedToken);
    setStatus("solved");
    setMessage("✅ Challenge solved. You can now submit.");
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    console.error(`Challenge failed: ${errorMessage}`);
    setStatus("error");
    setToken(null);
    setMessage(`❌ CAP Challenge Error: ${errorMessage}`);
  }, []);

  const CapDisplay = useMemo(
    () =>
      function CapDisplayComponent() {
        return (
          <CapWidgetWithNoSSR
            endpoint="/api/"
            onSolve={handleSolve}
            onError={handleError}
          />
        );
      },
    [handleSolve, handleError],
  );

  return {
    token,
    isVerified: status === "solved" && token !== null,
    captchaMessage: message,
    CapDisplay,
  };
}
