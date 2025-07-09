
-- Add name column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name text;

-- Update existing users to have a name based on their email
UPDATE public.users 
SET name = COALESCE(
  name,
  split_part(email, '@', 1)
)
WHERE name IS NULL;
