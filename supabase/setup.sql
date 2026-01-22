-- ============================
-- Types
-- ============================

CREATE TYPE ticket_category AS ENUM ('Técnico', 'Facturación', 'Comercial');
CREATE TYPE ticket_sentiment AS ENUM ('Positivo', 'Neutral', 'Negativo');

-- ============================
-- Tickets Table
-- ============================

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    description TEXT NOT NULL,

    -- AI-enriched fields (nullable until processed)
    category ticket_category,
    sentiment ticket_sentiment,
    confidence FLOAT,

    -- Processing state
    processed BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'new',          -- new, processing, done, error
    priority TEXT,                     -- high, medium, low
    error_message TEXT
);

-- ============================
-- Row Level Security
-- ============================

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" 
    ON tickets FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Enable insert access for all authenticated users" 
    ON tickets FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Enable update access for all authenticated users" 
    ON tickets FOR UPDATE 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete access for all authenticated users" 
    ON tickets FOR DELETE 
    TO authenticated 
    USING (true);

-- ============================
-- Indexes for Performance
-- ============================

CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_sentiment ON tickets(sentiment);
CREATE INDEX IF NOT EXISTS idx_tickets_processed ON tickets(processed);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- ============================
-- Statistics Function
-- ============================

CREATE OR REPLACE FUNCTION get_ticket_stats()
RETURNS TABLE (
    total_tickets BIGINT,
    processed_tickets BIGINT,
    unprocessed_tickets BIGINT,

    positive_sentiment BIGINT,
    neutral_sentiment BIGINT,
    negative_sentiment BIGINT,

    tecnico_category BIGINT,
    facturacion_category BIGINT,
    comercial_category BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT AS total_tickets,
        COUNT(*) FILTER (WHERE processed = true)::BIGINT AS processed_tickets,
        COUNT(*) FILTER (WHERE processed = false)::BIGINT AS unprocessed_tickets,

        COUNT(*) FILTER (WHERE sentiment = 'Positivo')::BIGINT AS positive_sentiment,
        COUNT(*) FILTER (WHERE sentiment = 'Neutral')::BIGINT AS neutral_sentiment,
        COUNT(*) FILTER (WHERE sentiment = 'Negativo')::BIGINT AS negative_sentiment,

        COUNT(*) FILTER (WHERE category = 'Técnico')::BIGINT AS tecnico_category,
        COUNT(*) FILTER (WHERE category = 'Facturación')::BIGINT AS facturacion_category,
        COUNT(*) FILTER (WHERE category = 'Comercial')::BIGINT AS comercial_category
    FROM tickets;
END;
$$;
