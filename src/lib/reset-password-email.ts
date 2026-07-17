import { resend } from "@/lib/resend";

const FROM = process.env.RESEND_FROM_EMAIL || "PokeHub <onboarding@resend.dev>";

function resetPasswordEmailHtml(name: string | null, resetUrl: string): string {
  const greeting = name ? `Hey ${name},` : "Hey there,";
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 20px;">Reset your password</h1>
      <p>${greeting}</p>
      <p>We got a request to reset your PokeHub password. Click below to choose a new one.</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; background: #c44fe0; color: #fff; padding: 12px 20px; border-radius: 10px; text-decoration: none; font-weight: 600;">
          Reset password
        </a>
      </p>
      <p style="color: #888; font-size: 13px;">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    </div>
  `;
}

interface SendResetPasswordEmailParams {
  to: string;
  name: string | null;
  resetUrl: string;
}

export async function sendResetPasswordEmail({ to, name, resetUrl }: SendResetPasswordEmailParams) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your PokeHub password",
    html: resetPasswordEmailHtml(name, resetUrl),
  });
}
