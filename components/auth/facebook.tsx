'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/loading/loading';

export const Facebook = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = () => {
    setLoading(!loading);
    router.push('/api/auth/facebook');
  };

  return (
    <Button
      variant={'outline'}
      onClick={handleLogin}
      className="flex gap-2 items-center"
    >
      <Icon
        name="facebook"
        color="#1877F2"
      />
      <span>Continue with Facebook</span>
      {loading && <Loading message={'Kindly wait as we log you in'} />}
    </Button>
  );
};
