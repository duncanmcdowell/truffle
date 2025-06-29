import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  // This can be swapped out for another provider easily
  return resend.emails.send({
    from: 'truffle@yourdomain.com',
    to,
    subject,
    html,
  });
} 