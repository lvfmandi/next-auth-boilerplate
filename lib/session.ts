import 'server-only';

// External Imports
import { jwtVerify, SignJWT, decodeJwt } from 'jose';
import { createId } from '@paralleldrive/cuid2';

// Next imports
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Lib and types
import { db } from '@/lib/db';
import { SessionUser, TokenPayload } from '@/lib/definitions';

// Data
import { getUserById } from '@/data/user';

// global variables
const secretKey = process.env.JWT_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
const alg = 'HS256';

// encrypt a JWT
export const encrypt = async (payload: TokenPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(encodedKey);
};

export const decode = (token: string) => {
  const claims = decodeJwt(token);
  return claims;
};

//  decrypt a JWT
export const decrypt = async (token: string | undefined = '') => {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: [alg],
    });
    return payload;
  } catch (error) {
    return null;
  }
};

//  create an access token
export const createAccessToken = async (sessionData: SessionUser) => {
  const { userId, userRole } = sessionData;
  return await encrypt({
    userId,
    userRole,
    expiresAt: '15m',
  });
};

// create a refresh token
export const createRefreshToken = async (sessionData: SessionUser) => {
  const { userId, userRole, _v } = sessionData;
  return await encrypt({
    userId,
    userRole,
    _v,
    expiresAt: '7d',
  });
};

//  create the session
export const createSession = async (sessionData: SessionUser) => {
  // create the access token
  const accessToken = await createAccessToken(sessionData);

  // create the refresh token
  const refreshToken = await createRefreshToken(sessionData);

  const cookiesStore = cookies();

  // create and set the cookies
  cookiesStore.set('id', accessToken, {
    httpOnly: true,
    maxAge: 15 * 60, //15 minutes,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  cookiesStore.set('r_id', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60, //7 days,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return { accessToken, refreshToken };
};

const getSession = async () => {
  const access_token = cookies().get('id')?.value;
  var accessToken = (await decrypt(access_token)) as TokenPayload | null;

  const refresh_token = cookies().get('r_id')?.value;
  const refreshToken = (await decrypt(refresh_token)) as TokenPayload | null;

  return { accessToken, refreshToken };
};

//  Verify the session
export const verifySession = async () => {
  var { accessToken, refreshToken } = await getSession();

  // return null if we don't have a refresh token
  if (!refreshToken?.userId) return deleteSession(false) || null;

  // delete session if we don't have such a user
  const user = await getUserById(refreshToken.userId);
  if (!user) return deleteSession(false) || null;

  // delete session if the refresh token's version does not match the one with the user, redirect to the login page;
  const refreshTokenVersion = user?.refreshTokenVersion;
  if (refreshToken._v !== refreshTokenVersion)
    return deleteSession(false, '/login') || null;

  // Create a new session if we don't have an access token or it's invalid,
  if (!accessToken?.userId) {
    const { userId, userRole, _v } = refreshToken;
    const session = await createSession({ userId, userRole, _v });
    accessToken = (await decrypt(session.accessToken)) as TokenPayload;
  }

  // return an access token if the user has a valid session
  return accessToken;
};

// deleting the session
export const deleteSession = async (
  allDevices: boolean,
  redirect_path?: string,
) => {
  if (allDevices) {
    // verify the session of the user. Only a logged in user can delete all sessions
    const accessToken = await verifySession();

    // do nothing if they are not logged in
    if (!accessToken?.userId) return null;

    // change the refreshTokenVersion in the DB
    await db.user.update({
      where: { id: accessToken.userId },
      data: { refreshTokenVersion: createId() },
    });
  }
  // deleting both the access token and the refresh token
  cookies().delete('id');
  cookies().delete('r_id');

  // Redirect to the given page if we want the user to be redirected
  if (redirect_path) redirect(redirect_path);
};
