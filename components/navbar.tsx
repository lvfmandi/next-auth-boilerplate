'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { logout } from '@/actions/logout';

import { cn } from '@/lib/utils';
import { authLinks, publicauthLinks } from '@/lib/navigation-links';

import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/components/context';

export const Navbar = () => {
  const [opened, setOpened] = useState(false);
  const { user, resetSession: resetUser } = useCurrentUser();
  const pathname = usePathname();

  const handleLogOut = async (allDevices?: boolean) => {
    // log out the user by removing their cookies
    await logout(allDevices);
    // clear the user from context
    resetUser();
  };

  return (
    <nav className="fixed top-0 left-0 w-full md:static bg-background flex flex-col-reverse md:flex-row md:items-center md:justify-center border-b z-10">
      <ul
        className={cn(
          opened ? 'h-screen md:h-auto' : 'h-0 md:h-auto',
          'overflow-hidden flex flex-col md:flex-row md:items-center transition-all duration-200 ease-in',
        )}
      >
        {publicauthLinks.map(({ name, link }) => {
          return (
            <li
              key={name}
              className={cn(
                pathname === link ? 'text-primary' : 'text-foreground',
                'border-b md:border-r md:border-b-0 last:border-0',
              )}
            >
              <Link
                href={link}
                className="block p-4"
                onClick={() => setOpened(!opened)}
              >
                {name}
              </Link>
            </li>
          );
        })}
        {authLinks.map(({ name, link, auth, role }) => {
          return (
            !!user === auth &&
            role.includes(user?.role || '') && (
              <li
                key={name}
                className={cn(
                  pathname === link ? 'text-primary' : 'text-foreground',
                  'border-b md:border-r md:border-b-0 last:border-0',
                )}
              >
                <Link
                  href={link}
                  className="block p-4"
                  onClick={() => setOpened(!opened)}
                >
                  {name}
                </Link>
              </li>
            )
          );
        })}
        {!!user && (
          <li
            className={cn(
              'flex flox-col md:flex-row border-b md:border-r md:border-b-0 last:border-0 p-4 gap-2',
            )}
          >
            <Button
              variant={'destructive'}
              onClick={() => handleLogOut()}
            >
              Log Out
            </Button>
            <Button
              variant={'destructive'}
              onClick={() => handleLogOut(true)}
            >
              Log out of all devices
            </Button>
          </li>
        )}
      </ul>
      <div className="flex justify-end p-2 md:hidden">
        <Button
          size={'icon'}
          variant={'outline'}
          className="rounded-full"
          onClick={() => setOpened(!opened)}
        >
          <Icon
            name={'menu'}
            width={21}
            height={21}
            className={cn(opened ? 'hidden' : 'block')}
          />
          <Icon
            name={'close'}
            width={21}
            height={21}
            className={cn(opened ? 'block' : 'hidden')}
          />
        </Button>
      </div>
    </nav>
  );
};
