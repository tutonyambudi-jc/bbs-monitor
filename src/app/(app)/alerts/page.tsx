import { listAlerts } from '@/lib/actions/alerts';
import { AlertsPanel } from '@/components/alerts/alerts-panel';

export const dynamic = 'force-dynamic';

export default async function AlertsPage() {
  const alerts = await listAlerts();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Alertes</h1>
      <AlertsPanel alerts={alerts} />
    </div>
  );
}
