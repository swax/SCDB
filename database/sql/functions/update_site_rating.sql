CREATE OR REPLACE FUNCTION update_site_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the site_rating with the average rating value for the specific sketch
    UPDATE public.sketch
    SET site_rating = (
        SELECT AVG(rating_value)
        FROM public.sketch_rating
        WHERE sketch_id = NEW.sketch_id
    )
    WHERE id = NEW.sketch_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
