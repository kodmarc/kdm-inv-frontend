import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import type { CompanyHomeLayoutContextType } from '../CompanyHomeLayout';
import { useAuth } from '../../../../context/AuthContext';
import { Badge } from '../../../../components/ui';
import api from '../../../../services/api';

const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const labelCls = 'block text-xs font-semibold text-slate-700 mb-1.5';

type SortOption = {
  label: string;
  value: string;
  sortBy: string;
  order: 'asc' | 'desc';
};

export const AccountsOpening: React.FC = () => {
  const { user } = useAuth();
  const { branchSlug } = useParams<{ branchSlug: string }>();
  const { accounts, fetchAccounts, setSuccess } = useOutletContext<CompanyHomeLayoutContextType>();

  const [localAccounts, setLocalAccounts] = useState<any[]>([]);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [accName, setAccName] = useState('');
  const [accCode, setAccCode] = useState('');
  const [accOpeningBalance, setAccOpeningBalance] = useState('');
  const [accIsGlobal, setAccIsGlobal] = useState(false);
  const [accError, setAccError] = useState('');
  const [accFieldErrors, setAccFieldErrors] = useState<Record<string, string>>({});
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editError, setEditError] = useState('');
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sorting states
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const sortOptions: SortOption[] = [
    { label: 'Account Name (A-Z)', value: 'name_asc', sortBy: 'name', order: 'asc' },
    { label: 'Account Name (Z-A)', value: 'name_desc', sortBy: 'name', order: 'desc' },
    { label: 'Balance (Low-High)', value: 'balance_asc', sortBy: 'balance', order: 'asc' },
    { label: 'Balance (High-Low)', value: 'balance_desc', sortBy: 'balance', order: 'desc' },
    { label: 'Opening Balance (Low-High)', value: 'opening_balance_asc', sortBy: 'opening_balance', order: 'asc' },
    { label: 'Opening Balance (High-Low)', value: 'opening_balance_desc', sortBy: 'opening_balance', order: 'desc' },
  ];

  const getCurrentSortValue = () => {
    const found = sortOptions.find(opt => opt.sortBy === sortBy && opt.order === sortOrder);
    return found ? found.value : 'name_asc';
  };

  const sortAccounts = useCallback((data: any[]) => {
    let filtered = [...data];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.code.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'name') {
      filtered.sort((a, b) => {
        const compare = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'balance') {
      filtered.sort((a, b) => {
        const aVal = parseFloat(a.balance || '0');
        const bVal = parseFloat(b.balance || '0');
        const compare = aVal - bVal;
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'opening_balance') {
      filtered.sort((a, b) => {
        const aVal = parseFloat(a.opening_balance || '0');
        const bVal = parseFloat(b.opening_balance || '0');
        const compare = aVal - bVal;
        return sortOrder === 'asc' ? compare : -compare;
      });
    }
    return filtered;
  }, [sortBy, sortOrder, searchQuery]);

  useEffect(() => {
    setLocalAccounts(sortAccounts(accounts));
  }, [accounts, sortAccounts]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = sortOptions.find(opt => opt.value === e.target.value);
    if (selected) {
      setSortBy(selected.sortBy);
      setSortOrder(selected.order);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccError(''); setAccFieldErrors({}); setIsSubmitting(true);
    const cleanName = accName.trim();
    if (!cleanName) { setIsSubmitting(false); return; }
    const payload: any = { name: cleanName, opening_balance: accOpeningBalance ? accOpeningBalance : '0.00' };
    if (accCode.trim()) payload.code = accCode.trim();
    if (user?.role === 'ORG_ADMIN' || user?.role === 'ORG_USER') payload.branch = accIsGlobal ? null : branchSlug;
    try {
      await api.post('/accounts/', payload);
      setSuccess('Ledger account registered successfully.');
      setAccName(''); setAccCode(''); setAccOpeningBalance(''); setAccIsGlobal(false);
      setShowAccountModal(false); fetchAccounts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, val]) => { errors[key] = Array.isArray(val) ? val.join(' ') : String(val); });
        setAccFieldErrors(errors);
        if (errors.non_field_errors) setAccError(errors.non_field_errors);
      } else { setAccError('Failed to register ledger account.'); }
    } finally { setIsSubmitting(false); }
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setEditError(''); setEditFieldErrors({}); setIsSubmitting(true);
    const cleanName = editName.trim();
    if (!cleanName) { setIsSubmitting(false); return; }
    const payload: any = { name: cleanName, is_active: editIsActive };
    if (editCode.trim()) payload.code = editCode.trim();
    try {
      await api.put(`/accounts/${editingRecord.id}/`, payload);
      setSuccess('Ledger account updated successfully.');
      setEditingRecord(null); fetchAccounts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, val]) => { errors[key] = Array.isArray(val) ? val.join(' ') : String(val); });
        setEditFieldErrors(errors);
        if (errors.non_field_errors) setEditError(errors.non_field_errors);
      } else { setEditError('Failed to update ledger account.'); }
    } finally { setIsSubmitting(false); }
  };

  const openAddModal = () => { setAccName(''); setAccCode(''); setAccOpeningBalance(''); setAccIsGlobal(false); setAccError(''); setAccFieldErrors({}); setShowAccountModal(true); };
  const openEditModal = (item: any) => { setEditingRecord(item); setEditName(item.name); setEditCode(item.code); setEditIsActive(item.is_active); setEditError(''); setEditFieldErrors({}); };

  const canCreate = user?.role === 'ORG_ADMIN' || user?.role === 'ORG_USER' || user?.role === 'BRANCH_ADMIN';

  const CloseButton = ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chart of Accounts / Ledger</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage organization and branch ledger accounts.</p>
        </div>
        {canCreate && (
          <button onClick={openAddModal} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Account
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by account name or code..."
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
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {localAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">No ledger accounts registered</p>
            <p className="mt-1 text-xs text-slate-400">Click "Add Account" to register the first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>{['Code', 'Account Name', 'Opening Balance', 'Current Balance', 'Scope', 'Status', 'Actions'].map(h => <th key={h} className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localAccounts.map(item => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4"><code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono text-slate-600">{item.code}</code></td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-slate-600">Rs. {item.opening_balance}</td>
                    <td className="px-6 py-4 text-slate-600">Rs. {item.balance}</td>
                    <td className="px-6 py-4"><Badge color={item.branch ? 'blue' : 'slate'}>{item.branch ? `Branch: ${item.branch}` : 'Global'}</Badge></td>
                    <td className="px-6 py-4"><Badge color={item.is_active ? 'green' : 'red'}>{item.is_active ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-6 py-4"><button onClick={() => openEditModal(item)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div><h3 className="text-base font-semibold text-slate-900">Register New Ledger Account</h3><p className="mt-0.5 text-xs text-slate-400">Add an account to the chart of accounts</p></div>
              <CloseButton onClick={() => setShowAccountModal(false)} />
            </div>
            <form onSubmit={handleCreateAccount}>
              <div className="space-y-4 p-6">
                {accError && <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{accError}</div>}
                <div><label className={labelCls}>Account Name <span className="text-red-500">*</span></label><input type="text" value={accName} onChange={e => setAccName(e.target.value)} placeholder="e.g. Sales Account, Rent Expense" required disabled={isSubmitting} className={inputCls} />{accFieldErrors.name && <p className="mt-1 text-[10px] font-semibold text-red-600">{accFieldErrors.name}</p>}</div>
                <div><label className={labelCls}>Manual Code <span className="text-slate-400 font-normal">(optional)</span></label><input type="text" value={accCode} onChange={e => setAccCode(e.target.value)} placeholder="Leave blank for auto-generated code" disabled={isSubmitting} className={inputCls} />{accFieldErrors.code && <p className="mt-1 text-[10px] font-semibold text-red-600">{accFieldErrors.code}</p>}</div>
                <div><label className={labelCls}>Opening Balance <span className="text-slate-400 font-normal">(optional)</span></label><input type="text" value={accOpeningBalance} onChange={e => setAccOpeningBalance(e.target.value)} placeholder="e.g. 15000.00" disabled={isSubmitting} className={inputCls} />{accFieldErrors.opening_balance && <p className="mt-1 text-[10px] font-semibold text-red-600">{accFieldErrors.opening_balance}</p>}</div>
                {(user?.role === 'ORG_ADMIN' || user?.role === 'ORG_USER') && (
                  <label className="flex cursor-pointer items-center gap-3">
                    <input type="checkbox" id="accIsGlobal" checked={accIsGlobal} onChange={e => setAccIsGlobal(e.target.checked)} disabled={isSubmitting} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                    <span className="text-sm text-slate-700">Create as Organization-Wide (Global)</span>
                  </label>
                )}
              </div>
              <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
                <button type="button" onClick={() => setShowAccountModal(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Registering...' : 'Register Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div><h3 className="text-base font-semibold text-slate-900">Edit Account Details</h3><p className="mt-0.5 text-xs text-slate-400">{editingRecord.name}</p></div>
              <CloseButton onClick={() => setEditingRecord(null)} />
            </div>
            <form onSubmit={handleUpdateRecord}>
              <div className="space-y-4 p-6">
                {editError && <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{editError}</div>}
                <div><label className={labelCls}>Account Name <span className="text-red-500">*</span></label><input type="text" value={editName} onChange={e => setEditName(e.target.value)} required disabled={isSubmitting} className={inputCls} />{editFieldErrors.name && <p className="mt-1 text-[10px] font-semibold text-red-600">{editFieldErrors.name}</p>}</div>
                <div><label className={labelCls}>Code <span className="text-red-500">*</span></label><input type="text" value={editCode} onChange={e => setEditCode(e.target.value)} required disabled={isSubmitting} className={inputCls} />{editFieldErrors.code && <p className="mt-1 text-[10px] font-semibold text-red-600">{editFieldErrors.code}</p>}</div>
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" id="editIsActive" checked={editIsActive} onChange={e => setEditIsActive(e.target.checked)} disabled={isSubmitting} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                  <span className="text-sm text-slate-700">Record is Active (enabled for transactions)</span>
                </label>
              </div>
              <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
                <button type="button" onClick={() => setEditingRecord(null)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};  