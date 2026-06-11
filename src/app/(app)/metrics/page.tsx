import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function MetricsPage() {
  const metrics = await prisma.serverMetric.findMany({
    orderBy: { recordedAt: 'desc' },
    take: 100,
  });

  const latest = metrics[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Métriques serveur</h1>

      {latest && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">CPU</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{latest.cpuPercent}%</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">RAM</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{latest.memoryPercent}%</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Load (1m)</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{latest.loadAvg1?.toFixed(2) ?? '—'}</p></CardContent></Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Historique</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Hostname</TableHead>
                <TableHead>CPU %</TableHead>
                <TableHead>RAM %</TableHead>
                <TableHead>Load 1m</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{format(m.recordedAt, 'dd/MM/yyyy HH:mm:ss', { locale: fr })}</TableCell>
                  <TableCell>{m.hostname}</TableCell>
                  <TableCell>{m.cpuPercent}%</TableCell>
                  <TableCell>{m.memoryPercent}%</TableCell>
                  <TableCell>{m.loadAvg1?.toFixed(2) ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
