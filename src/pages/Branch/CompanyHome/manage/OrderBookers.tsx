import React, { useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import type { CompanyHomeLayoutContextType } from '../CompanyHomeLayout';
import { useAuth } from '../../../../context/AuthContext';
import { Badge } from '../../../../components/ui';
import api from '../../../../services/api';

const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const labelCls = 'block text-xs font-semibold text-slate-700 mb-1.5';

export const OrderBookers: React.FC = () => {
  const { user } = useAuth();
  const { branchSlug } = useParams<{ branchSlug: string }>();
  const { orderBookers, fetchOrderBookers, setSuccess } = useOutletContext<CompanyHomeLayoutContextType>();

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [regName, setRegName] = useState('');
  const [regContactNo, setRegContactNo] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regIsGlobal, setRegIsGlobal] = useState(false);
  const [regError, setRegError] = useState('');
  const [regFieldErrors, setRegFieldErrors] = useState<Record<string, string>>({});
  const [editName, setEditName] = useState('');
  const [editContactNo, setEditContactNo] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editError, setEditError] = useState('');
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(''); setRegFieldErrors({}); setIsSubmitting(true);
    const cleanName = regName.trim();
    if (!cleanName) { setIsSubmitting(false); return; }
    const payload: any = { name: cleanName, contact_no: regContactNo.trim(), email: regEmail.trim() || null };
    if (user?.role === 'ORG_ADMIN' || user?.role === 'ORG_USER') payload.branch = regIsGlobal ? null : branchSlug;
    try {
      await api.post('/order-bookers/', payload);
      setSuccess('Order booker registered successfully.');
      setRegName(''); setRegContactNo(''); setRegEmail(''); setRegIsGlobal(false);
      setShowRegisterModal(false); fetchOrderBookers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, val]) => { errors[key] = Array.isArray(val) ? val.join(' ') : String(val); });
        setRegFieldErrors(errors);
        if (errors.non_field_errors) setRegError(errors.non_field_errors);
      } else { setRegError('Failed to register order booker.'); }
    } finally { setIsSubmitting(false); }
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setEditError(''); setEditFieldErrors({}); setIsSubmitting(true);
    const cleanName = editName.trim();
    if (!cleanName) { setIsSubmitting(false); return; }
    const payload: any = { name: cleanName, is_active: editIsActive, contact_no: editContactNo.trim(), email: editEmail.trim() || null };
    try {
      await api.put(`/order-bookers/${editingRecord.id}/`, payload);
      setSuccess('Order booker updated successfully.');
      setEditingRecord(null); fetchOrderBookers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, val]) => { errors[key] = Array.isArray(val) ? val.join(' ') : String(val); });
        setEditFieldErrors(errors);
        if (errors.non_field_errors) setEditError(errors.non_field_errors);
      } else { setEditError('Failed to update order booker.'); }
    } finally { setIsSubmitting(false); }
  };

  const openAddModal = () => { setRegName(''); setRegContactNo(''); setRegEmail(''); setRegIsGlobal(false); setRegError(''); setRegFieldErrors({}); setShowRegisterModal(true); };
  const openEditModal = (item: any) => { setEditingRecord(item); setEditName(item.name); setEditContactNo(item.contact_no); setEditEmail(item.email || ''); setEditIsActive(item.is_active); setEditError(''); setEditFieldErrors({}); };

  const canCreate = user?.role === 'ORG_ADMIN' || user?.role === 'ORG_USER' || user?.role === 'BRANCH_ADMIN';

  const ModalShell = ({ title, subtitle, onClose, onSubmit, error, fieldErrors, children }: any) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div><h3 className="text-base font-semibold text-slate-900">{title}</h3><p className="mt-0.5 text-xs text-slate-400">{subtitle}</p></div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="space-y-4 p-6">
            {error && <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>}
            {children(fieldErrors)}
          </div>
          <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Bookers</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage individuals responsible for taking orders.</p>
        </div>
        {canCreate && (
          <button onClick={openAddModal} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Order Booker
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {orderBookers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-semibold text-slate-700">No order bookers registered</p>
            <p className="mt-1 text-xs text-slate-400">Click "Add Order Booker" to register the first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>{['Name', 'Contact No', 'Email', 'Scope', 'Status', 'Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orderBookers.map(item => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-slate-600">{item.contact_no}</td>
                    <td className="px-6 py-4 text-slate-500">{item.email || '—'}</td>
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

      {showRegisterModal && (
        <ModalShell title="Register New Order Booker" subtitle="Add an order booker to this branch" onClose={() => setShowRegisterModal(false)} onSubmit={handleCreateRegister} error={regError} fieldErrors={regFieldErrors}>
          {(fe: any) => (<>
            <div><label className={labelCls}>Name <span className="text-red-500">*</span></label><input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="e.g. John Doe" required disabled={isSubmitting} className={inputCls} />{fe.name && <p className="mt-1 text-[10px] font-semibold text-red-600">{fe.name}</p>}</div>
            <div><label className={labelCls}>Contact No <span className="text-red-500">*</span></label><input type="text" value={regContactNo} onChange={e => setRegContactNo(e.target.value)} placeholder="e.g. 03001234567" required disabled={isSubmitting} className={inputCls} />{fe.contact_no && <p className="mt-1 text-[10px] font-semibold text-red-600">{fe.contact_no}</p>}</div>
            <div><label className={labelCls}>Email <span className="text-slate-400 font-normal">(optional)</span></label><input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="e.g. john@example.com" disabled={isSubmitting} className={inputCls} /></div>
            {(user?.role === 'ORG_ADMIN' || user?.role === 'ORG_USER') && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={regIsGlobal} onChange={e => setRegIsGlobal(e.target.checked)} disabled={isSubmitting} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                <span className="text-sm text-slate-700">Register as Global (all branches)</span>
              </label>
            )}
          </>)}
        </ModalShell>
      )}

      {editingRecord && (
        <ModalShell title="Edit Order Booker" subtitle="Update details and status" onClose={() => setEditingRecord(null)} onSubmit={handleUpdateRecord} error={editError} fieldErrors={editFieldErrors}>
          {(fe: any) => (<>
            <div><label className={labelCls}>Name <span className="text-red-500">*</span></label><input type="text" value={editName} onChange={e => setEditName(e.target.value)} required disabled={isSubmitting} className={inputCls} />{fe.name && <p className="mt-1 text-[10px] font-semibold text-red-600">{fe.name}</p>}</div>
            <div><label className={labelCls}>Contact No <span className="text-red-500">*</span></label><input type="text" value={editContactNo} onChange={e => setEditContactNo(e.target.value)} required disabled={isSubmitting} className={inputCls} />{fe.contact_no && <p className="mt-1 text-[10px] font-semibold text-red-600">{fe.contact_no}</p>}</div>
            <div><label className={labelCls}>Email <span className="text-slate-400 font-normal">(optional)</span></label><input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="optional" disabled={isSubmitting} className={inputCls} /></div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" id="editIsActive" checked={editIsActive} onChange={e => setEditIsActive(e.target.checked)} disabled={isSubmitting} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
              <span className="text-sm text-slate-700">Record is Active</span>
            </label>
          </>)}
        </ModalShell>
      )}
    </div>
  );
};
