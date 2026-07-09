import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Log in — PokeHub",
};

export default function SignInPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-[26px] py-10">
      <SignInForm />
    </div>
  );
}
