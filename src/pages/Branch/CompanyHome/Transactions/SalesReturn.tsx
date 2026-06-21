import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const SalesReturn: React.FC = () => {
  const navigate = useNavigate();
  const { branchSlug, companySlug } = useParams<{ branchSlug: string; companySlug: string }>();

  return (
    <div className="animate-fade-in bg-white border border-slate-200 rounded-2xl shadow-xs p-12 text-center max-w-lg mx-auto my-12">
      <div className="text-5xl mb-4">🔄</div>
      <h3 className="text-xl font-bold text-sky-600 mb-2">Sales Return Console</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
        The sales return and customer ledger credit notes module is scheduled for implementation in a subsequent phase. Ledger and inventory impact mappings are already pre-routed.
      </p>
      <button 
        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all"
        onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/home`)}
      >
        Return to Dashboard
      </button>
    </div>
  );
};
