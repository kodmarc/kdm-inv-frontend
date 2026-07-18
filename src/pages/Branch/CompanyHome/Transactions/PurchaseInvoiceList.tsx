import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import type { CompanyHomeLayoutContextType } from '../CompanyHomeLayout';
import api from '../../../../services/api';

type SortOption = {
  label: string;
  value: string;
  sortBy: string;
  order: 'asc' | 'desc';
};

export const PurchaseInvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { branchSlug, companySlug } = useParams<{ branchSlug: string; companySlug: string }>();

  const {
    purchaseInvoices,
    fetchPurchaseInvoices,
    activeCompany,
    isLoading,
    setSuccess,
    setError
  } = useOutletContext<CompanyHomeLayoutContextType>();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  
  // Sorting states
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [localInvoices, setLocalInvoices] = useState<any[]>([]);

  const sortOptions: SortOption[] = [
    { label: 'Newest First', value: 'created_at_desc', sortBy: 'created_at', order: 'desc' },
    { label: 'Oldest First', value: 'created_at_asc', sortBy: 'created_at', order: 'asc' },
    { label: 'Net Amount (High-Low)', value: 'net_amount_desc', sortBy: 'net_amount', order: 'desc' },
    { label: 'Net Amount (Low-High)', value: 'net_amount_asc', sortBy: 'net_amount', order: 'asc' },
    { label: 'Supplier (A-Z)', value: 'supplier_name_asc', sortBy: 'supplier_name', order: 'asc' },
    { label: 'Supplier (Z-A)', value: 'supplier_name_desc', sortBy: 'supplier_name', order: 'desc' },
  ];

  const getCurrentSortValue = () => {
    const found = sortOptions.find(opt => opt.sortBy === sortBy && opt.order === sortOrder);
    return found ? found.value : 'created_at_desc';
  };

  const sortAndFilterInvoices = useCallback((data: any[]) => {
    let filtered = [...data];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(inv =>
        inv.purchase_code?.toLowerCase().includes(q) ||
        inv.supplier_name?.toLowerCase().includes(q)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }
    
    // Apply sorting
    if (sortBy === 'created_at') {
      filtered.sort((a, b) => {
        const compare = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'net_amount') {
      filtered.sort((a, b) => {
        const aVal = parseFloat(a.net_amount || '0');
        const bVal = parseFloat(b.net_amount || '0');
        const compare = aVal - bVal;
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'supplier_name') {
      filtered.sort((a, b) => {
        const compare = (a.supplier_name || '').localeCompare(b.supplier_name || '');
        return sortOrder === 'asc' ? compare : -compare;
      });
    }
    
    return filtered;
  }, [sortBy, sortOrder, searchQuery, statusFilter]);

  useEffect(() => {
    fetchPurchaseInvoices();
  }, [companySlug]);

  useEffect(() => {
    setLocalInvoices(sortAndFilterInvoices(purchaseInvoices));
  }, [purchaseInvoices, sortAndFilterInvoices]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = sortOptions.find(opt => opt.value === e.target.value);
    if (selected) {
      setSortBy(selected.sortBy);
      setSortOrder(selected.order);
    }
  };

  const handleDownloadPDF = (id: string, _code?: string) => {
    const url = `${api.defaults.baseURL}/purchase-invoices/${id}/download-pdf/`;
    window.open(url, '_blank');
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'paid' : 'pending';
    try {
      await api.post(`/purchase-invoices/${id}/change-status/`, { status: nextStatus });
      setSuccess(`Purchase status updated to ${nextStatus.toUpperCase()}`);
      fetchPurchaseInvoices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to toggle invoice status.');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Filter invoices for the active company
  const companyInvoices = localInvoices.filter(inv => inv.company === activeCompany?.id);

  return (
    <div className="space-y-5">
      {/* Header with Title and Add Button on Right */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Invoices</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage purchases, stock additions, vendor accounts, and ledger liabilities.
          </p>
        </div>
        <button
          onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/purchase-invoice/new`)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Purchase Invoice
        </button>
      </div>

      {/* Search Bar + Sort Dropdown + Status Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code or supplier..."
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
              onClick={() => setSearchQuery('')}
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
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
          {(['all', 'pending', 'paid'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all cursor-pointer capitalize ${
                statusFilter === filter
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-sm text-slate-500">Loading purchase records...</p>
            </div>
          </div>
        ) : companyInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-slate-700">
              {searchQuery ? 'No purchase invoices found matching your search' : 'No purchase invoices found'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {searchQuery ? 'Try adjusting your search terms' : 'Click "New Purchase Invoice" to create the first one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {['Code', 'Date', 'Supplier', 'Account', 'Net Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companyInvoices.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3.5 font-bold text-navy">{inv.purchase_code}</td>
                    <td className="px-4 py-3.5 text-slate-500">{inv.date}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{inv.supplier_name}</td>
                    <td className="px-4 py-3.5 text-slate-500">{inv.account_name}</td>
                    <td className="px-4 py-3.5 font-bold text-navy">Rs. {parseFloat(inv.net_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(inv.id, inv.status)}
                        title="Click to toggle payment status"
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shadow-xs ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {inv.status}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/purchase-invoice/${inv.id}/edit`)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(inv.id, inv.purchase_code)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
                        >
                          Print PDF
                        </button>
                      </div>
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

export default PurchaseInvoiceList;