import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { Toaster } from 'sonner';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader user={session} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
