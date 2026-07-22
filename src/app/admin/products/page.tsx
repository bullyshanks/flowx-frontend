'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Loader2, RefreshCw, Edit3, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { productsApi } from '@/lib/services';
import { financeApi } from '@/lib/admin-services';
import {
  PageHeader, Table, Th, Td, Button, EmptyState,
} from '@/components/admin/ui';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editCommission, setEditCommission] = useState('');   // '' = use global default
  const [editRiderRate, setEditRiderRate] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const list = await productsApi.getAll();
      setProducts(list);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p: Product) => {
    setEditing(p.id);
    setEditPrice(String(p.price));
    setEditCommission(p.commissionPct != null ? String(Number(p.commissionPct)) : '');
    setEditRiderRate(String(Number(p.riderEarningPerUnit ?? 0)));
  };

  const saveEdit = async (productId: string) => {
    const newPrice = parseFloat(editPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Enter a valid price');
      return;
    }
    const commissionPct = editCommission.trim() === '' ? null : parseFloat(editCommission);
    if (commissionPct !== null && (isNaN(commissionPct) || commissionPct < 0 || commissionPct > 100)) {
      toast.error('Commission % must be 0–100 (or empty for default)');
      return;
    }
    const riderEarningPerUnit = parseFloat(editRiderRate);
    if (isNaN(riderEarningPerUnit) || riderEarningPerUnit < 0) {
      toast.error('Rider earning must be 0 or more');
      return;
    }
    try {
      await api.put(`/products/${productId}`, { price: newPrice });
      await financeApi.updateProductRates(productId, { commissionPct, riderEarningPerUnit });
      toast.success('Product updated');
      setEditing(null);
      load();
    } catch {
      toast.error('Failed to update');
    }
  };

  const toggleActive = async (p: Product) => {
    try {
      if (p.isActive) {
        await api.delete(`/products/${p.id}`);
        toast.success('Product deactivated');
      } else {
        await api.put(`/products/${p.id}`, { isActive: true });
        toast.success('Product activated');
      }
      load();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Update prices and availability"
        actions={
          <Button variant="secondary" onClick={load}>
            <RefreshCw size={14} /> Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-electric" size={32} />
        </div>
      ) : products.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No products" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Product</Th>
              <Th>Description</Th>
              <Th>Min Qty</Th>
              <Th>Unit</Th>
              <Th>Price</Th>
              <Th>Commission %</Th>
              <Th>Rider Rs./unit</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="font-semibold text-white">{p.name}</div>
                  <div className="text-[11px] text-white/45 font-mono">{p.slug}</div>
                </Td>
                <Td className="text-white/65 text-xs max-w-xs">{p.description || '—'}</Td>
                <Td className="font-bold text-white">{p.minQuantity}</Td>
                <Td className="text-white/65 text-xs">{p.unit}</Td>
                <Td>
                  {editing === p.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-white/45 text-xs">Rs.</span>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-24 bg-white/10 border border-electric rounded-lg text-white text-sm px-2 py-1.5"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <span className="font-bold text-white">{formatPrice(p.price)}</span>
                  )}
                </Td>
                <Td>
                  {editing === p.id ? (
                    <input
                      type="number"
                      value={editCommission}
                      onChange={(e) => setEditCommission(e.target.value)}
                      placeholder="default"
                      className="w-20 bg-white/10 border border-electric rounded-lg text-white text-sm px-2 py-1.5"
                    />
                  ) : p.commissionPct != null ? (
                    <span className="font-bold text-white">{Number(p.commissionPct)}%</span>
                  ) : (
                    <span className="text-white/40 text-xs">default</span>
                  )}
                </Td>
                <Td>
                  {editing === p.id ? (
                    <input
                      type="number"
                      value={editRiderRate}
                      onChange={(e) => setEditRiderRate(e.target.value)}
                      className="w-20 bg-white/10 border border-electric rounded-lg text-white text-sm px-2 py-1.5"
                    />
                  ) : p.hasRiderDelivery === false ? (
                    <span className="text-white/40 text-xs">no rider</span>
                  ) : (
                    <span className="font-bold text-white">{formatPrice(p.riderEarningPerUnit ?? 0)}</span>
                  )}
                </Td>
                <Td>
                  <button
                    onClick={() => toggleActive(p)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      p.isActive
                        ? 'bg-flowgreen/15 text-flowgreen border-flowgreen/30'
                        : 'bg-white/5 text-white/50 border-white/15'
                    }`}
                  >
                    {p.isActive ? 'Active' : 'Inactive'}
                  </button>
                </Td>
                <Td>
                  {editing === p.id ? (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="success" onClick={() => saveEdit(p.id)}>
                        <Save size={12} /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                        <X size={12} /> Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => startEdit(p)}>
                      <Edit3 size={12} /> Edit
                    </Button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
