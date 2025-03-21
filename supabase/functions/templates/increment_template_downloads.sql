
-- Function to increment a template's download count
CREATE OR REPLACE FUNCTION increment_template_downloads(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.reminder_templates
  SET download_count = download_count + 1
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
