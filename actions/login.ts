'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';

import { UserDTO } from '@/lib/dto';
import { createSession } from '@/lib/session';
import { sendVerificationCode } from '@/lib/sms';
import { sendTwoFactorCode, sendEmailVerificationCode } from '@/lib/mail';
import {
  generateEmail2FACode,
  verifyEmailVerificationCode,
  generateEmailVerificationCode,
  verifyTelephoneVerificationCode,
  verifyEmail2FACode,
  verifyTelephone2FACode,
} from '@/lib/code';

import { LogInSchema } from '@/schemas/zod-schema';

import { getUserByEmailOrTelephone } from '@/data/user';

export const login = async (data: z.infer<typeof LogInSchema>) => {
  // validate the data
  const isValid = LogInSchema.safeParse(data);

  if (!isValid.success) return { error: 'The data provided in invalid!' };

  const { email, telephone, password, code } = data;

  // look up the user
  const existingUser = await getUserByEmailOrTelephone({ email, telephone });

  // return error if we have no user in the DB
  if (!existingUser)
    return { error: 'Invalid username or password, try again!' };

  // check if the user has been verified
  if (!(existingUser.emailVerified || existingUser.phoneVerified)) {
    if (code) {
      // verify the telephone code if they used their phone for verification
      if (telephone) {
        try {
          await verifyTelephoneVerificationCode(telephone, code);
        } catch (_error) {
          const error = _error as Error;
          return { verified: { status: false, message: error.message } };
        }
      }

      // verify the email code if they used their email for verification
      if (email) {
        try {
          await verifyEmailVerificationCode(code);
        } catch (_error) {
          const error = _error as Error;
          return { verified: { status: false, message: error.message } };
        }
      }
    } else {
      // generate and send a code for verifying a telephone user
      if (existingUser.telephone) {
        try {
          // send the verification code
          await sendVerificationCode(`+${existingUser.telephone}`);

          return {
            code: {
              status: true,
              message: 'Enter the verification code we sent to your phone',
            },
          };
        } catch (_error) {
          const error = _error as Error;
          return { error: error.message };
        }
      }

      // generate and send a code for verifying an email user
      if (existingUser.email) {
        try {
          // generate the verification code
          const verificationCode = await generateEmailVerificationCode(
            existingUser.email,
          );

          // send verification code via email
          await sendEmailVerificationCode(
            verificationCode.email,
            verificationCode.code,
          );

          return {
            code: {
              status: true,
              message: 'Enter the verification code sent to your email',
            },
          };
        } catch (_error) {
          const error = _error as Error;
          return { error: error.message };
        }
      }
    }
  }

  // check if the user has 2FA enabled
  if (existingUser.isTwoFactorEnabled) {
    // check if they have given us the code, so that we can verify it
    if (code) {
      try {
        // verify them using a phone number
        if (existingUser.telephone) {
          await verifyTelephone2FACode(
            existingUser.id,
            existingUser.telephone,
            code,
          );
        }

        // verify them using an email
        if (existingUser.email) {
          await verifyEmail2FACode(existingUser.id, existingUser.email, code);
        }
      } catch (_error) {
        const error = _error as Error;
        return { error: error.message };
      }
    } else {
      // They don't have a code and we should create one and send it to them
      try {
        // create a telephone 2FA code
        if (existingUser.telephone) {
          // send them a 2FA code
          await sendVerificationCode(`+${existingUser.telephone}`);
          return {
            code: {
              status: true,
              message: 'Enter the 2FA code sent to your phone',
            },
          };
        }

        // create an email 2FA code
        if (existingUser.email) {
          const twoFactorCode = await generateEmail2FACode(existingUser.email);
          // send them the code
          await sendTwoFactorCode(existingUser.email, twoFactorCode.code);
          return {
            code: {
              status: true,
              message: 'Enter the 2FA code sent to your email',
            },
          };
        }
      } catch (error) {
        if (existingUser.telephone)
          return {
            error:
              'We could not send a Two Factor Authentication (2FA) code to your phone number. Log in to try again.',
          };

        if (existingUser.email)
          return {
            error:
              'We could not send a Two Factor Authentication (2FA) code to your email. Log in to try again.',
          };
      }
    }
  }

  // compare if passwords match
  const passwordsMatch = bcrypt.compareSync(
    password,
    existingUser.password || '',
  );

  // return error if passwords don't match
  if (!passwordsMatch) return { error: 'Invalid email or password' };

  // add the tokens to the HTTP-only cookie
  await createSession({
    userId: existingUser.id,
    userRole: existingUser.role,
    _v: existingUser.refreshTokenVersion,
  });

  // return the user we just created to the client
  return { user: UserDTO(existingUser) };
};
