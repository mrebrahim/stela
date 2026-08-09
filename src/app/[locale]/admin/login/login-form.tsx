'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Locale } from '@/i18n/config';

export function LoginForm({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); return; }
      router.replace(`/${locale}/admin`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-card">
      <div>
        <div className="text-xl font-bold text-slate-900">Admin sign-in</div>
        <div className="text-sm text-slate-500 mt-1">Sign in to manage listings and leads.</div>
      </div>
      <label className="block">
        <span className="block text-sm text-slate-600 mb-1">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
          autoComplete="email"
        />
      </label>
      <label className="block">
        <span className="block text-sm text-slate-600 mb-1">Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
          autoComplete="current-password"
        />
      </label>
      {error && <div className="rounded bg-red-50 border border-red-200 text-red-800 p-2 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-stella-700 hover:bg-stella-800 text-white py-2 font-semibold disabled:opacity-40"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
