// External Imports
import crypto from 'crypto';

// Lib and types
import { db } from '@/lib/db';
import { verifyCodeByPhoneAndCode } from '@/lib/sms';

// Data
import {
  getVerificationCodeByCode,
  getVerificationCodeByEmail,
} from '@/data/verification-code';
import {
  getPasswordResetCodeByCode,
  getPasswordResetCodeByEmail,
} from '@/data/password-reset-code';
import { getUserByEmail, getUserByTelephone } from '@/data/user';
import { getTwoFactorCodeByEmail } from '@/data/two-factor-code';
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation';

// generating the email verification code
export const generateEmailVerificationCode = async (email: string) => {
  const code = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000); //5 minutes

  // Delete an existing code
  const existingCode = await getVerificationCodeByEmail(email);
  if (existingCode)
    await db.verificationCode.delete({ where: { id: existingCode.id } });

  const verificationCode = await db.verificationCode.create({
    data: { email, code, expires },
  });

  return verificationCode;
};

// generating the 2FA code
export const generateEmail2FACode = async (email: string) => {
  const code = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000); //5 minutes

  // Delete an existing code
  const existingCode = await getTwoFactorCodeByEmail(email);
  if (existingCode)
    await db.twoFactorCode.delete({ where: { id: existingCode.id } });

  const twoFactorCode = await db.twoFactorCode.create({
    data: { email, code, expires },
  });

  return twoFactorCode;
};

// generate the password reset code
export const generatePasswordResetCode = async (email: string) => {
  const code = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 10 * 60 * 1000); // 10 minutes

  // Delete an already existing code
  const existingCode = await getPasswordResetCodeByEmail(email);
  if (existingCode)
    await db.passwordResetCode.delete({ where: { id: existingCode.id } });

  const passwordResetCode = await db.passwordResetCode.create({
    data: { email, code, expires },
  });

  return passwordResetCode;
};

// verify a user's telephone number
export const verifyTelephoneVerificationCode = async (
  telephone: string,
  code: string,
) => {
  var verificationCheck;

  try {
    // check if we have that phoneOTP
    verificationCheck = await verifyCodeByPhoneAndCode(`+${telephone}`, code);

    // the status can be: pending, approved, canceled, max_attempts_reached, deleted, failed or expired
    // You can handle each status differently
    if (verificationCheck.status !== 'approved') {
      return {
        verified: {
          status: false,
          message: `We could not verify your phone number. Status is: code_${verificationCheck.status}`,
        },
      };
    }
  } catch (_error) {
    const error = _error as Error;
    throw new Error(error.message);
  }

  //  return an error if we don't have a user by that phone number
  const userByTelephone = await getUserByTelephone(
    verificationCheck.to.replace('+', ''),
  );

  if (!userByTelephone)
    return {
      verified: {
        status: false,
        message: 'We could not verify the phone number',
      },
    };

  try {
    // Make changes to the user to change when they last verified
    await db.user.update({
      where: { id: userByTelephone.id },
      data: { phoneVerified: new Date() },
    });

    // return success
    return {
      verified: {
        status: true,
        message:
          'Your phone number was successfully verified. Login to continue',
      },
    };
  } catch (error) {
    throw new Error(
      'An error occured on our side, please try loggin in to try again',
    );
  }
};

// verify a user's email
export const verifyEmailVerificationCode = async (code: string) => {
  // get the verification code from the db
  const emailCode = await getVerificationCodeByCode(code);

  // throw error if there is not such code
  if (!emailCode)
    throw new Error(
      'We could not verify your account, kindly try logging in to try again',
    );

  // check if it is expired and return error if it is expired
  const expired = new Date() > emailCode.expires;
  if (expired)
    throw new Error(
      'The code you provided is expired, Try logging in to get a new code',
    );

  // check if we have a user by the email provided
  const userByEmail = await getUserByEmail(emailCode.email);

  // return error if we do not have a user by that email
  if (!userByEmail) throw new Error('We could not verify that email');

  // make changes to the user to update when they last verified
  try {
    await db.user.update({
      where: { email: emailCode.email },
      data: { emailVerified: new Date() },
    });

    // delete the email verification we just used
    await db.verificationCode.delete({ where: { id: emailCode.id } });

    // return sucess if everything goes well
    return {
      verified: {
        status: true,
        message: 'Your email was successfully verified, Login to continue.',
      },
    };
  } catch (error) {
    throw new Error(
      'An error occured on our side, please try loggin in to try again',
    );
  }
};

// verify a user's two factor code by email
export const verifyEmail2FACode = async (
  userId: string,
  userEmail: string,
  code: string,
) => {
  try {
    // return error if the code is not in the DB
    const twoFactorCode = await getTwoFactorCodeByEmail(userEmail);
    if (!twoFactorCode) return { error: 'Invalid Code!' };

    // return error if the code does not match
    if (twoFactorCode.code !== code) return { error: 'Invalid Code!' };

    // return error if the code has expired
    if (twoFactorCode.expires < new Date())
      throw new Error('Your code has expired, kindly login to try again');

    //delete the code from the database after a successful code
    await db.twoFactorCode.delete({ where: { id: twoFactorCode.id } });

    // get an existing confirmation of 2FA from the database
    const existingConfirmation = await getTwoFactorConfirmationByUserId(userId);

    // delete the existing 2FA confirmation
    if (existingConfirmation) {
      await db.twoFactorConfirmation.delete({
        where: { id: existingConfirmation.id },
      });
    }

    // create a new 2FA confirmation in the database
    // We can know when they were last authenticated
    await db.twoFactorConfirmation.create({
      data: { userId },
    });
  } catch (error) {
    throw new Error('Something went wrong when trying to validate your code');
  }
};

// verify a user's two factor code by telephone
export const verifyTelephone2FACode = async (
  userId: string,
  userTelephone: string,
  code: string,
) => {
  try {
    const verificationCheck = await verifyCodeByPhoneAndCode(
      userTelephone,
      code,
    );

    // the status can be: pending, approved, canceled, max_attempts_reached, deleted, failed or expired
    if (verificationCheck.status !== 'approved') {
      throw new Error(
        `We could not verify your phone number. Status is: code_${verificationCheck.status}`,
      );
    }

    // get an existing confirmation of 2FA from the database
    const existingConfirmation = await getTwoFactorConfirmationByUserId(userId);

    // delete the existing 2FA confirmation
    if (existingConfirmation) {
      await db.twoFactorConfirmation.delete({
        where: { id: existingConfirmation.id },
      });
    }

    // create a new 2FA confirmation in the database
    // We can know when they were last authenticated
    await db.twoFactorConfirmation.create({
      data: { userId },
    });
  } catch (_error) {
    const error = _error as Error;
    return { error: error.message };
  }
};

// verify a user's password code by email
export const verifyEmailPasswordCode = async (code: string) => {
  // Return an error if we have an invalid code
  const existingCode = await getPasswordResetCodeByCode(code);

  if (!existingCode) throw new Error('Invalid code!');

  // Return an error if we have an expired code
  const expired = existingCode.expires < new Date();
  if (expired) {
    throw new Error(
      'The code is expired, kindly go to the "login page" and click on "forgot password" to get a new code',
    );
  }

  return existingCode;
};
