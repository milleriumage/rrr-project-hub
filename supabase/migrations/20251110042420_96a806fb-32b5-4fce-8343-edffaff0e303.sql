-- Add currency column to credit_packages
ALTER TABLE credit_packages ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';