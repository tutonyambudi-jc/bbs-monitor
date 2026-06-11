import { listServices } from '@/lib/actions/services';
import { ServicesPanel } from '@/components/services/services-panel';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const services = await listServices();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Services surveillés</h1>
      <ServicesPanel services={services} />
    </div>
  );
}
