-- Add last_withdrawal_at column to profiles table for persistent withdrawal cooldown
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_withdrawal_at timestamp with time zone DEFAULT NULL;

-- Add unique constraint on vitrine_slug to prevent duplicates
ALTER TABLE public.profiles 
ADD CONSTRAINT unique_vitrine_slug UNIQUE (vitrine_slug);