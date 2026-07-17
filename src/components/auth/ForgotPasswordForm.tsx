"use client";

import { useState } from "react";
import {
  fieldLabelClass,
  inputClass,
  inputBorderClass,
  submitBtnClass,
  fieldErrorClass,
} from "@/components/auth/auth-form-styles";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }
    if (!emailRe.test(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setEmailError("");
    setSubmitting(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubmitting(false);
    setSent(true);
  }

  if (sent) {
    return (
      <p className="m-0 text-[14.5px] text-dim-foreground text-center leading-relaxed">
        If an account exists for <span className="font-semibold text-foreground">{email}</span>,
        we&apos;ve sent a password reset link.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-[18px]">
        <div className={`${fieldLabelClass} mb-[7px]`}>Email</div>
        <input
          type="email"
          placeholder="trainer@pokehub.gg"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError("");
          }}
          className={`${inputClass} ${inputBorderClass}`}
        />
        {emailError && <div className={fieldErrorClass}>{emailError}</div>}
      </div>
      <button type="submit" disabled={submitting} className={submitBtnClass}>
        {submitting ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
