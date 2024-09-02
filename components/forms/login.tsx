'use client';

import Link from 'next/link';

import { z } from 'zod';
import { useState, useTransition } from 'react';

import { login } from '@/actions/login';

import { useForm } from 'react-hook-form';
import { ErrorSuccess } from '@/lib/definitions';
import { LogInSchema } from '@/schemas/zod-schema';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Alert } from '@/components/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/components/context';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useSearchParams } from 'next/navigation';

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const existingError = searchParams.get('error')
    ? { error: searchParams.get('error') as string }
    : undefined;
  const [code, setCode] = useState<boolean | undefined>(undefined);
  const [emailOrTel, setEmailOrTel] = useState<'email' | 'telephone'>('email');
  const [errorSuccess, setErrorSuccess] = useState<ErrorSuccess | undefined>(
    existingError,
  );
  const [isPending, startTransition] = useTransition();
  const { setSession } = useCurrentUser();

  const form = useForm<z.infer<typeof LogInSchema>>({
    resolver: zodResolver(LogInSchema),
    defaultValues: {
      email: '',
      telephone: '',
      password: '',
    },
  });

  // 2. Define a submit handler.
  const onSubmit = (values: z.infer<typeof LogInSchema>) => {
    startTransition(async () => {
      const response = await login(values);

      // if we get a code, we give the user a chance to add the code
      if ('code' in response) {
        const { status, message } = response.code || {};
        setCode(status);
        setErrorSuccess(status ? { success: message } : { error: message });
      }

      // if we get an error verifying, we ask the user to try loggin in again
      if ('verified' in response) {
        const { status, message } = response.verified || {};
        setCode(status);
        setErrorSuccess(status ? { success: message } : { error: message });
      }

      // in the case we get an error message, we display it to the user
      if ('error' in response) {
        setCode(undefined);
        setErrorSuccess(response);
      }

      // if we get a user, we set the context to update that
      if ('user' in response && response.user) {
        setSession(response.user);
      }
    });
  };

  // Define what happens when you change between email and telephone
  const changeEmailOrTelephone = (value: 'email' | 'telephone') => {
    // defining the fields we're moving between
    const fields: Record<string, 'email' | 'telephone'> = {
      email: 'telephone',
      telephone: 'email',
    };

    // set the value that you're changing from to and empty string
    if (fields[value]) form.setValue(fields[value], '');

    // change to the other value
    setEmailOrTel(value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-xl font-medium">Log In</h1>
        <p>Log into your account to continue</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {code && (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      {...field}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {!code && (
            <>
              <div className="space-y-2">
                <div className="flex items-start">
                  <Select
                    defaultValue={emailOrTel}
                    onValueChange={changeEmailOrTelephone}
                  >
                    <SelectTrigger className="w-20 rounded-r-none border-r-0 focus:ring-0">
                      <SelectValue placeholder="Email/Tel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="telephone">Tel</SelectItem>
                    </SelectContent>
                  </Select>
                  {emailOrTel === 'email' && (
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Email"
                              {...field}
                              disabled={isPending}
                              className="rounded-l-none"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                  {emailOrTel === 'telephone' && (
                    <FormField
                      control={form.control}
                      name="telephone"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <PhoneInput
                              country="ke"
                              placeholder="+254 712 345 678"
                              disabled={isPending}
                              containerClass="shadow-sm"
                              inputClass="!w-full !h-9 !border-border"
                              buttonClass="!rounded-l-none h-9 !border-border"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => <FormMessage />}
                />
                <FormDescription className="text-xs">
                  Use your <b>email</b> or <b>phone number</b>
                </FormDescription>
              </div>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="Password"
                        placeholder="Password"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          {errorSuccess && (
            <Alert
              message={errorSuccess.error || errorSuccess.success || ''}
              variant={errorSuccess.error ? 'error' : 'success'}
            />
          )}
          <Button
            variant="link"
            asChild
            className="p-0 h-fit"
          >
            <Link
              href={'/forgot-password'}
              className="text-xs text-primary"
            >
              Forgort Password?
            </Link>
          </Button>
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {code ? 'Confirm' : 'Submit'}
          </Button>
        </form>
      </Form>
    </div>
  );
};
