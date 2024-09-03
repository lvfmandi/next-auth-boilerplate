'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';

import { getCurrentUser } from '@/actions/user';

import { db } from '@/lib/db';
import { sendEmailVerificationCode } from '@/lib/mail';
import {
  generateEmailVerificationCode,
  verifyEmailVerificationCode,
} from '@/lib/code';

import { SettingsSchema } from '@/schemas/zod-schema';

import {
  getUserByEmail,
  getUserByEmailOrTelephone,
  getUserByTelephone,
} from '@/data/user';
import { sendVerificationCode, verifyCodeByPhoneAndCode } from '@/lib/sms';

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  //getting to know if they are verified
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized!' };

  // validate the data
  const isValid = SettingsSchema.safeParse(values);
  if (!isValid.success) return { error: 'The data is invalid' };

  const {
    email,
    telephone,
    firstName,
    lastName,
    password,
    newPassword,
    isTwoFactorEnabled,
    role,
    code,
  } = values;

  const existingUser = await getUserByEmailOrTelephone({
    email: user.email || undefined,
    telephone: user.telephone || undefined,
  });

  // Removing the email and password of the user is they are an oAuth user
  if (user.accounts.length) {
    values.password = undefined;
    values.email = undefined;
  }

  if (user.id !== existingUser?.id)
    // Return an error if the user's don't match
    return { error: 'Unauthorized!' };

  // Return an error if we do not have a valid user
  if (!existingUser) return { error: 'User does not exist' };

  if (code) {
    if (telephone) {
      try {
        const verification = await verifyCodeByPhoneAndCode(
          `+${telephone}`,
          code,
        );

        if (verification.status !== 'approved')
          return {
            error: `We could not change the new phone number the new phone number`,
          };
      } catch (_error) {
        const error = _error as Error;
        return { error: error.message };
      }
    }

    if (email) {
      try {
        await verifyEmailVerificationCode(code);
      } catch (_error) {
        const error = _error as Error;
        return { error: error.message };
      }
    }
  } else {
    //   check if the crucial data has changed
    if (telephone && user.telephone && telephone !== user.telephone) {
      const exisitingUser = await getUserByTelephone(telephone);
      if (exisitingUser) return { error: 'Phone number already is use!' };

      await sendVerificationCode(`+${telephone}`);

      return {
        code: {
          status: true,
          message: 'Verification code sent to your number!',
        },
      };
    }

    //   check if the crucial data has changed
    if (email && user.email && email !== user.email) {
      const exisitingUser = await getUserByEmail(email);
      if (exisitingUser) return { error: 'Email already is use!' };

      const verificationToken = await generateEmailVerificationCode(user.email);
      await sendEmailVerificationCode(email, verificationToken.code);

      return {
        code: {
          status: true,
          message: 'Verification code sent to your email!',
        },
      };
    }
  }

  // trying to change USER to ADMIN
  if (role !== user.role && user.role !== 'ADMIN')
    return { error: 'Only admins can change their roles' };

  if (password && newPassword && existingUser.password) {
    // Return an error if the passwords do not match
    const passwordsMatch = bcrypt.compareSync(password, existingUser.password);

    if (!passwordsMatch) return { error: 'Incorrect Password!' };

    const hash = bcrypt.hashSync(newPassword, 12);
    values.password = hash;
  }

  await db.user.update({
    where: { id: existingUser.id },
    data: {
      email: values.email || undefined,
      telephone: telephone || undefined,
      fullName: `${firstName} ${lastName}`,
      password: values.password || undefined,
      isTwoFactorEnabled,
      role,
    },
  });

  return { success: 'User successfully updated' };
};
