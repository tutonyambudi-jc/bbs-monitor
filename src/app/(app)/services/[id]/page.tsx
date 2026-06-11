import { notFound } from 'next/navigation';
import { getServiceDetail } from '@/lib/actions/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await getServiceDetail(id);
  if (!service) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{service.name}</h1>
        <p className="text-muted-foreground">{service.healthUrl}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Résumé</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div><p className="text-sm text-muted-foreground">Statut</p><StatusBadge status={service.status} /></div>
          <div><p className="text-sm text-muted-foreground">Réponse</p><p className="font-semibold">{service.lastResponseMs ?? '—'} ms</p></div>
          <div><p className="text-sm text-muted-foreground">Code HTTP</p><p className="font-semibold">{service.lastStatusCode ?? '—'}</p></div>
          <div><p className="text-sm text-muted-foreground">Dernière vérif.</p><p className="font-semibold">{service.lastCheckedAt ? format(service.lastCheckedAt, 'dd/MM/yyyy HH:mm', { locale: fr }) : '—'}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Historique health checks</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Réponse</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Erreur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {service.healthChecks.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{format(c.checkedAt, 'dd/MM HH:mm:ss', { locale: fr })}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell>{c.responseMs} ms</TableCell>
                  <TableCell>{c.statusCode ?? '—'}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{c.errorMessage ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
