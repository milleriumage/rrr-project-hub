-- Create chat_messages table for real-time chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false,
  cost INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages where they are sender or receiver
CREATE POLICY "Users can view their own messages"
ON public.chat_messages
FOR SELECT
USING (
  auth.uid() = sender_id OR 
  auth.uid() = receiver_id
);

-- Policy: Authenticated users can send messages
CREATE POLICY "Authenticated users can send messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update read status of messages sent to them
CREATE POLICY "Users can update read status"
ON public.chat_messages
FOR UPDATE
USING (auth.uid() = receiver_id);

-- Create index for better query performance
CREATE INDEX idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_messages_receiver ON public.chat_messages(receiver_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at DESC);

-- Enable realtime for chat_messages
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;