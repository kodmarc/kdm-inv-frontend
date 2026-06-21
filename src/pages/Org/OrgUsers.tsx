import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Button, Input, Badge, Modal } from '../../components/ui';

interface UserItem {
  id: string;
  username: string;
  email: string | null;
  role: 'ORG_ADMIN' | 'ORG_USER' | 'BRANCH_ADMIN' | 'USER' | 'KPO';
  branch: string | null;
  is_active: boolean;
}

interface BranchItem {
  id: string;
  name: string;
  slug: string;
}

interface OrgUsersContext {
  users: UserItem[];
  branches: BranchItem[];
  fetchUsers: () => Promise<void>;
  isUsersLoading: boolean;
  userSuccess: string;
  setUserSuccess: (msg: string) => void;
  userError: string;
  setUserError: (msg: string) => void;
}

const roleColors: Record<string, 'blue' | 'purple' | 'green' | 'amber' | 'slate'> = {
  ORG_ADMIN: 'purple',
  ORG_USER: 'blue',
  BRANCH_ADMIN: 'blue',
  USER: 'green',
  KPO: 'amber',
};

const roleLabels: Record<string, string> = {
  ORG_ADMIN: 'Org Admin',
  ORG_USER: 'Org User',
  BRANCH_ADMIN: 'Branch Admin',
  USER: 'Operator',
  KPO: 'KPO',
};

const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const labelCls = 'block text-xs font-semibold text-slate-700 mb-1.5';

export const OrgUsers: React.FC = () => {
  const { user } = useAuth();
  const {
    users, branches, fetchUsers, isUsersLoading,
    userSuccess, setUserSuccess, userError, setUserError,
  } = useOutletContext<OrgUsersContext>();

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [modalMode, setModalMode] = useState<'org' | 'branch'>('org');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<UserItem['role']>('ORG_USER');
  const [selectedBranchSlug, setSelectedBranchSlug] = useState('');
  const [userIsActive, setUserIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const hqUsers = users.filter(u => ['ORG_ADMIN', 'ORG_USER'].includes(u.role));
  const branchUsers = users.filter(u => ['BRANCH_ADMIN', 'USER', 'KPO'].includes(u.role));

  const openAddOrgModal = () => {
    setModalMode('org'); setEditingUser(null);
    setUsername(''); setEmail(''); setPassword('');
    setUserRole('ORG_USER'); setSelectedBranchSlug(''); setUserIsActive(true);
    setModalError(''); setFieldErrors({}); setShowModal(true);
  };

  const openAddBranchModal = () => {
    setModalMode('branch'); setEditingUser(null);
    setUsername(''); setEmail(''); setPassword('');
    setUserRole('BRANCH_ADMIN');
    setSelectedBranchSlug(branches.length > 0 ? branches[0].slug : '');
    setUserIsActive(true);
    setModalError(''); setFieldErrors({}); setShowModal(true);
  };

  const openEditModal = (target: UserItem) => {
    const isHQ = ['ORG_ADMIN', 'ORG_USER'].includes(target.role);
    setModalMode(isHQ ? 'org' : 'branch');
    setEditingUser(target);
    setUsername(target.username);
    setEmail(target.email || '');
    setPassword('');
    setUserRole(target.role);
    setSelectedBranchSlug(target.branch || (branches.length > 0 ? branches[0].slug : ''));
    setUserIsActive(target.is_active);
    setModalError(''); setFieldErrors({}); setShowModal(true);
  };

  const handleFieldChange = (field: string, val: string, setter: (v: any) => void) => {
    setter(val);
    if (fieldErrors[field]) setFieldErrors(prev => { const c = { ...prev }; delete c[field]; return c; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(''); setFieldErrors({});

    const isBranchRole = ['BRANCH_ADMIN', 'USER', 'KPO'].includes(userRole);
    const payload: any = {
      username: username.trim(),
      email: email.trim() || null,
      role: userRole,
      branch: isBranchRole ? selectedBranchSlug : null,
      is_active: userIsActive,
    };

    if (password.trim()) {
      payload.password = password.trim();
    } else if (!editingUser) {
      setModalError('Password is required for new users.');
      setFieldErrors({ password: 'Password is required.' });
      return;
    }

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}/`, payload);
        setUserSuccess('User account updated successfully.');
      } else {
        await api.post('/users/', payload);
        setUserSuccess('User account created successfully.');
      }
      setShowModal(false);
      fetchUsers();
      setTimeout(() => setUserSuccess(''), 3000);
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
        setModalError('An unexpected server error occurred.');
      }
    }
  };

  const handleToggleActive = async (target: UserItem) => {
    if (target.id === user?.id) {
      setUserError('You cannot disable your own account.');
      setTimeout(() => setUserError(''), 3000);
      return;
    }
    try {
      await api.patch(`/users/${target.id}/`, { is_active: !target.is_active });
      setUserSuccess(`User account ${!target.is_active ? 'enabled' : 'disabled'}.`);
      fetchUsers();
      setTimeout(() => setUserSuccess(''), 3000);
    } catch {
      setUserError('Failed to toggle active status.');
      setTimeout(() => setUserError(''), 3000);
    }
  };

  const UserTable: React.FC<{ rows: UserItem[]; showBranch?: boolean }> = ({ rows, showBranch }) => (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
            {showBranch && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</th>}
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={showBranch ? 6 : 5} className="px-5 py-10 text-center text-sm text-slate-400">
                No users in this group yet.
              </td>
            </tr>
          ) : rows.map((u) => (
            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3.5 font-medium text-slate-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 shrink-0">
                    {u.username.slice(0, 2).toUpperCase()}
                  </div>
                  {u.username}
                </div>
              </td>
              <td className="px-5 py-3.5 text-slate-500">{u.email || '—'}</td>
              {showBranch && (
                <td className="px-5 py-3.5">
                  {u.branch
                    ? <code className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{u.branch}</code>
                    : '—'}
                </td>
              )}
              <td className="px-5 py-3.5">
                <Badge color={roleColors[u.role] || 'slate'}>{roleLabels[u.role] || u.role}</Badge>
              </td>
              <td className="px-5 py-3.5">
                <Badge color={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Active' : 'Disabled'}</Badge>
              </td>
              <td className="px-5 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(u)}>Edit</Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(u)}
                    disabled={u.id === user?.id}
                    className={u.is_active ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}
                  >
                    {u.is_active ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">Manage HQ and branch-level accounts with role-based access.</p>
      </div>

      {userSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {userSuccess}
        </div>
      )}
      {userError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {userError}
        </div>
      )}

      {/* HQ Users Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Organization HQ Users</h2>
            <p className="text-xs text-slate-400 mt-0.5">Admins and managers with global access</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="purple">{hqUsers.length}</Badge>
            <Button size="sm" onClick={openAddOrgModal}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add HQ User
            </Button>
          </div>
        </div>
        {isUsersLoading ? (
          <div className="flex items-center justify-center py-10 gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <span className="text-sm text-slate-400">Loading...</span>
          </div>
        ) : (
          <div className="p-4"><UserTable rows={hqUsers} /></div>
        )}
      </div>

      {/* Branch Users Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Branch-Specific Users</h2>
            <p className="text-xs text-slate-400 mt-0.5">Operators and cashiers linked to individual branches</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="slate">{branchUsers.length}</Badge>
            <Button size="sm" onClick={openAddBranchModal} disabled={branches.length === 0}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Branch User
            </Button>
          </div>
        </div>
        {isUsersLoading ? (
          <div className="flex items-center justify-center py-10 gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            <span className="text-sm text-slate-400">Loading...</span>
          </div>
        ) : (
          <div className="p-4">
            {branches.length === 0 && branchUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 rounded-lg border-2 border-dashed border-slate-200 text-center">
                <p className="text-sm text-slate-400">Create at least one branch before adding branch users.</p>
              </div>
            ) : (
              <UserTable rows={branchUsers} showBranch />
            )}
          </div>
        )}
      </div>

      {/* User Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Update Access Account' : `Register New ${modalMode === 'org' ? 'HQ' : 'Branch'} User`}
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
          <Input label="Username *" value={username} onChange={(e) => handleFieldChange('username', e.target.value, setUsername)} error={fieldErrors.username} required />
          <Input label="Email Address (optional)" type="email" value={email} onChange={(e) => handleFieldChange('email', e.target.value, setEmail)} placeholder="optional" error={fieldErrors.email} />
          <Input
            label={editingUser ? 'Password (leave blank to keep current)' : 'Password *'}
            type="password"
            value={password}
            onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
            error={fieldErrors.password}
            required={!editingUser}
          />

          <div className="flex flex-col">
            <label className={labelCls}>Access Role</label>
            {modalMode === 'org' ? (
              <select value={userRole} onChange={(e) => setUserRole(e.target.value as any)} className={inputCls}>
                <option value="ORG_USER">Organization User (HQ)</option>
                <option value="ORG_ADMIN">Organization Admin</option>
              </select>
            ) : (
              <select value={userRole} onChange={(e) => setUserRole(e.target.value as any)} className={inputCls}>
                <option value="BRANCH_ADMIN">Branch Admin</option>
                <option value="USER">Branch Operator</option>
                <option value="KPO">KPO (Cashier)</option>
              </select>
            )}
          </div>

          {modalMode === 'branch' && ['BRANCH_ADMIN', 'USER', 'KPO'].includes(userRole) && (
            <div className="flex flex-col">
              <label className={labelCls}>Linked Branch *</label>
              {branches.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
                  Please create a branch first before assigning branch-level roles.
                </div>
              ) : (
                <select value={selectedBranchSlug} onChange={(e) => setSelectedBranchSlug(e.target.value)} required className={inputCls}>
                  {branches.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                </select>
              )}
              {fieldErrors.branch && <span className="text-[11px] font-semibold text-red-600 mt-1">{fieldErrors.branch}</span>}
            </div>
          )}

          {editingUser && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={userIsActive}
                onChange={(e) => setUserIsActive(e.target.checked)}
                disabled={editingUser.id === user?.id}
                className="w-4 h-4 rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm text-slate-700 font-medium">Account is active</span>
            </label>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="surface" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={modalMode === 'branch' && branches.length === 0}>
              {editingUser ? 'Save Changes' : 'Register User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrgUsers;
