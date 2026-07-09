import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Join PokeHub",
};

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-[26px] py-10">
      <RegisterForm />
    </div>
  );
}
