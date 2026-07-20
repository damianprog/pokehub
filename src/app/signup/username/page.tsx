import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UsernameForm } from "@/components/auth/UsernameForm";

export const metadata: Metadata = {
  title: "Choose your username — PokeHub",
};

export default async function UsernamePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }
  if (session.user.username) {
    redirect("/");
  }

  return (
    <div className="flex-1 flex items-center justify-center px-[26px] py-10">
      <div className="w-[420px] max-w-full animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="mt-0 mb-2 font-heading font-extrabold text-[30px] tracking-[-0.025em]">
            Choose your username
          </h1>
          <p className="m-0 text-dim-foreground text-[15px]">
            This is how other trainers will find you on PokeHub.
          </p>
        </div>

        <div className="bg-card border border-[rgba(255,255,255,0.07)] rounded-[18px] p-[30px]">
          <UsernameForm />
        </div>
      </div>
    </div>
  );
}
