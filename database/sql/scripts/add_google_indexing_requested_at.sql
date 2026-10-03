-- Apply before deploying the API. Existing sketches remain unmarked.
ALTER TABLE public.sketch
  ADD COLUMN IF NOT EXISTS google_indexing_requested_at TIMESTAMP(3);
