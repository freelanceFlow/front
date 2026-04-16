'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { storageService } from '@/services/storage.service';
import { AxiosError } from 'axios';

const registerSchema = z
  .object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    adress: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterInput = z.infer<typeof registerSchema>;

interface ErrorResponse {
  message: string;
}

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      adress: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;

      await authService.register(registerData);

      const loginResponse = await authService.login({
        email: data.email,
        password: data.password,
      });

      if (loginResponse.data.token) {
        storageService.setToken(loginResponse.data.token);
        if (loginResponse.data.user) {
          storageService.setUser(loginResponse.data.user);
        }
        router.push('/homepage');
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as AxiosError<ErrorResponse>;
      setError(
        error.response?.data?.message || 'An error occurred during registration'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            {...register('first_name')}
            type="text"
            id="first_name"
            placeholder="John"
            disabled={isLoading}
          />
          {errors.first_name && (
            <p className="text-destructive text-sm">
              {errors.first_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            {...register('last_name')}
            type="text"
            id="last_name"
            placeholder="Doe"
            disabled={isLoading}
          />
          {errors.last_name && (
            <p className="text-destructive text-sm">
              {errors.last_name.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          {...register('email')}
          type="email"
          id="email"
          placeholder="you@example.com"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="adress">Address (Optional)</Label>
        <Input
          {...register('adress')}
          type="text"
          id="adress"
          placeholder="123 Main St, City, Country"
          disabled={isLoading}
        />
        {errors.adress && (
          <p className="text-destructive text-sm">{errors.adress.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          {...register('password')}
          type="password"
          id="password"
          placeholder="••••••"
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          {...register('confirmPassword')}
          type="password"
          id="confirmPassword"
          placeholder="••••••"
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-destructive text-sm">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}
