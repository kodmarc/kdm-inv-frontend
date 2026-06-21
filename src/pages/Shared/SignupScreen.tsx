import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui';

export const SignupScreen: React.FC = () => {
  const { signupOrg, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [orgId, setOrgId] = useState('');
  const [orgName, setOrgName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setFieldErrors({});
    setIsSubmitting(true);

    if (!orgId.trim() || !orgName.trim() || !username.trim() || !password.trim()) {
      setSubmitError('All fields are required.');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters long.' });
      setIsSubmitting(false);
      return;
    }

    try {
      await signupOrg(orgId, orgName, username, password);
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
          setSubmitError(typeof errorData === 'string' ? errorData : 'Validation failed. Check inputs.');
        }
      } else {
        const errorMsg = err.response.data?.error || 'Signup failed due to a server error.';
        setSubmitError(typeof errorMsg === 'string' ? errorMsg : 'An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: string, setter: (val: string) => void) => {
    setter(value);
    if (fieldErrors[field]) setFieldErrors((prev) => { const c = { ...prev }; delete c[field]; return c; });
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
          <button onClick={() => navigate('/login')} className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900">
            Sign In →
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:py-24">

        {/* Left — Pitch */}
        <section>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Organization Onboarding
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Set up your workspace in seconds.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-500">
            Register your organization to get an HQ admin account. Add branches, configure policies, and onboard your team — all from one central panel.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-px border border-slate-200 bg-slate-200">
            {[
              ['Step 1', 'Register your org & get an admin account'],
              ['Step 2', 'Create branches under your organization'],
              ['Step 3', 'Set up companies, items & parties'],
              ['Step 4', 'Onboard staff and start invoicing'],
            ].map(([step, desc]) => (
              <div key={step} className="bg-white px-4 py-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500">{step}</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Right — Form */}
        <section>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Form header */}
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Register Organization</h2>
              <p className="mt-0.5 text-xs text-slate-500">Creates your HQ tenant and primary admin account</p>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {submitError}
                  </div>
                )}

                <Input
                  label="Organization ID"
                  error={fieldErrors.org_id || null}
                  value={orgId}
                  onChange={(e) => handleFieldChange('org_id', e.target.value, setOrgId)}
                  disabled={isSubmitting}
                  placeholder="e.g. kdm101"
                  required
                />
                {!fieldErrors.org_id && (
                  <p className="text-[11px] text-slate-400">Min 5 chars, letters and numbers only, no spaces.</p>
                )}

                <Input
                  label="Organization Business Name"
                  error={fieldErrors.org_name || null}
                  value={orgName}
                  onChange={(e) => handleFieldChange('org_name', e.target.value, setOrgName)}
                  disabled={isSubmitting}
                  placeholder="e.g. KDM Traders"
                  required
                />

                <Input
                  label="Admin Username"
                  error={fieldErrors.username || null}
                  value={username}
                  onChange={(e) => handleFieldChange('username', e.target.value, setUsername)}
                  disabled={isSubmitting}
                  placeholder="Choose a username"
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Admin Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
                      disabled={isSubmitting}
                      required
                      placeholder="Min 8 characters"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <span className="text-[10px] font-semibold text-red-600">{fieldErrors.password}</span>
                  ) : (
                    <p className="text-[11px] text-slate-400">Must be at least 8 characters.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register & Create Organization →'}
                </button>
              </form>

              <div className="mt-5 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
                Already registered?{' '}
                <button type="button" onClick={() => navigate('/login')} className="font-semibold text-blue-600 underline-offset-2 hover:underline">
                  Sign in here
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SignupScreen;
