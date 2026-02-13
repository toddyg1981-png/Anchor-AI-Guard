import React, { useState, useEffect } from 'react';
import { env } from '../config/env';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
  organization: { id: string; name: string } | null;
}

interface ProfileData {
  id?: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  timezone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankBsb: string | null;
  bankRoutingNumber: string | null;
  bankSwiftCode: string | null;
  bankIban: string | null;
  bankCurrency: string | null;
  bankCountry: string | null;
  taxId: string | null;
  taxCountry: string | null;
}

interface VerificationData {
  id?: string;
  status: string;
  companyLegalName: string | null;
  companyTradingName: string | null;
  companyRegistrationNo: string | null;
  companyType: string | null;
  industry: string | null;
  companyWebsite: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  regAddress: string | null;
  regCity: string | null;
  regState: string | null;
  regPostalCode: string | null;
  regCountry: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
}

interface BadgeData {
  id: string;
  badgeCode: string;
  type: string;
  status: string;
  planTier: string | null;
  embedCode: string | null;
  imageUrl: string | null;
  verificationUrl: string | null;
  verificationCount: number;
  issuedAt: string;
  expiresAt: string;
}

const emptyProfile: ProfileData = {
  firstName: null, lastName: null, phone: null, jobTitle: null, department: null, timezone: null,
  address: null, city: null, state: null, postalCode: null, country: null,
  bankName: null, bankAccountName: null, bankAccountNumber: null, bankBsb: null, bankRoutingNumber: null,
  bankSwiftCode: null, bankIban: null, bankCurrency: 'USD', bankCountry: null,
  taxId: null, taxCountry: null,
};

const emptyVerification: VerificationData = {
  status: 'UNVERIFIED',
  companyLegalName: null, companyTradingName: null, companyRegistrationNo: null,
  companyType: null, industry: null, companyWebsite: null, companyEmail: null,
  companyPhone: null, regAddress: null, regCity: null, regState: null,
  regPostalCode: null, regCountry: null, submittedAt: null, verifiedAt: null,
  rejectionReason: null,
};

type TabId = 'personal' | 'bank' | 'tax' | 'verification' | 'badge';

const UserProfileSettings: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [verification, setVerification] = useState<VerificationData>(emptyVerification);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [showDeleteBankConfirm, setShowDeleteBankConfirm] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const token = localStorage.getItem('anchor_auth_token');

  const showNotif = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchProfile();
    fetchVerification();
    fetchBadges();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${env.apiBaseUrl}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setUserData(data.user);
      setProfile(data.profile || emptyProfile);
      setNameValue(data.user?.name || '');
    } catch {
      showNotif('error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVerification = async () => {
    try {
      const res = await fetch(`${env.apiBaseUrl}/verification`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVerification(data.verification || emptyVerification);
      }
    } catch { /* silent */ }
  };

  const fetchBadges = async () => {
    try {
      const res = await fetch(`${env.apiBaseUrl}/verification/badges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBadges(data.badges || []);
      }
    } catch { /* silent */ }
  };

  const saveUserName = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${env.apiBaseUrl}/profile/user`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameValue }),
      });
      if (!res.ok) throw new Error('Failed to update name');
      const data = await res.json();
      setUserData(prev => prev ? { ...prev, name: data.user.name } : prev);
      setEditingName(false);
      showNotif('success', 'Name updated successfully');
    } catch {
      showNotif('error', 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${env.apiBaseUrl}/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to save profile');
      }
      setProfile(data.profile);
      showNotif('success', 'Profile saved successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile';
      showNotif('error', msg);
    } finally {
      setSaving(false);
    }
  };

  const deleteBankDetails = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${env.apiBaseUrl}/profile/bank`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to remove bank details');
      setProfile(prev => ({
        ...prev,
        bankName: null, bankAccountName: null, bankAccountNumber: null,
        bankBsb: null, bankRoutingNumber: null, bankSwiftCode: null, bankIban: null,
        bankCurrency: 'USD', bankCountry: null,
      }));
      setShowDeleteBankConfirm(false);
      showNotif('success', 'Bank details removed');
    } catch {
      showNotif('error', 'Failed to remove bank details');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value || null }));
  };

  const updateVerificationField = (field: keyof VerificationData, value: string) => {
    setVerification(prev => ({ ...prev, [field]: value || null }));
  };

  const saveBusinessDetails = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${env.apiBaseUrl}/verification/save`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyLegalName: verification.companyLegalName,
          companyTradingName: verification.companyTradingName,
          companyRegistrationNo: verification.companyRegistrationNo,
          companyType: verification.companyType,
          industry: verification.industry,
          companyWebsite: verification.companyWebsite,
          companyEmail: verification.companyEmail,
          companyPhone: verification.companyPhone,
          regAddress: verification.regAddress,
          regCity: verification.regCity,
          regState: verification.regState,
          regPostalCode: verification.regPostalCode,
          regCountry: verification.regCountry,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save business details');
      }
      const data = await res.json();
      setVerification(data.verification);
      showNotif('success', 'Business details saved successfully');
    } catch (err: any) {
      showNotif('error', err.message || 'Failed to save business details');
    } finally {
      setSaving(false);
    }
  };

  const submitVerification = async () => {
    if (!verification.companyLegalName) {
      showNotif('error', 'Company legal name is required');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`${env.apiBaseUrl}/verification/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyLegalName: verification.companyLegalName,
          companyTradingName: verification.companyTradingName,
          companyRegistrationNo: verification.companyRegistrationNo,
          companyType: verification.companyType,
          industry: verification.industry,
          companyWebsite: verification.companyWebsite,
          companyEmail: verification.companyEmail,
          companyPhone: verification.companyPhone,
          regAddress: verification.regAddress,
          regCity: verification.regCity,
          regState: verification.regState,
          regPostalCode: verification.regPostalCode,
          regCountry: verification.regCountry,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit');
      }
      const data = await res.json();
      setVerification(prev => ({ ...prev, status: data.verification.status, submittedAt: data.verification.submittedAt }));
      showNotif('success', 'Business verification submitted for review');
      fetchBadges(); // Check if badge was auto-issued
    } catch (err: any) {
      showNotif('error', err.message || 'Failed to submit verification');
    } finally {
      setSaving(false);
    }
  };

  const copyEmbedCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
    showNotif('success', 'Embed code copied to clipboard');
  };

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'bank', label: 'Bank Details', icon: '🏦' },
    { id: 'tax', label: 'Tax Info', icon: '📋' },
    { id: 'verification', label: 'Business Verification', icon: '✅' },
    { id: 'badge', label: 'Security Badge', icon: '🛡️' },
  ];

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan',
    'Netherlands', 'Switzerland', 'Singapore', 'India', 'Brazil', 'Ireland', 'Sweden', 'Norway',
    'Denmark', 'Finland', 'New Zealand', 'Israel', 'South Korea', 'Other',
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'JPY', 'SGD', 'SEK', 'NOK', 'DKK', 'NZD', 'INR', 'BRL'];

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Asia/Singapore', 'Australia/Sydney', 'Pacific/Auckland',
  ];

  const companyTypes = [
    'LLC', 'Ltd', 'Corporation', 'Inc', 'Sole Trader', 'Partnership', 'LLP',
    'PLC', 'GmbH', 'Pty Ltd', 'S.A.', 'Non-Profit', 'Government Agency', 'Other',
  ];

  const industries = [
    'Technology', 'Financial Services', 'Healthcare', 'Government', 'Defense',
    'Energy & Utilities', 'Telecommunications', 'Manufacturing', 'Retail & E-commerce',
    'Education', 'Legal', 'Real Estate', 'Media & Entertainment', 'Transportation',
    'Insurance', 'Consulting', 'Cybersecurity', 'SaaS', 'Other',
  ];

  const VerificationStatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      VERIFIED: { bg: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-300', label: '✅ Verified' },
      PENDING: { bg: 'bg-amber-500/20 border-amber-500/40', text: 'text-amber-300', label: '⏳ Pending Review' },
      UNDER_REVIEW: { bg: 'bg-blue-500/20 border-blue-500/40', text: 'text-blue-300', label: '🔍 Under Review' },
      REJECTED: { bg: 'bg-red-500/20 border-red-500/40', text: 'text-red-300', label: '❌ Rejected' },
      UNVERIFIED: { bg: 'bg-slate-500/20 border-slate-500/40', text: 'text-slate-300', label: '⬜ Unverified' },
    };
    const c = config[status] || config.UNVERIFIED;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto text-cyan-400 mb-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl border text-sm font-medium animate-in slide-in-from-right ${
          notification.type === 'success'
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            : 'bg-red-500/20 border-red-500/40 text-red-300'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Account Settings</h1>
          <p className="text-slate-400 mt-1">Manage your personal information, bank details, and tax information</p>
        </div>
      </div>

      {/* User Card */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-pink-500/25">
            {userData?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && nameValue.trim()) saveUserName(); if (e.key === 'Escape') { setEditingName(false); setNameValue(userData?.name || ''); } }}
                  className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-lg font-semibold focus:outline-none focus:border-cyan-500"
                  autoFocus
                  placeholder="Enter your name"
                />
                <button onClick={saveUserName} disabled={saving || !nameValue.trim()} className="px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditingName(false); setNameValue(userData?.name || ''); }} className="px-3 py-1.5 text-slate-400 rounded-lg text-sm hover:text-white">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-white">{userData?.name || 'No name set'}</h2>
                <button onClick={() => setEditingName(true)} className="text-slate-500 hover:text-cyan-400 transition-colors" title="Edit your display name">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
            <p className="text-slate-400 text-sm">{userData?.email}</p>
            {/* Company name from verification data */}
            {verification.companyLegalName && (
              <p className="text-slate-300 text-sm mt-0.5 flex items-center gap-1.5">
                <span className="text-slate-500">🏢</span>
                {verification.companyLegalName}
                {verification.status === 'VERIFIED' && <span className="text-emerald-400 text-xs">✅</span>}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-block px-2.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full capitalize font-medium">
                {userData?.role}
              </span>
              {userData?.organization && (
                <span className="text-xs text-slate-500">
                  {userData.organization.name}
                </span>
              )}
              {userData?.createdAt && (
                <span className="text-xs text-slate-500">
                  Member since {new Date(userData.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/30 border border-slate-700/50 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#35c6ff]/20 to-[#ff4fa3]/20 text-white border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">👤</span>
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="First Name" value={profile.firstName} onChange={v => updateField('firstName', v)} placeholder="John" />
              <InputField label="Last Name" value={profile.lastName} onChange={v => updateField('lastName', v)} placeholder="Doe" />
              <InputField label="Phone Number" value={profile.phone} onChange={v => updateField('phone', v)} placeholder="+1 (555) 123-4567" type="tel" />
              <InputField label="Job Title" value={profile.jobTitle} onChange={v => updateField('jobTitle', v)} placeholder="Security Engineer" />
              <InputField label="Department" value={profile.department} onChange={v => updateField('department', v)} placeholder="Engineering" />
              <SelectField label="Timezone" value={profile.timezone} onChange={v => updateField('timezone', v)} options={timezones} placeholder="Select timezone" />
            </div>
            <div className="border-t border-slate-700/50 pt-5 mt-5">
              <p className="text-sm font-medium text-slate-300 mb-4">Address</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <InputField label="Street Address" value={profile.address} onChange={v => updateField('address', v)} placeholder="123 Main St, Suite 100" />
                </div>
                <InputField label="City" value={profile.city} onChange={v => updateField('city', v)} placeholder="San Francisco" />
                <InputField label="State / Province" value={profile.state} onChange={v => updateField('state', v)} placeholder="California" />
                <InputField label="Postal Code" value={profile.postalCode} onChange={v => updateField('postalCode', v)} placeholder="94105" />
                <SelectField label="Country" value={profile.country} onChange={v => updateField('country', v)} options={countries} placeholder="Select country" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏦</span>
                <h3 className="text-lg font-semibold text-white">Bank Details</h3>
              </div>
              {(profile.bankName || profile.bankAccountNumber) && (
                <button
                  onClick={() => setShowDeleteBankConfirm(true)}
                  className="px-3 py-1.5 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
                >
                  Remove Bank Details
                </button>
              )}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
              <span className="text-amber-400 mt-0.5">🔒</span>
              <div>
                <p className="text-sm text-amber-300 font-medium">Sensitive Information</p>
                <p className="text-xs text-amber-400/70 mt-0.5">Bank details are encrypted at rest. Account numbers are masked when displayed.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Bank Name" value={profile.bankName} onChange={v => updateField('bankName', v)} placeholder="Chase, HSBC, Barclays..." />
              <InputField label="Account Holder Name" value={profile.bankAccountName} onChange={v => updateField('bankAccountName', v)} placeholder="John Doe" />
              <InputField label="Account Number" value={profile.bankAccountNumber} onChange={v => updateField('bankAccountNumber', v)} placeholder="Enter account number" sensitive />
              <InputField label="BSB (AU/NZ)" value={profile.bankBsb} onChange={v => updateField('bankBsb', v)} placeholder="000-000" sensitive />
              <InputField label="Routing Number (ABA)" value={profile.bankRoutingNumber} onChange={v => updateField('bankRoutingNumber', v)} placeholder="Enter routing number" sensitive />
              <InputField label="SWIFT / BIC Code" value={profile.bankSwiftCode} onChange={v => updateField('bankSwiftCode', v)} placeholder="CHASUS33" />
              <InputField label="IBAN" value={profile.bankIban} onChange={v => updateField('bankIban', v)} placeholder="Enter IBAN" sensitive />
              <SelectField label="Currency" value={profile.bankCurrency} onChange={v => updateField('bankCurrency', v)} options={currencies} placeholder="Select currency" />
              <SelectField label="Bank Country" value={profile.bankCountry} onChange={v => updateField('bankCountry', v)} options={countries} placeholder="Select country" />
            </div>
          </div>
        )}

        {activeTab === 'tax' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📋</span>
              <h3 className="text-lg font-semibold text-white">Tax Information</h3>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
              <span className="text-amber-400 mt-0.5">🔒</span>
              <div>
                <p className="text-sm text-amber-300 font-medium">Tax IDs are encrypted</p>
                <p className="text-xs text-amber-400/70 mt-0.5">Your tax identification number (SSN, EIN, VAT, etc.) is encrypted and only partially visible.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Tax ID (SSN / EIN / VAT)" value={profile.taxId} onChange={v => updateField('taxId', v)} placeholder="Enter tax ID" sensitive />
              <SelectField label="Tax Country" value={profile.taxCountry} onChange={v => updateField('taxCountry', v)} options={countries} placeholder="Select country" />
            </div>
          </div>
        )}

        {/* ─── BUSINESS VERIFICATION TAB ─── */}
        {activeTab === 'verification' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <h3 className="text-lg font-semibold text-white">Business Verification</h3>
              </div>
              <VerificationStatusBadge status={verification.status} />
            </div>

            {/* Status banner */}
            {verification.status === 'VERIFIED' && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                <span className="text-emerald-400 text-xl">✅</span>
                <div>
                  <p className="text-sm text-emerald-300 font-medium">Business Verified</p>
                  <p className="text-xs text-emerald-400/70 mt-0.5">
                    Your business was verified on {verification.verifiedAt ? new Date(verification.verifiedAt).toLocaleDateString() : 'N/A'}.
                    You are confirmed as a legitimate customer.
                  </p>
                </div>
              </div>
            )}
            {verification.status === 'PENDING' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                <span className="text-amber-400 text-xl">⏳</span>
                <div>
                  <p className="text-sm text-amber-300 font-medium">Verification Under Review</p>
                  <p className="text-xs text-amber-400/70 mt-0.5">
                    Submitted on {verification.submittedAt ? new Date(verification.submittedAt).toLocaleDateString() : 'N/A'}.
                    We&apos;re reviewing your business details. This usually takes 1-2 business days.
                  </p>
                </div>
              </div>
            )}
            {verification.status === 'REJECTED' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <span className="text-red-400 text-xl">❌</span>
                <div>
                  <p className="text-sm text-red-300 font-medium">Verification Rejected</p>
                  <p className="text-xs text-red-400/70 mt-0.5">
                    Reason: {verification.rejectionReason || 'Details could not be verified'}.
                    Please update your details and resubmit.
                  </p>
                </div>
              </div>
            )}
            {verification.status === 'UNVERIFIED' && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 flex items-start gap-3">
                <span className="text-cyan-400 text-xl">📝</span>
                <div>
                  <p className="text-sm text-cyan-300 font-medium">Verify Your Business</p>
                  <p className="text-xs text-cyan-400/70 mt-0.5">
                    Submit your business details so we can confirm you&apos;re a real customer.
                    Verified businesses on Pro plans and above receive an official Anchor Security Badge.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Company Legal Name *" value={verification.companyLegalName} onChange={v => updateVerificationField('companyLegalName', v)} placeholder="Acme Corporation Ltd" />
              <InputField label="Trading Name (if different)" value={verification.companyTradingName} onChange={v => updateVerificationField('companyTradingName', v)} placeholder="Acme Corp" />
              <InputField label="Registration Number" value={verification.companyRegistrationNo} onChange={v => updateVerificationField('companyRegistrationNo', v)} placeholder="Company House / EIN / ABN" />
              <SelectField label="Company Type" value={verification.companyType} onChange={v => updateVerificationField('companyType', v)} options={companyTypes} placeholder="Select type" />
              <SelectField label="Industry" value={verification.industry} onChange={v => updateVerificationField('industry', v)} options={industries} placeholder="Select industry" />
              <InputField label="Company Website" value={verification.companyWebsite} onChange={v => updateVerificationField('companyWebsite', v)} placeholder="https://acme.com" />
              <InputField label="Company Email" value={verification.companyEmail} onChange={v => updateVerificationField('companyEmail', v)} placeholder="info@acme.com" type="email" />
              <InputField label="Company Phone" value={verification.companyPhone} onChange={v => updateVerificationField('companyPhone', v)} placeholder="+1 (555) 000-0000" type="tel" />
            </div>

            <div className="border-t border-slate-700/50 pt-5 mt-5">
              <p className="text-sm font-medium text-slate-300 mb-4">Registered Address</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <InputField label="Street Address" value={verification.regAddress} onChange={v => updateVerificationField('regAddress', v)} placeholder="123 Business Park, Suite 100" />
                </div>
                <InputField label="City" value={verification.regCity} onChange={v => updateVerificationField('regCity', v)} placeholder="London" />
                <InputField label="State / Province" value={verification.regState} onChange={v => updateVerificationField('regState', v)} placeholder="Greater London" />
                <InputField label="Postal Code" value={verification.regPostalCode} onChange={v => updateVerificationField('regPostalCode', v)} placeholder="EC2A 4NE" />
                <SelectField label="Country" value={verification.regCountry} onChange={v => updateVerificationField('regCountry', v)} options={countries} placeholder="Select country" />
              </div>
            </div>

            {/* Save & Submit Buttons */}
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-700/50">
              {/* Save Draft Button — always available when not under review */}
              {verification.status !== 'PENDING' && verification.status !== 'UNDER_REVIEW' && (
                <button
                  onClick={saveBusinessDetails}
                  disabled={saving}
                  className="px-6 py-2.5 bg-slate-700/50 text-white border border-slate-600/50 rounded-xl text-sm font-semibold hover:bg-slate-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                      Save Business Details
                    </>
                  )}
                </button>
              )}

              {/* Submit for Verification — only if UNVERIFIED or REJECTED */}
              {(verification.status === 'UNVERIFIED' || verification.status === 'REJECTED') && (
                <button
                  onClick={submitVerification}
                  disabled={saving || !verification.companyLegalName}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      Submitting...
                    </>
                  ) : verification.status === 'REJECTED' ? 'Resubmit for Verification' : 'Submit for Verification'}
                </button>
              )}

              {/* Verified status — show save for updates */}
              {verification.status === 'VERIFIED' && (
                <span className="text-xs text-slate-500 ml-auto">Verified details can be updated and saved at any time</span>
              )}
            </div>
          </div>
        )}

        {/* ─── SECURITY BADGE TAB ─── */}
        {activeTab === 'badge' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🛡️</span>
              <h3 className="text-lg font-semibold text-white">Anchor Security Badge</h3>
            </div>

            {verification.status !== 'VERIFIED' ? (
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8 text-center">
                <span className="text-4xl block mb-3">🔒</span>
                <h4 className="text-lg font-semibold text-white mb-2">Business Verification Required</h4>
                <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
                  To receive your official Anchor Security Badge, your business must first be verified.
                  Badges are available for Pro plan customers and above.
                </p>
                <button
                  onClick={() => setActiveTab('verification')}
                  className="px-5 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors"
                >
                  Go to Business Verification
                </button>
              </div>
            ) : badges.length === 0 ? (
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-8 text-center">
                <span className="text-4xl block mb-3">🏷️</span>
                <h4 className="text-lg font-semibold text-white mb-2">No Badge Issued Yet</h4>
                <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
                  Your business is verified but no badge has been issued yet.
                  Badges are automatically issued for Pro plan customers and above.
                  If you&apos;re on a Pro+ plan and don&apos;t see your badge, please contact support.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {badges.map(badge => (
                  <div key={badge.id} className="bg-slate-700/30 border border-slate-600/50 rounded-2xl overflow-hidden">
                    {/* Badge Preview */}
                    <div className="p-6 bg-gradient-to-br from-slate-800/80 to-slate-900/80 flex items-center justify-center">
                      {badge.imageUrl && (
                        <img src={badge.imageUrl} alt="Anchor Security Badge" className="h-14" />
                      )}
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">Badge ID: <span className="text-cyan-400 font-mono">{badge.badgeCode}</span></p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Issued {new Date(badge.issuedAt).toLocaleDateString()} &bull;
                            Expires {new Date(badge.expiresAt).toLocaleDateString()} &bull;
                            {badge.verificationCount} verifications
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          badge.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                          badge.status === 'EXPIRED' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {badge.status}
                        </span>
                      </div>

                      {/* Verification URL */}
                      {badge.verificationUrl && (
                        <div>
                          <p className="text-xs font-medium text-slate-400 mb-1.5">Verification URL</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-cyan-400 font-mono truncate">
                              {badge.verificationUrl}
                            </code>
                            <button
                              onClick={() => navigator.clipboard.writeText(badge.verificationUrl || '')}
                              className="px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-600/50 transition-colors shrink-0"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Embed Code */}
                      {badge.embedCode && (
                        <div>
                          <p className="text-xs font-medium text-slate-400 mb-1.5">Embed Code — Paste this into your website HTML</p>
                          <div className="relative">
                            <pre className="bg-slate-800/80 border border-slate-700/50 rounded-lg p-3 text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
                              {badge.embedCode}
                            </pre>
                            <button
                              onClick={() => copyEmbedCode(badge.embedCode || '')}
                              className="absolute top-2 right-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-medium hover:brightness-110 transition-all"
                            >
                              {copiedEmbed ? '✓ Copied!' : 'Copy Code'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Badge Info Grid */}
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-700/50">
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">{badge.type}</p>
                          <p className="text-xs text-slate-500">Badge Type</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">{badge.planTier || 'N/A'}</p>
                          <p className="text-xs text-slate-500">Plan Tier</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">{badge.verificationCount}</p>
                          <p className="text-xs text-slate-500">Times Verified</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save Button — only for personal/bank/tax tabs */}
        {(activeTab === 'personal' || activeTab === 'bank' || activeTab === 'tax') && (
          <div className="flex justify-end mt-8 pt-5 border-t border-slate-700/50">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] text-white rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Delete Bank Confirmation Modal */}
      {showDeleteBankConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Remove Bank Details?</h3>
            <p className="text-sm text-slate-400 mb-5">This will permanently delete all your bank account information. This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteBankConfirm(false)} className="px-4 py-2 text-slate-400 hover:text-white rounded-lg text-sm transition-colors">
                Cancel
              </button>
              <button onClick={deleteBankDetails} disabled={saving} className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Removing...' : 'Remove Bank Details'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable input field
const InputField: React.FC<{
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  sensitive?: boolean;
}> = ({ label, value, onChange, placeholder, type = 'text', sensitive }) => {
  const [revealed, setRevealed] = useState(false);
  const isMasked = sensitive && value && value.startsWith('****');

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={sensitive && !revealed ? 'password' : type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
        />
        {sensitive && (
          <button
            type="button"
            onClick={() => setRevealed(!revealed)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            title={revealed ? 'Hide' : 'Show'}
          >
            {revealed ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
        {isMasked && (
          <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-amber-400/60">Masked</span>
        )}
      </div>
    </div>
  );
};

// Reusable select field
const SelectField: React.FC<{
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}> = ({ label, value, onChange, options, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      title={label}
      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors appearance-none"
    >
      <option value="" className="bg-slate-800">{placeholder || 'Select...'}</option>
      {options.map(opt => (
        <option key={opt} value={opt} className="bg-slate-800">{opt}</option>
      ))}
    </select>
  </div>
);

export default UserProfileSettings;
