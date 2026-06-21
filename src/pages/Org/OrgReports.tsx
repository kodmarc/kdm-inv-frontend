import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Badge } from '../../components/ui';

interface BranchItem {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

interface UserItem {
  id: string;
  username: string;
  email: string | null;
  role: string;
  branch: string | null;
  is_active: boolean;
}

interface OrgSettings {
  name: string;
  org_id: string;
  company_creation_policy: 'ORG_ADMIN' | 'BRANCH_ADMIN';
  item_creation_policy: 'ORG_ADMIN' | 'BRANCH_ADMIN';
}

interface OrgReportsContext {
  branches: BranchItem[];
  users: UserItem[];
  settings: OrgSettings | null;
}

const roleLabels: Record<string, string> = {
  ORG_ADMIN: 'Org Admin',
  ORG_USER: 'Org User',
  BRANCH_ADMIN: 'Branch Admin',
  USER: 'Branch Operator',
  KPO: 'KPO Cashier',
};

const roleColors: Record<string, 'purple' | 'blue' | 'green' | 'amber' | 'slate'> = {
  ORG_ADMIN: 'purple',
  ORG_USER: 'blue',
  BRANCH_ADMIN: 'blue',
  USER: 'green',
  KPO: 'amber',
};

export const OrgReports: React.FC = () => {
  const { branches, users, settings } = useOutletContext<OrgReportsContext>();

  const getBranchUsers = (slug: string) => users.filter(u => u.branch === slug);

  const roleDistribution = [
    { role: 'ORG_ADMIN', count: users.filter(u => u.role === 'ORG_ADMIN').length },
    { role: 'ORG_USER', count: users.filter(u => u.role === 'ORG_USER').length },
    { role: 'BRANCH_ADMIN', count: users.filter(u => u.role === 'BRANCH_ADMIN').length },
    { role: 'USER', count: users.filter(u => u.role === 'USER').length },
    { role: 'KPO', count: users.filter(u => u.role === 'KPO').length },
  ];

  const totalActive = users.filter(u => u.is_active).length;
  const totalDisabled = users.filter(u => !u.is_active).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics & Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Organization-wide metrics and comparative branch analytics.</p>
      </div>

      {/* Top-Level Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Branches', value: branches.length, sub: 'Registered', color: 'bg-blue-50', textColor: 'text-blue-600' },
          { label: 'Total Users', value: users.length, sub: 'All accounts', color: 'bg-violet-50', textColor: 'text-violet-600' },
          { label: 'Active Accounts', value: totalActive, sub: 'Enabled users', color: 'bg-emerald-50', textColor: 'text-emerald-600' },
          { label: 'Disabled Accounts', value: totalDisabled, sub: 'Suspended users', color: 'bg-red-50', textColor: 'text-red-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <span className={`text-lg font-bold ${stat.textColor}`}>{stat.value}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{stat.label}</p>
            <p className="text-xs text-slate-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Role Distribution Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">User Distribution by Role</h2>
            <p className="text-xs text-slate-400 mt-0.5">Breakdown of all user accounts across the organization</p>
          </div>
          <div className="p-5 space-y-3">
            {roleDistribution.map(({ role, count }) => (
              <div key={role} className="flex items-center gap-3">
                <Badge color={roleColors[role] || 'slate'} className="w-28 justify-center shrink-0">
                  {roleLabels[role] || role}
                </Badge>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{ width: users.length > 0 ? `${(count / users.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-700 w-6 text-right shrink-0">{count}</span>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No users registered yet.</p>
            )}
          </div>
        </div>

        {/* Active Scopes Overview Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Governance Overview</h2>
            <p className="text-xs text-slate-400 mt-0.5">Current policy configuration and org-level stats</p>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Total Branches', value: branches.length.toString() },
              { label: 'Total User Accounts', value: users.length.toString() },
              {
                label: 'Company Register Scope',
                value: settings?.company_creation_policy === 'ORG_ADMIN' ? 'Centralized (HQ)' : 'Decentralized (Branch)',
              },
              {
                label: 'Item Register Scope',
                value: settings?.item_creation_policy === 'ORG_ADMIN' ? 'Centralized (HQ)' : 'Decentralized (Branch)',
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Strength by Branch */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Staff Strength by Branch</h2>
          <p className="text-xs text-slate-400 mt-0.5">Personnel headcount breakdown per branch</p>
        </div>

        {branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">No branches registered yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch ID</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Admins</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Operators</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">KPOs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branches.map((b) => {
                const localUsers = getBranchUsers(b.slug);
                return (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{b.name}</td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{b.slug}</code>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge color={localUsers.length > 0 ? 'blue' : 'slate'}>{localUsers.length}</Badge>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">
                      {localUsers.filter(u => u.role === 'BRANCH_ADMIN').length}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">
                      {localUsers.filter(u => u.role === 'USER').length}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">
                      {localUsers.filter(u => u.role === 'KPO').length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrgReports;
