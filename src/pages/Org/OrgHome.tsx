import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

interface OrgHomeContext {
  branches: any[];
  users: any[];
}

export const OrgHome: React.FC = () => {
  const { branches, users } = useOutletContext<OrgHomeContext>();
  const navigate = useNavigate();

  const hqUsers = users.filter(u => ['ORG_ADMIN', 'ORG_USER'].includes(u.role));
  const branchUsers = users.filter(u => ['BRANCH_ADMIN', 'USER', 'KPO'].includes(u.role));

  const kpis = [
    {
      title: 'Registered Branches',
      value: branches.length,
      subtitle: 'Active store branches',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: 'HQ Staff',
      value: hqUsers.length,
      subtitle: 'Admins & managers',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Branch Staff',
      value: branchUsers.length,
      subtitle: 'Operators & cashiers',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    {
      title: 'Branch Management',
      description: 'View, manage, and monitor all registered store branches across your organization.',
      linkLabel: 'View Branches',
      linkColor: 'text-blue-600 hover:text-blue-700',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      path: '/org-admin/branches',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: 'Governance Policies',
      description: 'Configure company and item creation policies governing how data is managed org-wide.',
      linkLabel: 'Configure Settings',
      linkColor: 'text-violet-600 hover:text-violet-700',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      path: '/org-admin/settings',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: 'User Access Control',
      description: 'Create and manage HQ and branch-level user accounts with role-based access permissions.',
      linkLabel: 'Manage Users',
      linkColor: 'text-emerald-600 hover:text-emerald-700',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      path: '/org-admin/users',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: 'Analytics & Reports',
      description: 'View comparative analytics on branch staff strength, user distribution, and org-wide metrics.',
      linkLabel: 'View Reports',
      linkColor: 'text-amber-600 hover:text-amber-700',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      path: '/org-admin/reports',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Organization Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back. Here's your organization overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
              <div className={`w-9 h-9 rounded-lg ${kpi.iconBg} flex items-center justify-center shrink-0`}>
                <span className={`w-5 h-5 ${kpi.iconColor}`}>{kpi.icon}</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
            <p className="mt-1 text-xs text-slate-400">{kpi.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <div key={action.title} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center mb-4`}>
              <span className={`w-5 h-5 ${action.iconColor}`}>{action.icon}</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">{action.title}</h3>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">{action.description}</p>
            <button
              onClick={() => navigate(action.path)}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${action.linkColor}`}
            >
              {action.linkLabel}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="flex items-start justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50 p-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">HQ Administration Control</h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">
            Use the sidebar to oversee branch status, toggle data creation policies, manage multi-tenant user access, and view organization-wide analytics.
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default OrgHome;
