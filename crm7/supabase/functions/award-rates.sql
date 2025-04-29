-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create award rates table
CREATE TABLE IF NOT EXISTS award_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    award_code VARCHAR(50) NOT NULL,
    classification_code VARCHAR(50) NOT NULL,
    base_rate DECIMAL(10,2) NOT NULL,
    casual_loading DECIMAL(5,2),
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(award_code, classification_code, effective_from)
);

-- Create penalties table
CREATE TABLE IF NOT EXISTS penalties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    award_code VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    rate DECIMAL(5,2) NOT NULL,
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(award_code, code, effective_from)
);

-- Create allowances table
CREATE TABLE IF NOT EXISTS allowances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    award_code VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    effective_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(award_code, code, effective_from)
);

-- Create classifications table
CREATE TABLE IF NOT EXISTS classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    award_code VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    level VARCHAR(50),
    grade VARCHAR(50),
    year_of_experience INTEGER,
    qualifications TEXT[],
    parent_code VARCHAR(50),
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(award_code, code, valid_from)
);

-- Function to get base rate for a classification
CREATE OR REPLACE FUNCTION get_award_base_rate(
    p_award_code VARCHAR,
    p_classification_code VARCHAR,
    p_date TIMESTAMP WITH TIME ZONE
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT base_rate
        FROM award_rates
        WHERE award_code = p_award_code
        AND classification_code = p_classification_code
        AND effective_from <= p_date
        AND (effective_to IS NULL OR effective_to > p_date)
        ORDER BY effective_from DESC
        LIMIT 1
    );
END;
$$;

-- Function to get full award rate details
CREATE OR REPLACE FUNCTION get_award_rate(
    p_award_code VARCHAR,
    p_classification_code VARCHAR,
    p_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSON;
BEGIN
    WITH rate_data AS (
        SELECT 
            ar.base_rate,
            ar.casual_loading,
            ar.effective_from,
            ar.effective_to,
            (
                SELECT json_agg(json_build_object(
                    'code', p.code,
                    'rate', p.rate,
                    'description', p.description
                ))
                FROM penalties p
                WHERE p.award_code = ar.award_code
                AND p.effective_from <= p_date
                AND (p.effective_to IS NULL OR p.effective_to > p_date)
            ) as penalties,
            (
                SELECT json_agg(json_build_object(
                    'code', a.code,
                    'amount', a.amount,
                    'description', a.description
                ))
                FROM allowances a
                WHERE a.award_code = ar.award_code
                AND a.effective_from <= p_date
                AND (a.effective_to IS NULL OR a.effective_to > p_date)
            ) as allowances
        FROM award_rates ar
        WHERE ar.award_code = p_award_code
        AND ar.classification_code = p_classification_code
        AND ar.effective_from <= p_date
        AND (ar.effective_to IS NULL OR ar.effective_to > p_date)
        ORDER BY ar.effective_from DESC
        LIMIT 1
    )
    SELECT json_build_object(
        'awardCode', p_award_code,
        'classificationCode', p_classification_code,
        'baseRate', base_rate,
        'casualLoading', casual_loading,
        'penalties', COALESCE(penalties, '[]'::json),
        'allowances', COALESCE(allowances, '[]'::json),
        'effectiveFrom', effective_from,
        'effectiveTo', effective_to
    ) INTO v_result
    FROM rate_data;

    RETURN COALESCE(v_result, '{}'::json);
END;
$$;

-- Function to get classifications
CREATE OR REPLACE FUNCTION get_award_classifications(
    p_award_code VARCHAR,
    p_search_term VARCHAR DEFAULT NULL,
    p_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    p_include_inactive BOOLEAN DEFAULT FALSE
)
RETURNS SETOF classifications
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM classifications c
    WHERE c.award_code = p_award_code
    AND (
        p_search_term IS NULL
        OR c.name ILIKE '%' || p_search_term || '%'
        OR c.code ILIKE '%' || p_search_term || '%'
    )
    AND (
        p_include_inactive
        OR (
            c.valid_from <= p_date
            AND (c.valid_to IS NULL OR c.valid_to > p_date)
        )
    )
    ORDER BY c.level, c.grade, c.year_of_experience NULLS FIRST;
END;
$$;

-- Function to calculate award rate
CREATE OR REPLACE FUNCTION calculate_award_rate(
    p_award_code VARCHAR,
    p_classification_code VARCHAR,
    p_employment_type VARCHAR,
    p_date TIMESTAMP WITH TIME ZONE,
    p_hours DECIMAL DEFAULT NULL,
    p_penalties VARCHAR[] DEFAULT NULL,
    p_allowances VARCHAR[] DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_base_rate DECIMAL(10,2);
    v_casual_loading DECIMAL(5,2);
    v_total DECIMAL(10,2);
    v_result JSON;
BEGIN
    -- Get base rate and casual loading
    SELECT ar.base_rate, ar.casual_loading
    INTO v_base_rate, v_casual_loading
    FROM award_rates ar
    WHERE ar.award_code = p_award_code
    AND ar.classification_code = p_classification_code
    AND ar.effective_from <= p_date
    AND (ar.effective_to IS NULL OR ar.effective_to > p_date)
    ORDER BY ar.effective_from DESC
    LIMIT 1;

    -- Calculate total with penalties and allowances
    WITH calculations AS (
        SELECT
            v_base_rate as base,
            CASE 
                WHEN p_employment_type = 'casual' THEN COALESCE(v_casual_loading, 0)
                ELSE 0
            END as loading,
            (
                SELECT COALESCE(json_agg(json_build_object(
                    'code', p.code,
                    'rate', p.rate,
                    'amount', (v_base_rate * p.rate / 100),
                    'description', p.description
                )), '[]'::json)
                FROM penalties p
                WHERE p.award_code = p_award_code
                AND p.code = ANY(p_penalties)
                AND p.effective_from <= p_date
                AND (p.effective_to IS NULL OR p.effective_to > p_date)
            ) as penalties,
            (
                SELECT COALESCE(json_agg(json_build_object(
                    'code', a.code,
                    'amount', a.amount,
                    'description', a.description
                )), '[]'::json)
                FROM allowances a
                WHERE a.award_code = p_award_code
                AND a.code = ANY(p_allowances)
                AND a.effective_from <= p_date
                AND (a.effective_to IS NULL OR a.effective_to > p_date)
            ) as allowances
    )
    SELECT json_build_object(
        'baseRate', base,
        'casualLoading', CASE WHEN loading > 0 THEN loading ELSE NULL END,
        'penalties', penalties,
        'allowances', allowances,
        'total', (
            base + 
            (base * loading / 100) +
            (
                SELECT COALESCE(SUM(value->>'amount')::DECIMAL, 0)
                FROM json_array_elements(penalties) as value
            ) +
            (
                SELECT COALESCE(SUM(value->>'amount')::DECIMAL, 0)
                FROM json_array_elements(allowances) as value
            )
        ),
        'breakdown', json_build_object(
            'base', base,
            'loading', base * loading / 100,
            'penalties', (
                SELECT COALESCE(SUM(value->>'amount')::DECIMAL, 0)
                FROM json_array_elements(penalties) as value
            ),
            'allowances', (
                SELECT COALESCE(SUM(value->>'amount')::DECIMAL, 0)
                FROM json_array_elements(allowances) as value
            )
        ),
        'metadata', json_build_object(
            'calculatedAt', CURRENT_TIMESTAMP,
            'effectiveDate', p_date,
            'source', 'cached'
        )
    ) INTO v_result
    FROM calculations;

    RETURN COALESCE(v_result, '{}'::json);
END;
$$;

-- Function to validate rate
CREATE OR REPLACE FUNCTION validate_award_rate(
    p_award_code VARCHAR,
    p_classification_code VARCHAR,
    p_rate DECIMAL,
    p_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_minimum_rate DECIMAL(10,2);
BEGIN
    SELECT base_rate
    INTO v_minimum_rate
    FROM award_rates
    WHERE award_code = p_award_code
    AND classification_code = p_classification_code
    AND effective_from <= p_date
    AND (effective_to IS NULL OR effective_to > p_date)
    ORDER BY effective_from DESC
    LIMIT 1;

    RETURN json_build_object(
        'isValid', p_rate >= v_minimum_rate,
        'minimumRate', v_minimum_rate,
        'difference', p_rate - v_minimum_rate
    );
END;
$$;

-- Function to get rate history
CREATE OR REPLACE FUNCTION get_award_rate_history(
    p_award_code VARCHAR,
    p_classification_code VARCHAR,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS SETOF award_rates
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM award_rates
    WHERE award_code = p_award_code
    AND classification_code = p_classification_code
    AND effective_from >= p_start_date
    AND (effective_to IS NULL OR effective_to <= p_end_date)
    ORDER BY effective_from DESC;
END;
$$;

-- Function to get future rates
CREATE OR REPLACE FUNCTION get_future_award_rates(
    p_award_code VARCHAR,
    p_classification_code VARCHAR,
    p_from_date TIMESTAMP WITH TIME ZONE
)
RETURNS SETOF award_rates
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM award_rates
    WHERE award_code = p_award_code
    AND classification_code = p_classification_code
    AND effective_from > p_from_date
    ORDER BY effective_from ASC;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_award_rates_updated_at
    BEFORE UPDATE ON award_rates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_penalties_updated_at
    BEFORE UPDATE ON penalties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allowances_updated_at
    BEFORE UPDATE ON allowances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classifications_updated_at
    BEFORE UPDATE ON classifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
