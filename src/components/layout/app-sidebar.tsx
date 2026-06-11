'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, AlertTriangle, LayoutDashboard, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/services', label: 'Services', icon: Server },
  { href: '/alerts', label: 'Alertes', icon: AlertTriangle },
  { href: '/metrics', label: 'Métriques', icon: Activity },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-[#0f172a] text-white">
      <div className="border-b border-white/10 px-4 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">BBS</p>
        <h1 className="text-lg font-semibold">Monitor</h1>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                active ? 'bg-[#2563eb] text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
