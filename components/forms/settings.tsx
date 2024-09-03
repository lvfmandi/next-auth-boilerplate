'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';

import { useState, useTransition } from 'react';

import { SettingsSchema } from '@/schemas/zod-schema';
import { zodResolver } from '@hookform/resolvers/zod';

import { ErrorSuccess, TypeUserDTO } from '@/lib/definitions';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
import { settings } from '@/actions/settings';
import { Alert } from '@/components/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import { Switch } from '@/components/ui/switch';
import { useCurrentUser } from '@/components/context';
import { Loading } from '@/components/loading/loading';

export const SettingsForm = () => {
  const { user } = useCurrentUser();

  if (!user) {
    return <Loading message={'Loading'} />;
  }

  const [code, setCode] = useState<boolean | undefined>(undefined);
  const [emailOrTel, setEmailOrTel] = useState<'email' | 'telephone'>(
    user.email ? 'email' : 'telephone',
  );
  const [errorSuccess, setErrorSuccess] = useState<ErrorSuccess | undefined>(
    undefined,
  );

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      firstName: user.fullName.split(' ')[0],
      lastName: user.fullName.split(' ')[1],
      email: user.email || '',
      telephone: user.telephone || '',
      password: undefined,
      newPassword: undefined,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      role: user.role,
      code: '',
    },
  });

  // 2. Define a submit handler.
  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    startTransition(async () => {
      const response = await settings(values);

      if (response?.code) {
        const { status, message } = response.code || {};
        setCode(status);
        setErrorSuccess(status ? { success: message } : { error: message });
      }

      if (response?.error || response?.success) {
        setCode(false);
        setErrorSuccess(response);
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
    <div className="w-full max-w-xs mx-auto mt-20 space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-medium">Settings</h1>
        <p>Change your credentials</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
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
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="First Name"
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
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Last Name"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!user.accounts.length && (
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
                                country={'ke'}
                                countryCodeEditable={false}
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
                    Use your <b>email</b> or <b>telephone</b>
                  </FormDescription>
                </div>
              )}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Email/Tel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                          <SelectItem value="USER">USER</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isTwoFactorEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start justify-between rounded-lg border p-3 shadow-sm gap-4">
                    <div className="space-y-0.5">
                      <FormLabel>Two Factor Enabled</FormLabel>
                      <FormDescription>
                        You will be required to confirm it's you everytime you
                        try sign in
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {!user.accounts.length && (
                <>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Old Password"
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
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="New Password"
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
                </>
              )}
            </>
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
    </div>
  );
};
