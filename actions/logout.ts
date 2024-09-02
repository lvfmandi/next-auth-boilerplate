'use server';
import { deleteSession } from '@/lib/session';

export const logout = async (allDevices?: boolean) =>
  await deleteSession(allDevices || false);
