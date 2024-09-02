import { z } from 'zod';

export const SignUpSchema = z
  .object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    email: z.string().email().optional().or(z.literal('')),
    telephone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/)
      .optional()
      .or(z.literal('')),
    password: z.string().min(8).max(64),
    confirmPassword: z.string().min(8).max(64),
    code: z.string().optional(),
  })
  .superRefine((schema, ctx) => {
    const { password, confirmPassword, email, telephone } = schema;

    // Check if passwords match
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirmPassword'],
      });
    }

    // Check if at least one of email or telephone is provided
    if (!email && !telephone) {
      ctx.addIssue({
        code: 'custom',
        message: 'Provide an email or a telephone number',
        path: ['email'], // You can also use path: [] to indicate it's a general form error
      });
    }
  });

export const LogInSchema = z
  .object({
    email: z.string().email().optional().or(z.literal('')),
    telephone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/)
      .optional()
      .or(z.literal('')),
    password: z.string().min(1).max(64),
    code: z.string().optional(),
  })
  .superRefine((schema, ctx) => {
    const { email, telephone } = schema;

    // Check if at least one of email or telephone is provided
    if (!email && !telephone) {
      ctx.addIssue({
        code: 'custom',
        message: 'Provide an email or a telephone number',
        path: ['email'], // You can also use path: [] to indicate it's a general form error
      });
    }
  });

export const ForgotPasswordSchema = z
  .object({
    email: z.string().email().optional().or(z.literal('')),
    telephone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/)
      .optional()
      .or(z.literal('')),
    password: z.string(),
    confirmPassword: z.string(),
    code: z.string(),
    useCode: z.boolean(),
  })
  .superRefine((schema, ctx) => {
    const { password, confirmPassword, code, useCode } = schema;
    // Check if passwords match
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirmPassword'],
      });
    }

    // check if the password is really small
    if (useCode) {
      if (password.length < 8) {
        ctx.addIssue({
          code: 'custom',
          message: 'Password must contain at least 8 characters',
          path: ['password'],
        });
      }

      // check if the password is really huge
      if (password.length > 64) {
        ctx.addIssue({
          code: 'custom',
          message: 'Password must contain at most 64 characters',
          path: ['password', 'confirmPassword'],
        });
      }

      if (code.length < 6) {
        ctx.addIssue({
          code: 'custom',
          message: 'Code must have at least 6 characters',
          path: ['code'],
        });
      }
    }
  });

export const SettingsSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email().optional().or(z.literal('')),
  telephone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .or(z.literal('')),
  password: z.string().min(8).max(64).optional(),
  newPassword: z.string().min(8).max(64).optional(),
  role: z.literal('USER').or(z.literal('ADMIN')),
  isTwoFactorEnabled: z.boolean(),
  code: z.string(),
});
