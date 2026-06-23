import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { Badge } from '../../../components/ui';

interface UserItem {
  id: string;
  username: string;
  email: string | null;
  role: 'ORG_ADMIN' | 'ORG_USER' | 'BRANCH_ADMIN' | 'USER' | 'KPO';
  branch: string | null;
  is_active: boolean;
}

const roleColors: Record<string, 'purple' | 'blue' | 'green' | 'amber' | 'slate'> = {
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
  USER: 'Branch User',
  KPO: 'KPO Cashier',
};

const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const labelCls = 'block text-xs font-semibold text-slate-700 mb-1.5';

export const BranchControlPanel: React.FC = () => {
  const { user } = useAuth();
  const { branchSlug } = useParams<{ branchSlug: string }>();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'BRANCH_ADMIN' | 'USER' | 'KPO'>('USER');
  const [isActive, setIsActive] = useState(true);
  const [modalError, setModalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users/');
      setUsers(response.data);
    } catch {
      setError('Failed to fetch branch users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setUsername(''); setEmail(''); setPassword(''); setRole('USER'); setIsActive(true);
    setModalError(''); setFieldErrors({});
    setShowModal(true);
  };

  const openEditModal = (target: UserItem) => {
    setEditingUser(target);
    setUsername(target.username);
    setEmail(target.email || '');
    setPassword('');
    setRole(target.role as 'BRANCH_ADMIN' | 'USER' | 'KPO');
    setIsActive(target.is_active);
    setModalError(''); setFieldErrors({});
    setShowModal(true);
  };

  const handleFieldChange = (field: string, val: string, setter: (v: any) => void) => {
    setter(val);
    if (fieldErrors[field]) setFieldErrors(prev => { const c = { ...prev }; delete c[field]; return c; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(''); setFieldErrors({});

    const payload: any = {
      username: username.trim(),
      email: email.trim() || null,
      role,
      branch: branchSlug,
      is_active: isActive,
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
        setSuccess('User updated successfully.');
      } else {
        await api.post('/users/', payload);
        setSuccess('User created successfully.');
      }
      setShowModal(false);
      fetchUsers();
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
        setModalError('An unexpected server error occurred.');
      }
    }
  };

  const handleToggleActive = async (target: UserItem) => {
    if (target.id === user?.id) {
      setError('You cannot disable your own user account.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      await api.patch(`/users/${target.id}/`, { is_active: !target.is_active });
      setSuccess(`User account ${!target.is_active ? 'enabled' : 'disabled'} successfully.`);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to toggle active status.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-black text-slate-900">KDM<span className="text-slate-300">POS</span></div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Control Panel · {branchSlug}</div>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {success && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Branch User Management</h2>
              <p className="mt-0.5 text-xs text-slate-400">Create and manage access credentials for local branch staff.</p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Staff User
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700">No staff users registered</p>
              <p className="mt-1 text-xs text-slate-400">Click "Add Staff User" to create the first account.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{u.username}</td>
                      <td className="px-6 py-4 text-slate-500">{u.email || '—'}</td>
                      <td className="px-6 py-4">
                        <Badge color={roleColors[u.role] || 'slate'}>{roleLabels[u.role] || u.role}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Active' : 'Disabled'}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={u.id === user?.id}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                              u.is_active
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {u.is_active ? 'Disable' : 'Enable'}
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
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {editingUser ? 'Update Staff User' : 'Register New Staff User'}
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  {editingUser ? 'Edit credentials and role assignment.' : 'Create a new branch staff account.'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 p-6">
                {modalError && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {modalError}
                  </div>
                )}
                <div>
                  <label className={labelCls}>Username</label>
                  <input type="text" value={username} onChange={e => handleFieldChange('username', e.target.value, setUsername)} required className={inputCls} />
                  {fieldErrors.username && <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.username}</p>}
                </div>
                <div>
                  <label className={labelCls}>Email Address <span className="font-normal text-slate-400">(optional)</span></label>
                  <input type="email" value={email} onChange={e => handleFieldChange('email', e.target.value, setEmail)} placeholder="optional" className={inputCls} />
                  {fieldErrors.email && <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className={labelCls}>
                    Password {editingUser && <span className="font-normal text-slate-400">(leave blank to keep current)</span>}
                  </label>
                  <input type="password" value={password} onChange={e => handleFieldChange('password', e.target.value, setPassword)} required={!editingUser} className={inputCls} />
                  {fieldErrors.password && <p className="mt-1 text-[10px] font-semibold text-red-600">{fieldErrors.password}</p>}
                </div>
                <div>
                  <label className={labelCls}>Role Permission</label>
                  <select value={role} onChange={e => setRole(e.target.value as any)} required className={inputCls}>
                    <option value="USER">Branch User</option>
                    <option value="KPO">KPO (Cashier Counter)</option>
                    <option value="BRANCH_ADMIN">Branch Admin</option>
                  </select>
                </div>
                {editingUser && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      disabled={editingUser.id === user?.id}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-slate-700">Account Active</span>
                  </label>
                )}
              </div>
              <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                  {editingUser ? 'Save Changes' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
