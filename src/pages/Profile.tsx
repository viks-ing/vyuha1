import React, { useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { IndustryType, BusinessType, CompanySize, TransportMode } from '../types';
import { Building2, Truck, Save, CheckCircle2, MapPin } from 'lucide-react';
import { indianCities } from '../data/mockData';

export const Profile: React.FC = () => {
  const { company, updateCompanyInfo, updateSupplyChainProfile, showToast } = useCompany();

  const [infoState, setInfoState] = useState(company.info);
  const [profileState, setProfileState] = useState(company.profile);
  const [isSaving, setIsSaving] = useState(false);

  const industries: IndustryType[] = [
    'Manufacturing',
    'Agriculture',
    'Retail',
    'Pharmaceuticals',
    'Electronics',
    'Automotive',
    'FMCG',
    'Textiles',
    'Other',
  ];
  const businessTypes: BusinessType[] = ['B2B', 'B2C', 'B2B2C'];
  const companySizes: CompanySize[] = ['Micro', 'Small', 'Medium', 'Large'];
  const transportModes: TransportMode[] = ['Road', 'Rail', 'Air', 'Sea', 'Multimodal'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateCompanyInfo(infoState);
      updateSupplyChainProfile(profileState);
      setIsSaving(false);
      showToast('Profile updated successfully!');
    }, 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Company & Supply Chain Profile</h2>
        <p className="text-sm text-slate-400">
          Manage your organizational identity and operational logistics baselines.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Company Information Card */}
        <Card className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-400" />
              Company Information
            </CardTitle>
            <CardDescription>General enterprise identification and sector classification</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              label="Company Name"
              value={infoState.companyName}
              onChange={(e) => setInfoState({ ...infoState, companyName: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Industry Sector"
                value={infoState.industry}
                onChange={(e) => setInfoState({ ...infoState, industry: e.target.value as IndustryType })}
                options={industries.map((i) => ({ value: i, label: i }))}
              />

              <Select
                label="Business Model"
                value={infoState.businessType}
                onChange={(e) => setInfoState({ ...infoState, businessType: e.target.value as BusinessType })}
                options={businessTypes.map((b) => ({ value: b, label: b }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Company Size"
                value={infoState.companySize}
                onChange={(e) => setInfoState({ ...infoState, companySize: e.target.value as CompanySize })}
                options={companySizes.map((s) => ({ value: s, label: `${s} Enterprise` }))}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Headquarters Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    list="profile-cities"
                    value={infoState.location}
                    onChange={(e) => setInfoState({ ...infoState, location: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-slate-700/80 bg-slate-900/90 pl-10 pr-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                  <datalist id="profile-cities">
                    {indianCities.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Supply Chain Parameters Card */}
        <Card className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              Supply Chain Operational Metrics
            </CardTitle>
            <CardDescription>Logistics constraints and transit baseline settings</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Number of Suppliers"
                type="number"
                min="1"
                value={profileState.supplierCount}
                onChange={(e) =>
                  setProfileState({ ...profileState, supplierCount: parseInt(e.target.value) || 0 })
                }
                helperText="Active Tier-1 component & material vendors."
                required
              />

              <Select
                label="Main Transportation Mode"
                value={profileState.primaryTransportMode}
                onChange={(e) =>
                  setProfileState({ ...profileState, primaryTransportMode: e.target.value as TransportMode })
                }
                options={transportModes.map((m) => ({ value: m, label: `${m} Freight` }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Average Lead Time (Days)"
                type="number"
                step="0.5"
                min="0.5"
                value={profileState.averageLeadTimeDays}
                onChange={(e) =>
                  setProfileState({ ...profileState, averageLeadTimeDays: parseFloat(e.target.value) || 0 })
                }
                helperText="Average days from order dispatch to delivery."
                required
              />

              <Input
                label="Delivery Distance (km)"
                type="number"
                min="1"
                value={profileState.deliveryDistanceKm}
                onChange={(e) =>
                  setProfileState({ ...profileState, deliveryDistanceKm: parseInt(e.target.value) || 0 })
                }
                helperText="Average transit route distance."
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Bottom Save Action */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" isLoading={isSaving} className="min-w-[180px]">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
