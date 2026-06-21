import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import type { CompanyHomeLayoutContextType } from '../CompanyHomeLayout';
import api from '../../../../services/api';

export const SalesInvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const { branchSlug, companySlug } = useParams<{ branchSlug: string; companySlug: string }>();
  
  const {
    salesInvoices,
    fetchSalesInvoices,
    activeCompany,
    isLoading,
    setSuccess,
    setError
  } = useOutletContext<CompanyHomeLayoutContextType>();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    fetchSalesInvoices();
  }, [companySlug]);

  const handleDownloadPDF = (id: string, _code?: string, type: 'regular' | 'booker' | 's_tax' = 'regular') => {
    const url = `${api.defaults.baseURL}/sales-invoices/${id}/download-pdf/?type=${type}`;
    window.open(url, '_blank');
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'paid' : 'pending';
    try {
      await api.post(`/sales-invoices/${id}/change-status/`, { status: nextStatus });
      setSuccess(`Invoice status updated to ${nextStatus.toUpperCase()}`);
      fetchSalesInvoices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to toggle invoice status.');
      setTimeout(() => setError(''), 4000);
    }
  };

  // Filter invoices for the active company
  const companyInvoices = salesInvoices.filter(inv => inv.company === activeCompany?.id);

  // Apply search & status filter
  const filteredInvoices = companyInvoices.filter(inv => {
    const matchesSearch = 
      inv.sale_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.party_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
      {/* Top Header Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-zinc-100">
        <div>
          <h3 className="text-xl font-bold text-navy tracking-tight">Sales Invoices</h3>
          <p className="text-xs text-muted mt-1 font-medium">
            Browse sale records, update payment states, and print invoice documents.
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/sales-invoice/new`)}
            className="cursor-pointer bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <span className="text-sm font-bold">+</span> New Sales Invoice
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            className="w-full text-xs border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-primary placeholder-zinc-400 bg-zinc-50/50"
            placeholder="Search code or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tab Filters */}
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
          Loading sales records...
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="py-12 border border-dashed border-zinc-200 rounded-2xl text-center text-xs text-muted font-medium bg-zinc-50/20">
          No sales invoices found matching filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-left">
            <thead>
              <tr className="bg-zinc-50/70">
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Code</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Date</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Customer</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Account</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Net Amount</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-medium text-zinc-700">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-50/40 transition-colors">
                  <td className="px-4 py-3.5 text-navy font-bold">{inv.sale_code}</td>
                  <td className="px-4 py-3.5 text-zinc-500">{inv.date}</td>
                  <td className="px-4 py-3.5 font-semibold text-zinc-800">{inv.party_name}</td>
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
                      {/* Edit Button */}
                      <button
                        onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/sales-invoice/${inv.id}/edit`)}
                        className="cursor-pointer bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        Edit
                      </button>

                      {/* PDF Print Options */}
                      <div className="relative group inline-block">
                        <button
                          className="cursor-pointer bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                        >
                          Print <span>▼</span>
                        </button>
                        
                        {/* Print Dropdown */}
                        <div className="absolute right-0 bottom-full mb-1 w-32 bg-white border border-zinc-200 rounded-xl shadow-lg hidden group-hover:block z-50 py-1 text-left">
                          <button
                            onClick={() => handleDownloadPDF(inv.id, inv.sale_code, 'regular')}
                            className="cursor-pointer w-full text-[10px] font-bold text-zinc-700 hover:bg-zinc-50 px-3 py-2 border-b border-zinc-100 text-left"
                          >
                            Regular PDF
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(inv.id, inv.sale_code, 'booker')}
                            className="cursor-pointer w-full text-[10px] font-bold text-zinc-700 hover:bg-zinc-50 px-3 py-2 border-b border-zinc-100 text-left"
                          >
                            Booker Copy
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(inv.id, inv.sale_code, 's_tax')}
                            className="cursor-pointer w-full text-[10px] font-bold text-zinc-700 hover:bg-zinc-50 px-3 py-2 text-left"
                          >
                            Sales Tax PDF
                          </button>
                        </div>
                      </div>
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
