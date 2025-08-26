
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import styles from "./page.module.css";

const CapWidgetWithNoSSR = dynamic(
  () => import("@pitininja/cap-react-widget").then((mod) => mod.CapWidget),
  {
    ssr: false,
    loading: () => <p>Loading Challenge...</p>,
  },
);

export default function Home() {
  const [status, setStatus] = useState<"idle" | "solved" | "error">("idle");
  const [message, setMessage] = useState(
    "Please solve the CAP challenge below.",
  );

  return (
    <main className={styles.container}>
      <h1>CAP Challenge System Test</h1>

      {status !== "solved" && (
        <CapWidgetWithNoSSR
          endpoint="/api/"
          onSolve={(token) => {
            console.log(`Challenge succeeded, final token: ${token}`);
            setStatus("solved");
            setMessage(
              "✅ Success! The CAP challenge was solved and redeemed successfully.",
            );
          }}
          onError={(errorMessage) => {
            console.error(`Challenge failed: ${errorMessage}`);
            setStatus("error");
            setMessage(`❌ Error: ${errorMessage}`);
          }}
        />
      )}

      <div className={styles.statusBox}>
        <p>
          <strong>Status:</strong> {status}
        </p>
        <p>{message}</p>
      </div>
    </main>
  );
}