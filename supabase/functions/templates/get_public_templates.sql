
-- Function to get public templates
CREATE OR REPLACE FUNCTION get_public_templates()
RETURNS SETOF json AS $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reminder_templates'
    ) THEN
        RETURN QUERY
        SELECT json_build_object(
            'id', t.id,
            'title', t.title,
            'description', t.description,
            'category', t.category,
            'type', t.type,
            'timing', t.timing,
            'created_by', t.created_by,
            'creator_name', t.creator_name,
            'download_count', t.download_count,
            'is_featured', t.is_featured,
            'is_public', t.is_public,
            'created_at', t.created_at,
            'tags', t.tags
        )
        FROM public.reminder_templates t
        WHERE t.is_public = true
        ORDER BY t.download_count DESC;
    ELSE
        -- Return empty set if table doesn't exist
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get my templates
CREATE OR REPLACE FUNCTION get_my_templates()
RETURNS SETOF json AS $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reminder_templates'
    ) THEN
        RETURN QUERY
        SELECT json_build_object(
            'id', t.id,
            'title', t.title,
            'description', t.description,
            'category', t.category,
            'type', t.type,
            'timing', t.timing,
            'created_by', t.created_by,
            'creator_name', t.creator_name,
            'download_count', t.download_count,
            'is_featured', t.is_featured,
            'is_public', t.is_public,
            'created_at', t.created_at,
            'tags', t.tags
        )
        FROM public.reminder_templates t
        WHERE t.created_by = auth.uid()
        ORDER BY t.created_at DESC;
    ELSE
        -- Return empty set if table doesn't exist
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
