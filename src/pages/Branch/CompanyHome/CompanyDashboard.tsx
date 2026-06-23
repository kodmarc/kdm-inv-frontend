import React from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import type { CompanyHomeLayoutContextType } from './CompanyHomeLayout';

export const CompanyDashboard: React.FC = () => {
  const { branchSlug, companySlug } = useParams<{ branchSlug: string; companySlug: string }>();
  const navigate = useNavigate();

  const { items, categories, salesInvoices, purchaseInvoices, activeCompany, isLoading } =
    useOutletContext<CompanyHomeLayoutContextType>();

  const getPath = (sub: string) => `/branch/${branchSlug}/company/${companySlug}/${sub}`;

  const pendingSales = salesInvoices.filter(i => i.status === 'pending').length;
  const pendingPurchases = purchaseInvoices.filter(i => i.status === 'pending').length;

  const stats = [
    { label: 'Items in Catalog', value: isLoading ? '...' : items.length, color: 'bg-blue-50 text-blue-600', sub: 'Active SKUs', path: 'items' },
    { label: 'Categories', value: categories.length, color: 'bg-violet-50 text-violet-600', sub: 'Item groups', path: 'categories' },
    { label: 'Pending Sales', value: pendingSales, color: 'bg-amber-50 text-amber-600', sub: 'Unpaid invoices', path: 'sales-invoice' },
    { label: 'Pending Purchases', value: pendingPurchases, color: 'bg-rose-50 text-rose-600', sub: 'Unpaid bills', path: 'purchase-invoice' },
  ];

  const quickLinks = [
    {
      title: 'New Sales Invoice',
      desc: 'Create a sales record and update party account.',
      path: getPath('sales-invoice/new'),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
      ),
    },
    {
      title: 'New Purchase Invoice',
      desc: 'Record supplier delivery and update stock.',
      path: getPath('purchase-invoice/new'),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
    },
    {
      title: 'Items Catalog',
      desc: 'Browse and manage your inventory items.',
      path: getPath('items'),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: 'Suppliers & Parties',
      desc: 'Manage vendor and customer contacts.',
      path: getPath('parties'),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-6 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Active Workspace</p>
          <h2 className="mt-0.5 text-lg font-black text-slate-900">
            {activeCompany?.name || companySlug?.toUpperCase()}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Branch: <span className="font-semibold uppercase text-slate-700">{branchSlug}</span>
          </p>
        </div>
        <button
          onClick={() => navigate(`/branch/${branchSlug}/companies`)}
          className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
        >
          <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Switch Company
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(stat => (
          <button
            key={stat.label}
            onClick={() => navigate(getPath(stat.path))}
            className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg text-lg font-black ${stat.color}`}>
              {stat.value}
            </div>
            <p className="text-sm font-semibold text-slate-900">{stat.label}</p>
            <p className="mt-0.5 text-xs text-slate-400">{stat.sub}</p>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-base font-bold text-slate-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map(link => (
            <button
              key={link.title}
              onClick={() => navigate(link.path)}
              className="group flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                {link.icon}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{link.title}</div>
                <p className="mt-0.5 text-xs leading-5 text-slate-400">{link.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
