import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const DailySalesReport: React.FC = () => {
  const navigate = useNavigate();
  const { branchSlug, companySlug } = useParams<{ branchSlug: string; companySlug: string }>();

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-sm font-bold text-slate-800">Daily Sales Report</h3>
      <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-400">
        The daily sales summary module is scheduled for implementation in a future phase. Sales ledger statements and stock summaries are already pre-routed.
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

export default DailySalesReport;

