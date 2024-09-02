import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { generateState } from 'arctic';

import { facebook } from '@/lib/oauth';

export const GET = async () => {
  const state = generateState();

  const url = await facebook.createAuthorizationURL(state, {
    scopes: ['email', 'public_profile'],
  });

  //   store state as cookie
  cookies().set('state', state, {
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    httpOnly: true,
    maxAge: 10 * 60, // 10 minutes
  });

  return NextResponse.redirect(url);
};
