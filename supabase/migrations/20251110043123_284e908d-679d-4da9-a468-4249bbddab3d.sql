-- Update BRL credit packages with correct Stripe product IDs
UPDATE credit_packages SET stripe_product_id = 'prod_TOZY8eHSihw8g9' WHERE id = 'brl_100';
UPDATE credit_packages SET stripe_product_id = 'prod_TOZZfyHp7ORcnp' WHERE id = 'brl_200';
UPDATE credit_packages SET stripe_product_id = 'prod_TOZZkgIu3lseF8' WHERE id = 'brl_500';
UPDATE credit_packages SET stripe_product_id = 'prod_TOZa3i9X3niUuN' WHERE id = 'brl_1000';
UPDATE credit_packages SET stripe_product_id = 'prod_TOZbDmIGr1pZ3W' WHERE id = 'brl_2500';
UPDATE credit_packages SET stripe_product_id = 'prod_TOZb1RQEFtZL2x' WHERE id = 'brl_5000';
UPDATE credit_packages SET stripe_product_id = 'prod_TOZcAsdo8rRXmg' WHERE id = 'brl_10000';