REVOKE EXECUTE ON FUNCTION public.has_knowledge_access(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.knowledge_touch_updated_at() FROM PUBLIC, anon, authenticated;