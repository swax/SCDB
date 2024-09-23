CREATE
OR REPLACE FUNCTION select_activity_grid (user_id TEXT) RETURNS TABLE (sketch_id TEXT, changed_day TIMESTAMP) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        row_id as sketch_id,
        DATE_TRUNC('day', changed_at) AS changed_day
    FROM
        audit
    WHERE
        changed_by_id = user_id
        AND table_name = 'sketch'
        AND changed_at >= NOW() - INTERVAL '90 days'
    GROUP BY
        row_id,
        changed_day
    ORDER BY
        changed_day,
        row_id;
END;
$$;