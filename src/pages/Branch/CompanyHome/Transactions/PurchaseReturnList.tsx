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

export const PurchaseReturnList: React.FC = () => {
  const navigate = useNavigate();
  const { branchSlug, companySlug } = useParams<{ branchSlug: string; companySlug: string }>();

  const {
    activeCompany,
    setSuccess,
    setError
  } = useOutletContext<CompanyHomeLayoutContextType>();

  const [returns, setReturns] = useState<any[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [returnTypeFilter, setReturnTypeFilter] = useState<'all' | 'normal' | 'damage'>('all');
  
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [localReturns, setLocalReturns] = useState<any[]>([]);

  const sortOptions: SortOption[] = [
    { label: 'Newest First', value: 'created_at_desc', sortBy: 'created_at', order: 'desc' },
    { label: 'Oldest First', value: 'created_at_asc', sortBy: 'created_at', order: 'asc' },
    { label: 'Net Amount (High-Low)', value: 'net_amount_desc', sortBy: 'net_amount', order: 'desc' },
    { label: 'Net Amount (Low-High)', value: 'net_amount_asc', sortBy: 'net_amount', order: 'asc' },
    { label: 'Supplier (A-Z)', value: 'supplier_name_asc', sortBy: 'supplier_name', order: 'asc' },
    { label: 'Supplier (Z-A)', value: 'supplier_name_desc', sortBy: 'supplier_name', order: 'desc' },
  ];

  const statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
  ];

  const typeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'Normal', value: 'normal' },
    { label: 'Damage', value: 'damage' },
  ];

  const getCurrentSortValue = () => {
    const found = sortOptions.find(opt => opt.sortBy === sortBy && opt.order === sortOrder);
    return found ? found.value : 'created_at_desc';
  };

  const sortAndFilterReturns = useCallback((data: any[]) => {
    let filtered = [...data];
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(ret =>
        ret.purchase_return_code?.toLowerCase().includes(q) ||
        ret.supplier_name?.toLowerCase().includes(q)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ret => ret.status === statusFilter);
    }
    
    if (returnTypeFilter !== 'all') {
      filtered = filtered.filter(ret => ret.return_type === returnTypeFilter);
    }
    
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
  }, [sortBy, sortOrder, searchQuery, statusFilter, returnTypeFilter]);

  const fetchReturns = async () => {
    setIsListLoading(true);
    try {
      const res = await api.get('/purchase-returns/');
      setReturns(res.data);
    } catch (err) {
      console.error('Failed to fetch purchase returns', err);
    } finally {
      setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [companySlug]);

  useEffect(() => {
    setLocalReturns(sortAndFilterReturns(returns));
  }, [returns, sortAndFilterReturns]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = sortOptions.find(opt => opt.value === e.target.value);
    if (selected) {
      setSortBy(selected.sortBy);
      setSortOrder(selected.order);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'paid' : 'pending';
    try {
      await api.post(`/purchase-returns/${id}/change-status/`, { status: nextStatus });
      setSuccess(`Status updated to ${nextStatus.toUpperCase()}`);
      fetchReturns();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to toggle status.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleDownloadPDF = (id: string) => {
    const url = `${api.defaults.baseURL}/purchase-returns/${id}/download-pdf/`;
    window.open(url, '_blank');
  };

  const companyReturns = localReturns.filter(ret => ret.company === activeCompany?.id);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Returns</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage product returns to suppliers, capture credit adjustments, and verify refund receipts.
          </p>
        </div>
        <button
          onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/purchase-return/new`)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Purchase Return
        </button>
      </div>

      {/* Filters - All Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search return code or supplier..."
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

        {/* Sort Dropdown */}
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

        {/* Status Dropdown */}
        <div className="min-w-[140px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'paid')}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Type Dropdown */}
        <div className="min-w-[140px]">
          <select
            value={returnTypeFilter}
            onChange={(e) => setReturnTypeFilter(e.target.value as 'all' | 'normal' | 'damage')}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isListLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-sm text-slate-500">Loading purchase returns...</p>
            </div>
          </div>
        ) : companyReturns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-slate-700">
              {searchQuery ? 'No purchase returns found matching your search' : 'No purchase returns found'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {searchQuery ? 'Try adjusting your search terms' : 'Click "New Purchase Return" to create the first one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {['Code', 'Date', 'Party Inv. #', 'Supplier', 'Account', 'Net Amount', 'Type', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companyReturns.map((ret) => (
                  <tr key={ret.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3.5 font-bold text-navy">{ret.purchase_return_code}</td>
                    <td className="px-4 py-3.5 text-slate-500">{ret.date}</td>
                    <td className="px-4 py-3.5 text-slate-500">{ret.party_inv_no || '—'}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{ret.supplier_name}</td>
                    <td className="px-4 py-3.5 text-slate-500">{ret.account_name}</td>
                    <td className="px-4 py-3.5 font-bold text-navy">Rs. {parseFloat(ret.net_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    
                    {/* ✅ Type Column */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shadow-xs ${
                        ret.return_type === 'damage'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {ret.return_type || 'normal'}
                      </span>
                    </td>
                    
                    {/* ✅ Status Column - Pending = Red, Paid = Green */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(ret.id, ret.status)}
                        title="Click to toggle payment status"
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shadow-xs ${
                          ret.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {ret.status}
                      </button>
                    </td>
                    
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/purchase-return/${ret.id}/edit`)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(ret.id)}
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

export default PurchaseReturnList;