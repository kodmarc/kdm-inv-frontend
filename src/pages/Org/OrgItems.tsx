import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { Button, Input, Modal } from '../../components/ui';

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
  created_at: string;
}

interface ItemCategoryItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

interface CompanyItem {
  id: string;
  name: string;
  code: string;
}

interface OrgItemsContext {
  items: ItemItem[];
  categories: ItemCategoryItem[];
  companies: CompanyItem[];
  fetchItems: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  isItemsLoading: boolean;
  isCategoriesLoading: boolean;
  itemSuccess: string;
  setItemSuccess: (msg: string) => void;
  itemError: string;
  setItemError: (msg: string) => void;
  categorySuccess: string;
  setCategorySuccess: (msg: string) => void;
  categoryError: string;
  setCategoryError: (msg: string) => void;
}

const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const labelCls = 'block text-xs font-semibold text-slate-700 mb-1.5';

export const OrgItems: React.FC = () => {
  const {
    items, categories, companies,
    fetchItems, fetchCategories,
    isItemsLoading, isCategoriesLoading,
    itemSuccess, setItemSuccess, itemError,
    categorySuccess, setCategorySuccess, categoryError,
  } = useOutletContext<OrgItemsContext>();

  const [activeTab, setActiveTab] = useState<'catalog' | 'categories'>('catalog');
  const [itemSearch, setItemSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  // Item modal state
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [itemSku, setItemSku] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemCompany, setItemCompany] = useState('');
  const [itemPack, setItemPack] = useState('');
  const [itemGrammage, setItemGrammage] = useState('');
  const [itemPurchaseRate, setItemPurchaseRate] = useState('');
  const [itemSalesRate, setItemSalesRate] = useState('');
  const [itemPurchaseTax, setItemPurchaseTax] = useState('');
  const [itemSalesTax, setItemSalesTax] = useState('');
  const [itemFederalTax, setItemFederalTax] = useState('');
  const [itemDiscountSlabQty, setItemDiscountSlabQty] = useState('');
  const [itemDiscountSlabRate, setItemDiscountSlabRate] = useState('');
  const [itemMinStock, setItemMinStock] = useState('');
  const [itemMaxStock, setItemMaxStock] = useState('');
  const [modalItemError, setModalItemError] = useState('');
  const [itemFieldErrors, setItemFieldErrors] = useState<Record<string, string>>({});

  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [modalCategoryError, setModalCategoryError] = useState('');
  const [categoryFieldErrors, setCategoryFieldErrors] = useState<Record<string, string>>({});

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalItemError('');
    setItemFieldErrors({});
    const cleanName = itemName.trim();
    if (!cleanName) return;
    if (!itemCategory) { setModalItemError('Category is required.'); return; }

    const payload: Record<string, unknown> = {
      name: cleanName,
      category: itemCategory,
      sku: itemSku.trim() || null,
      company: itemCompany || null,
      pack: itemPack ? parseInt(itemPack, 10) : null,
      grammage: itemGrammage.trim() || null,
      purchase_rate: itemPurchaseRate || null,
      sales_rate: itemSalesRate || null,
      purchase_tax: itemPurchaseTax || null,
      sales_tax: itemSalesTax || null,
      federal_tax: itemFederalTax || null,
      discount_slab_qty: itemDiscountSlabQty || null,
      discount_slab_rate: itemDiscountSlabRate || null,
      min_stock: itemMinStock || null,
      max_stock: itemMaxStock || null,
    };
    if (itemCode.trim()) payload.code = itemCode.trim();

    try {
      await api.post('/items/', payload);
      setItemSuccess('Item registered successfully.');
      setShowItemModal(false);
      await fetchItems();
      setTimeout(() => setItemSuccess(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, val]) => { errors[key] = Array.isArray(val) ? val.join(' ') : String(val); });
        setItemFieldErrors(errors);
        if (errors.non_field_errors) setModalItemError(errors.non_field_errors);
      } else {
        setModalItemError('Failed to register item.');
      }
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalCategoryError('');
    setCategoryFieldErrors({});
    const cleanName = categoryName.trim();
    if (!cleanName) return;

    const payload: Record<string, unknown> = {
      name: cleanName,
      description: categoryDesc.trim() || null,
    };
    if (categoryCode.trim()) payload.code = categoryCode.trim();

    try {
      await api.post('/item-categories/', payload);
      setCategorySuccess('Item category registered successfully.');
      setShowCategoryModal(false);
      await fetchCategories();
      setTimeout(() => setCategorySuccess(''), 3000);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, val]) => { errors[key] = Array.isArray(val) ? val.join(' ') : String(val); });
        setCategoryFieldErrors(errors);
        if (errors.non_field_errors) setModalCategoryError(errors.non_field_errors);
      } else {
        setModalCategoryError('Failed to register category.');
      }
    }
  };

  const openItemModal = () => {
    setItemName(''); setItemCode(''); setItemSku('');
    setItemCategory(categories.length > 0 ? categories[0].id : '');
    setItemCompany(''); setItemPack(''); setItemGrammage('');
    setItemPurchaseRate(''); setItemSalesRate('');
    setItemPurchaseTax(''); setItemSalesTax(''); setItemFederalTax('');
    setItemDiscountSlabQty(''); setItemDiscountSlabRate('');
    setItemMinStock(''); setItemMaxStock('');
    setModalItemError(''); setItemFieldErrors({});
    setShowItemModal(true);
  };

  const openCategoryModal = () => {
    setCategoryName(''); setCategoryCode(''); setCategoryDesc('');
    setModalCategoryError(''); setCategoryFieldErrors({});
    setShowCategoryModal(true);
  };

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    i.code.toLowerCase().includes(itemSearch.toLowerCase()) ||
    i.category_name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const filteredCats = categories.filter(c =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const successMsg = itemSuccess || categorySuccess;
  const errorMsg = itemError || categoryError;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Item & Category Catalog</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage all items and categories from HQ. Items are visible to branches via company assignment.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {errorMsg}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {[
          { key: 'catalog', label: 'Items Catalog', count: items.length },
          { key: 'categories', label: 'Categories', count: categories.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'catalog' | 'categories')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Items Catalog Tab */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Saleable Items</h2>
              <p className="text-xs text-slate-400 mt-0.5">{items.length} registered items</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-48"
                />
              </div>
              <Button onClick={openItemModal} size="sm" disabled={categories.length === 0}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </Button>
            </div>
          </div>

          {isItemsLoading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              <span className="text-sm text-slate-400">Loading items...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700">
                {itemSearch ? 'No items match your search.' : 'No items registered yet.'}
              </p>
              {!itemSearch && categories.length === 0 && (
                <p className="text-xs text-slate-400 mt-1">Create at least one category before adding items.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code / SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pack / Wt</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Buy / Sell</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{item.name}</td>
                      <td className="px-6 py-4">
                        <code className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{item.code}</code>
                        {item.sku && <div className="text-xs text-slate-400 mt-0.5">SKU: {item.sku}</div>}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{item.category_name}</td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{item.company_name || '—'}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {item.pack && <div className="text-xs">×{item.pack}</div>}
                        {item.grammage && <div className="text-xs text-slate-400">{item.grammage}</div>}
                        {!item.pack && !item.grammage && '—'}
                      </td>
                      <td className="px-6 py-4">
                        {item.purchase_rate ? (
                          <div className="text-xs space-y-0.5">
                            <div className="text-slate-500">Buy: <span className="font-medium text-slate-900">Rs. {item.purchase_rate}</span></div>
                            {item.sales_rate && <div className="text-slate-500">Sell: <span className="font-medium text-slate-900">Rs. {item.sales_rate}</span></div>}
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Item Categories</h2>
              <p className="text-xs text-slate-400 mt-0.5">{categories.length} categories defined</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-48"
                />
              </div>
              <Button onClick={openCategoryModal} size="sm">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Category
              </Button>
            </div>
          </div>

          {isCategoriesLoading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              <span className="text-sm text-slate-400">Loading categories...</span>
            </div>
          ) : filteredCats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700">
                {categorySearch ? 'No categories match your search.' : 'No categories registered yet.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCats.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{cat.name}</td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{cat.code}</code>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{cat.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Item Creation Modal */}
      <Modal show={showItemModal} onClose={() => setShowItemModal(false)} title="Register New Item" size="lg">
        {modalItemError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 mb-4">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {modalItemError}
          </div>
        )}
        <form onSubmit={handleCreateItem} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Item Name *" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Lays Masala Large" error={itemFieldErrors.name} required />
            <div className="flex flex-col">
              <label className={labelCls}>Category *</label>
              <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} required className={inputCls}>
                <option value="">Select Category...</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name} ({cat.code})</option>)}
              </select>
              {itemFieldErrors.category && <span className="text-[11px] font-semibold text-red-600 mt-1">{itemFieldErrors.category}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Item Code (optional)" value={itemCode} onChange={(e) => setItemCode(e.target.value)} placeholder="Leave blank for auto-seq" error={itemFieldErrors.code} />
            <Input label="SKU (optional)" value={itemSku} onChange={(e) => setItemSku(e.target.value)} placeholder="e.g. SKU-12345" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className={labelCls}>Company Catalog (optional)</label>
              <select value={itemCompany} onChange={(e) => setItemCompany(e.target.value)} className={inputCls}>
                <option value="">None (Generic)</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Packaging & Rates</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input label="Pack Size" value={itemPack} onChange={(e) => setItemPack(e.target.value)} placeholder="e.g. 12" type="number" min="1" />
              <Input label="Grammage / Wt" value={itemGrammage} onChange={(e) => setItemGrammage(e.target.value)} placeholder="e.g. 150 g" />
              <Input label="Purchase Rate" value={itemPurchaseRate} onChange={(e) => setItemPurchaseRate(e.target.value)} placeholder="150.00" />
              <Input label="Sales Rate" value={itemSalesRate} onChange={(e) => setItemSalesRate(e.target.value)} placeholder="180.00" />
              <Input label="Purchase Tax (%)" value={itemPurchaseTax} onChange={(e) => setItemPurchaseTax(e.target.value)} placeholder="17" />
              <Input label="Sales Tax (%)" value={itemSalesTax} onChange={(e) => setItemSalesTax(e.target.value)} placeholder="17" />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Slabs & Thresholds</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input label="Federal Tax (%)" value={itemFederalTax} onChange={(e) => setItemFederalTax(e.target.value)} placeholder="3" />
              <Input label="Discount Slab Qty" value={itemDiscountSlabQty} onChange={(e) => setItemDiscountSlabQty(e.target.value)} placeholder="50" />
              <Input label="Discount Slab Rate (%)" value={itemDiscountSlabRate} onChange={(e) => setItemDiscountSlabRate(e.target.value)} placeholder="10" />
              <Input label="Min Stock Alert" value={itemMinStock} onChange={(e) => setItemMinStock(e.target.value)} placeholder="10" />
              <Input label="Max Stock Capacity" value={itemMaxStock} onChange={(e) => setItemMaxStock(e.target.value)} placeholder="1000" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="surface" onClick={() => setShowItemModal(false)}>Cancel</Button>
            <Button type="submit">Register Item</Button>
          </div>
        </form>
      </Modal>

      {/* Category Creation Modal */}
      <Modal show={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Register Item Category">
        {modalCategoryError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 mb-4">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {modalCategoryError}
          </div>
        )}
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input label="Category Name *" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g. Snacks" error={categoryFieldErrors.name} required />
          <Input label="Category Code (optional)" value={categoryCode} onChange={(e) => setCategoryCode(e.target.value)} placeholder="Leave blank for auto-seq" error={categoryFieldErrors.code} />
          <div className="flex flex-col">
            <label className={labelCls}>Description (optional)</label>
            <textarea rows={3} value={categoryDesc} onChange={(e) => setCategoryDesc(e.target.value)} placeholder="Provide category description..." className={`${inputCls} resize-none`} />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="surface" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
            <Button type="submit">Register Category</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrgItems;
