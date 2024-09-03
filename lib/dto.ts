import 'server-only';

import { Prisma } from '@prisma/client';
import { TypeUserDTO } from './definitions';

type UserWithAccount = Prisma.UserGetPayload<{ include: { accounts: true } }>;

// This data transfer object is aimed at returning only the necessary data from the PRISMA User model
export const UserDTO = (User: UserWithAccount): TypeUserDTO => {
  const {
    id,
    fullName,
    email,
    telephone,
    image,
    role,
    isTwoFactorEnabled,
    accounts,
  } = User;
  return {
    id,
    fullName,
    email,
    telephone,
    image,
    role,
    isTwoFactorEnabled,
    accounts: accounts.map((account) => account.id),
  };
};
