import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Button, Input, Badge } from '../../components/ui';

interface OrgSettingsData {
  name: string;
  org_id: string;
  company_creation_policy: 'ORG_ADMIN' | 'BRANCH_ADMIN';
  item_creation_policy: 'ORG_ADMIN' | 'BRANCH_ADMIN';
}

interface OrgSettingsContext {
  settings: OrgSettingsData | null;
  fetchSettings: () => Promise<void>;
}

interface PolicyOptionProps {
  name: string;
  value: string;
  currentValue: string;
  onChange: () => void;
  disabled: boolean;
  title: string;
  description: string;
}

const PolicyOption: React.FC<PolicyOptionProps> = ({ name, value, currentValue, onChange, disabled, title, description }) => {
  const isSelected = currentValue === value;
  return (
    <label className={`flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition-colors ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
    } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={isSelected}
        onChange={onChange}
        disabled={disabled}
        className="mt-0.5 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 shrink-0"
      />
      <div>
        <p className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{title}</p>
        <p className={`text-xs mt-0.5 leading-relaxed ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>{description}</p>
      </div>
    </label>
  );
};

export const OrgSettings: React.FC = () => {
  const { user } = useAuth();
  const { settings, fetchSettings } = useOutletContext<OrgSettingsContext>();

  const [orgName, setOrgName] = useState('');
  const [companyPolicy, setCompanyPolicy] = useState<'ORG_ADMIN' | 'BRANCH_ADMIN'>('ORG_ADMIN');
  const [itemPolicy, setItemPolicy] = useState<'ORG_ADMIN' | 'BRANCH_ADMIN'>('ORG_ADMIN');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  useEffect(() => {
    if (settings) {
      setOrgName(settings.name);
      setCompanyPolicy(settings.company_creation_policy);
      setItemPolicy(settings.item_creation_policy);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');
    try {
      await api.put('/org-admin/settings/', {
        name: orgName.trim(),
        company_creation_policy: companyPolicy,
        item_creation_policy: itemPolicy,
      });
      setSettingsSuccess('Organization policies saved successfully.');
      await fetchSettings();
      setTimeout(() => setSettingsSuccess(''), 3000);
    } catch {
      setSettingsError('Failed to save settings. Please try again.');
    }
  };

  const isAdmin = user?.role === 'ORG_ADMIN';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Governance Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Configure organization-wide policies and metadata.</p>
      </div>

      {settingsSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {settingsSuccess}
        </div>
      )}
      {settingsError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {settingsError}
        </div>
      )}

      {!isAdmin && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          You have read-only access. Only Org Admins can modify these settings.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Organization Identity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Organization Identity</h2>
            <p className="text-xs text-slate-400 mt-0.5">Basic organization metadata</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Organization ID</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings?.org_id || ''}
                  disabled
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 font-mono cursor-not-allowed"
                />
                <Badge color="slate">Immutable</Badge>
              </div>
              <p className="text-[11px] text-slate-400">Organization ID cannot be changed after creation.</p>
            </div>
            <Input
              label="Organization Display Name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              disabled={!isAdmin}
            />
          </div>
        </div>

        {/* Company Creation Policy */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Company Creation Policy</h2>
            <p className="text-xs text-slate-400 mt-0.5">Controls where company catalogs are created and managed</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PolicyOption
              name="companyPolicy"
              value="ORG_ADMIN"
              currentValue={companyPolicy}
              onChange={() => setCompanyPolicy('ORG_ADMIN')}
              disabled={!isAdmin}
              title="Centralized (HQ Only)"
              description="Only HQ Admins can create and manage companies. All branches share the same global catalog."
            />
            <PolicyOption
              name="companyPolicy"
              value="BRANCH_ADMIN"
              currentValue={companyPolicy}
              onChange={() => setCompanyPolicy('BRANCH_ADMIN')}
              disabled={!isAdmin}
              title="Decentralized (Branch-Specific)"
              description="Each branch creates and manages its own company catalog independently."
            />
          </div>
        </div>

        {/* Item Catalog Policy */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Item Catalog Scoping Policy</h2>
            <p className="text-xs text-slate-400 mt-0.5">Controls where saleable items and stock registers are defined</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PolicyOption
              name="itemPolicy"
              value="ORG_ADMIN"
              currentValue={itemPolicy}
              onChange={() => setItemPolicy('ORG_ADMIN')}
              disabled={!isAdmin}
              title="Centralized (HQ Only)"
              description="HQ Admins define the item catalog globally. All branches consume the same item list."
            />
            <PolicyOption
              name="itemPolicy"
              value="BRANCH_ADMIN"
              currentValue={itemPolicy}
              onChange={() => setItemPolicy('BRANCH_ADMIN')}
              disabled={!isAdmin}
              title="Decentralized (Branch-Specific)"
              description="Branch admins directly create and manage their own local store items independently."
            />
          </div>
        </div>

        {/* Save Button */}
        {isAdmin && (
          <div className="flex justify-end">
            <Button type="submit">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Save Configuration
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default OrgSettings;
