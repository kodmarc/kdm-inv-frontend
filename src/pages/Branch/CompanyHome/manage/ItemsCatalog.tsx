import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { CompanyHomeLayoutContextType } from '../CompanyHomeLayout';
import { Badge } from '../../../../components/ui';
import api from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';

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
  const { user } = useAuth();
  const { setSuccess } = useOutletContext<CompanyHomeLayoutContextType>();
  
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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

  // ✅ FIXED: Proper sorting with null/empty values at the end
  const sortItemsLocally = useCallback((data: any[]) => {
    const sorted = [...data];
    
    if (sortBy === 'name') {
      sorted.sort((a, b) => {
        const aVal = a.name || '';
        const bVal = b.name || '';
        const compare = aVal.localeCompare(bVal);
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'sales_rate') {
      sorted.sort((a, b) => {
        // Parse values, treat null/empty as -Infinity so they go to the end
        const aVal = a.sales_rate !== null && a.sales_rate !== '' && a.sales_rate !== undefined 
          ? parseFloat(a.sales_rate) 
          : (sortOrder === 'desc' ? -Infinity : Infinity);
        const bVal = b.sales_rate !== null && b.sales_rate !== '' && b.sales_rate !== undefined 
          ? parseFloat(b.sales_rate) 
          : (sortOrder === 'desc' ? -Infinity : Infinity);
        
        const compare = aVal - bVal;
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'purchase_rate') {
      sorted.sort((a, b) => {
        const aVal = a.purchase_rate !== null && a.purchase_rate !== '' && a.purchase_rate !== undefined 
          ? parseFloat(a.purchase_rate) 
          : (sortOrder === 'desc' ? -Infinity : Infinity);
        const bVal = b.purchase_rate !== null && b.purchase_rate !== '' && b.purchase_rate !== undefined 
          ? parseFloat(b.purchase_rate) 
          : (sortOrder === 'desc' ? -Infinity : Infinity);
        
        const compare = aVal - bVal;
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'current_stock') {
      sorted.sort((a, b) => {
        const aVal = a.current_stock !== null && a.current_stock !== undefined 
          ? parseFloat(a.current_stock) 
          : (sortOrder === 'desc' ? -Infinity : Infinity);
        const bVal = b.current_stock !== null && b.current_stock !== undefined 
          ? parseFloat(b.current_stock) 
          : (sortOrder === 'desc' ? -Infinity : Infinity);
        
        const compare = aVal - bVal;
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'created_at') {
      sorted.sort((a, b) => {
        const aVal = new Date(a.created_at).getTime();
        const bVal = new Date(b.created_at).getTime();
        const compare = aVal - bVal;
        return sortOrder === 'asc' ? compare : -compare;
      });
    }
    return sorted;
  }, [sortBy, sortOrder]);

  // Use local sorting since backend sorting might not handle nulls properly
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all items without sorting from backend (or with basic sorting)
      let url = `/items/`;
      
      if (selectedCategory) {
        url += `?category=${selectedCategory}`;
      }
      if (selectedCompany) {
        url += `${selectedCategory ? '&' : '?'}company=${selectedCompany}`;
      }
      if (debouncedSearch.trim()) {
        url += `${selectedCategory || selectedCompany ? '&' : '?'}search=${encodeURIComponent(debouncedSearch.trim())}`;
      }
      
      const response = await api.get(url);
      
      // Apply local sorting with proper null handling
      const sortedData = sortItemsLocally(response.data);
      setItems(sortedData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch items.');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, [sortItemsLocally, selectedCategory, selectedCompany, debouncedSearch]);

  const fetchFilters = useCallback(async () => {
    try {
      const [categoriesRes, companiesRes] = await Promise.all([
        api.get('/item-categories/'),
        api.get('/companies/')
      ]);
      setCategories(categoriesRes.data || []);
      setCompanies(companiesRes.data || []);
    } catch (err) {
      console.error('Error fetching filter data:', err);
    }
  }, []);

  useEffect(() => { fetchFilters(); }, [fetchFilters]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = sortOptions.find(opt => opt.value === e.target.value);
    if (selected) {
      setSortBy(selected.sortBy);
      setSortOrder(selected.order);
      // Re-fetch with new sort
      fetchItems();
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

      {/* Filters Bar */}
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

        {categories.length > 0 && (
          <div className="min-w-[150px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {companies.length > 0 && (
          <div className="min-w-[150px]">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Companies</option>
              {companies.map((comp) => (
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

      {/* Items Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-sm text-slate-500">Loading items...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">Error loading items</p>
            <p className="mt-1 text-xs text-slate-400">{error}</p>
            <button
              onClick={fetchItems}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try Again
            </button>
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
                {items.map(item => (
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