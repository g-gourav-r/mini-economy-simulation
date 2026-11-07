-- ==============================================================================
-- GAME STATE & AUDIO-VISUAL DISASTER WIRING
-- Run this in the Supabase SQL Editor
-- ==============================================================================

-- 1. Create 'game_state' singleton table
CREATE TABLE IF NOT EXISTS game_state (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    market_rate INTEGER NOT NULL DEFAULT 0,
    weather_status TEXT NOT NULL DEFAULT 'sunny' CHECK (weather_status IN ('sunny', 'storm')),
    news_text TEXT NOT NULL DEFAULT 'Welcome to the Mini-Economy! Markets are open.',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed singleton row
INSERT INTO game_state (id, market_rate, weather_status, news_text)
VALUES (1, 0, 'sunny', 'Welcome to the Mini-Economy! Markets are open.')
ON CONFLICT (id) DO NOTHING;

-- Enable Realtime publication so Projector and Admin dashboards receive live pushes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'game_state'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE game_state;
    END IF;
END $$;

-- Enable RLS & Policies
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'game_state' AND policyname = 'Allow public read game_state') THEN
        CREATE POLICY "Allow public read game_state" ON game_state FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'game_state' AND policyname = 'Allow public update game_state') THEN
        CREATE POLICY "Allow public update game_state" ON game_state FOR UPDATE USING (true);
    END IF;
END $$;

-- 2. RPC: update_market(p_rate INTEGER, p_news TEXT)
CREATE OR REPLACE FUNCTION update_market(
    p_rate INTEGER,
    p_news TEXT DEFAULT 'Market fluctuation event'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_affected_citizens INTEGER := 0;
    v_total_mf_before BIGINT := 0;
    v_total_mf_after BIGINT := 0;
BEGIN
    SELECT COALESCE(SUM(mf_invested_amount), 0) INTO v_total_mf_before FROM citizens;

    -- Adjust mf_invested_amount for all citizens with investments
    UPDATE citizens
    SET mf_invested_amount = GREATEST(0, ROUND(mf_invested_amount * (1.0 + (p_rate::numeric / 100.0))))
    WHERE mf_invested_amount > 0;

    GET DIAGNOSTICS v_affected_citizens = ROW_COUNT;

    SELECT COALESCE(SUM(mf_invested_amount), 0) INTO v_total_mf_after FROM citizens;

    UPDATE game_state
    SET market_rate = p_rate,
        news_text = p_news,
        updated_at = now()
    WHERE id = 1;

    RETURN jsonb_build_object(
        'success', true,
        'market_rate', p_rate,
        'news_text', p_news,
        'affected_citizens', v_affected_citizens,
        'total_mf_before', v_total_mf_before,
        'total_mf_after', v_total_mf_after,
        'timestamp', now()
    );
END;
$$;

-- 3. RPC: trigger_calamity()
CREATE OR REPLACE FUNCTION trigger_calamity()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_affected_citizens INTEGER := 0;
    v_total_penalized INTEGER := 0;
    v_insured_citizens INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO v_insured_citizens
    FROM citizens
    WHERE has_insurance = true;

    -- Log penalty transactions for uninsured citizens
    INSERT INTO transactions (citizen_id, station, amount, description)
    SELECT id, 'Calamity', -20, 'Storm Disaster Damage (No Insurance Penalty)'
    FROM citizens
    WHERE has_insurance = false;

    GET DIAGNOSTICS v_affected_citizens = ROW_COUNT;
    v_total_penalized := v_affected_citizens * 20;

    -- Deduct Rs 20 from uninsured citizens (guarded at 0)
    UPDATE citizens
    SET balance = GREATEST(0, balance - 20)
    WHERE has_insurance = false;

    -- Set weather to 'storm'
    UPDATE game_state
    SET weather_status = 'storm',
        news_text = '⚠️ SEVERE STORM ALERT: Calamity hits city! Uninsured citizens fined Rs 20 for damages.',
        updated_at = now()
    WHERE id = 1;

    RETURN jsonb_build_object(
        'success', true,
        'weather_status', 'storm',
        'uninsured_penalized_count', v_affected_citizens,
        'total_fined_amount', v_total_penalized,
        'insured_protected_count', v_insured_citizens,
        'timestamp', now()
    );
END;
$$;

-- 4. RPC: resolve_calamity()
CREATE OR REPLACE FUNCTION resolve_calamity()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE game_state
    SET weather_status = 'sunny',
        news_text = '☀️ Storm has passed! Clear sunny skies return to the city. Markets are operating normally.',
        updated_at = now()
    WHERE id = 1;

    RETURN jsonb_build_object(
        'success', true,
        'weather_status', 'sunny',
        'timestamp', now()
    );
END;
$$;
