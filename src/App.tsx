import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Shared Pages
import { LandingPage } from './pages/Shared/LandingPage';
import { LoginScreen } from './pages/Shared/LoginScreen';
import { SignupScreen } from './pages/Shared/SignupScreen';

// Org HQ Pages
import { OrgLayout } from './pages/Org/OrgLayout';
import { OrgHome } from './pages/Org/OrgHome';
import { OrgBranches } from './pages/Org/OrgBranches';
import { OrgCompanies } from './pages/Org/OrgCompanies';
import { OrgItems } from './pages/Org/OrgItems';
import { OrgUsers } from './pages/Org/OrgUsers';
import { OrgReports } from './pages/Org/OrgReports';

// Branch Pages
import { CompanySelection } from './pages/Branch/CompanySelection';
import { BranchControlPanel } from './pages/Branch/CompanyHome/BranchControlPanel';
import { CompanyDashboard } from './pages/Branch/CompanyHome/CompanyDashboard';
import { CompanyHomeLayout } from './pages/Branch/CompanyHome/CompanyHomeLayout';

// Manage Pages
import { ItemsCatalog } from './pages/Branch/CompanyHome/manage/ItemsCatalog';
import { ItemCategories } from './pages/Branch/CompanyHome/manage/ItemCategories';
import { OrderBookers } from './pages/Branch/CompanyHome/manage/OrderBookers';
import { Salesmen } from './pages/Branch/CompanyHome/manage/Salesmen';
import { PartiesRegistry } from './pages/Branch/CompanyHome/manage/PartiesRegistry';
import { AccountsOpening } from './pages/Branch/CompanyHome/manage/AccountsOpening';

// ✅ TRANSACTION IMPORTS
import SalesInvoiceList from './pages/Branch/CompanyHome/Transactions/SalesInvoiceList';
import SalesInvoiceForm from './pages/Branch/CompanyHome/Transactions/SalesInvoiceForm';
import PurchaseInvoiceList from './pages/Branch/CompanyHome/Transactions/PurchaseInvoiceList';
import PurchaseInvoiceForm from './pages/Branch/CompanyHome/Transactions/PurchaseInvoiceForm';
import PurchaseReturnList from './pages/Branch/CompanyHome/Transactions/PurchaseReturnList';
import PurchaseReturnForm from './pages/Branch/CompanyHome/Transactions/PurchaseReturnForm';

// ✅ SALES RETURN (renamed from Damage Receiving)
import SalesReturnList from './pages/Branch/CompanyHome/Transactions/SalesReturnList';
import SalesReturnForm from './pages/Branch/CompanyHome/Transactions/SalesReturnForm';

import LoadForm from './pages/Branch/CompanyHome/Transactions/LoadForm';
import DailySalesReport from './pages/Branch/CompanyHome/Transactions/DailySalesReport';

// KPO Pages
import { KpoCheckout } from './pages/Kpo/KpoCheckout';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-page text-navy">Loading session...</div>;
  }
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />

          {/* Org HQ Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_USER']} />}>
            <Route element={<OrgLayout />}>
              <Route path="/org-admin/dashboard" element={<OrgHome />} />
              <Route path="/org-admin/branches" element={<OrgBranches />} />
              <Route path="/org-admin/companies" element={<OrgCompanies />} />
              <Route path="/org-admin/items" element={<OrgItems />} />
              <Route path="/org-admin/users" element={<OrgUsers />} />
              <Route path="/org-admin/reports" element={<OrgReports />} />
            </Route>
          </Route>

          {/* Branch Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['BRANCH_ADMIN', 'USER']} />}>
            <Route path="/branch/:branchSlug/companies" element={<CompanySelection />} />
            <Route path="/branch/:branchSlug/control-panel" element={<BranchControlPanel />} />

            <Route element={<CompanyHomeLayout />}>
              <Route path="/branch/:branchSlug/company/:companySlug/home" element={<CompanyDashboard />} />
              <Route path="/branch/:branchSlug/company/:companySlug/items" element={<ItemsCatalog />} />
              <Route path="/branch/:branchSlug/company/:companySlug/categories" element={<ItemCategories />} />
              <Route path="/branch/:branchSlug/company/:companySlug/order-bookers" element={<OrderBookers />} />
              <Route path="/branch/:branchSlug/company/:companySlug/salesmen" element={<Salesmen />} />
              <Route path="/branch/:branchSlug/company/:companySlug/parties" element={<PartiesRegistry />} />
              <Route path="/branch/:branchSlug/company/:companySlug/accounts" element={<AccountsOpening />} />

              {/* Sales Invoice */}
              <Route path="/branch/:branchSlug/company/:companySlug/sales-invoice" element={<SalesInvoiceList />} />
              <Route path="/branch/:branchSlug/company/:companySlug/sales-invoice/new" element={<SalesInvoiceForm />} />
              <Route path="/branch/:branchSlug/company/:companySlug/sales-invoice/:id/edit" element={<SalesInvoiceForm />} />

              {/* Purchase Invoice */}
              <Route path="/branch/:branchSlug/company/:companySlug/purchase-invoice" element={<PurchaseInvoiceList />} />
              <Route path="/branch/:branchSlug/company/:companySlug/purchase-invoice/new" element={<PurchaseInvoiceForm />} />
              <Route path="/branch/:branchSlug/company/:companySlug/purchase-invoice/:id/edit" element={<PurchaseInvoiceForm />} />

              {/* Purchase Return */}
              <Route path="/branch/:branchSlug/company/:companySlug/purchase-return" element={<PurchaseReturnList />} />
              <Route path="/branch/:branchSlug/company/:companySlug/purchase-return/new" element={<PurchaseReturnForm />} />
              <Route path="/branch/:branchSlug/company/:companySlug/purchase-return/:id/edit" element={<PurchaseReturnForm />} />

              {/* ✅ Sales Return (renamed from Damage Receiving) */}
              <Route path="/branch/:branchSlug/company/:companySlug/sales-return" element={<SalesReturnList />} />
              <Route path="/branch/:branchSlug/company/:companySlug/sales-return/new" element={<SalesReturnForm />} />
              <Route path="/branch/:branchSlug/company/:companySlug/sales-return/:id/edit" element={<SalesReturnForm />} />

              <Route path="/branch/:branchSlug/company/:companySlug/load-form" element={<LoadForm />} />
              <Route path="/branch/:branchSlug/company/:companySlug/daily-sales-report" element={<DailySalesReport />} />
            </Route>
          </Route>

          {/* KPO POS Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['KPO']} />}>
            <Route path="/kpo/branch/:branchSlug/checkout" element={<KpoCheckout />} />
          </Route>

          {/* Fallbacks */}
          <Route path="/access-denied" element={<div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-4 text-center text-danger"><h2 className="text-2xl font-black text-navy">403 - Access Denied</h2><p className="max-w-md text-sm text-muted">You do not have the required role permissions to view this page.</p></div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;