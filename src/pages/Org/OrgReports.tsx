import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Badge } from '../../components/ui';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

interface OrgReportsContext {
  branches: BranchItem[];
  users: UserItem[];
}

const roleLabels: Record<string, string> = {
  ORG_ADMIN: 'Org Admin',
  ORG_USER: 'Org User',
  BRANCH_ADMIN: 'Branch Admin',
  USER: 'Branch Operator',
  KPO: 'KPO Cashier',
};

/*
const roleColors: Record<string, 'purple' | 'blue' | 'green' | 'amber' | 'slate'> = {
  ORG_ADMIN: 'purple',
  ORG_USER: 'blue',
  BRANCH_ADMIN: 'blue',
  USER: 'green',
  KPO: 'amber',
};
*/

// Chart colors
const chartColors = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B'];

type SortOption = {
  label: string;
  value: string;
  order: 'asc' | 'desc';
};

export const OrgReports: React.FC = () => {
  const { branches, users } = useOutletContext<OrgReportsContext>();
  
  // Filter states
  const [searchBranch, setSearchBranch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sort options
  const sortOptions: SortOption[] = [
    { label: 'Branch Name (A-Z)', value: 'name', order: 'asc' },
    { label: 'Branch Name (Z-A)', value: 'name', order: 'desc' },
    { label: 'Staff Count (Low-High)', value: 'staff_count', order: 'asc' },
    { label: 'Staff Count (High-Low)', value: 'staff_count', order: 'desc' },
    { label: 'Date Created (Newest)', value: 'created_at', order: 'desc' },
    { label: 'Date Created (Oldest)', value: 'created_at', order: 'asc' },
  ];

  // Helper to get branch users
  const getBranchUsers = (slug: string) => users.filter(u => u.branch === slug);

  // Get role distribution
  const roleDistribution = [
    { role: 'ORG_ADMIN', count: users.filter(u => u.role === 'ORG_ADMIN').length, label: roleLabels['ORG_ADMIN'] },
    { role: 'ORG_USER', count: users.filter(u => u.role === 'ORG_USER').length, label: roleLabels['ORG_USER'] },
    { role: 'BRANCH_ADMIN', count: users.filter(u => u.role === 'BRANCH_ADMIN').length, label: roleLabels['BRANCH_ADMIN'] },
    { role: 'USER', count: users.filter(u => u.role === 'USER').length, label: roleLabels['USER'] },
    { role: 'KPO', count: users.filter(u => u.role === 'KPO').length, label: roleLabels['KPO'] },
  ];

  const totalActive = users.filter(u => u.is_active).length;
  const totalDisabled = users.filter(u => !u.is_active).length;

  // Filter and sort branches
  const filteredBranches = useMemo(() => {
    let result = [...branches];

    if (searchBranch.trim()) {
      const term = searchBranch.toLowerCase().trim();
      result = result.filter(b => 
        b.name.toLowerCase().includes(term) || 
        b.slug.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(b => {
        const branchUsers = getBranchUsers(b.slug);
        if (statusFilter === 'active') {
          return branchUsers.some(u => u.is_active);
        } else {
          return branchUsers.some(u => !u.is_active);
        }
      });
    }

    if (roleFilter !== 'all') {
      result = result.filter(b => {
        const branchUsers = getBranchUsers(b.slug);
        return branchUsers.some(u => u.role === roleFilter);
      });
    }

    if (sortBy === 'name') {
      result.sort((a, b) => {
        const compare = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'staff_count') {
      result.sort((a, b) => {
        const aCount = getBranchUsers(a.slug).length;
        const bCount = getBranchUsers(b.slug).length;
        const compare = aCount - bCount;
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'created_at') {
      result.sort((a, b) => {
        const compare = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return sortOrder === 'asc' ? compare : -compare;
      });
    }

    return result;
  }, [branches, users, searchBranch, statusFilter, roleFilter, sortBy, sortOrder]);

  const uniqueRoles = Array.from(new Set(users.map(u => u.role)));
  const getCurrentSort = () => `${sortBy}-${sortOrder}`;

  // Chart data
  const roleChartData = {
    labels: roleDistribution.map(r => r.label),
    datasets: [
      {
        data: roleDistribution.map(r => r.count),
        backgroundColor: chartColors,
        borderColor: chartColors.map(() => '#FFFFFF'),
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
    },
    cutout: '60%',
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Role Distribution Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">User Distribution by Role</h2>
            <p className="text-xs text-slate-400 mt-0.5">Breakdown of all user accounts across the organization</p>
          </div>
          <div className="p-5">
            <div className="h-[220px]">
              {users.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No users registered yet.
                </div>
              ) : (
                <Doughnut data={roleChartData} options={doughnutOptions} />
              )}
            </div>
            {users.length > 0 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {roleDistribution.map((r, idx) => (
                  <div key={r.role} className="text-center">
                    <div 
                      className="w-full h-1 rounded-full mb-1"
                      style={{ backgroundColor: chartColors[idx] }}
                    />
                    <span className="text-xs font-semibold text-slate-700">{r.count}</span>
                    <p className="text-[10px] text-slate-400 truncate">{r.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Org Overview Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Organization Overview</h2>
            <p className="text-xs text-slate-400 mt-0.5">High-level org-wide statistics</p>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Total Branches', value: branches.length.toString() },
              { label: 'Total User Accounts', value: users.length.toString() },
              { label: 'Active / Inactive Ratio', value: `${totalActive}/${totalDisabled}` },
              { label: 'Company Management', value: 'Centralized (HQ)' },
              { label: 'Item Management', value: 'Centralized (HQ)' },
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

        {/* Filter Controls */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[150px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search branches..."
              value={searchBranch}
              onChange={(e) => setSearchBranch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="min-w-[140px] px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{roleLabels[role] || role}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="min-w-[140px] px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active Staff</option>
            <option value="inactive">Inactive Staff</option>
          </select>

          <select
            value={getCurrentSort()}
            onChange={(e) => {
              const [value, order] = e.target.value.split('-');
              setSortBy(value);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="min-w-[160px] px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
          >
            {sortOptions.map(opt => (
              <option key={`${opt.value}-${opt.order}`} value={`${opt.value}-${opt.order}`}>
                {opt.label}
              </option>
            ))}
          </select>

          {(searchBranch || roleFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'name' || sortOrder !== 'asc') && (
            <button
              onClick={() => {
                setSearchBranch('');
                setRoleFilter('all');
                setStatusFilter('all');
                setSortBy('name');
                setSortOrder('asc');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
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
        ) : filteredBranches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <p className="text-sm text-slate-500">No branches match your filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch ID</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Admins</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Operators</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">KPOs</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBranches.map((b) => {
                    const localUsers = getBranchUsers(b.slug);
                    const hasActive = localUsers.some(u => u.is_active);
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
                        <td className="px-6 py-4 text-center">
                          <Badge color={hasActive ? 'green' : 'red'}>
                            {hasActive ? 'Active' : 'No Active Staff'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-slate-200 text-xs text-slate-400 bg-slate-50/50">
              Showing {filteredBranches.length} of {branches.length} branches
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrgReports;