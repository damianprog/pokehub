"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  fieldLabelClass,
  inputClass,
  inputBorderClass,
  inputErrorBorderClass,
  submitBtnClass,
  fieldErrorClass,
  formErrorBannerClass,
} from "@/components/auth/auth-form-styles";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SignupFormProps {
  onRegistered: () => void;
}

export function SignupForm({ onRegistered }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState("");
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let nextNameError = "";
    let nextEmailError = "";
    let nextPasswordError = "";
    let nextConfirmError = "";

    if (!name.trim()) nextNameError = "Name is required.";
    if (!email.trim()) nextEmailError = "Email is required.";
    else if (!emailRe.test(email)) nextEmailError = "Enter a valid email address.";
    if (!password) nextPasswordError = "Password is required.";
    else if (password.length < 8) nextPasswordError = "Use at least 8 characters.";
    if (!confirmPassword) nextConfirmError = "Please confirm your password.";
    else if (confirmPassword !== password) nextConfirmError = "Passwords do not match.";

    if (nextNameError || nextEmailError || nextPasswordError || nextConfirmError) {
      setNameError(nextNameError);
      setEmailError(nextEmailError);
      setPasswordError(nextPasswordError);
      setConfirmError(nextConfirmError);
      setFormError("Please fix the errors below.");
      triggerShake();
      return;
    }

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmError("");
    setFormError("");
    setSubmitting(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
    const data = await res.json();

    if (!res.ok) {
      setSubmitting(false);
      setFormError(data.error ?? "Something went wrong. Please try again.");
      triggerShake();
      return;
    }

    setSubmitting(false);
    toast.success("Account created — you can now log in.");
    onRegistered();
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

        <div className="mb-[14px]">
          <div className={`${fieldLabelClass} mb-[7px]`}>Name</div>
          <input
            type="text"
            placeholder="Ash Ketchum"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError("");
              setFormError("");
            }}
            className={`${inputClass} ${nameError ? inputErrorBorderClass : inputBorderClass}`}
          />
          {nameError && <div className={fieldErrorClass}>{nameError}</div>}
        </div>

        <div className="mb-[14px]">
          <div className={`${fieldLabelClass} mb-[7px]`}>Email</div>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
              setFormError("");
            }}
            className={`${inputClass} ${emailError ? inputErrorBorderClass : inputBorderClass}`}
          />
          {emailError && <div className={fieldErrorClass}>{emailError}</div>}
        </div>

        <div className="mb-[14px]">
          <div className={`${fieldLabelClass} mb-[7px]`}>Password</div>
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
          Create account
        </button>

        <p className="mt-4 mb-0 text-xs leading-relaxed text-[#5c636e] text-center">
          By signing up, you agree to PokeHub&apos;s Terms and Privacy Policy.
        </p>
      </form>
    </div>
  );
}
