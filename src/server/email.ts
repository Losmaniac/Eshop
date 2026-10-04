import { config } from "@/server/config";

export type EmailAttachment = {
  filename: string;
  /** Base64 encoded content. */
  content: string;
  /** Set to reference the file inline from HTML as cid:<contentId>. */
  contentId?: string;
};

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
};

/**
 * Sends a transactional email through the Resend HTTP API. Without an API key
 * (local development) the email is only logged. Emails are notifications;
 * the database is the system of record, so callers should not fail an order
 * because an email could not be sent.
 */
export async function sendEmail(email: Email): Promise<boolean> {
  if (!config.resendApiKey) {
    console.info(`[email] RESEND_API_KEY not set, not sending "${email.subject}" to ${email.to}`);
    return false;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: config.emailFrom,
      to: [email.to],
      subject: email.subject,
      html: email.html,
      text: email.text,
      reply_to: email.replyTo,
      attachments: email.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        content_id: a.contentId,
      })),
    }),
  });
  if (!response.ok) {
    console.error(`[email] Resend error ${response.status}: ${await response.text()}`);
    return false;
  }
  return true;
}
