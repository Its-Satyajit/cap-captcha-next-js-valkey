"use client";

import { type FormEvent, useState } from "react";
import { useCapChallenge } from "@/hooks/use-cap-challenge";
import styles from "./page.module.css";

export default function Home() {
  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "submitted"
  >("idle");
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const { token, isVerified, captchaMessage, CapDisplay } = useCapChallenge();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isVerified) {
      setFormMessage("❌ CAP Challenge not solved.");
      return;
    }

    setFormStatus("submitting");
    setFormMessage("Submitting your request...");

    // Simulate a network request
    setTimeout(() => {
      console.log("Form submitted with CAP token:", token);
      setFormStatus("submitted");
      setFormMessage("✅ Your form has been successfully submitted!");
    }, 1000);
  };

  const displayMessage = formMessage || captchaMessage;

  return (
    <main className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Sign Up</h1>

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className={styles.input}
          disabled={formStatus !== "idle"}
        />

        {formStatus !== "submitted" && <CapDisplay />}

        <button
          type="submit"
          className={styles.button}
          disabled={!isVerified || formStatus !== "idle"}
        >
          {formStatus === "submitting" ? "Submitting..." : "Submit"}
        </button>
      </form>

      <div className={styles.statusBox}>
        <p>{displayMessage}</p>
      </div>
    </main>
  );
}