# Types and Interfaces

TypeScript interfaces in this project are defined locally where they are used rather than in a shared types file. The most important interfaces are in `CompanyHomeLayout.tsx` since that layout passes all its data to child pages through the Outlet context.

---

## Auth Types (AuthContext.tsx)

```typescript
interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  role: 'ORG_ADMIN' | 'ORG_USER' | 'BRANCH_ADMIN' | 'USER' | 'KPO';
  org_id: string | null;
  org_name: string | null;
  branch_slug: string | null;
  branch_name: string | null;
  company_creation_policy?: 'ORG_ADMIN' | 'BRANCH_ADMIN' | null;
  item_creation_policy?: 'ORG_ADMIN' | 'BRANCH_ADMIN' | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginOrg: (orgId, role, username, password) => Promise<UserProfile>;
  loginBranch: (orgId, branchSlug, role, username, password) => Promise<UserProfile>;
  signupOrg: (orgId, orgName, username, password) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

---

## Catalog and Master Data Types (CompanyHomeLayout.tsx)

```typescript
interface CompanyItem {
  id: string; name: string; code: string; branch: string | null;
}

interface ItemCategoryItem {
  id: string; name: string; code: string; description?: string; branch: string | null;
}

interface ItemItem {
  id: string; name: string; code: string; sku?: string;
  category: string; category_name: string; category_code: string;
  company?: string; company_name?: string;
  pack?: number; grammage?: string;
  purchase_rate?: string; sales_rate?: string;
  purchase_tax?: string; sales_tax?: string; federal_tax?: string;
  discount_slab_qty?: string; discount_slab_rate?: string;
  min_stock?: string; max_stock?: string;
  current_stock?: string; damaged_stock?: string;
  is_active: boolean; branch: string | null;
}

interface OrderBookerItem {
  id: string; name: string; contact_no: string; email?: string;
  is_active: boolean; branch: string | null;
}

interface SalesmanItem {
  id: string; name: string; contact_no: string; email?: string;
  is_active: boolean; branch: string | null;
}

interface PartyItem {
  id: string; name: string; contact_no: string; email?: string;
  is_active: boolean; is_supplier: boolean; is_party: boolean;
  ntn?: string; gst_no?: string;
  credit_limit: string; balance_amount: string;
  branch: string | null;
}

interface AccountOpeningItem {
  id: string; name: string; code: string;
  opening_balance: string; balance: string;
  is_active: boolean; branch: string | null;
}
```

---

## Transaction Types (CompanyHomeLayout.tsx)

```typescript
interface SalesInvoiceLineItem {
  id?: string; item: string; item_name?: string; item_code?: string;
  bal_qty: string; carton: string; pcs: string; rate: string;
  amount: string; s_tax_amount: string; f_tax_amount: string;
  gross_amount: string; to_rate: string; to_amount: string; net_amount: string;
}

interface SalesInvoiceItem {
  id: string; sale_code: string; date: string; status: 'pending' | 'paid';
  party: string; party_name: string;
  order_booker?: string; salesman?: string; remarks?: string;
  company: string; company_name: string; account: string; account_name: string;
  ntn?: string; gst_no?: string;
  credit_days: number; credit_limit: string; balance_amount: string;
  discount: string; net_amount: string;
  line_items: SalesInvoiceLineItem[];
  created_at: string;
}

interface PurchaseInvoiceLineItem {
  id?: string; item: string; item_name?: string; item_code?: string;
  carton: string; pcs: string; rate: string; amount: string;
  discount_amount: string; to_rate: string; to_amount: string;
  s_tax_rate: string; s_tax_amount: string; net_amount: string;
}

interface PurchaseInvoiceItem {
  id: string; purchase_code: string; date: string;
  supplier: string; supplier_name: string;
  account: string; account_name: string; company: string; company_name: string;
  status: 'pending' | 'paid'; remarks?: string;
  s_tax: string; freight: string; adv_income_tax: string; net_amount: string;
  ntn?: string; gst_no?: string;
  credit_days: number; credit_limit: string; balance_amount: string;
  line_items: PurchaseInvoiceLineItem[];
  created_at: string;
}
```

---

## Outlet Context Type (CompanyHomeLayout.tsx)

The interface `CompanyHomeLayoutContextType` defines what child pages receive via `useOutletContext()`. It includes all the data arrays, the fetch functions, loading/error/success state, and a reference to the `activeCompany` (the company matching the current `:companySlug` URL param).

Child pages import this interface and consume it like:

```typescript
import { useOutletContext } from 'react-router-dom';
import type { CompanyHomeLayoutContextType } from '../CompanyHomeLayout';

const { items, fetchItems, setSuccess, setError } = useOutletContext<CompanyHomeLayoutContextType>();
```
