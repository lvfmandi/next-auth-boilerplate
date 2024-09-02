import { db } from '@/lib/db';

export const getTwoFactorCodeByEmail = async (email: string) => {
  try {
    const twoFactorCode = await db.twoFactorCode.findFirst({
      where: { email },
    });
    return twoFactorCode;
  } catch (error) {
    return null;
  }
};
