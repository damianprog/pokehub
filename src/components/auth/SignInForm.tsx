"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

const oauthErrorMessages: Record<string, string> = {
  OAuthAccountNotLinked:
    "To confirm your identity, sign in with the same account you used originally.",
};

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState(() => {
    const error = searchParams.get("error");
    if (!error) return "";
    return oauthErrorMessages[error] ?? "Something went wrong signing you in. Please try again.";
  });
  const [shake, setShake] = useState(() => searchParams.get("error") != null);
  const [submitting, setSubmitting] = useState(false);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let nextEmailError = "";
    let nextPasswordError = "";
    if (!email.trim()) nextEmailError = "Email is required.";
    else if (!emailRe.test(email)) nextEmailError = "Enter a valid email address.";
    if (!password) nextPasswordError = "Password is required.";

    if (nextEmailError || nextPasswordError) {
      setEmailError(nextEmailError);
      setPasswordError(nextPasswordError);
      setFormError("Please fix the errors below.");
      triggerShake();
      return;
    }

    setEmailError("");
    setPasswordError("");
    setFormError("");
    setSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setSubmitting(false);

    if (result?.error) {
      setFormError("Invalid email or password.");
      triggerShake();
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="w-[420px] max-w-full animate-fade-up">
      <div className="text-center mb-8">
        <h1 className="mt-0 mb-2 font-heading font-extrabold text-[30px] tracking-[-0.025em]">
          Welcome back
        </h1>
        <p className="m-0 text-dim-foreground text-[15px]">
          Log in to keep rating &amp; collecting.
        </p>
      </div>

      <div
        className={`bg-card border border-[rgba(255,255,255,0.07)] rounded-[18px] p-[30px] ${
          shake ? "animate-shake" : ""
        }`}
      >
        <form onSubmit={handleSubmit} noValidate>
          {formError && <div className={formErrorBannerClass}>
            <span className="text-[#f07a7a] text-[15px] shrink-0">⚠</span>
            <span>{formError}</span>
          </div>}

          <div className="mb-4">
            <div className={`${fieldLabelClass} mb-[7px]`}>Email</div>
            <input
              type="email"
              placeholder="trainer@pokehub.gg"
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

          <div className="mb-[10px]">
            <div className="flex justify-between items-baseline mb-[7px]">
              <span className={fieldLabelClass}>Password</span>
              <Link href="#" className="text-xs">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
                setFormError("");
              }}
              className={`${inputClass} ${passwordError ? inputErrorBorderClass : inputBorderClass}`}
            />
            {passwordError && <div className={fieldErrorClass}>{passwordError}</div>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`${submitBtnClass} my-[22px]`}
          >
            Log in
          </button>
        </form>

        <div className="flex items-center gap-3 mb-[18px]">
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
          <span className="text-xs text-dim-foreground">OR</span>
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
        </div>

        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="w-full h-12 rounded-[12px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] font-semibold text-[14.5px] text-foreground flex items-center justify-center gap-[10px]"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Sign in with GitHub
        </button>
      </div>

      <div className={`${footerTextClass} mt-[22px]`}>
        No account?{" "}
        <Link href="/register" className={footerLinkClass}>
          Sign up free
        </Link>
      </div>
    </div>
  );
}
