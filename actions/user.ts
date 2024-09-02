'use server';

import { UserDTO } from '@/lib/dto';
import { verifySession } from '@/lib/session';

import { getUserById } from '@/data/user';

export const getCurrentUser = async () => {
  //  verify the user
  const session = await verifySession();
  if (!session) return null;

  //  based on the access token get the users data
  const user = await getUserById(session.userId as string);
  if (!user) return null;

  return UserDTO(user);
};
