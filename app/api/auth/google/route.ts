import { generateCodeVerifier, generateState } from 'arctic';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { google } from '@/lib/oauth';

export const GET = async () => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ['email', 'profile'],
  });

  //   store state verifier as cookie
  cookies().set('state', state, {
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    httpOnly: true,
    maxAge: 10 * 60, // 10 minutes
  });

  //   store code verifier as cookie
  cookies().set('code_verifier', codeVerifier, {
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    httpOnly: true,
    maxAge: 10 * 60, // 10 minutes
  });

  return NextResponse.redirect(url);
};
