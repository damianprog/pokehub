"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fieldLabelClass,
  inputClass,
  inputBorderClass,
  inputErrorBorderClass,
  submitBtnClass,
  fieldErrorClass,
  formErrorBannerClass,
} from "@/components/auth/auth-form-styles";

interface ResetPasswordFormProps {
  token: string | undefined;
}

type Phase = "form" | "done" | "expired" | "invalid";

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<Phase>(token ? "form" : "invalid");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    let nextPasswordError = "";
    let nextConfirmError = "";
    if (!password) nextPasswordError = "Password is required.";
    else if (password.length < 8) nextPasswordError = "Use at least 8 characters.";
    if (!confirmPassword) nextConfirmError = "Please confirm your password.";
    else if (confirmPassword !== password) nextConfirmError = "Passwords do not match.";

    if (nextPasswordError || nextConfirmError) {
      setPasswordError(nextPasswordError);
      setConfirmError(nextConfirmError);
      setFormError("Please fix the errors below.");
      return;
    }

    setPasswordError("");
    setConfirmError("");
    setFormError("");
    setSubmitting(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, confirmPassword }),
    });
    const data = await res.json();

    setSubmitting(false);

    if (!res.ok) {
      if (data.error === "expired" || data.error === "invalid") {
        setPhase(data.error);
      } else {
        setFormError(data.error ?? "Something went wrong. Please try again.");
      }
      return;
    }

    setPhase("done");
  }

  if (phase === "done") {
    return (
      <div className="text-center">
        <p className="mt-0 mb-6 text-[14.5px] text-dim-foreground leading-relaxed">
          Your password has been reset. You can now log in.
        </p>
        <button type="button" onClick={() => router.push("/sign-in")} className={submitBtnClass}>
          Log in
        </button>
      </div>
    );
  }

  if (phase === "expired" || phase === "invalid") {
    const message =
      phase === "expired"
        ? "This reset link has expired. Request a new one below."
        : "This reset link is invalid or has already been used. Request a new one below.";
    return (
      <div className="text-center">
        <p className="mt-0 mb-6 text-[14.5px] text-dim-foreground leading-relaxed">{message}</p>
        <Link href="/forgot-password" className={`${submitBtnClass} flex items-center justify-center`}>
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className={formErrorBannerClass}>
          <span className="text-[#f07a7a] text-[15px] shrink-0">⚠</span>
          <span>{formError}</span>
        </div>
      )}

      <div className="mb-[14px]">
        <div className={`${fieldLabelClass} mb-[7px]`}>New password</div>
        <input
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError("");
            setConfirmError("");
            setFormError("");
          }}
          className={`${inputClass} ${passwordError ? inputErrorBorderClass : inputBorderClass}`}
        />
        {passwordError && <div className={fieldErrorClass}>{passwordError}</div>}
      </div>

      <div className="mb-2">
        <div className={`${fieldLabelClass} mb-[7px]`}>Confirm password</div>
        <input
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setConfirmError("");
            setFormError("");
          }}
          className={`${inputClass} ${confirmError ? inputErrorBorderClass : inputBorderClass}`}
        />
        {confirmError && <div className={fieldErrorClass}>{confirmError}</div>}
      </div>

      <button type="submit" disabled={submitting} className={`${submitBtnClass} mt-[18px]`}>
        Reset password
      </button>
    </form>
  );
}
