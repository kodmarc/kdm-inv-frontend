import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import type { CompanyHomeLayoutContextType } from '../CompanyHomeLayout';
import api from '../../../../services/api';

type SortOption = {
  label: string;
  value: string;
  sortBy: string;
  order: 'asc' | 'desc';
};

export const SalesReturnList: React.FC = () => {
  const navigate = useNavigate();
  const { branchSlug, companySlug } = useParams<{ branchSlug: string; companySlug: string }>();

  // ✅ Only import what's actually used
  const {
    activeCompany,
    accounts,
    salesReturns,
    fetchSalesReturns,
    isLoading: contextLoading
  } = useOutletContext<CompanyHomeLayoutContextType>();

  // ❌ REMOVED: setSuccess, setError (not used)

  const [searchQuery, setSearchQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [returnTypeFilter, setReturnTypeFilter] = useState<'all' | 'normal' | 'damage'>('all');
  
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [localReturns, setLocalReturns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sortOptions: SortOption[] = [
    { label: 'None', value: 'none', sortBy: 'none', order: 'desc' },
    { label: 'Newest First', value: 'created_at_desc', sortBy: 'created_at', order: 'desc' },
    { label: 'Oldest First', value: 'created_at_asc', sortBy: 'created_at', order: 'asc' },
    { label: 'Net Amount (High-Low)', value: 'net_amount_desc', sortBy: 'net_amount', order: 'desc' },
    { label: 'Net Amount (Low-High)', value: 'net_amount_asc', sortBy: 'net_amount', order: 'asc' },
    { label: 'Customer (A-Z)', value: 'party_name_asc', sortBy: 'party_name', order: 'asc' },
    { label: 'Customer (Z-A)', value: 'party_name_desc', sortBy: 'party_name', order: 'desc' },
    { label: 'Salesman (A-Z)', value: 'salesman_name_asc', sortBy: 'salesman_name', order: 'asc' },
    { label: 'Salesman (Z-A)', value: 'salesman_name_desc', sortBy: 'salesman_name', order: 'desc' },
  ];

  const accountOptions = useMemo(() => {
    const opts = [{ label: 'All Accounts', value: 'all' }];
    accounts.forEach(acc => {
      opts.push({ label: `${acc.name} (${acc.code})`, value: acc.id });
    });
    return opts;
  }, [accounts]);

  const statusOptions = [
    { label: 'All Status', value: 'all' },
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

  // ✅ Optimized sorting and filtering
  const sortAndFilterReturns = useCallback((data: any[]) => {
    let filtered = [...data];
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(ret =>
        ret.sales_return_code?.toLowerCase().includes(q) ||
        ret.party_name?.toLowerCase().includes(q)
      );
    }
    
    if (accountFilter !== 'all') {
      filtered = filtered.filter(ret => ret.account === accountFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ret => ret.status === statusFilter);
    }
    
    if (returnTypeFilter !== 'all') {
      filtered = filtered.filter(ret => ret.return_type === returnTypeFilter);
    }
    
    if (sortBy !== 'none') {
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
      } else if (sortBy === 'party_name') {
        filtered.sort((a, b) => {
          const compare = (a.party_name || '').localeCompare(b.party_name || '');
          return sortOrder === 'asc' ? compare : -compare;
        });
      } else if (sortBy === 'salesman_name') {
        filtered.sort((a, b) => {
          const compare = (a.salesman_name || '').localeCompare(b.salesman_name || '');
          return sortOrder === 'asc' ? compare : -compare;
        });
      }
    }
    
    return filtered;
  }, [sortBy, sortOrder, searchQuery, accountFilter, statusFilter, returnTypeFilter]);

  // ✅ Load from context - NO API CALL!
  useEffect(() => {
    if (salesReturns.length > 0) {
      setLocalReturns(sortAndFilterReturns(salesReturns));
      setIsLoading(false);
    } else if (!contextLoading) {
      fetchSalesReturns().then(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(true);
    }
  }, [salesReturns, sortAndFilterReturns, fetchSalesReturns, contextLoading]);

  // ✅ Re-filter when filters change
  useEffect(() => {
    if (salesReturns.length > 0) {
      setLocalReturns(sortAndFilterReturns(salesReturns));
    }
  }, [sortAndFilterReturns, salesReturns]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = sortOptions.find(opt => opt.value === e.target.value);
    if (selected) {
      setSortBy(selected.sortBy);
      setSortOrder(selected.order);
    }
  };

  const handleDownloadPDF = (id: string) => {
    const url = `${api.defaults.baseURL}/sales-returns/${id}/download-pdf/`;
    window.open(url, '_blank');
  };

  // ✅ Click on row - navigates to VIEW mode (read-only)
  const handleRowClick = (id: string) => {
    navigate(`/branch/${branchSlug}/company/${companySlug}/sales-return/${id}`);
  };

  const handleEditClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/branch/${branchSlug}/company/${companySlug}/sales-return/${id}/edit`);
  };

  const companyReturns = useMemo(() => {
    return localReturns.filter(ret => ret.company === activeCompany?.id);
  }, [localReturns, activeCompany]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Returns</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage product returns from customers, record credit adjustments, and verify refund receipts.
          </p>
        </div>
        <button
          onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/sales-return/new`)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Sales Return
        </button>
      </div>

      {/* Search bar - max width full */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[250px] max-w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search return code or customer..."
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

        <div className="min-w-[150px]">
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

        <div className="min-w-[150px]">
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {accountOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[130px]">
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

        <div className="min-w-[130px]">
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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Salesman</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Account</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Net Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                      <span className="ml-3 text-sm text-slate-500">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : companyReturns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-500">
                    {searchQuery ? 'No sales returns found matching your search' : 'No sales returns found'}
                  </td>
                </tr>
              ) : (
                companyReturns.map((ret) => (
                  <tr 
                    key={ret.id} 
                    className="transition-colors hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleRowClick(ret.id)}
                  >
                    <td className="px-4 py-3.5 font-bold text-navy">{ret.sales_return_code}</td>
                    <td className="px-4 py-3.5 text-slate-500">{ret.date}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800 truncate max-w-[180px]">{ret.party_name}</td>
                    <td className="px-4 py-3.5 text-slate-500 truncate max-w-[140px]">{ret.salesman_name}</td>
                    <td className="px-4 py-3.5 text-slate-500 truncate max-w-[160px]">{ret.account_name}</td>
                    <td className="px-4 py-3.5 font-bold text-navy text-right">Rs. {parseFloat(ret.net_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shadow-xs ${
                        ret.return_type === 'damage'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {ret.return_type || 'normal'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shadow-xs ${
                        ret.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleEditClick(ret.id, e)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReturnList;