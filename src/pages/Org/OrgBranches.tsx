import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { Button, Input, Badge } from '../../components/ui';

interface BranchItem {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

interface UserItem {
  id: string;
  username: string;
  email: string | null;
  role: string;
  branch: string | null;
  is_active: boolean;
}

interface OrgBranchesContext {
  branches: BranchItem[];
  users: UserItem[];
  fetchBranches: () => Promise<void>;
}

const roleColors: Record<string, 'blue' | 'purple' | 'green' | 'slate'> = {
  BRANCH_ADMIN: 'blue',
  USER: 'green',
  KPO: 'purple',
};

const roleLabels: Record<string, string> = {
  BRANCH_ADMIN: 'Branch Admin',
  USER: 'Operator',
  KPO: 'KPO',
};

export const OrgBranches: React.FC = () => {
  const { branches, users, fetchBranches } = useOutletContext<OrgBranchesContext>();
  const [newBranchName, setNewBranchName] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null);
  const [isBranchLoading, setIsBranchLoading] = useState(false);
  const [branchError, setBranchError] = useState('');
  const [branchSuccess, setBranchSuccess] = useState('');

  const getBranchUsers = (slug: string) => users.filter(u => u.branch === slug);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBranchError('');
    setBranchSuccess('');
    const cleanName = newBranchName.trim();
    if (!cleanName) return;

    setIsBranchLoading(true);
    try {
      await api.post('/org-admin/branches/', { name: cleanName });
      setNewBranchName('');
      setBranchSuccess('Branch registered successfully.');
      await fetchBranches();
      setTimeout(() => setBranchSuccess(''), 3000);
    } catch (err: any) {
      const valError = err.response?.data?.name || 'Failed to create branch.';
      setBranchError(Array.isArray(valError) ? valError[0] : valError);
    } finally {
      setIsBranchLoading(false);
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (!window.confirm('Delete this branch? Users mapped to it will lose access.')) return;
    setBranchError('');
    setBranchSuccess('');
    try {
      await api.delete(`/org-admin/branches/${branchId}/`);
      setBranchSuccess('Branch deleted successfully.');
      if (selectedBranch?.id === branchId) setSelectedBranch(null);
      await fetchBranches();
      setTimeout(() => setBranchSuccess(''), 3000);
    } catch {
      setBranchError('Failed to delete branch. Ensure it has no active transaction references.');
      setTimeout(() => setBranchError(''), 4000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Branches Registry</h1>
        <p className="mt-1 text-sm text-slate-500">Create and manage store branches across your organization.</p>
      </div>

      {/* Alerts */}
      {branchSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {branchSuccess}
        </div>
      )}
      {branchError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {branchError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left Column: Add + List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add Branch Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Add New Branch</h3>
            <form onSubmit={handleCreateBranch} className="space-y-3">
              <Input
                label="Branch Name"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="e.g. Clifton Outlet"
                required
              />
              <Button type="submit" disabled={isBranchLoading} className="w-full">
                {isBranchLoading ? 'Creating...' : '+ Create Branch'}
              </Button>
            </form>
          </div>

          {/* Branch List Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">All Branches</h3>
                <Badge color="blue">{branches.length}</Badge>
              </div>
            </div>

            {branches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">No branches yet. Create one above.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {branches.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBranch(b)}
                    className={`flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors ${
                      selectedBranch?.id === b.id
                        ? 'bg-blue-50 border-l-2 border-blue-500'
                        : 'hover:bg-slate-50 border-l-2 border-transparent'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${selectedBranch?.id === b.id ? 'text-blue-700' : 'text-slate-900'}`}>
                        {b.name}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{b.slug}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteBranch(b.id); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Branch Detail */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full">
            {selectedBranch ? (
              <div>
                {/* Detail Header */}
                <div className="px-6 py-5 border-b border-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{selectedBranch.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                          {selectedBranch.slug}
                        </code>
                        <span className="text-xs text-slate-400">
                          Created {new Date(selectedBranch.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <Badge color="green">Active</Badge>
                  </div>
                </div>

                {/* Staff Table */}
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-slate-900">Branch Personnel</h4>
                    <Badge color="slate">{getBranchUsers(selectedBranch.slug).length} staff</Badge>
                  </div>

                  {getBranchUsers(selectedBranch.slug).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border-2 border-dashed border-slate-200">
                      <svg className="w-8 h-8 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-sm text-slate-400">No users assigned to this branch yet.</p>
                      <p className="text-xs text-slate-400 mt-1">Add users in User Management → Branch Users.</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {getBranchUsers(selectedBranch.slug).map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-900">{u.username}</td>
                              <td className="px-4 py-3 text-slate-500">{u.email || '—'}</td>
                              <td className="px-4 py-3">
                                <Badge color={roleColors[u.role] || 'slate'}>
                                  {roleLabels[u.role] || u.role}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Badge color={u.is_active ? 'green' : 'red'}>
                                  {u.is_active ? 'Active' : 'Disabled'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Select a Branch</h3>
                <p className="text-sm text-slate-400">Click on a branch from the list to view its personnel and details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgBranches;
