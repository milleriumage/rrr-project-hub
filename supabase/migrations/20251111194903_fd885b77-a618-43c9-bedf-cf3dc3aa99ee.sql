-- Add payment fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS paypal_email TEXT,
ADD COLUMN IF NOT EXISTS stripe_email TEXT;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Creators can view their own transactions" ON public.creator_transactions;
DROP POLICY IF EXISTS "System can insert transactions" ON public.creator_transactions;

-- Create creator_transactions table for earnings history
CREATE TABLE IF NOT EXISTS public.creator_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  content_item_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL,
  card_title TEXT NOT NULL,
  original_price INTEGER NOT NULL,
  amount_received INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on creator_transactions
ALTER TABLE public.creator_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Creators can view their own transactions
CREATE POLICY "Creators can view their own transactions"
ON public.creator_transactions
FOR SELECT
TO authenticated
USING (auth.uid() = creator_id);

-- Policy: System can insert transactions (via purchase_content function)
CREATE POLICY "System can insert transactions"
ON public.creator_transactions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update the purchase_content function to record creator transactions
CREATE OR REPLACE FUNCTION public.purchase_content(item_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  item_price INT;
  item_title TEXT;
  buyer_balance INT;
  creator_id_val UUID;
  commission_rate NUMERIC := 0.50;
  earnings INT;
BEGIN
  SELECT price, creator_id, title INTO item_price, creator_id_val, item_title
  FROM public.content_items WHERE id = item_id;

  SELECT credits_balance INTO buyer_balance
  FROM public.profiles WHERE id = auth.uid();

  IF buyer_balance < item_price THEN
    RETURN json_build_object('success', false, 'message', 'Insufficient credits');
  END IF;

  -- Deduct from buyer
  UPDATE public.profiles
  SET credits_balance = credits_balance - item_price
  WHERE id = auth.uid();

  -- Calculate earnings after commission
  earnings := floor(item_price * (1 - commission_rate));
  
  -- Add to creator's earned balance
  UPDATE public.profiles
  SET earned_balance = earned_balance + earnings
  WHERE id = creator_id_val;

  -- Record unlocked content
  INSERT INTO public.unlocked_content (user_id, content_item_id)
  VALUES (auth.uid(), item_id);

  -- Record buyer transaction
  INSERT INTO public.transactions (user_id, type, amount, description, related_content_id)
  VALUES (auth.uid(), 'purchase', -item_price, 'Content purchase', item_id);

  -- Record creator transaction (earnings history)
  INSERT INTO public.creator_transactions (
    creator_id, 
    buyer_id, 
    content_item_id, 
    card_title, 
    original_price, 
    amount_received
  )
  VALUES (
    creator_id_val, 
    auth.uid(), 
    item_id, 
    item_title, 
    item_price, 
    earnings
  );

  RETURN json_build_object('success', true, 'message', 'Purchase successful');
END;
$function$;