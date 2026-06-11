'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SessionUser } from '@/lib/auth-session';

export function AppHeader({ user }: { user: SessionUser }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <p className="text-sm text-muted-foreground">Surveillance écosystème BBS</p>
      <div className="flex items-center gap-3">
        <div className="text-right text-sm">
          <p className="font-medium">{user.fullName}</p>
          <p className="text-xs text-muted-foreground">{user.role}</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="size-4" />
          Déconnexion
        </Button>
      </div>
    </header>
  );
}
