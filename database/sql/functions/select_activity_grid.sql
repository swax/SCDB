CREATE
OR REPLACE FUNCTION select_activity_grid (user_id TEXT, timezone TEXT) RETURNS TABLE (sketch_id TEXT, changed_day TIMESTAMPTZ) -- TIMESTAMPTZ to match the timezone-aware timestamps
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        row_id as sketch_id,
        DATE_TRUNC('day', changed_at AT TIME ZONE timezone) AS changed_day
    FROM
        audit
    WHERE
        changed_by_id = user_id
        AND table_name = 'sketch'
        AND operation = 'INSERT'
        AND changed_at >= NOW() AT TIME ZONE timezone - INTERVAL '90 days'
    GROUP BY
        row_id,
        changed_day
    ORDER BY
        changed_day,
        row_id;
END;
$$;