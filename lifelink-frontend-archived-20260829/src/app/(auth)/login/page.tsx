'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (supabaseError) throw supabaseError;
      setError('Logged in successfully!');
      setEmail('');
      setPassword('');
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
          Welcome Back
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded border border-slate-300/50 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded border border-slate-300/50 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center mt-2">
              {error}
            </p>
          )}
        </form>
        <p className="text-center text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-red-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}