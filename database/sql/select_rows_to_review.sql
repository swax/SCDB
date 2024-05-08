-- A function that scans all tables for rows that need review
-- Powers the /review page
CREATE
OR REPLACE FUNCTION select_rows_to_review (row_count INT) RETURNS TABLE (
    table_name VARCHAR,
    row_id INT,
    review_status review_status_type,
    modified_by_username VARCHAR,
    modified_at TIMESTAMP
) LANGUAGE plpgsql AS $$
DECLARE
    tbl_names TEXT[] = ARRAY['character', 'episode', 'person', 'recurring_sketch', 'season', 'show', 'sketch', 'tag_category', 'tag'];
    tbl_name TEXT;
BEGIN
    -- Create a temporary table to collect all results
    CREATE TEMP TABLE IF NOT EXISTS temp_results (
        table_name VARCHAR,
        row_id INT,
        review_status review_status_type,
        modified_by_username VARCHAR,
        modified_at TIMESTAMP
    );

    -- Ensure the temporary table is empty
    TRUNCATE temp_results;

    -- Loop through each table name and insert matching rows into the temporary table
    FOREACH tbl_name IN ARRAY tbl_names
    LOOP
         EXECUTE format('
            INSERT INTO temp_results
            SELECT %L AS table_name, x.id AS row_id, x.review_status, u.username as modified_by_username, x.modified_at 
            FROM %I x
            JOIN "user" u on u.id=x.modified_by_id
            WHERE review_status != ''Reviewed''
            ORDER BY review_status DESC, modified_at ASC
            LIMIT %L
        ', tbl_name, tbl_name, row_count);
    END LOOP;

    -- Return all results from the temporary table ordered by modified_date
    RETURN QUERY 
    SELECT * 
    FROM temp_results 
    ORDER BY review_status DESC, modified_at ASC 
    LIMIT row_count;

    -- Clean up: Drop the temporary table
    DROP TABLE temp_results;
END;
$$;