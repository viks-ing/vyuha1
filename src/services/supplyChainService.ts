import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { SupplyChainProfile } from '../types/database';

export const supplyChainService = {
  /**
   * Fetch supply chain profile for a company
   */
  async getSupplyChainProfile(companyId: string): Promise<SupplyChainProfile | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await (supabase.from('supply_chain_profiles' as any) as any)
      .select('*')
      .eq('company_id', companyId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Supply chain profile fetch error:', error.message);
      return null;
    }

    return data as SupplyChainProfile;
  },

  /**
   * Save or update supply chain profile
   */
  async saveSupplyChainProfile(profile: Partial<SupplyChainProfile> & { company_id: string }): Promise<SupplyChainProfile | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await (supabase.from('supply_chain_profiles' as any) as any)
      .upsert(profile, { onConflict: 'company_id' })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save supply chain profile: ${error.message}`);
    }

    return data as SupplyChainProfile;
  },
};
