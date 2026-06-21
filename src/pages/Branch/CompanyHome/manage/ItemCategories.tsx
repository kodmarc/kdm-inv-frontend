import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { CompanyHomeLayoutContextType } from '../CompanyHomeLayout';
import { useAuth } from '../../../../context/AuthContext';
import { Badge } from '../../../../components/ui';
import api from '../../../../services/api';

const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const labelCls = 'block text-xs font-semibold text-slate-700 mb-1.5';
const textareaCls = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none';

export const ItemCategories: React.FC = () => {
  const { user } = useAuth();
  const { categories, fetchCategories, setSuccess } = useOutletContext<CompanyHomeLayoutContextType>();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [modalCategoryError, setModalCategoryError] = useState('');
  const [categoryFieldErrors, setCategoryFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => { setCategoryName(''); setCategoryCode(''); setCategoryDesc(''); setModalCategoryError(''); setCategoryFieldErrors({}); };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalCategoryError(''); setCategoryFieldErrors({}); setIsSubmitting(true);
    const cleanName = categoryName.trim();
    if (!cleanName) { setIsSubmitting(false); return; }
    const payload: any = { name: cleanName, description: categoryDesc.trim() || null };
    if (categoryCode.trim()) payload.code = categoryCode.trim();
    try {
      await api.post('/item-categories/', payload);
      setSuccess('Item category registered successfully.');
      resetForm(); setShowCategoryModal(false); fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, val]) => { errors[key] = Array.isArray(val) ? val.join(' ') : String(val); });
        setCategoryFieldErrors(errors);
        if (errors.non_field_errors) setModalCategoryError(errors.non_field_errors);
      } else { setModalCategoryError('Failed to register category.'); }
    } finally { setIsSubmitting(false); }
  };

  const canCreate = user?.item_creation_policy === 'BRANCH_ADMIN' && user?.role === 'BRANCH_ADMIN';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Item Categories</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Scoping: <span className="font-medium">{user?.item_creation_policy === 'ORG_ADMIN' ? 'Centralized (HQ Managed)' : 'Decentralized (Branch Managed)'}</span>
          </p>
        </div>
        {canCreate && (
          <button onClick={() => { resetForm(); setShowCategoryModal(true); }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Category
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">No categories in catalog scope</p>
            <p className="mt-1 text-xs text-slate-400">{canCreate ? 'Click "Add Category" to create the first one.' : 'Categories are managed by HQ.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {['Category Name', 'Category Code', 'Description', 'Scope'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map(cat => (
                  <tr key={cat.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{cat.name}</td>
                    <td className="px-6 py-4"><code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono text-slate-600">{cat.code}</code></td>
                    <td className="px-6 py-4 text-slate-500">{cat.description || '—'}</td>
                    <td className="px-6 py-4"><Badge color={cat.branch ? 'blue' : 'slate'}>{cat.branch ? `Branch: ${cat.branch}` : 'Global'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Register Item Category</h3>
                <p className="mt-0.5 text-xs text-slate-400">Create a new category for grouping items</p>
              </div>
              <button onClick={() => setShowCategoryModal(false)} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="space-y-4 p-6">
                {modalCategoryError && <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{modalCategoryError}</div>}
                <div>
                  <label className={labelCls}>Category Name <span className="text-red-500">*</span></label>
                  <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="e.g. Snacks" required disabled={isSubmitting} className={inputCls} />
                  {categoryFieldErrors.name && <p className="mt-1 text-[10px] font-semibold text-red-600">{categoryFieldErrors.name}</p>}
                </div>
                <div>
                  <label className={labelCls}>Category Code <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input type="text" value={categoryCode} onChange={e => setCategoryCode(e.target.value)} placeholder="Leave blank for auto-seq" disabled={isSubmitting} className={inputCls} />
                  {categoryFieldErrors.code && <p className="mt-1 text-[10px] font-semibold text-red-600">{categoryFieldErrors.code}</p>}
                </div>
                <div>
                  <label className={labelCls}>Description <span className="text-slate-400 font-normal">(optional)</span></label>
                  <textarea rows={3} value={categoryDesc} onChange={e => setCategoryDesc(e.target.value)} placeholder="Provide category description..." disabled={isSubmitting} className={textareaCls} />
                </div>
              </div>
              <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
                <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Registering...' : 'Register Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
