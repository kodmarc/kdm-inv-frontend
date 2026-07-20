import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Badge } from '../../../../components/ui';
import type { CompanyHomeLayoutContextType } from '../CompanyHomeLayout';

type SortOption = {
  label: string;
  value: string;
  sortBy: string;
  order: 'asc' | 'desc';
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export const ItemsCatalog: React.FC = () => {
  // ✅ Context se data lein with default values
  const {
    items: contextItems = [],
    categories: contextCategories = [],
    companies: contextCompanies = [],
    fetchItems,
    isLoading: contextLoading = false
  } = useOutletContext<CompanyHomeLayoutContextType>() || {};

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 500);

  const sortOptions: SortOption[] = [
    { label: 'Item Name (A-Z)', value: 'name_asc', sortBy: 'name', order: 'asc' },
    { label: 'Item Name (Z-A)', value: 'name_desc', sortBy: 'name', order: 'desc' },
    { label: 'Sales Rate (High-Low)', value: 'sales_rate_desc', sortBy: 'sales_rate', order: 'desc' },
    { label: 'Sales Rate (Low-High)', value: 'sales_rate_asc', sortBy: 'sales_rate', order: 'asc' },
    { label: 'Purchase Rate (High-Low)', value: 'purchase_rate_desc', sortBy: 'purchase_rate', order: 'desc' },
    { label: 'Purchase Rate (Low-High)', value: 'purchase_rate_asc', sortBy: 'purchase_rate', order: 'asc' },
    { label: 'Stock (High-Low)', value: 'stock_desc', sortBy: 'current_stock', order: 'desc' },
    { label: 'Stock (Low-High)', value: 'stock_asc', sortBy: 'current_stock', order: 'asc' },
    { label: 'Newest First', value: 'created_at_desc', sortBy: 'created_at', order: 'desc' },
    { label: 'Oldest First', value: 'created_at_asc', sortBy: 'created_at', order: 'asc' },
  ];

  const getCurrentSortValue = () => {
    const found = sortOptions.find(opt => opt.sortBy === sortBy && opt.order === sortOrder);
    return found ? found.value : 'name_asc';
  };

  // ✅ Local filtering and sorting - NO API CALLS!
  const filterAndSortItems = useCallback(() => {
    // ✅ Handle case when contextItems is undefined or empty
    if (!contextItems || contextItems.length === 0) {
      return [];
    }

    let filtered = [...contextItems];
    
    // Search filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(q) ||
        item.code?.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q)
      );
    }
    
    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Company filter
    if (selectedCompany) {
      filtered = filtered.filter(item => item.company === selectedCompany);
    }
    
    // ✅ Sort with proper null/undefined handling
    if (sortBy === 'name') {
      filtered.sort((a, b) => {
        const aVal = a.name || '';
        const bVal = b.name || '';
        const compare = aVal.localeCompare(bVal);
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'sales_rate') {
      filtered.sort((a, b) => {
        // ✅ Safe parsing with fallback to 0
        const aVal = parseFloat(a.sales_rate ?? '0') || 0;
        const bVal = parseFloat(b.sales_rate ?? '0') || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    } else if (sortBy === 'purchase_rate') {
      filtered.sort((a, b) => {
        // ✅ Safe parsing with fallback to 0 using nullish coalescing
        const aVal = parseFloat(a.purchase_rate ?? '0') || 0;
        const bVal = parseFloat(b.purchase_rate ?? '0') || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    } else if (sortBy === 'current_stock') {
      filtered.sort((a, b) => {
        // ✅ Safe parsing with fallback to 0
        const aVal = parseFloat(a.current_stock ?? '0') || 0;
        const bVal = parseFloat(b.current_stock ?? '0') || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    } else if (sortBy === 'created_at') {
      filtered.sort((a, b) => {
        // ✅ Safe date parsing with fallback
        const aVal = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bVal = b.created_at ? new Date(b.created_at).getTime() : 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    
    return filtered;
  }, [contextItems, debouncedSearch, selectedCategory, selectedCompany, sortBy, sortOrder]);

  // ✅ Update items when context data or filters change
  useEffect(() => {
    if (contextItems && contextItems.length > 0) {
      setItems(filterAndSortItems());
      setLoading(false);
    } else if (!contextLoading && fetchItems) {
      fetchItems().then(() => {
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(true);
    }
  }, [contextItems, filterAndSortItems, fetchItems, contextLoading]);

  // ✅ Re-filter when filters change (NO API CALL!)
  useEffect(() => {
    if (contextItems && contextItems.length > 0) {
      setItems(filterAndSortItems());
    }
  }, [filterAndSortItems, contextItems]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = sortOptions.find(opt => opt.value === e.target.value);
    if (selected) {
      setSortBy(selected.sortBy);
      setSortOrder(selected.order);
    }
  };

  const resetFilters = () => {
    setSortBy('name');
    setSortOrder('asc');
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCompany('');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Items Catalog</h1>
          <p className="mt-0.5 text-sm text-slate-500">Browse and manage items in your catalog.</p>
        </div>
        {!loading && <div className="text-xs text-slate-400">{items.length} items found</div>}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, code, or SKU..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 pl-9 pr-9 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <svg 
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="min-w-[180px]">
          <select
            value={getCurrentSortValue()}
            onChange={handleSortChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {contextCategories && contextCategories.length > 0 && (
          <div className="min-w-[150px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Categories</option>
              {contextCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {contextCompanies && contextCompanies.length > 0 && (
          <div className="min-w-[150px]">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Companies</option>
              {contextCompanies.map((comp) => (
                <option key={comp.id} value={comp.id}>{comp.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={resetFilters}
          className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-sm text-slate-500">Loading items...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">No items found</p>
            <p className="mt-1 text-xs text-slate-400">
              {searchQuery || selectedCategory || selectedCompany 
                ? 'Try adjusting your filters or search terms.' 
                : 'Items will appear here once added to the catalog.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Code / SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Pack & Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Purchase Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Sales Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3.5 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3.5">
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono text-slate-600">{item.code}</code>
                      {item.sku && <div className="mt-0.5 text-[10px] text-slate-400">SKU: {item.sku}</div>}
                    </td>
                    <td className="px-4 py-3.5"><Badge color="slate">{item.category_name || '—'}</Badge></td>
                    <td className="px-4 py-3.5 text-slate-600">{item.company_name || '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {item.pack ? <div>Pack: {item.pack}</div> : null}
                      {item.grammage ? <div>{item.grammage}</div> : null}
                      {!item.pack && !item.grammage && '—'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {item.purchase_rate !== null && item.purchase_rate !== '' && item.purchase_rate !== undefined 
                        ? `Rs. ${parseFloat(item.purchase_rate).toFixed(2)}` 
                        : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {item.sales_rate !== null && item.sales_rate !== '' && item.sales_rate !== undefined 
                        ? `Rs. ${parseFloat(item.sales_rate).toFixed(2)}` 
                        : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge color={parseFloat(item.current_stock || '0') > 0 ? 'green' : 'red'}>
                        {parseFloat(item.current_stock || '0').toFixed(2)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge color={item.is_active ? 'green' : 'red'}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </Badge>
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