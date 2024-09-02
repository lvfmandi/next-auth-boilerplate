import 'server-only';

import twilio from 'twilio';

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTHENTICATION_TOKEN,
);

export const sendVerificationCode = async (to: string) => {
  try {
    // send the code
    const verification = await twilioClient.verify.v2
      .services(process.env.TWILIO_2FA_SERVICE_ID as string)
      .verifications.create({ to, channel: 'sms' });

    // if we are successful return the data
    return verification;
  } catch (_error) {
    // if error, throw an error
    throw _error;
  }
};

export const verifyCodeByPhoneAndCode = async (to: string, code: string) => {
  try {
    const verificationCheck = await twilioClient.verify.v2
      .services(process.env.TWILIO_2FA_SERVICE_ID as string)
      .verificationChecks.create({ to, code });

    return verificationCheck;
  } catch (_error) {
    // throw an error incase we get one
    throw _error;
  }
};
