'use client';
import { useState, useTransition } from 'react';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useForm } from 'react-hook-form';

import { forgotPassword } from '@/actions/forgot-password';

import { ErrorSuccess } from '@/lib/definitions';
import { ForgotPasswordSchema } from '@/schemas/zod-schema';

import { toast } from 'sonner';
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

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { redirect } from 'next/navigation';

export const ForgortPasswordForm = () => {
  const [emailOrTel, setEmailOrTel] = useState<'email' | 'telephone'>('email');
  const [errorSuccess, setErrorSuccess] = useState<ErrorSuccess | undefined>(
    undefined,
  );
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
      telephone: '',
      password: '',
      confirmPassword: '',
      code: '',
      useCode: false,
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof ForgotPasswordSchema>) {
    startTransition(async () => {
      const response = await forgotPassword(values);

      // in case we are successful, we should display a success message and give the user an option to change their password
      if (response?.code) {
        form.setValue('useCode', true);
        const { status, message } = response.code;
        setErrorSuccess(status ? { success: message } : { error: message });
      }

      // in the case we get an error message, we display it to the user
      if (response?.error) {
        setErrorSuccess(response);
      }

      // in the case we get an successs message, we display it to the user and redirect to login
      if (response?.success) {
        toast.success(response.success);
        redirect('/login');
      }
    });
  }

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
    <main className="w-full max-w-xs mx-auto mt-20 space-y-4">
      <div className="space-y-2">
        <h1 className="text-xl font-medium">Forgot your password?</h1>
        <p>It happens to the best of us 😄</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {form.getValues('useCode') && (
            <div className="space-y-6">
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="text-xs">
                      Repeat the password you entered above to make sure you
                      entered it correctly
                    </FormDescription>
                  </FormItem>
                )}
              />
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
                    <FormDescription className="text-xs">
                      We sent a code to your <b>phone or email</b>, use it in
                      the above field
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          )}
          {!form.getValues('useCode') && (
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
          )}
          {errorSuccess && (
            <Alert
              message={errorSuccess.error || errorSuccess.success || ''}
              variant={errorSuccess.error ? 'error' : 'success'}
            />
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            Submit
          </Button>
        </form>
      </Form>
    </main>
  );
};
