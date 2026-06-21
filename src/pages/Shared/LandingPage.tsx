import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleDashboardRedirect = () => {
    if (!user) return;
    if (user.role === 'ORG_ADMIN' || user.role === 'ORG_USER') {
      navigate('/org-admin/dashboard');
    } else if (user.role === 'KPO') {
      navigate(`/kpo/branch/${user.branch_slug}/checkout`);
    } else {
      navigate(`/branch/${user.branch_slug}/companies`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 text-left">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            <span className="text-base font-black tracking-tight text-slate-900">
              KDM<span className="text-slate-400">POS</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm text-slate-500 md:inline">
                  Signed in as <strong className="text-slate-900">{user?.username}</strong>
                </span>
                <button onClick={logout} className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900">
                  Sign Out
                </button>
                <button onClick={handleDashboardRedirect} className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900">
                  Sign In
                </button>
                <button onClick={() => navigate('/signup')} className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
            <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:items-center">

              {/* Left — Copy */}
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Multi-tenant inventory platform
                </div>

                <h1 className="text-5xl font-black leading-[1.03] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                  Inventory &amp; POS for <span className="text-blue-600">serious</span> operations.
                </h1>

                <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-500">
                  A unified control surface for multi-branch organizations. Manage stock, invoices, parties, and teams — all in one governed platform.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {isAuthenticated ? (
                    <button onClick={handleDashboardRedirect} className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                      Open Dashboard →
                    </button>
                  ) : (
                    <>
                      <button onClick={() => navigate('/signup')} className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                        Register Organization →
                      </button>
                      <button onClick={() => navigate('/login')} className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-500 hover:text-slate-900">
                        Sign In to Portal
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-10 grid grid-cols-2 gap-px border border-slate-200 bg-slate-200 sm:grid-cols-4">
                  {[
                    ['Multi-tenant', 'Org + branch isolation'],
                    ['Role-based', 'Admin, staff, KPO'],
                    ['Full invoicing', 'Sales & purchase'],
                    ['Live stock', 'Real-time tracking'],
                  ].map(([title, detail]) => (
                    <div key={title} className="bg-white px-4 py-4">
                      <div className="text-sm font-bold text-slate-900">{title}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — Preview Card */}
              <div className="relative">
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-[0_24px_64px_rgba(0,0,0,0.10)]">
                  {/* Navy card header */}
                  <div className="px-6 py-4" style={{ background: '#0F172A' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded bg-blue-600 flex items-center justify-center">
                          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-white">Branch Control Panel</span>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                      </div>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="divide-y divide-slate-100 bg-white">
                    {[
                      { label: 'Branch isolation', desc: 'Keep branch data separated while staying visible at HQ level.', badge: 'Active' },
                      { label: 'Governed inputs', desc: 'Policy-driven item and company creation across the organization.', badge: 'Enforced' },
                      { label: 'Live stock sync', desc: 'Inventory updates reflect immediately across invoice flows.', badge: 'Synced' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-4 px-6 py-4">
                        <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">{item.badge}</span>
                          </div>
                          <p className="mt-0.5 text-xs leading-5 text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-xl">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                One platform. Every operation.
              </h2>
              <p className="mt-3 text-base text-slate-500">
                Purpose-built for multi-branch distribution and retail — from HQ governance to floor-level POS.
              </p>
            </div>

            <div className="grid gap-px border border-slate-200 bg-slate-200 md:grid-cols-3">
              {[
                {
                  title: 'HQ Governance',
                  text: 'Organization admins control company and item creation policies across all branches from a central panel.',
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
                {
                  title: 'Full Transaction Suite',
                  text: 'Sales and purchase invoices, returns, damage tracking — all with auto-generated codes and PDF export.',
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                  ),
                },
                {
                  title: 'Granular Access Control',
                  text: 'Five role types — Org Admin, Org User, Branch Admin, Branch User, and KPO — each with scoped permissions.',
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ),
                },
              ].map(({ title, text, icon }) => (
                <div key={title} className="bg-white p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    {icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">&copy; {new Date().getFullYear()} KDM POS. All rights reserved.</span>
            <span className="text-xs text-slate-400">Multi-tenant inventory &amp; POS platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
