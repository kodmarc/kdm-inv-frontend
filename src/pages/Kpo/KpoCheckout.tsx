import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';

export const KpoCheckout: React.FC = () => {
  const { user, logout } = useAuth();
  const { branchSlug } = useParams<{ branchSlug: string }>();

  return (
    <div>
      <div>
        <div>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h2>POS Register: {branchSlug}</h2>
        <p>
          Operator: <span>{user?.username}</span> ({user?.role})
        </p>
        
        <div>
          KPO POS billing module under development
        </div>

        <button 
          onClick={logout}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
export default KpoCheckout;
