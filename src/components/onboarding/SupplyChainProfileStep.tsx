import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { SupplyChainProfileData, TransportMode } from '../../types';
import { Truck, ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  initialData: SupplyChainProfileData;
  onNext: (data: SupplyChainProfileData) => void;
  onBack: () => void;
}

export const SupplyChainProfileStep: React.FC<Props> = ({ initialData, onNext, onBack }) => {
  const [formData, setFormData] = useState<SupplyChainProfileData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const transportModes: TransportMode[] = ['Road', 'Rail', 'Air', 'Sea', 'Multimodal'];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.supplierCount || formData.supplierCount < 1) {
      newErrors.supplierCount = 'Supplier count must be at least 1';
    }
    if (!formData.averageLeadTimeDays || formData.averageLeadTimeDays <= 0) {
      newErrors.averageLeadTimeDays = 'Average lead time must be greater than 0';
    }
    if (!formData.deliveryDistanceKm || formData.deliveryDistanceKm <= 0) {
      newErrors.deliveryDistanceKm = 'Delivery distance must be greater than 0';
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
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
          <Truck className="w-5 h-5 text-sky-600" />
          Step 2: Supply Chain Profile
        </h2>
        <p className="text-sm text-slate-600">
          Specify your operational logistics metrics to baseline risk calculation models.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Number of Key Suppliers"
          type="number"
          min="1"
          placeholder="e.g. 24"
          value={formData.supplierCount || ''}
          onChange={(e) => setFormData({ ...formData, supplierCount: parseInt(e.target.value) || 0 })}
          helperText="Total active Tier-1 & Tier-2 raw material or component suppliers."
          error={errors.supplierCount}
          required
        />

        <Select
          label="Main Transportation Mode"
          value={formData.primaryTransportMode}
          onChange={(e) => setFormData({ ...formData, primaryTransportMode: e.target.value as TransportMode })}
          options={transportModes.map((mode) => ({ value: mode, label: `${mode} Freight` }))}
          helperText="Primary mode used for long-haul dispatch and transit corridors."
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Average Lead Time (Days)"
          type="number"
          step="0.5"
          min="0.5"
          placeholder="e.g. 8"
          value={formData.averageLeadTimeDays || ''}
          onChange={(e) => setFormData({ ...formData, averageLeadTimeDays: parseFloat(e.target.value) || 0 })}
          helperText="Average number of days between supplier dispatch and receiving inventory."
          error={errors.averageLeadTimeDays}
          required
        />

        <Input
          label="Delivery Distance (km)"
          type="number"
          min="1"
          placeholder="e.g. 420"
          value={formData.deliveryDistanceKm || ''}
          onChange={(e) => setFormData({ ...formData, deliveryDistanceKm: parseInt(e.target.value) || 0 })}
          helperText="Average transit route distance between major suppliers & warehouses."
          error={errors.deliveryDistanceKm}
          required
        />
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-200 gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button type="submit">
          Next: Business Constraints <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </form>
  );
};
