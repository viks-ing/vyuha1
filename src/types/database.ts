export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string; // references auth.users(id)
  full_name: string | null;
  company_name: string | null;
  role: string | null;
  created_at?: string;
}

export interface Company {
  id: string;
  owner_id: string; // references auth.users(id)
  name: string;
  industry: string | null;
  city: string | null;
  state: string | null;
  created_at?: string;
}

export interface SupplyChainProfile {
  id: string;
  company_id: string; // references companies(id)
  supplier_dependency: string | null;
  number_of_suppliers: number | null;
  inventory_days: number | null;
  safety_stock_days: number | null;
  supplier_lead_time: number | null;
  import_dependency: number | null;
  transportation_mode: string | null;
  current_logistics_cost: number | null;
  max_additional_budget: number | null;
  max_acceptable_delay: number | null;
  created_at?: string;
}

export interface RouteAnalysis {
  id: string;
  company_id: string; // references companies(id)
  origin: string;
  destination: string;
  transport_mode: string;
  distance_km: number;
  estimated_travel_time_hours: number;
  route_geometry: Json | null; // GeoJSON or coordinate array
  created_at?: string;
}

export interface Prediction {
  id: string;
  company_id: string; // references companies(id)
  route_analysis_id: string | null; // references route_analyses(id)
  predicted_delay_days: number;
  predicted_logistics_cost: number;
  risk_score: number;
  risk_level: string;
  model_version: string | null;
  created_at?: string;
}

export interface Scenario {
  id: string;
  prediction_id: string | null; // references predictions(id)
  scenario_name: string;
  inventory_days: number | null;
  supplier_dependency: string | null;
  transportation_mode: string | null;
  additional_cost: number | null;
  predicted_delay_days: number | null;
  predicted_cost: number | null;
  risk_score: number | null;
  risk_level: string | null;
  is_feasible: boolean | null;
  created_at?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'> & { created_at?: string };
        Update: Partial<Profile>;
      };
      companies: {
        Row: Company;
        Insert: Omit<Company, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Company>;
      };
      supply_chain_profiles: {
        Row: SupplyChainProfile;
        Insert: Omit<SupplyChainProfile, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<SupplyChainProfile>;
      };
      route_analyses: {
        Row: RouteAnalysis;
        Insert: Omit<RouteAnalysis, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<RouteAnalysis>;
      };
      predictions: {
        Row: Prediction;
        Insert: Omit<Prediction, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Prediction>;
      };
      scenarios: {
        Row: Scenario;
        Insert: Omit<Scenario, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Scenario>;
      };
    };
  };
}
