-- Garantir que o Realtime está habilitado para chat_messages
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação do realtime (se ainda não estiver)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'chat_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    END IF;
END $$;