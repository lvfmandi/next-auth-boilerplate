import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { getAccountByProviderUserId } from '@/data/account';

import { db } from '@/lib/db';
import { createSession } from '@/lib/session';
import { facebook, getFacebookUserByToken } from '@/lib/oauth';

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;

  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const storedState = cookies().get('state')?.value ?? null;

  const Location = '/dashboard';

  if (!state || !code || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
      headers: {
        Location: '/login',
      },
    });
  }

  try {
    const tokens = await facebook.validateAuthorizationCode(code);

    // decode the id token and get the data
    const facebookUser = await getFacebookUserByToken(tokens.accessToken);

    const existingAccount = await getAccountByProviderUserId(facebookUser.id);

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

    const { id, name, email, picture } = facebookUser;

    // create the user
    const user = await db.user.create({
      data: {
        fullName: name,
        email,
        image: picture.data.url,
        emailVerified: new Date(),
      },
    });

    // create the account
    await db.account.create({
      data: {
        userId: user.id,
        type: 'oidc',
        provider: 'facebook',
        providerAccountId: id,
        access_token: tokens.accessToken,
        expires_at: tokens.accessTokenExpiresAt,
        token_type: 'bearer',
        scope: 'public_profile email',
        id_token: tokens.accessToken,
      },
    });

    //     create session
    await createSession({
      userId: user.id,
      userRole: user.role,
      _v: user.refreshTokenVersion,
    });

    return new Response(null, { status: 302, headers: { Location } });
  } catch (error) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/login',
      },
    });
  }
};
