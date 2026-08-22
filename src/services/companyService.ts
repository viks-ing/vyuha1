import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Company } from '../types/database';

export const companyService = {
  /**
   * Fetch company details owned by the authenticated user
   */
  async getCompanyByOwner(ownerId: string): Promise<Company | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await (supabase.from('companies' as any) as any)
      .select('*')
      .eq('owner_id', ownerId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Company fetch error:', error.message);
      return null;
    }

    return data as Company;
  },

  /**
   * Create or update company record
   */
  async upsertCompany(company: Partial<Company> & { owner_id: string; name: string }): Promise<Company | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await (supabase.from('companies' as any) as any)
      .upsert(company, { onConflict: 'owner_id' })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save company details: ${error.message}`);
    }

    return data as Company;
  },
};
