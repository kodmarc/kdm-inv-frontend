import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';

export const KpoCheckout: React.FC = () => {
  const { user, logout } = useAuth();
  const { branchSlug } = useParams<{ branchSlug: string }>();

  return (
    <div className="flex h-screen flex-col bg-slate-50">

      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-black text-slate-900">KDM<span className="text-slate-300">POS</span></div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">POS Register · {branchSlug}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
              {user?.username?.slice(0, 2).toUpperCase() || 'KP'}
            </div>
            <div className="text-right leading-tight">
              <div className="text-xs font-semibold text-slate-800">{user?.username}</div>
              <div className="text-[10px] text-slate-400">KPO Cashier</div>
            </div>
          </div>
          <div className="h-5 w-px bg-slate-200" />
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
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-12 py-16 text-center max-w-md w-full">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
            <svg className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-800">POS Billing Module</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-400 max-w-xs">
            The KPO point-of-sale checkout interface is scheduled for implementation in a future phase. Cart, billing, and payment processing flows are pre-routed.
          </p>
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-4 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-amber-700">Register: {branchSlug}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KpoCheckout;
