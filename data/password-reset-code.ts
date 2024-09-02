import { db } from '@/lib/db';

export const getPasswordResetCodeByEmail = async (email: string) => {
  try {
    const passwordResetCode = await db.passwordResetCode.findFirst({
      where: { email },
    });
    return passwordResetCode;
  } catch (error) {
    return null;
  }
};

export const getPasswordResetCodeByCode = async (code: string) => {
  try {
    const passwordResetCode = await db.passwordResetCode.findFirst({
      where: { code },
    });
    return passwordResetCode;
  } catch (error) {
    return null;
  }
};
