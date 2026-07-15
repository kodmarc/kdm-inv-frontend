import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { CompanyHomeLayoutContextType } from '../CompanyHomeLayout';
import { Badge } from '../../../../components/ui';

type SortOption = {
  label: string;
  value: string;
  order: 'asc' | 'desc';
};

export const ItemsCatalog: React.FC = () => {
  const { items, isLoading, fetchItems } =
    useOutletContext<CompanyHomeLayoutContextType>();
  
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortOptions: SortOption[] = [
    { label: 'Item Name (A-Z)', value: 'name', order: 'asc' },
    { label: 'Item Name (Z-A)', value: 'name', order: 'desc' },
    { label: 'Sales Rate (Low-High)', value: 'sales_rate', order: 'asc' },
    { label: 'Sales Rate (High-Low)', value: 'sales_rate', order: 'desc' },
    { label: 'Purchase Rate (Low-High)', value: 'purchase_rate', order: 'asc' },
    { label: 'Purchase Rate (High-Low)', value: 'purchase_rate', order: 'desc' },
    { label: 'Stock (Low-High)', value: 'current_stock', order: 'asc' },
    { label: 'Stock (High-Low)', value: 'current_stock', order: 'desc' },
  ];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = sortOptions.find(opt => 
      `${opt.value}-${opt.order}` === e.target.value
    );
    if (selected) {
      setSortBy(selected.value);
      setSortOrder(selected.order);
      // Re-fetch with new sort parameters
      fetchItems();
    }
  };

  const getCurrentSort = () => `${sortBy}-${sortOrder}`;

  // Sort items locally (optional - if you want immediate sorting without re-fetch)
  const sortedItems = [...items];
  if (sortBy === 'name') {
    sortedItems.sort((a, b) => {
      const compare = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? compare : -compare;
    });
  } else if (sortBy === 'sales_rate') {
    sortedItems.sort((a, b) => {
      const aVal = parseFloat(a.sales_rate || '0');
      const bVal = parseFloat(b.sales_rate || '0');
      const compare = aVal - bVal;
      return sortOrder === 'asc' ? compare : -compare;
    });
  } else if (sortBy === 'purchase_rate') {
    sortedItems.sort((a, b) => {
      const aVal = parseFloat(a.purchase_rate || '0');
      const bVal = parseFloat(b.purchase_rate || '0');
      const compare = aVal - bVal;
      return sortOrder === 'asc' ? compare : -compare;
    });
  } else if (sortBy === 'current_stock') {
    sortedItems.sort((a, b) => {
      const aVal = parseFloat(a.current_stock || '0');
      const bVal = parseFloat(b.current_stock || '0');
      const compare = aVal - bVal;
      return sortOrder === 'asc' ? compare : -compare;
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Items Catalog</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Items are managed by HQ and visible here based on company assignment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-600">
            Sort by:
          </label>
          <select
            value={getCurrentSort()}
            onChange={handleSortChange}
            className="min-w-[180px] rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {sortOptions.map(opt => (
              <option key={`${opt.value}-${opt.order}`} value={`${opt.value}-${opt.order}`}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">No items in catalog</p>
            <p className="mt-1 text-xs text-slate-400">Contact HQ to add items to this company's catalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Code / SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Pack & Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Purchase Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Sales Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Taxes</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Min / Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedItems.map(item => (
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
    </div>
  );
};

export default ItemsCatalog;  