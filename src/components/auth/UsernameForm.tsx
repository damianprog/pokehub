"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  fieldLabelClass,
  inputClass,
  inputBorderClass,
  inputErrorBorderClass,
  submitBtnClass,
  fieldErrorClass,
  formErrorBannerClass,
} from "@/components/auth/auth-form-styles";

const usernameRe = /^[a-z0-9_-]+$/;

export function UsernameForm() {
  const { update } = useSession();
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [formError, setFormError] = useState("");
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const value = username.trim().toLowerCase();
    let nextUsernameError = "";
    if (!value) nextUsernameError = "Username is required.";
    else if (value.length < 3 || value.length > 20) nextUsernameError = "Use 3–20 characters.";
    else if (!usernameRe.test(value))
      nextUsernameError = "Only lowercase letters, numbers, underscores and hyphens.";

    if (nextUsernameError) {
      setUsernameError(nextUsernameError);
      setFormError("Please fix the errors below.");
      triggerShake();
      return;
    }

    setUsernameError("");
    setFormError("");
    setSubmitting(true);

    const res = await fetch("/api/auth/username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: value }),
    });
    const data = await res.json();

    if (!res.ok) {
      setSubmitting(false);
      setFormError(data.error ?? "Something went wrong. Please try again.");
      triggerShake();
      return;
    }

    await update({});
    window.location.href = "/";
  }

  return (
    <div className={shake ? "animate-shake" : undefined}>
      <form onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className={formErrorBannerClass}>
            <span className="text-[#f07a7a] text-[15px] shrink-0">⚠</span>
            <span>{formError}</span>
          </div>
        )}

        <div className="mb-2">
          <div className={`${fieldLabelClass} mb-[7px]`}>Username</div>
          <input
            type="text"
            placeholder="ash_ketchum"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setUsernameError("");
              setFormError("");
            }}
            className={`${inputClass} ${usernameError ? inputErrorBorderClass : inputBorderClass}`}
          />
          {usernameError && <div className={fieldErrorClass}>{usernameError}</div>}
        </div>

        <button type="submit" disabled={submitting} className={`${submitBtnClass} mt-[18px]`}>
          Continue
        </button>
      </form>
    </div>
  );
}
