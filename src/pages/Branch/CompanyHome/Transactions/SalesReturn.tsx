import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const SalesReturn: React.FC = () => {
  const navigate = useNavigate();
  const { branchSlug, companySlug } = useParams<{ branchSlug: string; companySlug: string }>();

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
      </div>
      <h3 className="text-sm font-bold text-slate-800">Sales Return</h3>
      <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-400">
        The sales return module is scheduled for implementation in a future phase. Ledger and inventory impact mappings are already pre-routed.
      </p>
      <button
        onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/home`)}
        className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-800"
      >
        Back to Dashboard
      </button>
    </div>
  );
};
