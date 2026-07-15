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
    { label: 'Date (Latest)', value: 'date_desc', sortBy: 'date', order: 'desc' },
    { label: 'Date (Earliest)', value: 'date_asc', sortBy: 'date', order: 'asc' },
    { label: 'Net Amount (High-Low)', value: 'net_amount_desc', sortBy: 'net_amount', order: 'desc' },
    { label: 'Net Amount (Low-High)', value: 'net_amount_asc', sortBy: 'net_amount', order: 'asc' },
    { label: 'Supplier (A-Z)', value: 'supplier_name_asc', sortBy: 'supplier_name', order: 'asc' },
    { label: 'Supplier (Z-A)', value: 'supplier_name_desc', sortBy: 'supplier_name', order: 'desc' },
  ];

  const getCurrentSortValue = () => {
    const found = sortOptions.find(opt => opt.sortBy === sortBy && opt.order === sortOrder);
    return found ? found.value : 'created_at_desc';
  };

  const sortInvoices = useCallback((data: any[]) => {
    const sorted = [...data];
    if (sortBy === 'created_at') {
      sorted.sort((a, b) => {
        const compare = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'date') {
      sorted.sort((a, b) => {
        const compare = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'net_amount') {
      sorted.sort((a, b) => {
        const aVal = parseFloat(a.net_amount || '0');
        const bVal = parseFloat(b.net_amount || '0');
        const compare = aVal - bVal;
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'supplier_name') {
      sorted.sort((a, b) => {
        const compare = (a.supplier_name || '').localeCompare(b.supplier_name || '');
        return sortOrder === 'asc' ? compare : -compare;
      });
    }
    return sorted;
  }, [sortBy, sortOrder]);

  useEffect(() => {
    fetchPurchaseInvoices();
  }, [companySlug]);

  useEffect(() => {
    setLocalInvoices(sortInvoices(purchaseInvoices));
  }, [purchaseInvoices, sortInvoices]);

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

  // Apply search & status filter
  const filteredInvoices = companyInvoices.filter(inv => {
    const matchesSearch = 
      inv.purchase_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
      {/* Top Header Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-zinc-100">
        <div>
          <h3 className="text-xl font-bold text-navy tracking-tight">Purchase Invoices</h3>
          <p className="text-xs text-muted mt-1 font-medium">
            Manage purchases, stock additions, vendor accounts, and ledger liabilities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-[180px]">
            <select
              value={getCurrentSortValue()}
              onChange={handleSortChange}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/purchase-invoice/new`)}
            className="cursor-pointer bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <span className="text-sm font-bold">+</span> New Purchase Invoice
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            className="w-full text-xs border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-primary placeholder-zinc-400 bg-zinc-50/50"
            placeholder="Search code or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/50">
          {(['all', 'pending', 'paid'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all cursor-pointer capitalize ${
                statusFilter === filter
                  ? 'bg-white text-navy shadow-xs'
                  : 'text-muted hover:text-navy'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-muted font-medium">
          Loading purchase records...
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="py-12 border border-dashed border-zinc-200 rounded-2xl text-center text-xs text-muted font-medium bg-zinc-50/20">
          No purchase invoices found matching filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-left">
            <thead>
              <tr className="bg-zinc-50/70">
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Code</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Date</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Supplier</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Account</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Net Amount</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-medium text-zinc-700">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-50/40 transition-colors">
                  <td className="px-4 py-3.5 text-navy font-bold">{inv.purchase_code}</td>
                  <td className="px-4 py-3.5 text-zinc-500">{inv.date}</td>
                  <td className="px-4 py-3.5 font-semibold text-zinc-800">{inv.supplier_name}</td>
                  <td className="px-4 py-3.5 text-zinc-500">{inv.account_name}</td>
                  <td className="px-4 py-3.5 font-bold text-navy">Rs. {parseFloat(inv.net_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => handleToggleStatus(inv.id, inv.status)}
                      title="Click to toggle payment status"
                      className={`cursor-pointer px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shadow-xs ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {inv.status}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/purchase-invoice/${inv.id}/edit`)}
                        className="cursor-pointer bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(inv.id, inv.purchase_code)}
                        className="cursor-pointer bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
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
  );
};
