import { getDashboardOverview } from '@/lib/actions/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { services, stats, latestMetric, recentChecks } = await getDashboardOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard global</h1>
        <p className="text-muted-foreground">Écosystème BBS — ERP, Travelia, Echo Challenge</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Services</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-emerald-600">ONLINE</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-emerald-600">{stats.online}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-amber-600">DEGRADED</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-amber-600">{stats.degraded}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-red-600">OFFLINE</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-red-600">{stats.offline}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Alertes ouvertes</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.openAlerts}</p></CardContent></Card>
      </div>

      {latestMetric && (
        <Card>
          <CardHeader><CardTitle>Métriques serveur (dernier enregistrement)</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div><p className="text-sm text-muted-foreground">CPU</p><p className="text-2xl font-semibold">{latestMetric.cpuPercent}%</p></div>
            <div><p className="text-sm text-muted-foreground">RAM</p><p className="text-2xl font-semibold">{latestMetric.memoryPercent}%</p></div>
            <div><p className="text-sm text-muted-foreground">Hostname</p><p className="text-lg font-medium">{latestMetric.hostname}</p></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>État des services</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Réponse</TableHead>
                <TableHead>Dernière vérif.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><Link href={`/services/${s.id}`} className="font-medium hover:underline">{s.name}</Link></TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell>{s.lastResponseMs != null ? `${s.lastResponseMs} ms` : '—'}</TableCell>
                  <TableCell>{s.lastCheckedAt ? format(s.lastCheckedAt, 'dd/MM HH:mm', { locale: fr }) : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Historique récent des checks</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Réponse</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentChecks.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{format(c.checkedAt, 'dd/MM HH:mm:ss', { locale: fr })}</TableCell>
                  <TableCell>{c.service.name}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell>{c.responseMs} ms</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
