'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';

import { ForgotPasswordSchema } from '@/schemas/zod-schema';

import { generatePasswordResetCode, verifyEmailPasswordCode } from '@/lib/code';
import {
  getUserByEmail,
  getUserByEmailOrTelephone,
  getUserByTelephone,
} from '@/data/user';
import { db } from '@/lib/db';
import { sendPasswordResetCode } from '@/lib/mail';
import { sendVerificationCode, verifyCodeByPhoneAndCode } from '@/lib/sms';

export const forgotPassword = async (
  data: z.infer<typeof ForgotPasswordSchema>,
) => {
  //    Return error if the data is invalid
  const isValid = ForgotPasswordSchema.safeParse(data);
  if (!isValid.success) return { error: 'The data provided is invalid!' };

  const { email, telephone, password, code } = data;

  if (code) {
    // verify the code and change the password
    // for a phone user
    if (telephone) {
      try {
        const verification = await verifyCodeByPhoneAndCode(
          `+${telephone}`,
          code,
        );

        // return an error if the code was not approved
        if (verification.status !== 'approved')
          return {
            error: `Invalid code with a status: ${verification.status}, request for another code by refreshing this page`,
          };

        // Return an error if we don't have a user with that code
        const existingUser = await getUserByTelephone(
          verification.to.replace('+', ''),
        );
        if (!existingUser) return { error: 'Invalid code!' };

        const hash = bcrypt.hashSync(password, 12);
        try {
          // Update the password of the user
          await db.user.update({
            where: { id: existingUser.id },
            data: { password: hash },
          });

          //  Update them on the status of the change
          return { success: 'Your password has been changed' };
        } catch (error) {
          return {
            error: 'There was an error chaning your password, please try again',
          };
        }
      } catch (_error) {
        const error = _error as Error;
        return { error: error.message };
      }
    }

    // for an email user
    if (email) {
      try {
        const existingCode = await verifyEmailPasswordCode(code);

        // Return an error if we don't have a user with that code
        const existingUser = await getUserByEmail(existingCode.email);

        if (!existingUser) return { error: 'Invalid code!' };

        const hash = bcrypt.hashSync(password, 12);
        try {
          // Update the password of the user
          await db.user.update({
            where: { id: existingUser.id },
            data: { password: hash },
          });

          //  delete the code that was used successfully
          await db.passwordResetCode.delete({ where: { id: existingCode.id } });

          //  Update them on the status of the change
          return { success: 'Your password has been changed' };
        } catch (error) {
          return {
            error:
              'There was an error changing your password, please try again',
          };
        }
      } catch (_error) {
        const error = _error as Error;
        return { error: error.message };
      }
    }
  } else {
    // send them a code so that they can change their password
    //    Return an error if we don't have a user with that email
    const existingUser = await getUserByEmailOrTelephone({ email, telephone });

    if (!existingUser)
      return { error: 'We did not find an account with those credentials' };

    // Create and send a code for a phone user
    if (existingUser.telephone) {
      try {
        // Send a password changing code to the user
        await sendVerificationCode(`+${existingUser.telephone}`);

        // Return a code if it was successful
        return {
          code: {
            status: true,
            message:
              'Change the password and use the verification code we sent to your phone',
          },
        };
      } catch (_error) {
        const error = _error as Error;
        return { error: error.message };
      }
    }

    //  Create and send a code for an email user
    if (existingUser.email) {
      try {
        //    Create a password-changing code
        const passwordResetCode = await generatePasswordResetCode(
          existingUser.email,
        );
        //    Send an email with that password changing cpde to give them a chance to change their email
        await sendPasswordResetCode(existingUser.email, passwordResetCode.code);

        //    Return a success message if it was successful
        return {
          code: {
            status: true,
            message:
              'Change the passsword and use the verification code we sent to your email',
          },
        };
      } catch (_error) {
        const error = _error as Error;
        return { error: error.message };
      }
    }
  }
};
