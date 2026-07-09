"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  fieldLabelClass,
  inputClass,
  inputBorderClass,
  inputErrorBorderClass,
  submitBtnClass,
  footerTextClass,
  footerLinkClass,
  fieldErrorClass,
  formErrorBannerClass,
} from "@/components/auth/auth-form-styles";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REDIRECT_DELAY_MS = 2000;

type SuccessMode = "signed-in" | "manual";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMode, setSuccessMode] = useState<SuccessMode | null>(null);

  useEffect(() => {
    if (!successMode) return;
    const destination = successMode === "signed-in" ? "/" : "/sign-in";
    const timeout = setTimeout(() => {
      router.push(destination);
      router.refresh();
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [successMode, router]);

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
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setSubmitting(false);
    setSuccessMode(signInResult?.error ? "manual" : "signed-in");
  }

  if (successMode) {
    const isSignedIn = successMode === "signed-in";
    return (
      <div className="w-[440px] max-w-full animate-fade-up">
        <div className="bg-card border border-[rgba(255,255,255,0.07)] rounded-[18px] p-[30px]">
          <div className="text-center py-5 px-1">
            <div className="size-[52px] rounded-full bg-[rgba(92,184,92,0.14)] border border-[rgba(92,184,92,0.35)] flex items-center justify-center text-2xl text-[#5cb85c] mx-auto mb-[18px]">
              ✓
            </div>
            <h3 className="mt-0 mb-2 font-heading font-bold text-[19px]">
              Account created
            </h3>
            <p className="mt-0 mb-5 text-sm text-muted-foreground">
              {isSignedIn ? "Signing you in…" : "Redirecting you to log in…"}
            </p>
            <Link
              href={isSignedIn ? "/" : "/sign-in"}
              className="inline-flex h-11 px-6 rounded-[11px] bg-gradient-to-br from-brand-from to-brand-to text-white font-bold text-[14.5px] items-center"
            >
              {isSignedIn ? "Continue →" : "Go to sign in →"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[440px] max-w-full animate-fade-up">
      <div className="text-center mb-8">
        <h1 className="mt-0 mb-2 font-heading font-extrabold text-[30px] tracking-[-0.025em]">
          Join PokeHub
        </h1>
        <p className="m-0 text-dim-foreground text-[15px]">
          Free forever. Rate, collect, obsess.
        </p>
      </div>

      <div className="bg-card border border-[rgba(255,255,255,0.07)] rounded-[18px] p-[30px]">
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

      <div className={`${footerTextClass} mt-[22px]`}>
        Already a trainer?{" "}
        <Link href="/sign-in" className={footerLinkClass}>
          Log in
        </Link>
      </div>
    </div>
  );
}
