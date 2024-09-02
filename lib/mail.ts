import { Resend } from 'resend';

import { TwoFactorEmail } from '@/components/email-templates/two-factor-email';
import { VerificationEmail } from '@/components/email-templates/verification-email';
import { PasswordResetEmail } from '@/components/email-templates/password-reset-email';

const resend = new Resend(process.env.RESEND_APIKEY);

export const sendEmailVerificationCode = async (email: string, code: string) => {
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Verification Email',
    react: VerificationEmail({ code }),
  });

  if (error) throw new Error(error.message);

  return data;
};

export const sendTwoFactorCode = async (email: string, code: string) => {
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Two Factor Code',
    react: TwoFactorEmail({ code }),
  });

  if (error) throw new Error(error.message);

  return data;
};

export const sendPasswordResetCode = async (email: string, code: string) => {
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Password Reset Lilnk',
    react: PasswordResetEmail({ code }),
  });

  if (error) throw new Error(error.message);

  return data;
};
