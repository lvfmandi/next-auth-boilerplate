import { Facebook, Google } from 'arctic';

import { FacebookUser } from '@/lib/definitions';

export const facebook = new Facebook(
  process.env.FACEBOOK_APP_ID as string,
  process.env.FACEBOOK_APP_SECRET as string,
  `${process.env.DOMAIN}/api/auth/callback/facebook`,
);

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID as string,
  process.env.GOOGLE_SECRET as string,
  `${process.env.DOMAIN}/api/auth/callback/google`,
);

export const getFacebookUserByToken = async (
  accessToken: string,
): Promise<FacebookUser> => {
  const url = new URL('https://graph.facebook.com/me');

  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('fields', ['id', 'name', 'picture', 'email'].join(','));
  const response = await fetch(url);

  const user = await response.json();
  return user;
};
