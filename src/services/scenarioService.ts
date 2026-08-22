import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Scenario } from '../types/database';

export const scenarioService = {
  /**
   * Save a What-If scenario simulation result to scenarios table
   */
  async saveScenario(scenarioData: Omit<Scenario, 'id' | 'created_at'>): Promise<Scenario | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await (supabase.from('scenarios' as any) as any)
      .insert(scenarioData)
      .select()
      .single();

    if (error) {
      console.warn('Failed to save scenario:', error.message);
      return null;
    }

    return data as Scenario;
  },

  /**
   * Fetch scenarios associated with a prediction
   */
  async getScenariosByPrediction(predictionId: string): Promise<Scenario[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await (supabase.from('scenarios' as any) as any)
      .select('*')
      .eq('prediction_id', predictionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching scenarios:', error.message);
      return [];
    }

    return (data || []) as Scenario[];
  },
};
