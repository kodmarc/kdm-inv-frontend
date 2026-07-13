import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { Button, Input, Modal } from '../../components/ui';

interface CompanyItem {
  id: string;
  name: string;
  code: string;
  branches: string[];
  created_at: string;
}

interface BranchItem {
  id: string;
  name: string;
  slug: string;
}

interface OrgCompaniesContext {
  companies: CompanyItem[];
  branches: BranchItem[];
  fetchCompanies: () => Promise<void>;
  isCompaniesLoading: boolean;
  companySuccess: string;
  setCompanySuccess: (msg: string) => void;
  companyError: string;
  setCompanyError: (msg: string) => void;
}

export const OrgCompanies: React.FC = () => {
  const {
    companies,
    branches,
    fetchCompanies,
    isCompaniesLoading,
    companySuccess,
    setCompanySuccess,
    companyError,
  } = useOutletContext<OrgCompaniesContext>();

  const [showModal, setShowModal] = useState(false);
  const [editCompany, setEditCompany] = useState<CompanyItem | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [modalError, setModalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const openCreateModal = () => {
    setEditCompany(null);
    setCompanyName('');
    setCompanyCode('');
    setSelectedBranches([]);
    setModalError('');
    setFieldErrors({});
    setShowModal(true);
  };

  const openEditModal = (company: CompanyItem) => {
    setEditCompany(company);
    setCompanyName(company.name);
    setCompanyCode(company.code);
    setSelectedBranches(company.branches || []);
    setModalError('');
    setFieldErrors({});
    setShowModal(true);
  };

  const toggleBranch = (slug: string) => {
    setSelectedBranches(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setFieldErrors({});

    const cleanName = companyName.trim();
    if (!cleanName) return;

    const payload: Record<string, unknown> = {
      name: cleanName,
      branches: selectedBranches,
    };
    if (companyCode.trim()) payload.code = companyCode.trim();

    setIsSubmitting(true);
    try {
      if (editCompany) {
        await api.patch(`/companies/${editCompany.id}/`, payload);
        setCompanySuccess('Company updated successfully.');
      } else {
        await api.post('/companies/', payload);
        setCompanySuccess('Company registered successfully.');
      }
      setShowModal(false);
      await fetchCompanies();
      setTimeout(() => setCompanySuccess(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, val]) => {
          errors[key] = Array.isArray(val) ? val.join(' ') : String(val);
        });
        setFieldErrors(errors);
        if (errors.non_field_errors) setModalError(errors.non_field_errors);
        else if (errors.detail) setModalError(errors.detail);
        else setModalError('Please fix the errors below.');
      } else {
        setModalError('Failed to save company. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const getBranchNames = (slugs: string[]) =>
    slugs
      .map(slug => branches.find(b => b.slug === slug)?.name || slug)
      .join(', ');

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Company Catalogs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage company registrations from HQ. Assign companies to branches to control visibility.
        </p>
      </div>

      {/* Alerts */}
      {companySuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {companySuccess}
        </div>
      )}
      {companyError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {companyError}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">All Companies</h2>
            <p className="text-xs text-slate-400 mt-0.5">{companies.length} registered</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-48"
              />
            </div>
            <Button onClick={openCreateModal} size="sm">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Company
            </Button>
          </div>
        </div>

        {/* Table */}
        {isCompaniesLoading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <span className="text-sm text-slate-400">Loading companies...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">
              {search ? 'No companies match your search.' : 'No companies registered yet.'}
            </p>
            {!search && (
              <Button onClick={openCreateModal} variant="outline" size="sm" className="mt-3">
                Register First Company
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Branches</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => {
                const assignedNames = getBranchNames(c.branches || []);
                const count = (c.branches || []).length;
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{c.code}</code>
                    </td>
                    <td className="px-6 py-4">
                      {count === 0 ? (
                        <span className="text-xs text-slate-400 italic">No branches assigned</span>
                      ) : (
                        <span
                          className="text-xs text-slate-700"
                          title={assignedNames}
                        >
                          {count === 1 ? assignedNames : `${count} branches`}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(c.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(c)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Company Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editCompany ? 'Edit Company' : 'Register New Company'}
      >
        {modalError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 mb-4">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {modalError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Nurpur"
            error={fieldErrors.name}
            required
          />
          <Input
            label="Company Code (optional)"
            value={companyCode}
            onChange={(e) => setCompanyCode(e.target.value)}
            placeholder="Leave blank to auto-generate"
            error={fieldErrors.code}
          />

          {/* Branch Assignment Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Assign to Branches
            </label>
            {branches.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No branches exist yet. Create branches first.</p>
            ) : (
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {branches.map((branch) => (
                  <label
                    key={branch.slug}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBranches.includes(branch.slug)}
                      onChange={() => toggleBranch(branch.slug)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-800">{branch.name}</span>
                    <span className="ml-auto text-xs text-slate-400 font-mono">{branch.slug}</span>
                  </label>
                ))}
              </div>
            )}
            {selectedBranches.length > 0 && (
              <p className="mt-1.5 text-xs text-slate-500">
                {selectedBranches.length} branch{selectedBranches.length !== 1 ? 'es' : ''} selected
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
            <Button type="button" variant="surface" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editCompany ? 'Save Changes' : 'Register Company'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrgCompanies;
