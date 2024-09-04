'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';

import { db } from '@/lib/db';
import { sendEmailVerificationCode } from '@/lib/mail';
import {
  generateEmailVerificationCode,
  verifyEmailVerificationCode,
  verifyTelephoneVerificationCode,
} from '@/lib/code';
import { sendVerificationCode } from '@/lib/sms';

import { getUserByEmailOrTelephone } from '@/data/user';

import { SignUpSchema } from '@/schemas/zod-schema';

export const signup = async (data: z.infer<typeof SignUpSchema>) => {
  // validate the data
  const isValid = SignUpSchema.safeParse(data);

  // return error if not valid
  if (!isValid.success) return { error: 'The data provided is invalid!' };

  // hash password
  const { firstName, lastName, email, telephone, password, code } = data;

  // this is the second time they are sending data through this function becuause they have a code
  if (!code) {
    // check if the user already exists
    const exisitingUser = await getUserByEmailOrTelephone({ email, telephone });
    if (exisitingUser) {
      if (email) return { error: 'Email already in use!' };
      if (telephone) return { error: 'Phone number already in use!' };
    }

    try {
      // insert data to db
      const fullName = `${firstName} ${lastName}`;
      const hash = bcrypt.hashSync(password, 12);

      await db.user.create({
        data: { fullName, email, telephone, password: hash },
      });
    } catch (error) {
      return {
        error:
          'An error occured when creating your account, please try signing up again',
      };
    }

    //  send them a code if they used their phone
    if (telephone) {
      try {
        // send the code for registration
        await sendVerificationCode(`+${telephone}`);

        // return that a code needs to be entered with a success message
        return {
          code: {
            status: true,
            message: 'Enter the verification code sent to your phone',
          },
        };
      } catch (_error) {
        // We had an error sending them a code and we should give them that chance again
        const error = _error as Error;
        return { code: { status: false, message: error.message } };
      }
    }

    // send them a code if they used their email
    if (email) {
      try {
        // generate the verification code
        const verificationCode = await generateEmailVerificationCode(email);

        // send the email for registration
        await sendEmailVerificationCode(
          verificationCode.email,
          verificationCode.code,
        );

        // return success when successful
        return {
          code: {
            status: true,
            message: 'Enter the verification code sent to your email',
          },
        };
      } catch (_error) {
        // We had an error sending them a code and we should give them that chance again
        const error = _error as Error;
        return { code: { status: false, message: error.message } };
      }
    }
  } else {
    // verify the telephone code if they used their phone for verification
    if (telephone) {
      try {
        return await verifyTelephoneVerificationCode(telephone, code);
      } catch (_error) {
        const error = _error as Error;
        return { verified: { status: false, message: error.message } };
      }
    }

    // verify the email code if they used their email for verification
    if (email) {
      try {
        return await verifyEmailVerificationCode(code);
      } catch (_error) {
        const error = _error as Error;
        return { verified: { status: false, message: error.message } };
      }
    }
  }

  return { error: 'Please add a phone number or email' };
};
