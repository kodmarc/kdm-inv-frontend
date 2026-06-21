import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import type { CompanyHomeLayoutContextType } from '../CompanyHomeLayout';
import api from '../../../../services/api';

interface DamageReceivingLineItem {
  id?: string;
  item: string;
  item_name?: string;
  item_code?: string;
  manual_code: string;
  issue_units: number;
  pcs: number;
  rate: string;
  amount: string;
  s_tax_rate: string;
  s_tax_amount: string;
  gross_amount: string;
  net_amount: string;
}

interface DamageReceivingItem {
  id: string;
  damage_receiving_code: string;
  date: string;
  salesman: string;
  salesman_name: string;
  party: string;
  party_name: string;
  account: string;
  account_name: string;
  company: string;
  company_name: string;
  status: 'pending' | 'paid';
  remarks?: string;
  s_tax: string;
  net_amount: string;
  ntn?: string;
  gst_no?: string;
  credit_days: number;
  credit_limit: string;
  balance_amount: string;
  line_items: DamageReceivingLineItem[];
  created_at: string;
  updated_at: string;
}

export const DamageReceivingList: React.FC = () => {
  const navigate = useNavigate();
  const { branchSlug, companySlug } = useParams<{ branchSlug: string; companySlug: string }>();

  const {
    activeCompany,
    setSuccess,
    setError
  } = useOutletContext<CompanyHomeLayoutContextType>();

  const [receivings, setReceivings] = useState<DamageReceivingItem[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const fetchReceivings = async () => {
    setIsListLoading(true);
    try {
      const res = await api.get('/damage-receivings/');
      setReceivings(res.data);
    } catch (err) {
      console.error('Failed to fetch damage receivings', err);
    } finally {
      setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivings();
  }, [companySlug]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'paid' : 'pending';
    try {
      await api.post(`/damage-receivings/${id}/change-status/`, { status: nextStatus });
      setSuccess(`Status updated to ${nextStatus.toUpperCase()}`);
      fetchReceivings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to toggle status.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleDownloadPDF = (id: string) => {
    const url = `${api.defaults.baseURL}/damage-receivings/${id}/download-pdf/`;
    window.open(url, '_blank');
  };

  const companyReceivings = receivings.filter(ret => ret.company === activeCompany?.id);

  const filteredReceivings = companyReceivings.filter(ret => {
    const matchesSearch = 
      ret.damage_receiving_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.party_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || ret.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-zinc-100">
        <div>
          <h3 className="text-xl font-bold text-navy tracking-tight">Damage Receiving</h3>
          <p className="text-xs text-muted mt-1 font-medium">
            Manage broken or faulted product returns received from customers, and record cash/outstanding ledger adjustments.
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/damage-receiving/new`)}
            className="cursor-pointer bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 font-bold"
          >
            <span className="text-sm font-bold">+</span> New Damage Receiving
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-6">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            className="w-full text-xs border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-primary placeholder-zinc-400 bg-zinc-50/50 font-medium text-zinc-700"
            placeholder="Search code or customer..."
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
                  ? 'bg-white text-navy shadow-xs font-bold'
                  : 'text-muted hover:text-navy'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {isListLoading ? (
        <div className="py-12 text-center text-xs text-muted font-medium">
          Loading damage receiving list...
        </div>
      ) : filteredReceivings.length === 0 ? (
        <div className="py-12 border border-dashed border-zinc-200 rounded-2xl text-center text-xs text-muted font-medium bg-zinc-50/20">
          No damage receiving vouchers found matching the filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-left">
            <thead>
              <tr className="bg-zinc-50/70">
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Code</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Date</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Customer</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Salesman</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Account</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Total Net Amount</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold tracking-wider text-muted uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs font-medium text-zinc-700">
              {filteredReceivings.map((ret) => (
                <tr key={ret.id} className="hover:bg-zinc-50/40 transition-colors">
                  <td className="px-4 py-3.5 text-navy font-bold">{ret.damage_receiving_code}</td>
                  <td className="px-4 py-3.5 text-zinc-500">{ret.date}</td>
                  <td className="px-4 py-3.5 font-semibold text-zinc-800">{ret.party_name}</td>
                  <td className="px-4 py-3.5 text-zinc-500">{ret.salesman_name}</td>
                  <td className="px-4 py-3.5 text-zinc-500">{ret.account_name}</td>
                  <td className="px-4 py-3.5 font-bold text-navy">
                    Rs. {parseFloat(ret.net_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => handleToggleStatus(ret.id, ret.status)}
                      title="Click to toggle status"
                      className={`cursor-pointer px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all shadow-xs ${
                        ret.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {ret.status}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/damage-receiving/${ret.id}/edit`)}
                        className="cursor-pointer bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(ret.id)}
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
