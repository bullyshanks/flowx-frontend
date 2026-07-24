'use client';

import { useEffect, useState } from 'react';
import { MapPin, Loader2, RefreshCw, Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, AdminZone } from '@/lib/admin-services';
import {
  PageHeader, Table, Th, Td, Button, EmptyState,
} from '@/components/admin/ui';
import { formatDate } from '@/lib/utils';

export default function AdminZonesPage() {
  const [zones, setZones] = useState<AdminZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('Karachi');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await adminApi.listZonesAdmin();
      setZones(list);
    } catch {
      toast.error('Failed to load zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createZone = async () => {
    if (!name.trim()) return toast.error('Name is required');
    setCreating(true);
    try {
      await adminApi.createZone({ name: name.trim(), city: city.trim() || undefined });
      toast.success('Zone created');
      setName('');
      setCity('Karachi');
      setShowCreate(false);
      load();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || 'Failed to create zone');
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (z: AdminZone) => {
    setTogglingId(z.id);
    try {
      await adminApi.updateZone(z.id, { isActive: !z.isActive });
      toast.success(z.isActive ? 'Zone deactivated' : 'Zone activated');
      load();
    } catch {
      toast.error('Failed to update zone');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Zones"
        subtitle="Delivery areas — deactivating hides a zone from signup/checkout without affecting existing vendors, riders, or orders"
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowCreate((s) => !s)}>
              <Plus size={14} /> {showCreate ? 'Cancel' : 'New Zone'}
            </Button>
            <Button variant="secondary" onClick={load}>
              <RefreshCw size={14} /> Refresh
            </Button>
          </>
        }
      />

      {showCreate && (
        <div className="bg-navy border border-white/[0.08] rounded-2xl p-6 mb-6">
          <h3 className="font-syne font-bold text-white text-base mb-4">New Zone</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gulistan-e-Johar"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-electric"
              />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-electric"
              />
            </div>
          </div>
          <Button variant="success" onClick={createZone} disabled={creating}>
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Create Zone
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-electric" size={32} />
        </div>
      ) : zones.length === 0 ? (
        <EmptyState icon={MapPin} title="No zones" description="Delivery zones will appear here." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>City</Th>
              <Th>Users</Th>
              <Th>Orders</Th>
              <Th>Subscriptions</Th>
              <Th>Status</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id} className="hover:bg-white/[0.02]">
                <Td className="font-semibold text-white">{z.name}</Td>
                <Td className="text-white/65 text-xs">{z.city}</Td>
                <Td className="text-white/65 text-xs">{z._count.users}</Td>
                <Td className="text-white/65 text-xs">{z._count.orders}</Td>
                <Td className="text-white/65 text-xs">{z._count.subscriptions}</Td>
                <Td>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      z.isActive
                        ? 'bg-flowgreen/15 text-flowgreen border-flowgreen/30'
                        : 'bg-white/5 text-white/50 border-white/15'
                    }`}
                  >
                    {z.isActive ? 'Active' : 'Inactive'}
                  </span>
                </Td>
                <Td className="text-white/55 text-xs">{formatDate(z.createdAt)}</Td>
                <Td>
                  <Button
                    size="sm"
                    variant={z.isActive ? 'danger' : 'success'}
                    disabled={togglingId === z.id}
                    onClick={() => toggleActive(z)}
                  >
                    {z.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
