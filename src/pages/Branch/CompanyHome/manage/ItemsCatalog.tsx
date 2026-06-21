import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { CompanyHomeLayoutContextType } from '../CompanyHomeLayout';
import { useAuth } from '../../../../context/AuthContext';
import { Badge } from '../../../../components/ui';
import api from '../../../../services/api';

const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const labelCls = 'block text-xs font-semibold text-slate-700 mb-1.5';

export const ItemsCatalog: React.FC = () => {
  const { user } = useAuth();
  const { items, categories, isLoading, fetchItems, activeCompany, setSuccess } =
    useOutletContext<CompanyHomeLayoutContextType>();

  const [showItemModal, setShowItemModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [itemSku, setItemSku] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemPack, setItemPack] = useState('');
  const [itemGrammage, setItemGrammage] = useState('');
  const [itemPurchaseRate, setItemPurchaseRate] = useState('');
  const [itemSalesRate, setItemSalesRate] = useState('');
  const [itemPurchaseTax, setItemPurchaseTax] = useState('');
  const [itemSalesTax, setItemSalesTax] = useState('');
  const [itemFederalTax, setItemFederalTax] = useState('');
  const [itemDiscountSlabQty, setItemDiscountSlabQty] = useState('');
  const [itemDiscountSlabRate, setItemDiscountSlabRate] = useState('');
  const [itemMinStock, setItemMinStock] = useState('');
  const [itemMaxStock, setItemMaxStock] = useState('');
  const [modalItemError, setModalItemError] = useState('');
  const [itemFieldErrors, setItemFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setItemName(''); setItemCode(''); setItemSku('');
    setItemCategory(categories.length > 0 ? categories[0].id : '');
    setItemPack(''); setItemGrammage(''); setItemPurchaseRate(''); setItemSalesRate('');
    setItemPurchaseTax(''); setItemSalesTax(''); setItemFederalTax('');
    setItemDiscountSlabQty(''); setItemDiscountSlabRate('');
    setItemMinStock(''); setItemMaxStock('');
    setModalItemError(''); setItemFieldErrors({});
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalItemError(''); setItemFieldErrors({}); setIsSubmitting(true);
    const cleanName = itemName.trim();
    if (!cleanName) { setIsSubmitting(false); return; }
    if (!itemCategory) { setModalItemError('Category is required.'); setIsSubmitting(false); return; }
    if (!activeCompany) { setModalItemError('Active company not found.'); setIsSubmitting(false); return; }

    const payload: any = {
      name: cleanName, category: itemCategory, company: activeCompany.id,
      sku: itemSku.trim() || null, pack: itemPack ? parseInt(itemPack, 10) : null,
      grammage: itemGrammage.trim() || null,
      purchase_rate: itemPurchaseRate || null, sales_rate: itemSalesRate || null,
      purchase_tax: itemPurchaseTax || null, sales_tax: itemSalesTax || null, federal_tax: itemFederalTax || null,
      discount_slab_qty: itemDiscountSlabQty || null, discount_slab_rate: itemDiscountSlabRate || null,
      min_stock: itemMinStock || null, max_stock: itemMaxStock || null,
    };
    if (itemCode.trim()) payload.code = itemCode.trim();

    try {
      await api.post('/items/', payload);
      setSuccess('Item registered in branch catalog successfully.');
      resetForm(); setShowItemModal(false); fetchItems();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, val]) => { errors[key] = Array.isArray(val) ? val.join(' ') : String(val); });
        setItemFieldErrors(errors);
        if (errors.non_field_errors) setModalItemError(errors.non_field_errors);
      } else { setModalItemError('An unexpected server error occurred.'); }
    } finally { setIsSubmitting(false); }
  };

  const canCreate = user?.item_creation_policy === 'BRANCH_ADMIN' && user?.role === 'BRANCH_ADMIN';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Items Catalog</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Policy: <span className="font-medium">{user?.item_creation_policy === 'ORG_ADMIN' ? 'Centralized (HQ Controlled)' : 'Decentralized (Branch Scoped)'}</span>
          </p>
        </div>
        {canCreate && (
          <button onClick={() => { resetForm(); setShowItemModal(true); }} disabled={categories.length === 0}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Item
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">No items in catalog</p>
            <p className="mt-1 text-xs text-slate-400">{canCreate ? 'Click "Add Item" to register the first item.' : 'Contact HQ to add items to the catalog.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {['Item Name', 'Code / SKU', 'Category', 'Pack & Weight', 'Purchase Rate', 'Sales Rate', 'Taxes', 'Stock', 'Min / Max'].map(h => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3.5 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3.5">
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono text-slate-600">{item.code}</code>
                      {item.sku && <div className="mt-0.5 text-[10px] text-slate-400">SKU: {item.sku}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{item.category_name}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {item.pack ? <div>Pack: {item.pack}</div> : null}
                      {item.grammage ? <div>{item.grammage}</div> : null}
                      {!item.pack && !item.grammage && '—'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{item.purchase_rate ? `Rs. ${item.purchase_rate}` : '—'}</td>
                    <td className="px-4 py-3.5 text-slate-600">{item.sales_rate ? `Rs. ${item.sales_rate}` : '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {item.purchase_tax ? <div>P: {item.purchase_tax}%</div> : null}
                      {item.sales_tax ? <div>S: {item.sales_tax}%</div> : null}
                      {item.federal_tax ? <div>F: {item.federal_tax}%</div> : null}
                      {!item.purchase_tax && !item.sales_tax && !item.federal_tax && '—'}
                    </td>
                    <td className="px-4 py-3.5"><Badge color="blue">{item.current_stock || '0.00'}</Badge></td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {item.min_stock ? <div>Min: {item.min_stock}</div> : null}
                      {item.max_stock ? <div>Max: {item.max_stock}</div> : null}
                      {!item.min_stock && !item.max_stock && '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl" style={{ maxHeight: '90vh' }}>
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Register New Saleable Item</h3>
                <p className="mt-0.5 text-xs text-slate-400">Add to the {activeCompany?.name} catalog</p>
              </div>
              <button onClick={() => setShowItemModal(false)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateItem} className="flex flex-col overflow-hidden">
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                {modalItemError && <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{modalItemError}</div>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelCls}>Item Name <span className="text-red-500">*</span></label>
                    <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Lays Masala Large" required className={inputCls} />
                    {itemFieldErrors.name && <p className="mt-1 text-[10px] font-semibold text-red-600">{itemFieldErrors.name}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Category <span className="text-red-500">*</span></label>
                    <select value={itemCategory} onChange={e => setItemCategory(e.target.value)} required className={inputCls}>
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                    </select>
                    {itemFieldErrors.category && <p className="mt-1 text-[10px] font-semibold text-red-600">{itemFieldErrors.category}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Manual Code <span className="text-slate-400 font-normal">(optional)</span></label>
                    <input type="text" value={itemCode} onChange={e => setItemCode(e.target.value)} placeholder="Leave blank for auto-seq" className={inputCls} />
                    {itemFieldErrors.code && <p className="mt-1 text-[10px] font-semibold text-red-600">{itemFieldErrors.code}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>SKU <span className="text-slate-400 font-normal">(optional)</span></label>
                    <input type="text" value={itemSku} onChange={e => setItemSku(e.target.value)} placeholder="e.g. SKU-12345" className={inputCls} />
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Packaging & Rates</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Pack (items/pack)</label><input type="number" min="1" value={itemPack} onChange={e => setItemPack(e.target.value)} placeholder="e.g. 10" className={inputCls} /></div>
                    <div><label className={labelCls}>Grammage / Weight</label><input type="text" value={itemGrammage} onChange={e => setItemGrammage(e.target.value)} placeholder="e.g. 150 g" className={inputCls} /></div>
                    <div><label className={labelCls}>Purchase Rate</label><input type="text" value={itemPurchaseRate} onChange={e => setItemPurchaseRate(e.target.value)} placeholder="e.g. 150.00" className={inputCls} /></div>
                    <div><label className={labelCls}>Sales Rate</label><input type="text" value={itemSalesRate} onChange={e => setItemSalesRate(e.target.value)} placeholder="e.g. 180.00" className={inputCls} /></div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Tax Rates (%)</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className={labelCls}>Purchase Tax</label><input type="text" value={itemPurchaseTax} onChange={e => setItemPurchaseTax(e.target.value)} placeholder="e.g. 17" className={inputCls} /></div>
                    <div><label className={labelCls}>Sales Tax</label><input type="text" value={itemSalesTax} onChange={e => setItemSalesTax(e.target.value)} placeholder="e.g. 17" className={inputCls} /></div>
                    <div><label className={labelCls}>Federal Tax</label><input type="text" value={itemFederalTax} onChange={e => setItemFederalTax(e.target.value)} placeholder="e.g. 3" className={inputCls} /></div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Slabs & Thresholds</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>Discount Slab Qty</label><input type="text" value={itemDiscountSlabQty} onChange={e => setItemDiscountSlabQty(e.target.value)} placeholder="e.g. 50" className={inputCls} /></div>
                    <div><label className={labelCls}>Discount Slab Rate (%)</label><input type="text" value={itemDiscountSlabRate} onChange={e => setItemDiscountSlabRate(e.target.value)} placeholder="e.g. 10" className={inputCls} /></div>
                    <div><label className={labelCls}>Min Stock Alert</label><input type="text" value={itemMinStock} onChange={e => setItemMinStock(e.target.value)} placeholder="e.g. 20" className={inputCls} /></div>
                    <div><label className={labelCls}>Max Stock Threshold</label><input type="text" value={itemMaxStock} onChange={e => setItemMaxStock(e.target.value)} placeholder="e.g. 500" className={inputCls} /></div>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-3 border-t border-slate-200 px-6 py-4">
                <button type="button" onClick={() => setShowItemModal(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsCatalog;
