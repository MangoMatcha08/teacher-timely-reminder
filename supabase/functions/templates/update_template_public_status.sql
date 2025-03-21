
-- Function to update a template's public status
CREATE OR REPLACE FUNCTION update_template_public_status(template_id UUID, is_public_status BOOLEAN)
RETURNS void AS $$
BEGIN
  UPDATE public.reminder_templates
  SET is_public = is_public_status
  WHERE id = template_id AND created_by = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
