import React, { useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import type { CompanyHomeLayoutContextType } from '../CompanyHomeLayout';
import { useAuth } from '../../../../context/AuthContext';
import { Badge } from '../../../../components/ui';
import api from '../../../../services/api';

const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const labelCls = 'block text-xs font-semibold text-slate-700 mb-1.5';

export const PartiesRegistry: React.FC = () => {
  const { user } = useAuth();
  const { branchSlug } = useParams<{ branchSlug: string }>();
  const { parties, fetchParties, setSuccess } = useOutletContext<CompanyHomeLayoutContextType>();

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [regName, setRegName] = useState('');
  const [regContactNo, setRegContactNo] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regIsGlobal, setRegIsGlobal] = useState(false);
  const [regIsSupplier, setRegIsSupplier] = useState(false);
  const [regIsParty, setRegIsParty] = useState(true);
  const [regNtn, setRegNtn] = useState('');
  const [regGstNo, setRegGstNo] = useState('');
  const [regCreditLimit, setRegCreditLimit] = useState('0.00');
  const [regError, setRegError] = useState('');
  const [regFieldErrors, setRegFieldErrors] = useState<Record<string, string>>({});
  const [editName, setEditName] = useState('');
  const [editContactNo, setEditContactNo] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsSupplier, setEditIsSupplier] = useState(false);
  const [editIsParty, setEditIsParty] = useState(false);
  const [editNtn, setEditNtn] = useState('');
  const [editGstNo, setEditGstNo] = useState('');
  const [editCreditLimit, setEditCreditLimit] = useState('0.00');
  const [editError, setEditError] = useState('');
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(''); setRegFieldErrors({}); setIsSubmitting(true);
    const cleanName = regName.trim();
    if (!cleanName) { setIsSubmitting(false); return; }
    const payload: any = {
      name: cleanName, contact_no: regContactNo.trim(), email: regEmail.trim() || null,
      is_supplier: regIsSupplier, is_party: regIsParty,
      ntn: regNtn.trim() || null, gst_no: regGstNo.trim() || null,
      credit_limit: regCreditLimit || '0.00'
    };
    if (user?.role === 'ORG_ADMIN' || user?.role === 'ORG_USER') payload.branch = regIsGlobal ? null : branchSlug;
    try {
      await api.post('/parties/', payload);
      setSuccess('Supplier & Party registered successfully.');
      setRegName(''); setRegContactNo(''); setRegEmail(''); setRegIsGlobal(false);
      setRegIsSupplier(false); setRegIsParty(true); setRegNtn(''); setRegGstNo(''); setRegCreditLimit('0.00');
      setShowRegisterModal(false); fetchParties();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, val]) => { errors[key] = Array.isArray(val) ? val.join(' ') : String(val); });
        setRegFieldErrors(errors);
        if (errors.non_field_errors) setRegError(errors.non_field_errors);
      } else { setRegError('Failed to register supplier / party.'); }
    } finally { setIsSubmitting(false); }
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setEditError(''); setEditFieldErrors({}); setIsSubmitting(true);
    const cleanName = editName.trim();
    if (!cleanName) { setIsSubmitting(false); return; }
    const payload: any = {
      name: cleanName, is_active: editIsActive, contact_no: editContactNo.trim(), email: editEmail.trim() || null,
      is_supplier: editIsSupplier, is_party: editIsParty,
      ntn: editNtn.trim() || null, gst_no: editGstNo.trim() || null,
      credit_limit: editCreditLimit || '0.00'
    };
    try {
      await api.put(`/parties/${editingRecord.id}/`, payload);
      setSuccess('Supplier / Party updated successfully.');
      setEditingRecord(null); fetchParties();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, val]) => { errors[key] = Array.isArray(val) ? val.join(' ') : String(val); });
        setEditFieldErrors(errors);
        if (errors.non_field_errors) setEditError(errors.non_field_errors);
      } else { setEditError('Failed to update supplier / party.'); }
    } finally { setIsSubmitting(false); }
  };

  const openAddModal = () => {
    setRegName(''); setRegContactNo(''); setRegEmail(''); setRegIsGlobal(false);
    setRegIsSupplier(false); setRegIsParty(true); setRegNtn(''); setRegGstNo(''); setRegCreditLimit('0.00');
    setRegError(''); setRegFieldErrors({}); setShowRegisterModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingRecord(item); setEditName(item.name); setEditContactNo(item.contact_no);
    setEditEmail(item.email || ''); setEditIsActive(item.is_active);
    setEditIsSupplier(item.is_supplier); setEditIsParty(item.is_party);
    setEditNtn(item.ntn || ''); setEditGstNo(item.gst_no || '');
    setEditCreditLimit(item.credit_limit || '0.00'); setEditError(''); setEditFieldErrors({});
  };

  const canCreate = user?.role === 'ORG_ADMIN' || user?.role === 'ORG_USER' || user?.role === 'BRANCH_ADMIN';

  const CloseButton = ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers & Parties Registry</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage vendors, retailers, shops, and partners for purchase and sales operations.</p>
        </div>
        {canCreate && (
          <button onClick={openAddModal} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Supplier / Party
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {parties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">No contacts registered</p>
            <p className="mt-1 text-xs text-slate-400">Click "Add Supplier / Party" to register the first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>{['Name', 'Contact', 'Roles', 'NTN / GST', 'Credit Limit', 'Balance', 'Scope', 'Status', 'Actions'].map(h => <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parties.map(item => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">{item.name}</td>
                    <td className="px-5 py-4 text-slate-600">{item.contact_no}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.is_supplier && <Badge color="purple">Supplier</Badge>}
                        {item.is_party && <Badge color="blue">Party</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {item.ntn ? <div>NTN: {item.ntn}</div> : null}
                      {item.gst_no ? <div>GST: {item.gst_no}</div> : null}
                      {!item.ntn && !item.gst_no && '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-600">Rs. {parseFloat(item.credit_limit).toFixed(2)}</td>
                    <td className="px-5 py-4 text-slate-600">Rs. {parseFloat(item.balance_amount).toFixed(2)}</td>
                    <td className="px-5 py-4"><Badge color={item.branch ? 'blue' : 'slate'}>{item.branch ? `Branch: ${item.branch}` : 'Global'}</Badge></td>
                    <td className="px-5 py-4"><Badge color={item.is_active ? 'green' : 'red'}>{item.is_active ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-5 py-4"><button onClick={() => openEditModal(item)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl" style={{ maxHeight: '90vh' }}>
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
              <div><h3 className="text-base font-semibold text-slate-900">Register New Supplier / Party</h3><p className="mt-0.5 text-xs text-slate-400">Add a vendor, retailer, or business contact</p></div>
              <CloseButton onClick={() => setShowRegisterModal(false)} />
            </div>
            <form onSubmit={handleCreateRegister} className="flex flex-col overflow-hidden">
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {regError && <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{regError}</div>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className={labelCls}>Name <span className="text-red-500">*</span></label><input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="e.g. Akbar Traders" required disabled={isSubmitting} className={inputCls} />{regFieldErrors.name && <p className="mt-1 text-[10px] font-semibold text-red-600">{regFieldErrors.name}</p>}</div>
                  <div><label className={labelCls}>Contact No <span className="text-red-500">*</span></label><input type="text" value={regContactNo} onChange={e => setRegContactNo(e.target.value)} placeholder="e.g. 03001234567" required disabled={isSubmitting} className={inputCls} />{regFieldErrors.contact_no && <p className="mt-1 text-[10px] font-semibold text-red-600">{regFieldErrors.contact_no}</p>}</div>
                  <div><label className={labelCls}>Email <span className="text-slate-400 font-normal">(optional)</span></label><input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="e.g. info@example.com" disabled={isSubmitting} className={inputCls} /></div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</p>
                  <div className="flex gap-6">
                    <label className="flex cursor-pointer items-center gap-2.5"><input type="checkbox" id="regIsSupplier" checked={regIsSupplier} onChange={e => setRegIsSupplier(e.target.checked)} disabled={isSubmitting} className="h-4 w-4 rounded border-slate-300 text-blue-600" /><span className="text-sm text-slate-700">Is Supplier (Vendor)</span></label>
                    <label className="flex cursor-pointer items-center gap-2.5"><input type="checkbox" id="regIsParty" checked={regIsParty} onChange={e => setRegIsParty(e.target.checked)} disabled={isSubmitting} className="h-4 w-4 rounded border-slate-300 text-blue-600" /><span className="text-sm text-slate-700">Is Party (Customer)</span></label>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className={labelCls}>NTN</label><input type="text" value={regNtn} onChange={e => setRegNtn(e.target.value)} placeholder="e.g. 1234567-8" disabled={isSubmitting} className={inputCls} /></div>
                  <div><label className={labelCls}>GST No</label><input type="text" value={regGstNo} onChange={e => setRegGstNo(e.target.value)} placeholder="e.g. 12-34-5678-901-23" disabled={isSubmitting} className={inputCls} /></div>
                  <div><label className={labelCls}>Credit Limit (Rs.)</label><input type="number" step="0.01" value={regCreditLimit} onChange={e => setRegCreditLimit(e.target.value)} disabled={isSubmitting} className={inputCls} /></div>
                </div>
                {(user?.role === 'ORG_ADMIN' || user?.role === 'ORG_USER') && (
                  <label className="flex cursor-pointer items-center gap-3">
                    <input type="checkbox" id="regIsGlobal" checked={regIsGlobal} onChange={e => setRegIsGlobal(e.target.checked)} disabled={isSubmitting} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                    <span className="text-sm text-slate-700">Register as Organization-Wide (Global)</span>
                  </label>
                )}
              </div>
              <div className="flex shrink-0 gap-3 border-t border-slate-200 px-6 py-4">
                <button type="button" onClick={() => setShowRegisterModal(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Registering...' : 'Register'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl" style={{ maxHeight: '90vh' }}>
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
              <div><h3 className="text-base font-semibold text-slate-900">Edit Details & Status</h3><p className="mt-0.5 text-xs text-slate-400">{editingRecord.name}</p></div>
              <CloseButton onClick={() => setEditingRecord(null)} />
            </div>
            <form onSubmit={handleUpdateRecord} className="flex flex-col overflow-hidden">
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {editError && <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{editError}</div>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className={labelCls}>Name <span className="text-red-500">*</span></label><input type="text" value={editName} onChange={e => setEditName(e.target.value)} required disabled={isSubmitting} className={inputCls} />{editFieldErrors.name && <p className="mt-1 text-[10px] font-semibold text-red-600">{editFieldErrors.name}</p>}</div>
                  <div><label className={labelCls}>Contact No <span className="text-red-500">*</span></label><input type="text" value={editContactNo} onChange={e => setEditContactNo(e.target.value)} required disabled={isSubmitting} className={inputCls} />{editFieldErrors.contact_no && <p className="mt-1 text-[10px] font-semibold text-red-600">{editFieldErrors.contact_no}</p>}</div>
                  <div><label className={labelCls}>Email</label><input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="optional" disabled={isSubmitting} className={inputCls} /></div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</p>
                  <div className="flex gap-6">
                    <label className="flex cursor-pointer items-center gap-2.5"><input type="checkbox" id="editIsSupplier" checked={editIsSupplier} onChange={e => setEditIsSupplier(e.target.checked)} disabled={isSubmitting} className="h-4 w-4 rounded border-slate-300 text-blue-600" /><span className="text-sm text-slate-700">Is Supplier</span></label>
                    <label className="flex cursor-pointer items-center gap-2.5"><input type="checkbox" id="editIsParty" checked={editIsParty} onChange={e => setEditIsParty(e.target.checked)} disabled={isSubmitting} className="h-4 w-4 rounded border-slate-300 text-blue-600" /><span className="text-sm text-slate-700">Is Party</span></label>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className={labelCls}>NTN</label><input type="text" value={editNtn} onChange={e => setEditNtn(e.target.value)} placeholder="e.g. 1234567-8" disabled={isSubmitting} className={inputCls} /></div>
                  <div><label className={labelCls}>GST No</label><input type="text" value={editGstNo} onChange={e => setEditGstNo(e.target.value)} placeholder="e.g. 12-34-5678-901-23" disabled={isSubmitting} className={inputCls} /></div>
                  <div><label className={labelCls}>Credit Limit (Rs.)</label><input type="number" step="0.01" value={editCreditLimit} onChange={e => setEditCreditLimit(e.target.value)} disabled={isSubmitting} className={inputCls} /></div>
                </div>
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" id="editIsActive" checked={editIsActive} onChange={e => setEditIsActive(e.target.checked)} disabled={isSubmitting} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                  <span className="text-sm text-slate-700">Record is Active (enabled for transactions)</span>
                </label>
              </div>
              <div className="flex shrink-0 gap-3 border-t border-slate-200 px-6 py-4">
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
