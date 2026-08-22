-- ====================================================================
-- VYUHA SUPPLY CHAIN PLATFORM - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Paste and run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 2. TABLE CREATION
-- ====================================================================

-- PROFILES (Extended user profile information linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    company_name TEXT,
    role TEXT DEFAULT 'Supply Chain Manager',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMPANIES (Company entity owned by authenticated users)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    industry TEXT,
    city TEXT,
    state TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUPPLY_CHAIN_PROFILES (Operational metrics and supply-chain configuration)
CREATE TABLE IF NOT EXISTS public.supply_chain_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
    supplier_dependency TEXT,
    number_of_suppliers INT,
    inventory_days INT,
    safety_stock_days INT,
    supplier_lead_time INT,
    import_dependency NUMERIC,
    transportation_mode TEXT,
    current_logistics_cost NUMERIC,
    max_additional_budget NUMERIC,
    max_acceptable_delay INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROUTE_ANALYSES (Multimodal OSRM & OpenStreetMap calculated routes)
CREATE TABLE IF NOT EXISTS public.route_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    transport_mode TEXT NOT NULL,
    distance_km NUMERIC NOT NULL,
    estimated_travel_time_hours NUMERIC NOT NULL,
    route_geometry JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PREDICTIONS (ML Prediction Engine outputs for delays, costs & risk scores)
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    route_analysis_id UUID REFERENCES public.route_analyses(id) ON DELETE SET NULL,
    predicted_delay_days NUMERIC NOT NULL,
    predicted_logistics_cost NUMERIC NOT NULL,
    risk_score INT NOT NULL,
    risk_level TEXT NOT NULL,
    model_version TEXT DEFAULT 'v1.0-xgb',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCENARIOS (What-If simulation experiments)
CREATE TABLE IF NOT EXISTS public.scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id UUID REFERENCES public.predictions(id) ON DELETE CASCADE,
    scenario_name TEXT NOT NULL,
    inventory_days INT,
    supplier_dependency TEXT,
    transportation_mode TEXT,
    additional_cost NUMERIC,
    predicted_delay_days NUMERIC,
    predicted_cost NUMERIC,
    risk_score INT,
    risk_level TEXT,
    is_feasible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_profiles_company_id ON public.supply_chain_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_route_analyses_company_id ON public.route_analyses(company_id);
CREATE INDEX IF NOT EXISTS idx_predictions_company_id ON public.predictions(company_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_prediction_id ON public.scenarios(prediction_id);

-- ====================================================================
-- 4. ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_chain_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- COMPANIES POLICIES
DROP POLICY IF EXISTS "Users can access own company" ON public.companies;
CREATE POLICY "Users can access own company" 
    ON public.companies FOR ALL 
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- SUPPLY CHAIN PROFILES POLICIES
DROP POLICY IF EXISTS "Users can access own supply chain profile" ON public.supply_chain_profiles;
CREATE POLICY "Users can access own supply chain profile" 
    ON public.supply_chain_profiles FOR ALL 
    USING (
        company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
    )
    WITH CHECK (
        company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
    );

-- ROUTE ANALYSES POLICIES
DROP POLICY IF EXISTS "Users can access own route analyses" ON public.route_analyses;
CREATE POLICY "Users can access own route analyses" 
    ON public.route_analyses FOR ALL 
    USING (
        company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
    )
    WITH CHECK (
        company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
    );

-- PREDICTIONS POLICIES
DROP POLICY IF EXISTS "Users can access own predictions" ON public.predictions;
CREATE POLICY "Users can access own predictions" 
    ON public.predictions FOR ALL 
    USING (
        company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
    )
    WITH CHECK (
        company_id IN (SELECT id FROM public.companies WHERE owner_id = auth.uid())
    );

-- SCENARIOS POLICIES
DROP POLICY IF EXISTS "Users can access own scenarios" ON public.scenarios;
CREATE POLICY "Users can access own scenarios" 
    ON public.scenarios FOR ALL 
    USING (
        prediction_id IN (
            SELECT p.id FROM public.predictions p
            JOIN public.companies c ON c.id = p.company_id
            WHERE c.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        prediction_id IN (
            SELECT p.id FROM public.predictions p
            JOIN public.companies c ON c.id = p.company_id
            WHERE c.owner_id = auth.uid()
        )
    );

-- ====================================================================
-- 6. AUTOMATED USER TRIGGER FOR PROFILE CREATION
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, company_name, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Supply Chain Manager'),
        COALESCE(new.raw_user_meta_data->>'company_name', 'My Enterprise'),
        'Supply Chain Manager'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
