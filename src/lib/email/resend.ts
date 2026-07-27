import { Resend } from "resend";

let client: Resend | null | undefined;

/** Returns null (not an error) when RESEND_API_KEY isn't configured yet. */
export function getResendClient(): Resend | null {
  if (client !== undefined) return client;
  client = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  return client;
}

export const EMAIL_FROM = "WebSouza <notifications@websouza.com>";
export const OWNER_EMAIL = "websouza0@gmail.com";
