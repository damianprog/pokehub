import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Log in — PokeHub",
};

export default function SignInPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-[26px] py-10">
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
