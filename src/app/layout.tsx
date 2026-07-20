import type { Metadata } from "next";
import { Space_Grotesk, Hanken_Grotesk } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { Nav } from "@/components/landing/Nav";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/auth";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PokeHub",
  description: "Rate, review, and collect every Pokémon.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${hankenGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <SessionProvider session={session}>
            <Nav />
            {children}
            <Toaster />
          </SessionProvider>
        </body>
    </html>
  );
}
