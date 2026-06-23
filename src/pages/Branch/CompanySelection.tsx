import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface CompanyItem {
  id: string;
  name: string;
  code: string;
  branch: string | null;
  created_at: string;
}

export const CompanySelection: React.FC = () => {
  const { user, logout } = useAuth();
  const { branchSlug } = useParams<{ branchSlug: string }>();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyCode, setNewCompanyCode] = useState('');
  const [modalError, setModalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCompanies = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.get('/companies/');
      setCompanies(response.data);
    } catch {
      setError('Failed to fetch companies list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSelectCompany = (companyCode: string) => {
    navigate(`/branch/${branchSlug}/company/${companyCode.toLowerCase()}/home`);
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setFieldErrors({});
    setIsSubmitting(true);

    const cleanName = newCompanyName.trim();
    if (!cleanName) {
      setModalError('Company name is required.');
      setIsSubmitting(false);
      return;
    }

    const payload: Record<string, string> = { name: cleanName };
    if (newCompanyCode.trim()) payload.code = newCompanyCode.trim();

    try {
      await api.post('/companies/', payload);
      setSuccess('Company registered successfully.');
      setNewCompanyName('');
      setNewCompanyCode('');
      setShowModal(false);
      fetchCompanies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, val]) => {
          errors[key] = Array.isArray(val) ? val.join(' ') : String(val);
        });
        setFieldErrors(errors);
        if (errors.non_field_errors) setModalError(errors.non_field_errors);
      } else {
        setModalError('Failed to register company.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const canCreate = user?.company_creation_policy === 'BRANCH_ADMIN' && user?.role === 'BRANCH_ADMIN';

  const initials = (name?: string) =>
    name ? name.slice(0, 2).toUpperCase() : '??';

  const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top header bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            <span className="text-sm font-black tracking-tight text-slate-900">
              KDM<span className="text-slate-300">POS</span>
            </span>
          </div>

          {/* Branch chip */}
          {branchSlug && (
            <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-500">Branch:</span>
              <span className="text-xs font-bold uppercase text-slate-800">{branchSlug}</span>
            </div>
          )}

          {/* Right: user + sign out */}
          <div className="flex items-center gap-2.5">
            {user && (
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {initials(user.username)}
                </div>
                <span className="text-sm font-medium text-slate-700">{user.username}</span>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Select Company Catalog
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Choose a company to open its inventory and transaction workspace.
          </p>
        </div>

        {/* Success / Error banners */}
        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
            <button onClick={fetchCompanies} className="ml-auto text-xs font-semibold underline-offset-2 hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* Search + action bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or code..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {canCreate && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Company
            </button>
          )}
        </div>

        {/* Companies grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              <p className="text-sm text-slate-500">Loading companies...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {search ? `No results for "${search}"` : 'No companies registered yet'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {search ? 'Try a different search term.' : canCreate ? 'Click "New Company" to add the first one.' : 'Contact your organization administrator to add companies.'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-4 text-xs font-medium text-blue-600 hover:underline underline-offset-2">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectCompany(c.code)}
                className="group relative flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Company logo placeholder */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-bold text-white shadow-sm">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 leading-tight">{c.name}</h3>
                    <svg className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono font-medium text-slate-500 uppercase">
                      {c.code}
                    </code>
                    {c.branch === null && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                        Global
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtle bottom enter hint */}
                <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-xl bg-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        )}

        {/* Count line */}
        {!isLoading && filtered.length > 0 && (
          <p className="mt-6 text-xs text-slate-400">
            Showing {filtered.length} of {companies.length} {companies.length === 1 ? 'company' : 'companies'}
          </p>
        )}
      </main>

      {/* Create Company Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Register New Company</h3>
                <p className="mt-0.5 text-xs text-slate-500">Add a company catalog to this branch workspace</p>
              </div>
              <button
                onClick={() => { setShowModal(false); setModalError(''); setFieldErrors({}); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateCompany}>
              <div className="space-y-4 p-6">
                {modalError && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {modalError}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Company Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="e.g. Nurpur"
                    disabled={isSubmitting}
                    required
                    className={inputCls}
                  />
                  {fieldErrors.name && <span className="text-[10px] font-semibold text-red-600">{fieldErrors.name}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Company Code <span className="text-slate-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={newCompanyCode}
                    onChange={(e) => setNewCompanyCode(e.target.value)}
                    placeholder="Leave blank to auto-generate"
                    disabled={isSubmitting}
                    className={inputCls}
                  />
                  {fieldErrors.code && <span className="text-[10px] font-semibold text-red-600">{fieldErrors.code}</span>}
                  {!fieldErrors.code && <p className="text-[11px] text-slate-400">Short identifier used in navigation URLs.</p>}
                </div>
              </div>

              <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setModalError(''); setFieldErrors({}); }}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
