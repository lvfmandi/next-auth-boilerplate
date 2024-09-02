import { Divider } from '@/components/divider';
import { Google } from '@/components/auth/google';
import { LoginForm } from '@/components/forms/login';
import { Facebook } from '@/components/auth/facebook';

const Login = () => {
  return (
    <main className="w-full max-w-xs mx-auto mt-20 space-y-6">
      <LoginForm />
      <Divider />
      <div className="grid gap-3">
        <Google />
        <Facebook />
      </div>
    </main>
  );
};

export default Login;
