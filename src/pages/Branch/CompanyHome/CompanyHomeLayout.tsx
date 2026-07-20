import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import api from '../../../services/api';

export interface CompanyItem {
  id: string;
  name: string;
  code: string;
  branches: string[];
}

export interface ItemCategoryItem {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface ItemItem {
  id: string;
  name: string;
  code: string;
  sku?: string;
  category: string;
  category_name: string;
  category_code: string;
  company?: string;
  company_name?: string;
  pack?: number;
  grammage?: string;
  purchase_rate?: string;
  sales_rate?: string;
  purchase_tax?: string;
  sales_tax?: string;
  federal_tax?: string;
  discount_slab_qty?: string;
  discount_slab_rate?: string;
  min_stock?: string;
  max_stock?: string;
  is_active: boolean;
  current_stock?: string;
  damaged_stock?: string;
  created_at?: string;        // ✅ ADDED
  updated_at?: string;        // ✅ ADDED (optional but good to have)
}

export interface OrderBookerItem {
  id: string;
  name: string;
  contact_no: string;
  email?: string;
  is_active: boolean;
  branch: string | null;
}

export interface SalesmanItem {
  id: string;
  name: string;
  contact_no: string;
  email?: string;
  is_active: boolean;
  branch: string | null;
}

export interface PartyItem {
  id: string;
  name: string;
  contact_no: string;
  email?: string;
  is_active: boolean;
  is_supplier: boolean;
  is_party: boolean;
  ntn?: string;
  gst_no?: string;
  credit_limit: string;
  balance_amount: string;
  branch: string | null;
}

export interface AccountOpeningItem {
  id: string;
  name: string;
  code: string;
  opening_balance: string;
  balance: string;
  is_active: boolean;
  branch: string | null;
}

export interface SalesInvoiceLineItem {
  id?: string;
  item: string;
  item_name?: string;
  item_code?: string;
  bal_qty: string;
  carton: string;
  pcs: string;
  rate: string;
  amount: string;
  s_tax_amount: string;
  f_tax_amount: string;
  gross_amount: string;
  to_rate: string;
  to_amount: string;
  net_amount: string;
}

export interface SalesInvoiceItem {
  id: string;
  sale_code: string;
  date: string;
  status: 'pending' | 'paid';
  party: string;
  party_name: string;
  order_booker?: string;
  salesman?: string;
  remarks?: string;
  company: string;
  company_name: string;
  account: string;
  account_name: string;
  ntn?: string;
  gst_no?: string;
  credit_days: number;
  credit_limit: string;
  balance_amount: string;
  discount: string;
  net_amount: string;
  line_items: SalesInvoiceLineItem[];
  created_at: string;
}

export interface PurchaseInvoiceLineItem {
  id?: string;
  item: string;
  item_name?: string;
  item_code?: string;
  carton: string;
  pcs: string;
  rate: string;
  amount: string;
  discount_amount: string;
  to_rate: string;
  to_amount: string;
  s_tax_rate: string;
  s_tax_amount: string;
  net_amount: string;
}

export interface PurchaseInvoiceItem {
  id: string;
  purchase_code: string;
  date: string;
  supplier: string;
  supplier_name: string;
  account: string;
  account_name: string;
  company: string;
  company_name: string;
  status: 'pending' | 'paid';
  remarks?: string;
  s_tax: string;
  freight: string;
  adv_income_tax: string;
  net_amount: string;
  line_items: PurchaseInvoiceLineItem[];
  ntn?: string;
  gst_no?: string;
  credit_days: number;
  credit_limit: string;
  balance_amount: string;
  created_at: string;
}

// ✅ Add interfaces for returns
export interface SalesReturnItem {
  id: string;
  sales_return_code: string;
  date: string;
  salesman: string;
  salesman_name: string;
  party: string;
  party_name: string;
  account: string;
  account_name: string;
  company: string;
  company_name: string;
  status: 'pending' | 'paid';
  return_type: 'normal' | 'damage';
  remarks?: string;
  s_tax: string;
  net_amount: string;
  ntn?: string;
  gst_no?: string;
  credit_days: number;
  credit_limit: string;
  balance_amount: string;
  line_items: any[];
  created_at: string;
}

export interface PurchaseReturnItem {
  id: string;
  purchase_return_code: string;
  date: string;
  party_inv_no?: string;
  supplier: string;
  supplier_name: string;
  account: string;
  account_name: string;
  company: string;
  company_name: string;
  status: 'pending' | 'paid';
  return_type: 'normal' | 'damage';
  remarks?: string;
  s_tax: string;
  freight: string;
  adv_income_tax: string;
  net_amount: string;
  ntn?: string;
  gst_no?: string;
  credit_days: number;
  credit_limit: string;
  balance_amount: string;
  line_items: any[];
  created_at: string;
}

export interface CompanyHomeLayoutContextType {
  companies: CompanyItem[];
  categories: ItemCategoryItem[];
  items: ItemItem[];
  orderBookers: OrderBookerItem[];
  salesmen: SalesmanItem[];
  parties: PartyItem[];
  accounts: AccountOpeningItem[];
  salesInvoices: SalesInvoiceItem[];
  purchaseInvoices: PurchaseInvoiceItem[];
  salesReturns: SalesReturnItem[];
  purchaseReturns: PurchaseReturnItem[];
  isLoading: boolean;
  success: string;
  setSuccess: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  fetchCompanies: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchItems: () => Promise<void>;
  fetchOrderBookers: () => Promise<void>;
  fetchSalesmen: () => Promise<void>;
  fetchParties: () => Promise<void>;
  fetchAccounts: () => Promise<void>;
  fetchSalesInvoices: () => Promise<void>;
  fetchPurchaseInvoices: () => Promise<void>;
  fetchSalesReturns: () => Promise<void>;
  fetchPurchaseReturns: () => Promise<void>;
  activeCompany: CompanyItem | undefined;
}

const roleLabels: Record<string, string> = {
  ORG_ADMIN: 'Org Admin',
  ORG_USER: 'Org User',
  BRANCH_ADMIN: 'Branch Admin',
  USER: 'Operator',
  KPO: 'KPO',
};

const MANAGE_SUBS = ['items', 'categories', 'order-bookers', 'salesmen', 'parties', 'accounts'];
const TRANSACTION_SUBS = ['purchase-invoice', 'sales-invoice', 'purchase-return', 'sales-return', 'load-form', 'daily-sales-report'];

export const CompanyHomeLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { branchSlug, companySlug } = useParams<{ branchSlug: string; companySlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [categories, setCategories] = useState<ItemCategoryItem[]>([]);
  const [items, setItems] = useState<ItemItem[]>([]);
  const [orderBookers, setOrderBookers] = useState<OrderBookerItem[]>([]);
  const [salesmen, setSalesmen] = useState<SalesmanItem[]>([]);
  const [parties, setParties] = useState<PartyItem[]>([]);
  const [accounts, setAccounts] = useState<AccountOpeningItem[]>([]);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoiceItem[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoiceItem[]>([]);
  const [salesReturns, setSalesReturns] = useState<SalesReturnItem[]>([]);
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturnItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const activeCompany = companies.find(c => c.code.toLowerCase() === companySlug?.toLowerCase());

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchCompanies = useCallback(async () => {
    try { const r = await api.get('/companies/'); setCompanies(r.data); } catch { /* silent */ }
  }, []);

  const fetchCategories = useCallback(async () => {
    try { const r = await api.get('/item-categories/'); setCategories(r.data); } catch { /* silent */ }
  }, []);

  const fetchItems = useCallback(async (sortBy?: string, sortOrder?: string) => {
    setIsLoading(true);
    try {
      let url = `/items/?company_code=${companySlug}`;
      if (sortBy) {
        url += `&sort_by=${sortBy}`;
      }
      if (sortOrder) {
        url += `&sort_order=${sortOrder}`;
      }
      const r = await api.get(url);
      setItems(r.data);
    } catch {
      setError('Failed to fetch items catalogue.');
    } finally {
      setIsLoading(false);
    }
  }, [companySlug]);

  const fetchOrderBookers = useCallback(async () => {
    try { const r = await api.get('/order-bookers/'); setOrderBookers(r.data); } catch { /* silent */ }
  }, []);

  const fetchSalesmen = useCallback(async () => {
    try { const r = await api.get('/salesmen/'); setSalesmen(r.data); } catch { /* silent */ }
  }, []);

  const fetchParties = useCallback(async () => {
    try { const r = await api.get('/parties/'); setParties(r.data); } catch { /* silent */ }
  }, []);

  const fetchSalesInvoices = useCallback(async () => {
    try { const r = await api.get('/sales-invoices/'); setSalesInvoices(r.data); } catch { /* silent */ }
  }, []);

  const fetchPurchaseInvoices = useCallback(async () => {
    try { const r = await api.get('/purchase-invoices/'); setPurchaseInvoices(r.data); } catch { /* silent */ }
  }, []);

  const fetchAccounts = useCallback(async () => {
    try { const r = await api.get('/accounts/'); setAccounts(r.data); } catch { /* silent */ }
  }, []);

  const fetchSalesReturns = useCallback(async () => {
    try {
      const res = await api.get('/sales-returns/');
      setSalesReturns(res.data);
    } catch (err) {
      console.error('Failed to fetch sales returns:', err);
    }
  }, []);

  const fetchPurchaseReturns = useCallback(async () => {
    try {
      const res = await api.get('/purchase-returns/');
      setPurchaseReturns(res.data);
    } catch (err) {
      console.error('Failed to fetch purchase returns:', err);
    }
  }, []);

  // Load all data on mount
  useEffect(() => {
    fetchCompanies();
    fetchCategories();
    fetchItems();
    fetchOrderBookers();
    fetchSalesmen();
    fetchParties();
    fetchAccounts();
    fetchSalesInvoices();
    fetchPurchaseInvoices();
    fetchSalesReturns();
    fetchPurchaseReturns();
  }, [companySlug]); // eslint-disable-line react-hooks/exhaustive-deps

  const getSubRoutePath = (sub: string) => `/branch/${branchSlug}/company/${companySlug}/${sub}`;

  const isActive = (sub: string) => {
    const base = getSubRoutePath(sub);
    return location.pathname === base || location.pathname.startsWith(base + '/');
  };

  const isManageActive = MANAGE_SUBS.some(isActive);
  const isTransactionsActive = TRANSACTION_SUBS.some(isActive);

  const toggle = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(prev => prev === name ? null : name);
  };

  const go = (path: string) => { navigate(path); setOpenDropdown(null); };

  const navBtnCls = (active: boolean) =>
    `flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
      active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const dropItemCls = (active: boolean) =>
    `flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
      active ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const Chevron = () => (
    <svg className="h-3 w-3 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">

      {/* ── Top Navigation Bar ── */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">

        {/* Brand */}
        <button
          onClick={() => navigate(`/branch/${branchSlug}/companies`)}
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </span>
          <span className="text-sm font-black text-slate-900">
            KDM<span className="text-slate-300">POS</span>
          </span>
        </button>

        <div className="h-5 w-px shrink-0 bg-slate-200" />

        {/* Company chip */}
        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {activeCompany?.name || companySlug?.toUpperCase()}
        </div>

        <div className="h-5 w-px shrink-0 bg-slate-200" />

        {/* Nav items */}
        <nav ref={navRef} className="flex items-center gap-0.5">

          {/* Dashboard */}
          <button onClick={() => go(getSubRoutePath('home'))} className={navBtnCls(isActive('home'))}>
            Dashboard
          </button>

          {/* Manage */}
          <div className="relative">
            <button onClick={(e) => toggle('manage', e)} className={navBtnCls(isManageActive)}>
              Manage <Chevron />
            </button>
            {openDropdown === 'manage' && (
              <div className="absolute left-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                {[
                  ['Items Catalog', 'items'],
                  ['Item Categories', 'categories'],
                  ['Order Bookers', 'order-bookers'],
                  ['Salesmen', 'salesmen'],
                  ['Suppliers & Parties', 'parties'],
                  ['Account Opening', 'accounts'],
                ].map(([label, sub]) => (
                  <button key={sub} onClick={() => go(getSubRoutePath(sub))} className={dropItemCls(isActive(sub))}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Transactions */}
          <div className="relative">
            <button onClick={(e) => toggle('transactions', e)} className={navBtnCls(isTransactionsActive)}>
              Transactions <Chevron />
            </button>
            {openDropdown === 'transactions' && (
              <div className="absolute left-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                {[
                  ['Purchase Invoice', 'purchase-invoice'],
                  ['Sales Invoice', 'sales-invoice'],
                  ['Purchase Return', 'purchase-return'],
                  ['Sales Return', 'sales-return'],
                  ['Load Form', 'load-form'],
                  ['Daily Sales Report', 'daily-sales-report'],
                ].map(([label, sub]) => (
                  <button key={sub} onClick={() => go(getSubRoutePath(sub))} className={dropItemCls(isActive(sub))}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account */}
          <div className="relative">
            <button onClick={(e) => toggle('account', e)} className={navBtnCls(false)}>
              Account <Chevron />
            </button>
            {openDropdown === 'account' && (
              <div className="absolute left-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                {['Cash Receiving', 'Recovery Form', 'CHQ Deposit Form', 'Payment Voucher', 'Receipt Voucher', 'Journal Voucher'].map(label => (
                  <div key={label} className="flex items-center justify-between rounded-lg px-3 py-2">
                    <span className="text-sm text-slate-400">{label}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">Soon</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reports */}
          <div className="relative">
            <button onClick={(e) => toggle('reports', e)} className={navBtnCls(false)}>
              Reports <Chevron />
            </button>
            {openDropdown === 'reports' && (
              <div className="absolute left-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                {['Sales Summary', 'Inventory Valuation', 'Ledger Statement'].map(label => (
                  <div key={label} className="flex items-center justify-between rounded-lg px-3 py-2">
                    <span className="text-sm text-slate-400">{label}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">Soon</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Control Panel — admins only */}
          {(user?.role === 'ORG_ADMIN' || user?.role === 'BRANCH_ADMIN') && (
            <button onClick={() => go(`/branch/${branchSlug}/control-panel`)} className={navBtnCls(false)}>
              Control Panel
            </button>
          )}
        </nav>

        {/* Right: user + actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            onClick={() => navigate(`/branch/${branchSlug}/companies`)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Switch Company
          </button>

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {user?.username?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="leading-tight">
              <div className="text-xs font-semibold text-slate-800">{user?.username}</div>
              <div className="text-[10px] text-slate-400">{roleLabels[user?.role || ''] || user?.role}</div>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200" />

          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Content Area ── */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6">

        {/* Global success banner */}
        {success && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
            <button onClick={() => setSuccess('')} className="ml-auto text-emerald-600 hover:text-emerald-800">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Global error banner */}
        {error && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
            <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ✅ Pass ALL context values including salesReturns and purchaseReturns */}
        <Outlet context={{
          companies,
          categories,
          items,
          orderBookers,
          salesmen,
          parties,
          accounts,
          salesInvoices,
          purchaseInvoices,
          salesReturns,      
          purchaseReturns,   
          isLoading,
          success, setSuccess,
          error, setError,
          fetchCompanies,
          fetchCategories,
          fetchItems,
          fetchOrderBookers,
          fetchSalesmen,
          fetchParties,
          fetchAccounts,
          fetchSalesInvoices,
          fetchPurchaseInvoices,
          fetchSalesReturns,    
          fetchPurchaseReturns,
          activeCompany
        }} />
      </main>
    </div>
  );
};