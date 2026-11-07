-- ==============================================================================
-- MINI-ECONOMY SIMULATION: SUPABASE DATABASE SCHEMA & RPC
-- Run this script in the Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Enable required extension for UUID generation (enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create 'citizens' table
CREATE TABLE IF NOT EXISTS citizens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    balance INTEGER NOT NULL DEFAULT 100 CHECK (balance >= 0),
    has_insurance BOOLEAN NOT NULL DEFAULT false,
    bank_deposit_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    mf_invested_amount INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create 'transactions' table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
    station TEXT NOT NULL,
    amount INTEGER NOT NULL, -- Negative for debit/charge, positive for credit/addition
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create indexes for high-speed lookups during the live event
CREATE INDEX IF NOT EXISTS idx_citizens_qr_id ON citizens(qr_id);
CREATE INDEX IF NOT EXISTS idx_transactions_citizen_id ON transactions(citizen_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- 5. Enable Row Level Security (RLS) & Policies
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Allow public read access to citizens" 
    ON citizens FOR SELECT 
    USING (true);

CREATE POLICY "Allow public read access to transactions" 
    ON transactions FOR SELECT 
    USING (true);

-- Allow public insert to citizens (useful when using publishable/anon key)
CREATE POLICY "Allow public insert to citizens" 
    ON citizens FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public update to citizens" 
    ON citizens FOR UPDATE 
    USING (true);

CREATE POLICY "Allow public insert to transactions" 
    ON transactions FOR INSERT 
    WITH CHECK (true);

-- 6. Atomic Stored Procedure (RPC): process_transaction
-- Uses row-level locking (FOR UPDATE) to guarantee atomic balance deduction/addition.
CREATE OR REPLACE FUNCTION process_transaction(
    p_citizen_id UUID,
    p_station TEXT,
    p_amount INTEGER,
    p_description TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_citizen_name TEXT;
    v_tx_id UUID;
BEGIN
    -- 1. Lock the citizen row for update to guarantee concurrency safety
    SELECT balance, name INTO v_current_balance, v_citizen_name
    FROM citizens
    WHERE id = p_citizen_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Citizen with ID % not found', p_citizen_id
            USING ERRCODE = 'P0002';
    END IF;

    -- 2. Calculate projected balance
    v_new_balance := v_current_balance + p_amount;

    -- 3. Validate sufficient funds for debit operations
    IF v_new_balance < 0 THEN
        RAISE EXCEPTION 'Insufficient funds: Current balance is Rs %, but attempted to charge Rs %', 
            v_current_balance, ABS(p_amount)
            USING ERRCODE = 'P0001';
    END IF;

    -- 4. Update the citizen balance
    UPDATE citizens
    SET balance = v_new_balance
    WHERE id = p_citizen_id;

    -- 5. Record the transaction in the ledger
    INSERT INTO transactions (citizen_id, station, amount, description)
    VALUES (p_citizen_id, p_station, p_amount, p_description)
    RETURNING id INTO v_tx_id;

    -- 6. Return response object with updated state
    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_tx_id,
        'citizen_id', p_citizen_id,
        'citizen_name', v_citizen_name,
        'amount', p_amount,
        'previous_balance', v_current_balance,
        'new_balance', v_new_balance,
        'station', p_station,
        'description', p_description,
        'timestamp', now()
    );
END;
$$;

-- 7. Stored Procedure: register_citizen (bypasses RLS under anon/publishable key)
CREATE OR REPLACE FUNCTION register_citizen(
    p_qr_id TEXT,
    p_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_citizen citizens%ROWTYPE;
BEGIN
    INSERT INTO citizens (qr_id, name, balance)
    VALUES (p_qr_id, p_name, 100)
    RETURNING * INTO v_citizen;

    RETURN to_jsonb(v_citizen);
END;
$$;
