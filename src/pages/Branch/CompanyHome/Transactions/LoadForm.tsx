import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const LoadForm: React.FC = () => {
  const navigate = useNavigate();
  const { branchSlug, companySlug } = useParams<{ branchSlug: string; companySlug: string }>();

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      </div>
      <h3 className="text-sm font-bold text-slate-800">Load Form</h3>
      <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-400">
        The load form operations module is scheduled for implementation in a future phase. Pre-load check registers and stock dispatch maps are already pre-routed.
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
