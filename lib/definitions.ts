export type ErrorSuccess = {
  success?: string;
  error?: string;
};

export type SessionUser = {
  userId: string;
  userRole: string;
  _v?: string;
};

export type TokenPayload = SessionUser & {
  expiresAt: string;
  _v?: string;
};

export type TypeUserDTO = {
  id: string;
  fullName: string;
  email: string | null;
  telephone: string | null;
  image: string | null;
  role: 'USER' | 'ADMIN';
  isTwoFactorEnabled: boolean;
};

export type GoogleUser = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: string;
  locale: string;
  exp: number;
};

export type FacebookUser = {
  id: string;
  name: string;
  picture: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
  email: string;
};
