import { Resend } from "resend";

// Lazy-initialize Resend client to avoid build-time errors when API key is not set
let resendClient: Resend | null = null;

export function getResend(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// For backwards compatibility - will throw at runtime if API key not set
export const resend = {
  emails: {
    send: (...args: Parameters<Resend["emails"]["send"]>) => getResend().emails.send(...args),
    cancel: (...args: Parameters<Resend["emails"]["cancel"]>) => getResend().emails.cancel(...args),
  },
  batch: {
    send: (...args: Parameters<Resend["batch"]["send"]>) => getResend().batch.send(...args),
  },
};
