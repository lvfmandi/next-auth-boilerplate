import { db } from '@/lib/db';

export const getAccountByProviderUserId = async (providerAccountId: string) => {
  try {
    const account = await db.account.findUnique({
      where: { providerAccountId },
      include: { user: true },
    });

    return account;
  } catch (error) {
    return null;
  }
};
