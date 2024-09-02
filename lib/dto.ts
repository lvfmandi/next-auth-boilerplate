import 'server-only';

import { User } from '@prisma/client';
import { TypeUserDTO } from './definitions';

// This data transfer object is aimed at returning only the necessary data from the PRISMA User model
export const UserDTO = (User: User): TypeUserDTO => {
  const { id,fullName, email, telephone, image, role, isTwoFactorEnabled } = User;
  return { id, fullName, email, telephone, image, role, isTwoFactorEnabled };
};
