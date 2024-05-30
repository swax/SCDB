CREATE TRIGGER sketch_rating_update_trigger
AFTER INSERT OR UPDATE ON public.sketch_rating
FOR EACH ROW
EXECUTE FUNCTION update_site_rating();