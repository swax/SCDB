-- the sketch_cast table has character_name and character_id columns
-- if the character is a one-off then just the name needs to be set
-- if the character is recurring then the id is set
-- to keep the name in sync with the id this trigger is used
CREATE TRIGGER trigger_update_character_name BEFORE INSERT
OR
UPDATE ON public.sketch_cast FOR EACH ROW
EXECUTE FUNCTION update_character_name ();