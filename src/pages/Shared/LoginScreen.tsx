import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui';

interface BranchOption {
  name: string;
  slug: string;
}

export const LoginScreen: React.FC = () => {
  const { loginOrg, loginBranch, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [portalType, setPortalType] = useState<'select' | 'org' | 'branch'>('select');
  const [branchStep, setBranchStep] = useState<1 | 2>(1);
  const [orgId, setOrgId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [isFetchingBranches, setIsFetchingBranches] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ORG_ADMIN' || user.role === 'ORG_USER') {
        navigate('/org-admin/dashboard');
      } else if (user.role === 'KPO') {
        navigate(`/kpo/branch/${user.branch_slug}/checkout`);
      } else {
        navigate(`/branch/${user.branch_slug}/companies`);
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    setSubmitError('');
    setFieldErrors({});
    setShowPassword(false);
    if (portalType === 'org') {
      setRole('ORG_ADMIN');
      setBranchStep(1);
    } else if (portalType === 'branch') {
      setRole('BRANCH_ADMIN');
    }
  }, [portalType]);

  const handleVerifyOrgId = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setFieldErrors({});

    const cleanOrg = orgId.trim();
    if (!cleanOrg) {
      setSubmitError('Organization ID is required.');
      return;
    }

    setIsFetchingBranches(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/public-branches/`, {
        params: { org_id: cleanOrg },
      });
      if (response.data && response.data.length > 0) {
        setBranches(response.data);
        setSelectedBranch(response.data[0].slug);
        setBranchStep(2);
      } else {
        setSubmitError('No active branches found under this Organization ID.');
      }
    } catch (err: any) {
      if (!err.response) {
        let backendOrigin = 'the backend service';
        try {
          if (import.meta.env.VITE_API_URL) backendOrigin = new URL(import.meta.env.VITE_API_URL).origin;
        } catch {
          backendOrigin = import.meta.env.VITE_API_URL || 'the backend service';
        }
        setSubmitError(`Network Error: Could not reach ${backendOrigin}. Verify the backend is running.`);
      } else if (err.response.status === 400) {
        const errorData = err.response.data?.error;
        setSubmitError(typeof errorData === 'string' ? errorData : 'Validation failed for Organization ID.');
        setFieldErrors({ org_id: typeof errorData === 'string' ? errorData : 'Invalid format.' });
      } else {
        setSubmitError('Organization verification failed.');
      }
    } finally {
      setIsFetchingBranches(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setFieldErrors({});

    if (!orgId.trim() || !username.trim() || !password.trim()) {
      setSubmitError('All credentials are required.');
      return;
    }

    try {
      if (portalType === 'org') {
        await loginOrg(orgId, role, username, password);
      } else {
        if (!selectedBranch) { setSubmitError('Branch must be selected.'); return; }
        await loginBranch(orgId, selectedBranch, role, username, password);
      }
    } catch (err: any) {
      if (!err.response) {
        let backendOrigin = 'the backend service';
        try {
          if (import.meta.env.VITE_API_URL) backendOrigin = new URL(import.meta.env.VITE_API_URL).origin;
        } catch {
          backendOrigin = import.meta.env.VITE_API_URL || 'the backend service';
        }
        setSubmitError(`Network Error: Could not reach ${backendOrigin}. Verify the backend is running.`);
      } else if (err.response.status === 400) {
        const errorData = err.response.data?.error;
        if (errorData && typeof errorData === 'object') {
          const errors: Record<string, string> = {};
          Object.entries(errorData).forEach(([key, val]) => { errors[key] = Array.isArray(val) ? val.join(' ') : String(val); });
          setFieldErrors(errors);
        } else {
          setSubmitError(typeof errorData === 'string' ? errorData : 'Login validation failed.');
        }
      } else {
        const errorMsg = err.response?.data?.error || 'Login failed. Please check your credentials.';
        setSubmitError(typeof errorMsg === 'string' ? errorMsg : 'Authentication failed.');
      }
    }
  };

  const handleFieldChange = (field: string, value: string, setter: (val: string) => void) => {
    setter(value);
    if (fieldErrors[field]) setFieldErrors((prev) => { const c = { ...prev }; delete c[field]; return c; });
  };

  const resetPortal = () => {
    setPortalType('select');
    setBranchStep(1);
    setOrgId(''); setUsername(''); setPassword('');
    setShowPassword(false); setBranches([]);
    setSubmitError(''); setFieldErrors({});
  };

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
  const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

  const selectClass = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 text-left">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            <span className="text-base font-black tracking-tight text-slate-900">KDM<span className="text-slate-400">POS</span></span>
          </button>
          <button onClick={() => navigate('/')} className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900">
            ← Back to Home
          </button>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Sign in to portal</h1>
            <p className="mt-1 text-sm text-slate-500">Choose your access level below.</p>
          </div>

          {/* Portal tab switcher */}
          {portalType !== 'select' && (
            <div className="mb-5 flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setPortalType('org')}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${portalType === 'org' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Organization
              </button>
              <button
                type="button"
                onClick={() => setPortalType('branch')}
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${portalType === 'branch' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Branch
              </button>
            </div>
          )}

          {/* Main card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6">
              {submitError && (
                <div className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {submitError}
                </div>
              )}

              {/* Portal selection state */}
              {portalType === 'select' && (
                <div className="space-y-3">
                  <p className="mb-4 text-sm text-slate-500">Which portal are you accessing?</p>
                  <button
                    type="button"
                    onClick={() => setPortalType('org')}
                    className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:border-blue-500 hover:bg-blue-50"
                  >
                    <div className="text-sm font-semibold text-slate-900">Organization Portal</div>
                    <p className="mt-0.5 text-xs text-slate-500">HQ admin &amp; org-level access</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPortalType('branch')}
                    className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:border-blue-500 hover:bg-blue-50"
                  >
                    <div className="text-sm font-semibold text-slate-900">Branch Portal</div>
                    <p className="mt-0.5 text-xs text-slate-500">Branch staff, KPO, and local access</p>
                  </button>
                </div>
              )}

              {/* Org login form */}
              {portalType === 'org' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input label="Organization ID" error={fieldErrors.org_id ?? null} value={orgId} onChange={(e) => handleFieldChange('org_id', e.target.value, setOrgId)} required />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Module Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} required className={selectClass}>
                      <option value="ORG_ADMIN">Organization Admin</option>
                      <option value="ORG_USER">Organization User</option>
                    </select>
                  </div>
                  <Input label="Username" error={fieldErrors.username ?? null} value={username} onChange={(e) => handleFieldChange('username', e.target.value, setUsername)} required />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => handleFieldChange('password', e.target.value, setPassword)} required className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {fieldErrors.password && <span className="text-[10px] font-semibold text-red-600">{fieldErrors.password}</span>}
                  </div>
                  <button type="submit" className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                    Sign In
                  </button>
                  <button type="button" onClick={resetPortal} className="w-full text-center text-xs text-slate-400 transition-colors hover:text-slate-700">
                    ← Change portal
                  </button>
                </form>
              )}

              {/* Branch login form */}
              {portalType === 'branch' && (
                <div className="space-y-4">
                  {branchStep === 1 && (
                    <form onSubmit={handleVerifyOrgId} className="space-y-4">
                      <Input label="Organization ID" error={fieldErrors.org_id ?? null} value={orgId} onChange={(e) => handleFieldChange('org_id', e.target.value, setOrgId)} required />
                      <button type="submit" disabled={isFetchingBranches} className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                        {isFetchingBranches ? 'Verifying...' : 'Verify Organization →'}
                      </button>
                    </form>
                  )}

                  {branchStep === 2 && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                        <span className="font-semibold text-slate-500">Org:</span>{' '}
                        <strong className="uppercase text-slate-900">{orgId}</strong>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700">Active Branch</label>
                        <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} required className={selectClass}>
                          {branches.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700">Module Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} required className={selectClass}>
                          <option value="BRANCH_ADMIN">Branch Admin</option>
                          <option value="USER">Branch User</option>
                          <option value="KPO">KPO (Cashier Counter)</option>
                        </select>
                      </div>
                      <Input label="Username" error={fieldErrors.username ?? null} value={username} onChange={(e) => handleFieldChange('username', e.target.value, setUsername)} required />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-700">Password</label>
                        <div className="relative">
                          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => handleFieldChange('password', e.target.value, setPassword)} required className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                        </div>
                        {fieldErrors.password && <span className="text-[10px] font-semibold text-red-600">{fieldErrors.password}</span>}
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setBranchStep(1); setSubmitError(''); setFieldErrors({}); setShowPassword(false); }} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900">
                          Back
                        </button>
                        <button type="submit" className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                          Sign In
                        </button>
                      </div>
                    </form>
                  )}

                  <button type="button" onClick={resetPortal} className="w-full text-center text-xs text-slate-400 transition-colors hover:text-slate-700">
                    ← Change portal
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <button type="button" onClick={() => navigate('/signup')} className="font-semibold text-blue-600 underline-offset-2 hover:underline">
              Register your organization
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginScreen;
