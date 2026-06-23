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
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            <span className="text-sm font-black tracking-tight text-slate-900">KDM<span className="text-slate-300">POS</span></span>
          </button>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="hidden text-xs text-slate-500 md:inline">
                  Signed in as <strong className="text-slate-800">{user?.username}</strong>
                </span>
                <button onClick={logout} className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50">
                  Sign Out
                </button>
                <button onClick={handleDashboardRedirect} className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700">
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50">
                  Sign In
                </button>
                <button onClick={() => navigate('/signup')} className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">

              {/* Left — Copy */}
              <div>
                <div className="animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-blue-600">
                  <span className="animate-pulse-blue h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Multi-tenant POS platform
                </div>

                <h1 className="animate-fade-up [animation-delay:80ms] text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Inventory &amp; POS for{' '}
                  <span className="text-blue-600">serious</span>{' '}
                  operations.
                </h1>

                <p className="animate-fade-up [animation-delay:180ms] mt-5 max-w-md text-base leading-relaxed text-slate-500">
                  A unified control surface for multi-branch organizations — manage stock, invoices, parties, and teams from one governed platform.
                </p>

                <div className="animate-fade-up [animation-delay:300ms] mt-7 flex flex-wrap gap-2.5">
                  {isAuthenticated ? (
                    <button onClick={handleDashboardRedirect} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 hover:shadow-md">
                      Open Dashboard →
                    </button>
                  ) : (
                    <>
                      <button onClick={() => navigate('/signup')} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5">
                        Register Organization →
                      </button>
                      <button onClick={() => navigate('/login')} className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5">
                        Sign In
                      </button>
                    </>
                  )}
                </div>

                {/* Feature chips */}
                <div className="animate-fade-up [animation-delay:420ms] mt-8 flex flex-wrap gap-2">
                  {[
                    'Multi-branch org',
                    'Role-based access',
                    'Sales & Purchase invoicing',
                    'Live stock tracking',
                    'PDF generation',
                    'Double-entry accounting',
                  ].map((f, i) => (
                    <span key={f} className="flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600" style={{ animationDelay: `${420 + i * 50}ms` }}>
                      <svg className="h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — App visual mockup */}
              <div className="animate-slide-in-right [animation-delay:200ms] relative">
                {/* Floating accent badge */}
                <div className="animate-float absolute -top-3 -right-3 z-10 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg">
                  <div className="text-[10px] font-semibold text-slate-400">Today's Revenue</div>
                  <div className="mt-0.5 text-lg font-black text-slate-900">Rs. 74,450</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +12% vs yesterday
                  </div>
                </div>

                {/* App screenshot frame */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">

                  {/* Browser chrome */}
                  <div className="flex h-8 items-center gap-2 border-b border-slate-100 bg-slate-50 px-3">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-200" />
                      <span className="h-2 w-2 rounded-full bg-slate-200" />
                      <span className="h-2 w-2 rounded-full bg-slate-200" />
                    </div>
                    <div className="mx-2 flex h-4 flex-1 items-center rounded bg-slate-100 px-2 text-[9px] text-slate-400">
                      kdmpos.app/branch/main/company/nurpur/home
                    </div>
                  </div>

                  {/* App top nav */}
                  <div className="flex h-9 items-center gap-2 border-b border-slate-100 bg-white px-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-blue-600">
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black text-slate-900">KDM<span className="text-slate-300">POS</span></span>
                    <div className="mx-1.5 h-3.5 w-px bg-slate-200" />
                    <div className="flex items-center gap-0.5">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-600">Dashboard</span>
                      {['Manage', 'Transactions', 'Reports'].map(n => (
                        <span key={n} className="rounded-md px-2 py-0.5 text-[9px] text-slate-400">{n}</span>
                      ))}
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] font-semibold text-slate-500">NURPUR</span>
                    </div>
                  </div>

                  {/* Dashboard content */}
                  <div className="bg-slate-50 p-3">

                    {/* Stats row */}
                    <div className="mb-2.5 grid grid-cols-4 gap-2">
                      {[
                        { label: 'Items', val: '284', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Categories', val: '18', color: 'text-violet-600', bg: 'bg-violet-50' },
                        { label: 'Pending Sales', val: '12', color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Purchases', val: '8', color: 'text-rose-600', bg: 'bg-rose-50' },
                      ].map(s => (
                        <div key={s.label} className="rounded-lg border border-slate-100 bg-white p-2 transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm">
                          <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-md text-xs font-black ${s.bg} ${s.color}`}>
                            {s.val}
                          </div>
                          <div className="text-[8px] font-medium text-slate-400">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Invoice table */}
                    <div className="overflow-hidden rounded-lg border border-slate-100 bg-white">
                      <div className="flex items-center justify-between border-b border-slate-50 px-3 py-1.5">
                        <span className="text-[9px] font-bold text-slate-700">Recent Sales Invoices</span>
                        <span className="text-[8px] font-semibold text-blue-600">View all →</span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {[
                          { code: 'SAL-0024', party: 'Ahmed & Co.', amt: '24,500', paid: true },
                          { code: 'SAL-0023', party: 'Malik Traders', amt: '18,200', paid: false },
                          { code: 'SAL-0022', party: 'Khan Wholesale', amt: '31,750', paid: true },
                          { code: 'SAL-0021', party: 'City Mart', amt: '9,400', paid: false },
                        ].map(row => (
                          <div key={row.code} className="flex items-center gap-2 px-3 py-1.5">
                            <span className="w-14 text-[8px] font-bold text-slate-800">{row.code}</span>
                            <span className="flex-1 text-[8px] text-slate-500">{row.party}</span>
                            <span className="text-[8px] font-bold text-slate-800">Rs.{row.amt}</span>
                            <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase ${
                              row.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {row.paid ? 'paid' : 'pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick actions row */}
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white p-2">
                        <div className="h-5 w-5 shrink-0 rounded bg-blue-50 flex items-center justify-center">
                          <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <span className="text-[9px] font-semibold text-slate-700">New Sales Invoice</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white p-2">
                        <div className="h-5 w-5 shrink-0 rounded bg-violet-50 flex items-center justify-center">
                          <svg className="h-3 w-3 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <span className="text-[9px] font-semibold text-slate-700">New Purchase Invoice</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating stock badge */}
                <div className="animate-float-slow absolute -bottom-3 -left-4 z-10 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-900">284 SKUs</div>
                      <div className="text-[9px] text-slate-400">Live stock sync</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="border-b border-slate-100 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                One platform. Every operation.
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                Purpose-built for multi-branch distribution and retail.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  title: 'HQ Governance',
                  delay: 0,
                  text: 'Organization admins control company and item creation policies across all branches from a central panel.',
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
                {
                  title: 'Full Transaction Suite',
                  delay: 120,
                  text: 'Sales and purchase invoices, returns, damage tracking — all with auto-generated codes and PDF export.',
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                  ),
                },
                {
                  title: 'Granular Access Control',
                  delay: 240,
                  text: 'Five role types — Org Admin, Org User, Branch Admin, Branch User, and KPO — each with scoped permissions.',
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ),
                },
              ].map(({ title, text, icon, delay }) => (
                <div key={title} className="animate-fade-up rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg" style={{ animationDelay: `${delay}ms` }}>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition-transform duration-200 group-hover:scale-110">
                    {icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Role breakdown */}
        <section className="border-b border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-xl font-black tracking-tight text-slate-900">Access levels built for every role</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { role: 'Org Admin', desc: 'Full HQ control', color: 'bg-violet-50 text-violet-700 border-violet-100 hover:border-violet-300' },
                { role: 'Org User', desc: 'HQ read access', color: 'bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300' },
                { role: 'Branch Admin', desc: 'Branch management', color: 'bg-sky-50 text-sky-700 border-sky-100 hover:border-sky-300' },
                { role: 'Branch User', desc: 'Day-to-day ops', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-300' },
                { role: 'KPO Cashier', desc: 'POS checkout only', color: 'bg-amber-50 text-amber-700 border-amber-100 hover:border-amber-300' },
              ].map((r, i) => (
                <div key={r.role} className={`animate-fade-up rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${r.color}`} style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="text-xs font-bold">{r.role}</div>
                  <div className="mt-0.5 text-xs opacity-70">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </span>
              <span className="text-xs font-black text-slate-900">KDM<span className="text-slate-300">POS</span></span>
            </div>
            <span className="text-xs text-slate-400">&copy; {new Date().getFullYear()} KDM POS. Multi-tenant inventory &amp; POS platform.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
