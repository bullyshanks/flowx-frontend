'use client';

import { useEffect, useState } from 'react';
import { Loader2, Package, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorPortalApi, VendorProductListing } from '@/lib/vendor-portal-services';
import { PageHeader, EmptyState } from '@/components/admin/ui';
import { formatPrice } from '@/lib/utils';

export default function VendorProductsPage() {
  const [products, setProducts] = useState<VendorProductListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftPrices, setDraftPrices] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () => {
    vendorPortalApi.myProducts()
      .then((p) => {
        setProducts(p);
        setDraftPrices(Object.fromEntries(p.map((x) => [x.id, x.price])));
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const savePrice = async (productId: string) => {
    const draft = draftPrices[productId];
    const value = Number(draft);
    if (draft.trim() === '' || Number.isNaN(value) || value < 0) {
      toast.error('Enter a valid price');
      return;
    }
    setSavingId(productId);
    try {
      await vendorPortalApi.updateMyProduct(productId, { price: value });
      toast.success('Price updated');
      load();
    } catch {
      toast.error('Failed to update price');
    } finally {
      setSavingId(null);
    }
  };

  const resetPrice = async (productId: string) => {
    setSavingId(productId);
    try {
      await vendorPortalApi.updateMyProduct(productId, { price: null });
      toast.success('Reset to catalog price');
      load();
    } catch {
      toast.error('Failed to reset price');
    } finally {
      setSavingId(null);
    }
  };

  const toggleStock = async (product: VendorProductListing) => {
    setSavingId(product.id);
    try {
      await vendorPortalApi.updateMyProduct(product.id, { inStock: !product.inStock });
      toast.success(product.inStock ? 'Marked out of stock' : 'Marked back in stock');
      load();
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-flowgreen" size={32} />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="My Products" subtitle="Set your own price and stock per product — leave blank to use the catalog price" />

      {products.length === 0 ? (
        <EmptyState icon={Package} title="No products" description="No active products in the catalog yet." />
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className={`bg-navy border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
                p.inStock ? 'border-white/[0.08]' : 'border-red-500/25 bg-red-500/[0.03]'
              }`}
            >
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
                💧
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-syne font-bold text-white text-[15px]">{p.name}</div>
                <div className="text-white/45 text-xs mt-0.5">
                  Catalog price: {formatPrice(p.catalogPrice)} / {p.unit} · Min order: {p.minQuantity}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">Rs.</span>
                  <input
                    type="number"
                    min={0}
                    value={draftPrices[p.id] ?? ''}
                    onChange={(e) => setDraftPrices((d) => ({ ...d, [p.id]: e.target.value }))}
                    className="w-28 pl-9 pr-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-sm outline-none focus:border-flowgreen"
                  />
                </div>
                <button
                  onClick={() => savePrice(p.id)}
                  disabled={savingId === p.id}
                  className="px-3.5 py-2.5 bg-flowgreen/15 border border-flowgreen/30 text-flowgreen rounded-xl text-xs font-bold hover:bg-flowgreen/25 transition disabled:opacity-50"
                >
                  Save
                </button>
                {p.hasOverridePrice && (
                  <button
                    onClick={() => resetPrice(p.id)}
                    disabled={savingId === p.id}
                    title="Reset to catalog price"
                    className="p-2.5 text-white/50 hover:text-white transition disabled:opacity-50"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>

              <button
                onClick={() => toggleStock(p)}
                disabled={savingId === p.id}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition disabled:opacity-50 ${
                  p.inStock
                    ? 'bg-white/5 border border-white/15 text-white/70 hover:bg-white/10'
                    : 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25'
                }`}
              >
                {p.inStock ? 'In Stock' : 'Out of Stock'}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
