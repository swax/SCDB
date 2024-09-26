CREATE OR REPLACE FUNCTION select_activity_grid (
    user_id TEXT, 
    daysBack INT
) 
RETURNS TABLE (sketch_id TEXT, changed_day TIMESTAMP)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        row_id AS sketch_id,
        changed_at AS changed_day
    FROM
        audit
    WHERE
        changed_by_id = user_id
        AND table_name = 'sketch'
        AND operation = 'INSERT'
        AND changed_at >= (NOW() - make_interval(days => daysBack))
    ORDER BY
        changed_day,
        row_id;
END;
$$;
