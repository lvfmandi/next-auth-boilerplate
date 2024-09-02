'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { getCurrentUser } from '@/actions/user';

import { TypeUserDTO } from '@/lib/definitions';
import { authLinks } from '@/lib/navigation-links';

type AuthContextType = {
  user: TypeUserDTO | null;
  setSession: (user: TypeUserDTO, redirect_path?: string) => void;
  resetSession: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<TypeUserDTO | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();

      // if the user is not logged in log them out
      if (!currentUser) return resetSession();

      // set the user to be the one in session
      setUser(currentUser);
    };

    fetchUser();
  }, []);

  // function to set the user in the context
  const setSession = (user: TypeUserDTO, redirect_path = '/dashboard') => {
    setUser(user);

    router.push(redirect_path);
  };

  // function to remove the user from the context
  const resetSession = (redirect_path = '/login') => {
    setUser(null);

    // redirect if the page they are in is an auth link and it requires authentication to access
    if (authLinks.find(({ link, auth }) => pathname.startsWith(link) && auth)) {
      router.push(redirect_path);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setSession, resetSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'The userCurrentUser context must be used within an AuthProvider',
    );
  }

  return context;
};
