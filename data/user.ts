import { db } from '@/lib/db';

export const getUserById = async (id: string) => {
  try {
    return await db.user.findUnique({ where: { id } });
  } catch (error) {
    return null;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    return await db.user.findUnique({ where: { email } });
  } catch (error) {
    return null;
  }
};

export const getUserByTelephone = async (telephone: string) => {
  try {
    return await db.user.findUnique({ where: { telephone } });
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
    });

    return user;
  } catch (error) {
    return null;
  }
};
