import React, { useState, useRef, useEffect } from 'react';
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

// Dictionary of Indian states and their major cities
const indianStatesAndCities: Record<string, string[]> = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada', 'Kadapa', 'Anantapur'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Namsai'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Jagdalpur'],
  'Delhi': ['New Delhi', 'Delhi NCR', 'Noida', 'Gurugram', 'Faridabad', 'Ghaziabad'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Navsari'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Baddi'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Hazaribagh'],
  'Karnataka': ['Bengaluru', 'Mysore', 'Hubli-Dharwad', 'Mangalore', 'Belgaum', 'Davangere', 'Bellary', 'Gulbarga', 'Shimoga'],
  'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Kannur'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Navi Mumbai', 'Amravati', 'Nanded'],
  'Manipur': ['Imphal', 'Thoubal'],
  'Meghalaya': ['Shillong', 'Tura'],
  'Mizoram': ['Aizawl', 'Lunglei'],
  'Nagaland': ['Dimapur', 'Kohima', 'Mokokchung'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot', 'Hoshiarpur'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bhilwara', 'Sikar'],
  'Sikkim': ['Gangtok', 'Namchi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Thoothukudi', 'Tiruppur'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar'],
  'Tripura': ['Agartala', 'Dharmanagar'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh'],
  'West Bengal': ['Kolkata', 'Howrah', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda', 'Kharagpur', 'Haldia'],
};

const indianStates = Object.keys(indianStatesAndCities);

export const CompanyInformationStep: React.FC<Props> = ({ initialData, onNext }) => {
  const [formData, setFormData] = useState<CompanyInformationData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const stateContainerRef = useRef<HTMLDivElement>(null);
  const cityContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (stateContainerRef.current && !stateContainerRef.current.contains(event.target as Node)) {
        setShowStateDropdown(false);
      }
      if (cityContainerRef.current && !cityContainerRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const [city, setCity] = useState(() => {
    if (initialData.location) {
      const parts = initialData.location.split(',');
      return parts[0] ? parts[0].trim() : '';
    }
    return '';
  });

  const [stateName, setStateName] = useState(() => {
    if (initialData.location) {
      const parts = initialData.location.split(',');
      return parts[1] ? parts[1].trim() : '';
    }
    return '';
  });

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

  // Dynamically filter cities based on the currently selected/entered state
  const matchedState = indianStates.find(s => s.toLowerCase() === stateName.trim().toLowerCase());
  const availableCities = matchedState ? indianStatesAndCities[matchedState] : [];

  // Filter states and cities list for datalist based on characters typed
  const filteredStates = stateName.trim()
    ? indianStates.filter(s => s.toLowerCase().includes(stateName.toLowerCase()))
    : indianStates;

  const filteredCities = city.trim()
    ? availableCities.filter(c => c.toLowerCase().includes(city.toLowerCase()))
    : availableCities;

  const cityPlaceholder = matchedState
    ? `e.g. Choose city in ${matchedState}`
    : stateName.trim()
      ? 'Please enter a valid state'
      : 'Select a state first';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    const trimmedState = stateName.trim();
    const trimmedCity = city.trim();

    if (!trimmedState) {
      newErrors.state = 'State is required';
    }

    if (!trimmedCity) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const finalState = matchedState || stateName.trim();
      const finalCity = (indianStatesAndCities[finalState] || []).find(c => c.toLowerCase() === city.trim().toLowerCase()) || city.trim();
      
      const combinedLocation = `${finalCity}, ${finalState}`;
      onNext({
        ...formData,
        location: combinedLocation,
      });
    }
  };

  const handleStateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (filteredStates.length > 0) {
        const topMatch = filteredStates[0];
        if (stateName.trim().toLowerCase() !== topMatch.toLowerCase()) {
          e.preventDefault();
          setStateName(topMatch);
          setCity(''); // Reset city selection
          setShowStateDropdown(false);
        }
      }
    }
  };

  const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (filteredCities.length > 0) {
        const topMatch = filteredCities[0];
        if (city.trim().toLowerCase() !== topMatch.toLowerCase()) {
          e.preventDefault();
          setCity(topMatch);
          setShowCityDropdown(false);
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1 mb-6 text-center sm:text-left">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
          <Building className="w-5 h-5 text-sky-600" />
          Step 1: Company Information
        </h2>
        <p className="text-sm text-slate-600">
          Enter basic details about your business organization to customize your risk profile.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Company Name"
          placeholder="e.g. Apex MotorWorks Ltd"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          error={errors.companyName}
          required
        />
      </div>

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
          options={companySizes.map((cs) => ({ value: cs, label: `${cs} Enterprise` }))}
          required
        />
      </div>

      {/* Headquarters section with State & City */}
      <div className="border-t border-slate-100 pt-4 mt-2 pb-24">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Headquarters <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Custom State Dropdown */}
          <div ref={stateContainerRef} className="space-y-1.5 relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              State
            </label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Maharashtra"
                value={stateName}
                onFocus={() => setShowStateDropdown(true)}
                onChange={(e) => {
                  setStateName(e.target.value);
                  setCity(''); // Reset city selection
                  setShowStateDropdown(true);
                }}
                onKeyDown={handleStateKeyDown}
                className={`flex h-10 w-full rounded-lg border bg-white pl-10 pr-8 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
                  errors.state ? 'border-rose-500' : 'border-slate-300'
                }`}
              />
              <div className="absolute right-3 text-slate-400 pointer-events-none">
                <svg className={`w-4 h-4 transition-transform duration-200 ${showStateDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {showStateDropdown && filteredStates.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 scrollbar-thin animate-in fade-in slide-in-from-top-1 duration-100">
                {filteredStates.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setStateName(s);
                      setCity('');
                      setShowStateDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-sky-50/50 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{s}</span>
                    {stateName.toLowerCase() === s.toLowerCase() && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
            {errors.state && <p className="text-xs text-rose-500 font-medium">{errors.state}</p>}
          </div>

          {/* Custom City Dropdown */}
          <div ref={cityContainerRef} className="space-y-1.5 relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              City
            </label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder={stateName.trim() ? 'e.g. Mumbai or type city' : 'Type state first'}
                value={city}
                onFocus={() => setShowCityDropdown(true)}
                onChange={(e) => {
                  setCity(e.target.value);
                  setShowCityDropdown(true);
                }}
                onKeyDown={handleCityKeyDown}
                disabled={!stateName.trim()}
                className={`flex h-10 w-full rounded-lg border bg-white pl-10 pr-8 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
                  errors.city ? 'border-rose-500' : 'border-slate-300'
                } disabled:opacity-60 disabled:bg-slate-50`}
              />
              <div className="absolute right-3 text-slate-400 pointer-events-none">
                <svg className={`w-4 h-4 transition-transform duration-200 ${showCityDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {showCityDropdown && filteredCities.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 scrollbar-thin animate-in fade-in slide-in-from-top-1 duration-100">
                {filteredCities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCity(c);
                      setShowCityDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-sky-50/50 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>{c}</span>
                    {city.toLowerCase() === c.toLowerCase() && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
            {errors.city && <p className="text-xs text-rose-500 font-medium">{errors.city}</p>}
          </div>

        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button type="submit" className="w-full sm:w-auto">
          Next: Supply Chain Profile <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </form>
  );
};
