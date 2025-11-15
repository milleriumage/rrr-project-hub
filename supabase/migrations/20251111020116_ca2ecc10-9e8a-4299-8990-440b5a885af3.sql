-- Permitir que guests (não autenticados ou com UUID especial) enviem mensagens
-- Remover a política antiga que só permitia usuários autenticados
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.chat_messages;

-- Nova política: permite usuários autenticados E guests (com UUID especial)
CREATE POLICY "Users and guests can send messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  -- Usuários autenticados: auth.uid() deve corresponder ao sender_id
  (auth.uid() = sender_id) 
  OR 
  -- Guests: permite o UUID especial de guest
  (sender_id = '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Atualizar política de SELECT para permitir que guests vejam suas mensagens
DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;

CREATE POLICY "Users and guests can view messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  -- Usuários autenticados podem ver mensagens que enviaram ou receberam
  (auth.uid() = sender_id OR auth.uid() = receiver_id)
  OR
  -- Todos podem ver mensagens enviadas por guests (mensagens públicas ao criador)
  (sender_id = '00000000-0000-0000-0000-000000000000'::uuid)
);