import { db } from '@/lib/db';

export const getVerificationCodeByCode = async (code: string) => {
  try {
    const verificationCode = await db.verificationCode.findFirst({
      where: { code },
    });
    return verificationCode;
  } catch (error) {
    return null;
  }
};

export const getVerificationCodeByEmail = async (email: string) => {
  try {
    const verificationCode = await db.verificationCode.findFirst({
      where: { email },
    });
    return verificationCode;
  } catch (error) {
    return null;
  }
};
