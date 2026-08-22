import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { CompanyInformationData, IndustryType, BusinessType, CompanySize } from '../../types';
import { indianCities } from '../../data/mockData';
import { Building, MapPin, ArrowRight } from 'lucide-react';

interface Props {
  initialData: CompanyInformationData;
  onNext: (data: CompanyInformationData) => void;
}

export const CompanyInformationStep: React.FC<Props> = ({ initialData, onNext }) => {
  const [formData, setFormData] = useState<CompanyInformationData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1 mb-6 text-center sm:text-left">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 justify-center sm:justify-start">
          <Building className="w-5 h-5 text-sky-400" />
          Step 1: Company Information
        </h2>
        <p className="text-sm text-slate-400">
          Enter basic details about your business organization to customize your risk profile.
        </p>
      </div>

      <Input
        label="Company Name"
        placeholder="e.g. Apex MotorWorks Ltd"
        value={formData.companyName}
        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
        error={errors.companyName}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Industry Sector"
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value as IndustryType })}
          options={industries.map((ind) => ({ value: ind, label: ind }))}
          required
        />

        <Select
          label="Business Type"
          value={formData.businessType}
          onChange={(e) => setFormData({ ...formData, businessType: e.target.value as BusinessType })}
          options={businessTypes.map((bt) => ({ value: bt, label: bt }))}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Company Size"
          value={formData.companySize}
          onChange={(e) => setFormData({ ...formData, companySize: e.target.value as CompanySize })}
          options={companySizes.map((sz) => ({
            value: sz,
            label: `${sz} Enterprise`,
          }))}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Headquarters / Key Location <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              list="indian-cities"
              placeholder="e.g. Pune, Maharashtra"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={`flex h-10 w-full rounded-lg border bg-slate-900/90 pl-10 pr-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${
                errors.location ? 'border-rose-500' : 'border-slate-700/80'
              }`}
            />
            <datalist id="indian-cities">
              {indianCities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>
          {errors.location && <p className="text-xs text-rose-400 font-medium">{errors.location}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-800">
        <Button type="submit" className="w-full sm:w-auto">
          Next: Supply Chain Profile <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </form>
  );
};
