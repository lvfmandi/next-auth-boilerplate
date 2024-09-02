import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { OAuth2RequestError } from 'arctic';

import { db } from '@/lib/db';
import { google } from '@/lib/oauth';
import { GoogleUser } from '@/lib/definitions';
import { createSession, decode } from '@/lib/session';

import { getAccountByProviderUserId } from '@/data/account';

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const storedState = cookies().get('state')?.value ?? null;
  const codeVerifier = cookies().get('code_verifier')?.value ?? null;
  const Location = '/dashboard';

  if (
    !code ||
    !state ||
    !storedState ||
    !codeVerifier ||
    state !== storedState
  ) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/login?error=${'Invalid credentials'}`,
      },
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);

    // decode the id token and get the data
    const googleUser = decode(tokens.idToken);

    // check if we have a similar account
    const existingAccount = await getAccountByProviderUserId(
      googleUser.sub as string,
    );

    // The account exists in our database
    if (existingAccount) {
      await createSession({
        userId: existingAccount.userId,
        userRole: existingAccount.user.role,
        _v: existingAccount.user.refreshTokenVersion,
      });

      return new Response(null, {
        status: 302,
        headers: {
          Location,
        },
      });
    }

    // the account doesn't exist in our database and so we will create a new user and a new account
    const { sub, email, name, picture, exp } = googleUser as GoogleUser;
    // create the user
    const user = await db.user.create({
      data: {
        fullName: name,
        email,
        image: picture,
        emailVerified: new Date(),
      },
    });

    // create the account
    await db.account.create({
      data: {
        userId: user.id,
        type: 'oidc',
        provider: 'google',
        providerAccountId: sub,
        access_token: tokens.accessToken,
        expires_at: new Date(exp),
        token_type: 'bearer',
        scope: 'openid email profile',
        id_token: tokens.idToken,
      },
    });

    // create session
    await createSession({
      userId: user.id,
      userRole: user.role,
      _v: user.refreshTokenVersion,
    });

    return new Response(null, { status: 302, headers: { Location } });
  } catch (_error) {
    if (_error instanceof OAuth2RequestError) {
      const { name, message } = _error;
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/login?error=${name}`,
        },
      });
    }

    const error = _error as Error;

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/login?error="${error.name}"`,
        'Content-Type': 'application/json',
      },
    });
  }
};
