import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM = process.env.RESEND_FROM ?? 'CoachUp <onboarding@resend.dev>'

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

/**
 * Send a client invite email with the one-time link.
 * No-op if RESEND_API_KEY is not set (returns { sent: false }).
 */
export async function sendInviteEmail(to: string, inviteLink: string): Promise<{ sent: boolean; error?: string }> {
  if (!resend) {
    return { sent: false }
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: "You're invited to join CoachUp",
    html: `
      <p>Your coach has invited you to join <strong>CoachUp</strong>, a strength coaching platform.</p>
      <p>Click the link below to sign up or log in and accept the invite. This link is one-time use.</p>
      <p><a href="${inviteLink}" style="display: inline-block; margin-top: 12px; padding: 12px 24px; background: #0d9488; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Accept invite</a></p>
      <p style="margin-top: 24px; color: #64748b; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; font-size: 14px;">${inviteLink}</p>
    `,
  })

  if (error) {
    return { sent: false, error: error.message }
  }
  return { sent: true }
}
