import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { RouteAnalysis } from '../types/database';

export const routeService = {
  /**
   * Save a calculated route analysis entry into route_analyses table
   */
  async saveRouteAnalysis(routeData: {
    company_id?: string;
    origin: string;
    destination: string;
    transport_mode: string;
    distance_km: number;
    estimated_travel_time_hours: number;
    route_geometry?: any;
  }): Promise<RouteAnalysis | null> {
    if (!isSupabaseConfigured()) return null;

    const company_id = routeData.company_id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await (supabase.from('route_analyses' as any) as any)
      .insert({
        company_id,
        origin: routeData.origin,
        destination: routeData.destination,
        transport_mode: routeData.transport_mode,
        distance_km: routeData.distance_km,
        estimated_travel_time_hours: routeData.estimated_travel_time_hours,
        route_geometry: routeData.route_geometry || null,
      })
      .select()
      .single();

    if (error) {
      console.warn('Failed to save route analysis to Supabase:', error.message);
      return null;
    }

    return data as RouteAnalysis;
  },

  /**
   * Fetch recent route analyses for a company
   */
  async getRouteAnalyses(companyId: string): Promise<RouteAnalysis[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await (supabase.from('route_analyses' as any) as any)
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching route analyses:', error.message);
      return [];
    }

    return (data || []) as RouteAnalysis[];
  },
};
