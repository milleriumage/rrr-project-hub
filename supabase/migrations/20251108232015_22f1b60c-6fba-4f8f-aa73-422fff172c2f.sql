-- Update the handle_new_user function to generate better usernames
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  random_adjective TEXT;
  random_noun TEXT;
  adjectives TEXT[] := ARRAY['Happy', 'Lucky', 'Cool', 'Swift', 'Brave', 'Clever', 'Bright', 'Smooth', 'Fresh', 'Bold'];
  nouns TEXT[] := ARRAY['Tiger', 'Eagle', 'Dolphin', 'Phoenix', 'Dragon', 'Wolf', 'Bear', 'Lion', 'Hawk', 'Panda'];
  random_number TEXT;
BEGIN
  -- Select random adjective and noun
  random_adjective := adjectives[floor(random() * array_length(adjectives, 1) + 1)];
  random_noun := nouns[floor(random() * array_length(nouns, 1) + 1)];
  random_number := floor(random() * 1000)::text;
  
  INSERT INTO public.profiles (id, username, vitrine_slug)
  VALUES (
    new.id,
    random_adjective || random_noun || random_number,
    lower(random_adjective) || '-' || lower(random_noun) || '-' || random_number
  );
  RETURN new;
END;
$$;