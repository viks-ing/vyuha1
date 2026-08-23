import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { BusinessConstraintsData, RiskTolerance } from '../../types';
import { ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../lib/utils';

interface Props {
  initialData: BusinessConstraintsData;
  onComplete: (data: BusinessConstraintsData) => void;
  onBack: () => void;
}

export const BusinessConstraintsStep: React.FC<Props> = ({ initialData, onComplete, onBack }) => {
  const [formData, setFormData] = useState<BusinessConstraintsData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const riskOptions: RiskTolerance[] = ['Low', 'Medium', 'High'];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.maxAcceptableDelayDays || formData.maxAcceptableDelayDays < 1) {
      newErrors.maxAcceptableDelayDays = 'Maximum acceptable delay must be at least 1 day';
    }
    if (formData.maxAdditionalBudget < 0) {
      newErrors.maxAdditionalBudget = 'Budget cannot be negative';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onComplete(formData);
      }, 600);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1 mb-6 text-center sm:text-left">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
          <ShieldAlert className="w-5 h-5 text-sky-600" />
          Step 3: Business Constraints & Tolerance
        </h2>
        <p className="text-sm text-slate-600">
          Define risk thresholds and maximum buffer limits for disruption management.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Maximum Acceptable Delay (Days)"
          type="number"
          min="1"
          placeholder="e.g. 5"
          value={formData.maxAcceptableDelayDays || ''}
          onChange={(e) => setFormData({ ...formData, maxAcceptableDelayDays: parseInt(e.target.value) || 0 })}
          helperText="Maximum allowed schedule slip before assembly line disruption."
          error={errors.maxAcceptableDelayDays}
          required
        />

        <Select
          label="Risk Tolerance Level"
          value={formData.riskTolerance}
          onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value as RiskTolerance })}
          options={riskOptions.map((opt) => ({
            value: opt,
            label: `${opt} Risk Tolerance`,
          }))}
          helperText="Used to trigger proactive warning notifications & alert flags."
          required
        />
      </div>

      <div className="space-y-1.5">
        <Input
          label="Maximum Additional Logistics Budget (₹)"
          type="number"
          step="1000"
          placeholder="e.g. 50000"
          value={formData.maxAdditionalBudget || ''}
          onChange={(e) => setFormData({ ...formData, maxAdditionalBudget: parseInt(e.target.value) || 0 })}
          helperText="Maximum contingency funds allocated for emergency rerouting or expedite fees."
          error={errors.maxAdditionalBudget}
          required
        />
        {formData.maxAdditionalBudget > 0 && (
          <p className="text-xs text-sky-600 font-medium pt-1">
            Selected Budget Limit: <span className="font-bold">{formatINR(formData.maxAdditionalBudget)}</span>
          </p>
        )}
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Summary of Settings</p>
        <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
          <li>Delay threshold: <span className="text-slate-900 font-medium">{formData.maxAcceptableDelayDays} Days</span></li>
          <li>Contingency budget: <span className="text-slate-900 font-medium">{formatINR(formData.maxAdditionalBudget)}</span></li>
          <li>Tolerance mode: <span className="text-sky-700 font-medium">{formData.riskTolerance}</span></li>
        </ul>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200 gap-3">
        <Button type="submit" variant="primary" isLoading={isSubmitting} className="min-w-[160px]">
          <CheckCircle2 className="w-4 h-4 mr-1" /> Complete Setup
        </Button>
      </div>
    </form>
  );
};
