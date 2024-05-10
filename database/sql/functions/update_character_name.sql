CREATE
OR REPLACE FUNCTION update_character_name () RETURNS TRIGGER AS $$
BEGIN
    -- Check if character_id is set and not null
    IF NEW.character_id IS NOT NULL THEN
        -- Fetch character name from the character table
        SELECT name INTO NEW.character_name
        FROM public.character
        WHERE id = NEW.character_id;

        -- If character_name is still null, it could mean no matching character was found
        IF NEW.character_name IS NULL THEN
            RAISE EXCEPTION 'Character ID % not found.', NEW.character_id;
        END IF;
    END IF;

    -- Return the updated row
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;