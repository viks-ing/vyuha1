import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Prediction } from '../types/database';

export const predictionService = {
  /**
   * Save a prediction result to predictions table
   */
  async savePrediction(predictionData: Omit<Prediction, 'id' | 'created_at'>): Promise<Prediction | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await (supabase.from('predictions' as any) as any)
      .insert(predictionData)
      .select()
      .single();

    if (error) {
      console.warn('Failed to save prediction:', error.message);
      return null;
    }

    return data as Prediction;
  },

  /**
   * Fetch predictions for a company
   */
  async getCompanyPredictions(companyId: string): Promise<Prediction[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await (supabase.from('predictions' as any) as any)
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching predictions:', error.message);
      return [];
    }

    return (data || []) as Prediction[];
  },
};
