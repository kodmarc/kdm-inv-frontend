import React, { useState, useEffect } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import type { CompanyHomeLayoutContextType } from '../CompanyHomeLayout';
import api from '../../../../services/api';
import { SearchableSelect } from '../../../../components/ui';

// Flexible date parsing function supporting "4 6 2006", "4 jan 2006", "04 06 2006" etc.
const parseFlexibleDate = (str: string): string => {
  if (!str) return '';
  const trimmed = str.trim();
  const parts = trimmed.split(/[\s\-/.]+/);
  
  if (parts.length === 3) {
    let day = parseInt(parts[0], 10);
    let monthInput = parts[1].toLowerCase();
    let year = parseInt(parts[2], 10);
    
    let month = parseInt(monthInput, 10);
    if (isNaN(month)) {
      const monthsAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthsFull = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      
      let foundIndex = monthsAbbr.findIndex(m => monthInput.startsWith(m));
      if (foundIndex === -1) {
        foundIndex = monthsFull.findIndex(m => monthInput.startsWith(m));
      }
      if (foundIndex !== -1) {
        month = foundIndex + 1;
      }
    }
    
    if (!isNaN(year) && year < 100) {
      year += year < 50 ? 2000 : 1900;
    }
    
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const yyyy = String(year);
        const mm = String(month).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
    }
  }
  
  const timestamp = Date.parse(trimmed);
  if (!isNaN(timestamp)) {
    const d = new Date(timestamp);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  
  return trimmed;
};

export const SalesInvoiceForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { branchSlug, companySlug } = useParams<{ branchSlug: string; companySlug: string }>();
  const navigate = useNavigate();

  const {
    items,
    parties,
    orderBookers,
    salesmen,
    accounts,
    salesInvoices,
    fetchSalesInvoices,
    activeCompany,
    setSuccess,
    setError
  } = useOutletContext<CompanyHomeLayoutContextType>();

  // Form fields
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [statusVal, setStatusVal] = useState<'pending' | 'paid'>('pending');
  const [party, setParty] = useState('');
  const [orderBooker, setOrderBooker] = useState('');
  const [salesman, setSalesman] = useState('');
  const [remarks, setRemarks] = useState('');
  const [account, setAccount] = useState('');
  const [discount, setDiscount] = useState('0.00');
  const [lineItems, setLineItems] = useState<any[]>([]);

  // Sync dateInput when date state changes (e.g. on loading existing invoice)
  useEffect(() => {
    if (date) {
      setDateInput(date);
    }
  }, [date]);

  const handleDateBlur = () => {
    const parsed = parseFlexibleDate(dateInput);
    if (/^\d{4}-\d{2}-\d{2}$/.test(parsed)) {
      setDate(parsed);
      setDateInput(parsed);
    }
  };

  // Snapshot/Display Fields from Party
  const [ntn, setNtn] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [creditLimit, setCreditLimit] = useState('0.00');
  const [balanceAmount, setBalanceAmount] = useState('0.00');
  const [creditDays, setCreditDays] = useState(0);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Filter lists by role
  const customerParties = parties.filter(p => p.is_party && p.is_active);
  const activeAccounts = accounts.filter(a => a.is_active);

  // Set default account if available
  useEffect(() => {
    if (!id && activeAccounts.length > 0 && !account) {
      setAccount(activeAccounts[0].id);
    }
  }, [accounts, id]);

  // Load initial empty row if new transaction
  useEffect(() => {
    if (!id && lineItems.length === 0) {
      addEmptyLineItem();
    }
  }, [id, lineItems]);

  // Load existing invoice for editing
  useEffect(() => {
    if (id && salesInvoices.length > 0) {
      const inv = salesInvoices.find(i => i.id === id);
      if (inv) {
        setDate(inv.date);
        setStatusVal(inv.status);
        setParty(inv.party);
        setOrderBooker(inv.order_booker || '');
        setSalesman(inv.salesman || '');
        setRemarks(inv.remarks || '');
        setAccount(inv.account);
        setDiscount(parseFloat(inv.discount).toFixed(2));
        
        // Snapshot loads
        setNtn(inv.ntn || '');
        setGstNo(inv.gst_no || '');
        setCreditLimit(parseFloat(inv.credit_limit).toFixed(2));
        setBalanceAmount(parseFloat(inv.balance_amount).toFixed(2));
        setCreditDays(inv.credit_days || 0);

        // Load line items (Note: backend returns total pieces in `pcs` field)
        const itemsList = inv.line_items.map((line: any) => {
          const matchedItem = items.find(it => it.id === line.item);
          const pack = matchedItem?.pack || 1;
          const totalPcs = parseFloat(line.pcs);
          
          const cartonVal = Math.floor(totalPcs / pack);

          return {
            item: line.item,
            item_name: line.item_name || matchedItem?.name || '—',
            item_code: line.item_code || matchedItem?.code || '—',
            pack: pack,
            bal_qty: line.bal_qty,
            carton: cartonVal,
            loosePcs: totalPcs, // holds total pieces
            rate: parseFloat(line.rate).toFixed(2),
            amount: parseFloat(line.amount).toFixed(2),
            s_tax_rate: matchedItem?.sales_tax || '0.00',
            s_tax_amount: parseFloat(line.s_tax_amount).toFixed(2),
            f_tax_rate: matchedItem?.federal_tax || '0.00',
            f_tax_amount: parseFloat(line.f_tax_amount).toFixed(2),
            gross_amount: parseFloat(line.gross_amount).toFixed(2),
            to_rate: parseFloat(line.to_rate).toFixed(2),
            to_amount: parseFloat(line.to_amount).toFixed(2),
            net_amount: parseFloat(line.net_amount).toFixed(2)
          };
        });
        setLineItems(itemsList);
      }
    }
  }, [id, salesInvoices, items]);

  // Handle party select change to populate snaps
  const handlePartyChange = (partyId: string) => {
    setParty(partyId);
    const selected = parties.find(p => p.id === partyId);
    if (selected) {
      setNtn(selected.ntn || '');
      setGstNo(selected.gst_no || '');
      setCreditLimit(parseFloat(selected.credit_limit).toFixed(2));
      setBalanceAmount(parseFloat(selected.balance_amount).toFixed(2));
      setCreditDays(0);
    }
  };

  // Add empty line item row
  const addEmptyLineItem = () => {
    setLineItems(prev => [
      ...prev,
      {
        item: '',
        item_name: '',
        item_code: '',
        pack: 1,
        bal_qty: '0.00',
        carton: 0,
        loosePcs: 0, // holds total pieces
        rate: '0.00',
        amount: '0.00',
        s_tax_rate: '0.00',
        s_tax_amount: '0.00',
        f_tax_rate: '0.00',
        f_tax_amount: '0.00',
        gross_amount: '0.00',
        to_rate: '0.00',
        to_amount: '0.00',
        net_amount: '0.00'
      }
    ]);
  };

  // Handle changing an item inside a row dropdown
  const handleRowItemChange = (index: number, itemId: string) => {
    if (!itemId) {
      const updated = [...lineItems];
      updated[index] = {
        item: '',
        item_name: '',
        item_code: '',
        pack: 1,
        bal_qty: '0.00',
        carton: 0,
        loosePcs: 0,
        rate: '0.00',
        amount: '0.00',
        s_tax_rate: '0.00',
        s_tax_amount: '0.00',
        f_tax_rate: '0.00',
        f_tax_amount: '0.00',
        gross_amount: '0.00',
        to_rate: '0.00',
        to_amount: '0.00',
        net_amount: '0.00'
      };
      setLineItems(updated);
      return;
    }

    const selected = items.find(it => it.id === itemId);
    if (!selected) return;

    // Check duplicate
    if (lineItems.some((li, idx) => li.item === itemId && idx !== index)) {
      setError('Item is already added to another row.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const updated = [...lineItems];
    const pack = selected.pack || 1;
    const rate = parseFloat(selected.sales_rate || '0.00').toFixed(2);
    const sTaxRate = parseFloat(selected.sales_tax || '0.00').toFixed(2);
    const fTaxRate = parseFloat(selected.federal_tax || '0.00').toFixed(2);

    updated[index] = {
      item: selected.id,
      item_name: selected.name,
      item_code: selected.code,
      pack: pack,
      bal_qty: selected.current_stock || '0.00',
      carton: updated[index].carton || 0,
      loosePcs: updated[index].loosePcs || 0,
      rate: rate,
      amount: '0.00',
      s_tax_rate: sTaxRate,
      s_tax_amount: '0.00',
      f_tax_rate: fTaxRate,
      f_tax_amount: '0.00',
      gross_amount: '0.00',
      to_rate: updated[index].to_rate || '0.00',
      to_amount: '0.00',
      net_amount: '0.00'
    };

    // Calculate row values
    const carton = updated[index].carton;
    let totalPcs = updated[index].loosePcs || 0;
    if (carton > 0 && totalPcs === 0) {
      totalPcs = carton * pack;
      updated[index].loosePcs = totalPcs;
    }
    const parsedRate = parseFloat(rate);
    const parsedSTaxRate = parseFloat(sTaxRate);
    const parsedFTaxRate = parseFloat(fTaxRate);
    const parsedToRate = parseFloat(updated[index].to_rate) || 0;

    const baseAmount = totalPcs * parsedRate;
    const sTaxAmt = baseAmount * (parsedSTaxRate / 100);
    const fTaxAmt = baseAmount * (parsedFTaxRate / 100);
    const grossAmt = baseAmount + sTaxAmt + fTaxAmt;
    const toAmt = baseAmount * (parsedToRate / 100);
    const netAmt = grossAmt - toAmt;

    updated[index].amount = baseAmount.toFixed(2);
    updated[index].s_tax_amount = sTaxAmt.toFixed(2);
    updated[index].f_tax_amount = fTaxAmt.toFixed(2);
    updated[index].gross_amount = grossAmt.toFixed(2);
    updated[index].to_amount = toAmt.toFixed(2);
    updated[index].net_amount = netAmt.toFixed(2);

    setLineItems(updated);
  };

  // Update line item details
  const updateLineItem = (index: number, key: string, value: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index] };

    if (key === 'carton') {
      item.carton = parseFloat(value) || 0;
      item.loosePcs = item.carton * item.pack;
    } else if (key === 'loosePcs') {
      item.loosePcs = parseFloat(value) || 0;
      item.carton = Math.floor(item.loosePcs / item.pack);
    } else if (key === 'rate') {
      item.rate = value;
    } else if (key === 'to_rate') {
      item.to_rate = value;
    }

    // Calculations
    const totalPcs = item.loosePcs; // holds total pieces
    const parsedRate = parseFloat(item.rate) || 0;
    const parsedToRate = parseFloat(item.to_rate) || 0;
    const parsedSTaxRate = parseFloat(item.s_tax_rate) || 0;
    const parsedFTaxRate = parseFloat(item.f_tax_rate) || 0;

    const baseAmount = totalPcs * parsedRate;
    const sTaxAmt = baseAmount * (parsedSTaxRate / 100);
    const fTaxAmt = baseAmount * (parsedFTaxRate / 100);
    const grossAmt = baseAmount + sTaxAmt + fTaxAmt;
    const toAmt = baseAmount * (parsedToRate / 100);
    const netAmt = grossAmt - toAmt;

    item.amount = baseAmount.toFixed(2);
    item.s_tax_amount = sTaxAmt.toFixed(2);
    item.f_tax_amount = fTaxAmt.toFixed(2);
    item.gross_amount = grossAmt.toFixed(2);
    item.to_amount = toAmt.toFixed(2);
    item.net_amount = netAmt.toFixed(2);

    updated[index] = item;
    setLineItems(updated);
  };

  // Remove line item row
  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) {
      setError('Invoice must have at least one row.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  // Totals calculations
  const subtotalSum = lineItems.reduce((sum, li) => sum + (parseFloat(li.amount) || 0), 0);
  const sTaxSum = lineItems.reduce((sum, li) => sum + (parseFloat(li.s_tax_amount) || 0), 0);
  const fTaxSum = lineItems.reduce((sum, li) => sum + (parseFloat(li.f_tax_amount) || 0), 0);
  const toSum = lineItems.reduce((sum, li) => sum + (parseFloat(li.to_amount) || 0), 0);
  const lineNetsSum = lineItems.reduce((sum, li) => sum + (parseFloat(li.net_amount) || 0), 0);
  const invoiceDiscount = parseFloat(discount) || 0;
  const grandTotal = Math.max(0, lineNetsSum - invoiceDiscount);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out blank rows
    const validLines = lineItems.filter(li => li.item);
    if (validLines.length === 0) {
      setError('Invoice must have at least one valid item selected.');
      setTimeout(() => setError(''), 4000);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    let finalDate = date;
    const parsed = parseFlexibleDate(dateInput);
    if (/^\d{4}-\d{2}-\d{2}$/.test(parsed)) {
      finalDate = parsed;
    } else {
      setError('Please enter a valid date (e.g. DD-MM-YYYY or DD Jan YYYY).');
      setIsSubmitting(false);
      setTimeout(() => setError(''), 4000);
      return;
    }

    const payload = {
      date: finalDate,
      status: statusVal,
      party,
      order_booker: orderBooker || null,
      salesman: salesman || null,
      remarks: remarks.trim() || null,
      company: activeCompany?.id,
      account,
      discount: discount || '0.00',
      net_amount: grandTotal.toFixed(2),
      ntn: ntn.trim() || null,
      gst_no: gstNo.trim() || null,
      credit_limit: creditLimit || '0.00',
      balance_amount: balanceAmount || '0.00',
      credit_days: creditDays || 0,
      line_items: validLines.map(li => ({
        item: li.item,
        bal_qty: li.bal_qty || '0.00',
        carton: li.carton,
        pcs: li.loosePcs, // total pieces
        rate: li.rate,
        amount: li.amount,
        s_tax_amount: li.s_tax_amount,
        f_tax_amount: li.f_tax_amount,
        gross_amount: li.gross_amount,
        to_rate: li.to_rate,
        to_amount: li.to_amount,
        net_amount: li.net_amount
      }))
    };

    try {
      if (id) {
        await api.put(`/sales-invoices/${id}/`, payload);
        setSuccess('Sales invoice updated successfully.');
      } else {
        await api.post('/sales-invoices/', payload);
        setSuccess('Sales invoice generated successfully.');
      }
      fetchSalesInvoices();
      setTimeout(() => setSuccess(''), 3000);
      navigate(`/branch/${branchSlug}/company/${companySlug}/sales-invoice`);
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errors: Record<string, string> = {};
        Object.entries(errorData).forEach(([key, val]) => {
          errors[key] = Array.isArray(val) ? val.join(' ') : String(val);
        });
        setFormErrors(errors);
        if (errors.non_field_errors) {
          setError(errors.non_field_errors);
        } else {
          setError('Please review fields with errors.');
        }
      } else {
        setError('An unexpected error occurred while saving invoice.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in bg-white p-6 w-full mx-auto">
      {/* Top Header Row */}
      <div className="mb-6 pb-4 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-navy tracking-tight">
            {id ? 'Modify Sales Invoice' : 'New Sales Invoice'}
          </h3>
          <p className="text-xs text-muted mt-1 font-medium">
            Capture order quantities, snapshot client limits, and record ledger voucher entries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Toggle Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs border flex items-center gap-1.5 ${
                statusVal === 'paid'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
              disabled={isSubmitting}
            >
              Status: {statusVal} <span className="text-[8px]">▼</span>
            </button>
            {isStatusDropdownOpen && (
              <div className="absolute right-0 top-[100%] mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 text-xs font-bold divide-y divide-zinc-50 w-28 overflow-hidden">
                <div
                  onClick={() => {
                    setStatusVal('pending');
                    setIsStatusDropdownOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-rose-50 text-rose-600 cursor-pointer transition-colors"
                >
                  PENDING
                </div>
                <div
                  onClick={() => {
                    setStatusVal('paid');
                    setIsStatusDropdownOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-emerald-50 text-emerald-600 cursor-pointer transition-colors"
                >
                  PAID
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/sales-invoice`)}
            className="cursor-pointer bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-600 text-xs font-bold px-4 py-2 rounded-xl transition-all"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">Invoice Date *</label>
            <input
              type="text"
              required
              className="text-xs border border-zinc-200 rounded-xl px-3 py-2.5 bg-white font-bold outline-hidden focus:outline-hidden"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              onBlur={handleDateBlur}
              disabled={isSubmitting}
            />
            {formErrors.date && <span className="text-[10px] text-danger font-semibold mt-1">{formErrors.date}</span>}
          </div>

          {/* Customer Select */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <SearchableSelect
              label="Customer (Party) *"
              placeholder=""
              options={customerParties.map(p => ({ value: p.id, label: `${p.name} (${p.contact_no})` }))}
              value={party}
              onChange={(val) => handlePartyChange(val)}
              disabled={isSubmitting}
              required
              error={formErrors.party}
            />
          </div>

          {/* Sales Revenue Account */}
          <div className="flex flex-col gap-1.5">
            <SearchableSelect
              label="Sales Revenue Account *"
              placeholder=""
              options={activeAccounts.map(a => ({ value: a.id, label: `${a.name} (${a.code})` }))}
              value={account}
              onChange={(val) => setAccount(val)}
              disabled={isSubmitting}
              required
              error={formErrors.account}
            />
          </div>

          {/* Order Booker */}
          <div className="flex flex-col gap-1.5">
            <SearchableSelect
              label="Order Booker (Optional)"
              placeholder=""
              options={orderBookers.map(b => ({ value: b.id, label: b.name }))}
              value={orderBooker}
              onChange={(val) => setOrderBooker(val)}
              disabled={isSubmitting}
            />
          </div>

          {/* Salesman */}
          <div className="flex flex-col gap-1.5">
            <SearchableSelect
              label="Salesman (Optional)"
              placeholder=""
              options={salesmen.map(s => ({ value: s.id, label: s.name }))}
              value={salesman}
              onChange={(val) => setSalesman(val)}
              disabled={isSubmitting}
            />
          </div>

          {/* Remarks */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">Remarks & Special Instructions</label>
            <input
              type="text"
              className="text-xs border border-zinc-200 rounded-xl px-3 py-2.5 bg-white font-bold outline-hidden focus:outline-hidden"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* NTN */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">NTN</label>
            <input
              type="text"
              className="text-xs border border-zinc-200 rounded-xl px-3 py-2.5 bg-white font-bold outline-hidden focus:outline-hidden"
              value={ntn}
              onChange={(e) => setNtn(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* GST */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">GST Registration</label>
            <input
              type="text"
              className="text-xs border border-zinc-200 rounded-xl px-3 py-2.5 bg-white font-bold outline-hidden focus:outline-hidden"
              value={gstNo}
              onChange={(e) => setGstNo(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Credit Limit */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">Credit Limit (Rs.)</label>
            <input
              type="number"
              step="0.01"
              className="text-xs border border-zinc-200 rounded-xl px-3 py-2.5 bg-white font-bold outline-hidden focus:outline-hidden"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Outstanding Balance */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">Outstanding Bal. (Rs.)</label>
            <input
              type="number"
              step="0.01"
              className="text-xs border border-zinc-200 rounded-xl px-3 py-2.5 bg-white font-bold outline-hidden focus:outline-hidden"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Credit Days Allowed */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">Credit Days Allowed</label>
            <input
              type="number"
              className="text-xs border border-zinc-200 rounded-xl px-3 py-2.5 bg-white font-bold outline-hidden focus:outline-hidden"
              value={creditDays}
              onChange={(e) => setCreditDays(parseInt(e.target.value, 10) || 0)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Step 2: Line Items Grid */}
        <div className="pt-4">
          <table className="min-w-full border-collapse border border-zinc-200 text-left">
            <thead>
              <tr className="bg-zinc-50 text-[10px] font-bold tracking-wider text-muted uppercase">
                <th className="border border-zinc-200 px-3 py-2 min-w-[220px]">Item Name</th>
                <th className="border border-zinc-200 px-3 py-2 text-right w-16">Bal. Stock</th>
                <th className="border border-zinc-200 px-3 py-2 text-right w-20">Carton</th>
                <th className="border border-zinc-200 px-3 py-2 text-right w-20">Pieces (Pcs)</th>
                <th className="border border-zinc-200 px-3 py-2 text-right w-24">Rate (Pc)</th>
                <th className="border border-zinc-200 px-3 py-2 text-right">Tax (S/F)</th>
                <th className="border border-zinc-200 px-3 py-2 text-right w-20">T.O Rate (%)</th>
                <th className="border border-zinc-200 px-3 py-2 text-right">Gross Total</th>
                <th className="border border-zinc-200 px-3 py-2 text-right">Net Amount</th>
                <th className="border border-zinc-200 px-3 py-2 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs font-medium text-zinc-700 bg-white">
              {lineItems.map((li, index) => {
                return (
                  <tr key={index} className="hover:bg-zinc-50/20 transition-colors">
                    <td className="border border-zinc-200 p-0">
                      <SearchableSelect
                        compact
                        borderless
                        placeholder="-- Select Item --"
                        options={items.filter(it => it.is_active).map(it => ({ value: it.id, label: `${it.name} (${it.code})` }))}
                        value={li.item}
                        onChange={(val) => handleRowItemChange(index, val)}
                        disabled={isSubmitting}
                      />
                    </td>
                    
                    <td className="border border-zinc-200 px-3 py-2 text-right text-zinc-500 font-semibold">
                      {parseFloat(li.bal_qty).toFixed(0)}
                    </td>
                    
                    {/* Carton */}
                    <td className="border border-zinc-200 p-0 text-right">
                      <input
                        type="number"
                        min="0"
                        className="w-full h-full text-right bg-transparent border-0 focus:outline-hidden focus:ring-0 px-3 py-2 text-xs font-semibold"
                        value={li.carton}
                        onChange={(e) => updateLineItem(index, 'carton', e.target.value)}
                        disabled={isSubmitting || !li.item}
                      />
                    </td>

                    {/* Pieces */}
                    <td className="border border-zinc-200 p-0 text-right">
                      <input
                        type="number"
                        min="0"
                        className="w-full h-full text-right bg-transparent border-0 focus:outline-hidden focus:ring-0 px-3 py-2 text-xs font-semibold"
                        value={li.loosePcs}
                        onChange={(e) => updateLineItem(index, 'loosePcs', e.target.value)}
                        disabled={isSubmitting || !li.item}
                      />
                    </td>

                    {/* Rate */}
                    <td className="border border-zinc-200 p-0 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full h-full text-right bg-transparent border-0 focus:outline-hidden focus:ring-0 px-3 py-2 text-xs font-semibold"
                        value={li.rate}
                        onChange={(e) => updateLineItem(index, 'rate', e.target.value)}
                        disabled={isSubmitting || !li.item}
                      />
                    </td>

                    {/* Taxes */}
                    <td className="border border-zinc-200 px-3 py-2 text-right">
                      {li.item ? (
                        <>
                          <div className="text-zinc-700">S: Rs. {parseFloat(li.s_tax_amount).toFixed(2)} <span className="text-[9px] text-muted">({li.s_tax_rate}%)</span></div>
                          <div className="text-zinc-600 mt-0.5">F: Rs. {parseFloat(li.f_tax_amount).toFixed(2)} <span className="text-[9px] text-muted">({li.f_tax_rate}%)</span></div>
                        </>
                      ) : '—'}
                    </td>

                    {/* TO Rate */}
                    <td className="border border-zinc-200 p-0 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full h-full text-right bg-transparent border-0 focus:outline-hidden focus:ring-0 px-3 py-2 text-xs font-semibold"
                        value={li.to_rate}
                        onChange={(e) => updateLineItem(index, 'to_rate', e.target.value)}
                        disabled={isSubmitting || !li.item}
                      />
                    </td>

                    {/* Gross */}
                    <td className="border border-zinc-200 px-3 py-2 text-right text-zinc-600">
                      {li.item ? `Rs. ${parseFloat(li.gross_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </td>

                    {/* Net */}
                    <td className="border border-zinc-200 px-3 py-2 text-right text-navy font-bold">
                      {li.item ? `Rs. ${parseFloat(li.net_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </td>

                    {/* Action delete & add */}
                    <td className="border border-zinc-200 px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={addEmptyLineItem}
                          className="cursor-pointer text-emerald-600 hover:text-emerald-800 text-sm font-bold w-6 h-6 rounded hover:bg-emerald-50 transition-colors flex items-center justify-center border border-emerald-100"
                          title="Add new line"
                          disabled={isSubmitting}
                        >
                          ＋
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="cursor-pointer text-danger hover:text-red-700 text-sm font-bold w-6 h-6 rounded hover:bg-red-50 transition-colors flex items-center justify-center border border-red-100"
                          title="Delete line"
                          disabled={isSubmitting}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pt-3 flex justify-start">
            <button
              type="button"
              onClick={addEmptyLineItem}
              className="cursor-pointer text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all font-bold"
              disabled={isSubmitting}
            >
              + Add a line
            </button>
          </div>
        </div>

        {/* Step 3: Summaries */}
        <div className="flex justify-end items-start pt-4">
          <div className="border border-zinc-200 rounded-2xl p-5 w-full max-w-md space-y-3.5 text-xs text-zinc-700 font-semibold">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
              <span>Subtotal Sum</span>
              <span className="text-zinc-900">Rs. {subtotalSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            
            <div className="flex justify-between items-center text-zinc-600">
              <span>Sales Tax Total</span>
              <span>Rs. {sTaxSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center text-zinc-600">
              <span>Further Tax Total</span>
              <span>Rs. {fTaxSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center text-zinc-600">
              <span>Trade Offer Deduction</span>
              <span className="text-rose-600">- Rs. {toSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {/* Discount input */}
            <div className="flex justify-between items-center py-1 border-t border-b border-dashed border-zinc-200">
              <span>Invoice Discount (Rs.)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-28 text-right text-xs border border-zinc-200 rounded-lg px-2 py-1 bg-white font-bold text-rose-600 outline-hidden"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-between items-center text-primary text-sm font-bold pt-1.5">
              <span>Grand Total</span>
              <span>Rs. {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Submit action */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/branch/${branchSlug}/company/${companySlug}/sales-invoice`)}
            className="cursor-pointer bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Saving Invoice...</span>
            ) : (
              <span>{id ? 'Save Changes' : 'Generate Invoice'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
