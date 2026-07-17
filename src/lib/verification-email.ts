import { resend } from "@/lib/resend";

const FROM = process.env.RESEND_FROM_EMAIL || "PokeHub <onboarding@resend.dev>";

function verificationEmailHtml(name: string | null, verifyUrl: string): string {
  const greeting = name ? `Hey ${name},` : "Hey there,";
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 20px;">Verify your email</h1>
      <p>${greeting}</p>
      <p>Confirm your email address to finish setting up your PokeHub account.</p>
      <p>
        <a href="${verifyUrl}" style="display: inline-block; background: #c44fe0; color: #fff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 600;">
          Verify email
        </a>
      </p>
      <p style="color: #888; font-size: 13px;">This link expires in 24 hours. If you didn't create a PokeHub account, you can ignore this email.</p>
    </div>
  `;
}

interface SendVerificationEmailParams {
  to: string;
  name: string | null;
  verifyUrl: string;
}

export async function sendVerificationEmail({ to, name, verifyUrl }: SendVerificationEmailParams) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your PokeHub email",
    html: verificationEmailHtml(name, verifyUrl),
  });
}
