'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Fingerprint, Lock, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const REMEMBER_KEY = 'bbs-monitor-remember-email';

function CornerBracket({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute size-8 border-white/90',
        className
      )}
      aria-hidden
    />
  );
}

function SecurityPanel() {
  return (
    <div className="relative hidden w-44 shrink-0 lg:block">
      <div className="relative mx-auto h-72 w-36">
        <CornerBracket className="left-0 top-0 border-l-2 border-t-2" />
        <CornerBracket className="right-0 top-0 border-r-2 border-t-2" />
        <CornerBracket className="bottom-0 left-0 border-b-2 border-l-2" />
        <CornerBracket className="bottom-0 right-0 border-b-2 border-r-2" />

        <div className="absolute left-1/2 top-[18%] flex size-20 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white/80">
          <Fingerprint className="size-10 text-white/95" strokeWidth={1.25} />
        </div>

        <div className="absolute bottom-[18%] left-1/2 flex size-20 -translate-x-1/2 items-center justify-center">
          <Shield className="size-16 text-white/90" strokeWidth={1.1} />
          <Lock className="absolute size-6 text-white/95" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

function PillInput({
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  autoComplete,
  id,
}: {
  icon: typeof User;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  id: string;
}) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-white/70"
        strokeWidth={1.75}
      />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-12 w-full rounded-full border border-white/35 bg-white/10 px-12 text-center text-sm text-white placeholder:text-white/55 backdrop-blur-sm transition focus:border-white/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
      />
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (remember) localStorage.setItem(REMEMBER_KEY, email);
      else localStorage.removeItem(REMEMBER_KEY);
    } catch {
      /* ignore */
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Connexion impossible');
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Image
        src="/login-bg.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/60" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="flex w-full max-w-3xl items-center justify-center gap-8 lg:gap-14">
          <SecurityPanel />

          <div className="w-full max-w-sm">
            <p className="mb-1 text-center text-xs font-medium uppercase tracking-[0.35em] text-white/50">
              BBS Monitor
            </p>
            <h1 className="mb-10 text-center text-5xl font-light tracking-[0.2em] text-white sm:text-6xl">
              2FA
            </h1>

            <form onSubmit={onSubmit} className="space-y-4">
              <PillInput
                id="email"
                icon={User}
                placeholder="Username"
                value={email}
                onChange={setEmail}
                autoComplete="username"
              />
              <PillInput
                id="password"
                icon={Lock}
                type="password"
                placeholder="Password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between px-2 pt-1 text-xs text-white/75">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="size-3.5 rounded border-white/40 bg-transparent accent-white"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="transition hover:text-white"
                  onClick={() => setError('Contactez un administrateur pour réinitialiser votre mot de passe.')}
                >
                  Forgot Password?
                </button>
              </div>

              {error && (
                <p className="rounded-full border border-red-400/40 bg-red-950/40 px-4 py-2 text-center text-xs text-red-200">
                  {error}
                </p>
              )}

              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 min-w-[140px] rounded-full bg-white px-10 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-white/90 disabled:opacity-60"
                >
                  {loading ? 'Connexion…' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
