"use client";

import { useState } from "react";
import { toast } from "sonner";
import { fieldLabelClass, inputClass, inputBorderClass, submitBtnClass } from "@/components/auth/auth-form-styles";

export function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubmitting(false);
    setSent(true);
    toast.success("If that account needs verification, we've sent a new link.");
  }

  if (sent) {
    return (
      <p className="m-0 text-[14.5px] text-dim-foreground text-center">
        Check your inbox for a new verification link.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-[18px]">
        <div className={`${fieldLabelClass} mb-[7px]`}>Email</div>
        <input
          type="email"
          placeholder="trainer@pokehub.gg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClass} ${inputBorderClass}`}
        />
      </div>
      <button type="submit" disabled={submitting} className={submitBtnClass}>
        {submitting ? "Sending…" : "Resend verification email"}
      </button>
    </form>
  );
}
