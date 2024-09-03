import { db } from '@/lib/db';

export const getUserById = async (id: string) => {
  try {
    return await db.user.findUnique({
      where: { id },
      include: { accounts: true },
    });
  } catch (error) {
    return null;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    return await db.user.findUnique({
      where: { email },
      include: { accounts: true },
    });
  } catch (error) {
    return null;
  }
};

export const getUserByTelephone = async (telephone: string) => {
  try {
    return await db.user.findUnique({
      where: { telephone },
      include: { accounts: true },
    });
  } catch (error) {
    return null;
  }
};

export const getUserByEmailOrTelephone = async ({
  email,
  telephone,
}: {
  email?: string;
  telephone?: string;
}) => {
  try {
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { telephone: telephone || undefined },
        ],
      },
      include: { accounts: true },
    });

    return user;
  } catch (error) {
    return null;
  }
};
