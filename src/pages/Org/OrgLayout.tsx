import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

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
  role: 'ORG_ADMIN' | 'ORG_USER' | 'BRANCH_ADMIN' | 'USER' | 'KPO';
  branch: string | null;
  is_active: boolean;
}

interface OrgSettings {
  name: string;
  org_id: string;
  company_creation_policy: 'ORG_ADMIN' | 'BRANCH_ADMIN';
  item_creation_policy: 'ORG_ADMIN' | 'BRANCH_ADMIN';
}

interface CompanyItem {
  id: string;
  name: string;
  code: string;
  branch: string | null;
  created_at: string;
}

interface ItemCategoryItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  branch: string | null;
  created_at: string;
}

interface ItemItem {
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
  branch: string | null;
  created_at: string;
}

export const OrgLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [items, setItems] = useState<ItemItem[]>([]);
  const [categories, setCategories] = useState<ItemCategoryItem[]>([]);

  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isCompaniesLoading, setIsCompaniesLoading] = useState(false);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  // Sequence counter prevents a stale fetchSettings response (from mount) from overwriting
  // a freshly-saved value when the save triggers its own fetch immediately after.
  const settingsFetchSeq = useRef(0);

  const [branchSuccess, setBranchSuccess] = useState('');
  const [branchError, setBranchError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [userError, setUserError] = useState('');
  const [companySuccess, setCompanySuccess] = useState('');
  const [companyError, setCompanyError] = useState('');
  const [itemSuccess, setItemSuccess] = useState('');
  const [itemError, setItemError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const fetchBranches = async () => {
    try {
      const res = await api.get('/org-admin/branches/');
      setBranches(res.data);
    } catch {
      setBranchError('Failed to load branches.');
    }
  };

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const res = await api.get('/users/');
      setUsers(res.data);
    } catch {
      setUserError('Failed to load organization users.');
    } finally {
      setIsUsersLoading(false);
    }
  };

  const fetchSettings = async () => {
    const mySeq = ++settingsFetchSeq.current;
    try {
      const res = await api.get('/org-admin/settings/');
      // Only apply the response if no newer fetch has started since this one was dispatched.
      if (mySeq === settingsFetchSeq.current) {
        setSettings(res.data);
      }
    } catch {
      console.error('Failed to load organization settings.');
    }
  };

  const fetchCompanies = async () => {
    setIsCompaniesLoading(true);
    setCompanyError('');
    try {
      const res = await api.get('/companies/');
      setCompanies(res.data);
    } catch {
      setCompanyError('Failed to load companies catalog.');
    } finally {
      setIsCompaniesLoading(false);
    }
  };

  const fetchItems = async () => {
    setIsItemsLoading(true);
    setItemError('');
    try {
      const res = await api.get('/items/');
      setItems(res.data);
    } catch {
      setItemError('Failed to load items catalog.');
    } finally {
      setIsItemsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setIsCategoriesLoading(true);
    setCategoryError('');
    try {
      const res = await api.get('/item-categories/');
      setCategories(res.data);
    } catch {
      setCategoryError('Failed to load item categories.');
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchUsers();
    fetchSettings();
    fetchCompanies();
    fetchItems();
    fetchCategories();
  }, []);

  const navItems = [
    {
      path: '/org-admin/dashboard',
      label: 'Dashboard',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      path: '/org-admin/branches',
      label: 'Branches',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      path: '/org-admin/companies',
      label: 'Companies',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      path: '/org-admin/items',
      label: 'Item Catalog',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      path: '/org-admin/users',
      label: 'User Management',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      path: '/org-admin/settings',
      label: 'Settings',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      path: '/org-admin/reports',
      label: 'Reports',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const pageTitles: Record<string, string> = {
    '/org-admin/dashboard': 'Dashboard',
    '/org-admin/branches': 'Branches Registry',
    '/org-admin/companies': 'Company Catalogs',
    '/org-admin/items': 'Item & Category Catalog',
    '/org-admin/users': 'User Management',
    '/org-admin/settings': 'Governance Settings',
    '/org-admin/reports': 'Analytics & Reports',
  };

  const getInitials = (name: string) => name.slice(0, 2).toUpperCase();
  const isActive = (path: string) => location.pathname === path;
  const pageTitle = pageTitles[location.pathname] || 'Organization HQ';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col h-full overflow-hidden border-r border-slate-200 bg-white">
        {/* Logo / Brand */}
        <div className="px-4 py-4 border-b border-slate-100">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 text-left w-full">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 leading-tight">
                KDM <span className="text-slate-300">HQ</span>
              </div>
              <div className="text-[10px] text-slate-400 leading-tight truncate max-w-[110px]">
                {user?.org_name}
              </div>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2.5">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`w-4 h-4 shrink-0 ${isActive(item.path) ? 'text-blue-600' : 'text-slate-400'}`}>{item.icon}</span>
                <span>{item.label}</span>
                {isActive(item.path) && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />}
              </button>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5 mb-2.5 px-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {getInitials(user?.username || 'HQ')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">{user?.username}</div>
              <div className="text-[10px] text-slate-400">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors border border-slate-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center px-6 gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-slate-900 truncate">{pageTitle}</h1>
            <p className="text-[11px] text-slate-400">
              {user?.org_name}
              {user?.org_id && (
                <> · <span className="font-mono">{user.org_id.toUpperCase()}</span></>
              )}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 shrink-0">
            HQ Admin
          </span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-6">
            <Outlet
              context={{
                branches,
                users,
                settings,
                companies,
                items,
                categories,
                fetchBranches,
                fetchUsers,
                fetchSettings,
                fetchCompanies,
                fetchItems,
                fetchCategories,
                isUsersLoading,
                isCompaniesLoading,
                isItemsLoading,
                isCategoriesLoading,
                branchSuccess,
                setBranchSuccess,
                branchError,
                setBranchError,
                userSuccess,
                setUserSuccess,
                userError,
                setUserError,
                companySuccess,
                setCompanySuccess,
                companyError,
                setCompanyError,
                itemSuccess,
                setItemSuccess,
                itemError,
                setItemError,
                categorySuccess,
                setCategorySuccess,
                categoryError,
                setCategoryError,
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrgLayout;
