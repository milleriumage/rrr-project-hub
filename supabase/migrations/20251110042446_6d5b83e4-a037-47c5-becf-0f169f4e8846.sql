-- Clear and insert credit packages with correct currency
DELETE FROM credit_packages;

-- USD Credit Packages
INSERT INTO credit_packages (id, credits, price, bonus, best_value, stripe_product_id, currency) VALUES
('usd_100', 100, 1.00, 0, false, 'prod_SyYehlUkfzq9Qn', 'USD'),
('usd_200', 200, 2.00, 0, true, 'prod_SyYasByos1peGR', 'USD'),
('usd_500', 500, 5.00, 0, false, 'prod_SyYeStqRDuWGFF', 'USD'),
('usd_1000', 1000, 10.00, 0, false, 'prod_SyYfzJ1fjz9zb9', 'USD'),
('usd_2500', 2500, 25.00, 0, true, 'prod_SyYmVrUetdiIBY', 'USD'),
('usd_5000', 5000, 50.00, 0, false, 'prod_SyYg54VfiOr7LQ', 'USD'),
('usd_10000', 10000, 100.00, 0, false, 'prod_SyYhva8A2beAw6', 'USD'),

-- BRL Credit Packages  
('brl_100', 100, 1.00, 0, false, 'prod_TOZY8eHSihw8g9', 'BRL'),
('brl_200', 200, 2.00, 0, true, 'prod_TOZZfyHp7ORcnp', 'BRL'),
('brl_500', 500, 5.00, 0, false, 'prod_TOZZkgIu3lseF8', 'BRL'),
('brl_1000', 1000, 10.00, 0, false, 'prod_TOZa3i9X3niUuN', 'BRL'),
('brl_2500', 2500, 25.00, 0, true, 'prod_TOZbDmIGr1pZ3W', 'BRL'),
('brl_5000', 5000, 50.00, 0, false, 'prod_TOZb1RQEFtZL2x', 'BRL'),
('brl_10000', 10000, 100.00, 0, false, 'prod_TOZcAsdo8rRXmg', 'BRL');

-- Update subscription plans with correct data
UPDATE subscription_plans SET name = 'Free Plan', price = 0.00, credits = 200, currency = 'USD', features = ARRAY['100 credits per month', 'Basic features', 'Community support'], stripe_product_id = 'prod_SyYChoQJbIb1ye' WHERE id = 'plan_free';
UPDATE subscription_plans SET name = 'Basic Plan', price = 9.00, credits = 1000, currency = 'USD', features = ARRAY['1000 credits per month', 'Priority support', 'Advanced features'], stripe_product_id = 'prod_SyYK31lYwaraZW' WHERE id = 'basic';
UPDATE subscription_plans SET name = 'Pro Plan', price = 15.00, credits = 2000, currency = 'USD', features = ARRAY['2000 credits per month', 'Premium support', 'All features', 'Early access'], stripe_product_id = 'prod_SyYMs3lMIhORSP' WHERE id = 'pro';
UPDATE subscription_plans SET name = 'VIP Plan', price = 25.00, credits = 5000, currency = 'USD', features = ARRAY['5000 credits per month', 'VIP support', 'All features', 'Exclusive perks'], stripe_product_id = 'prod_SyYOUxRB7COSzb' WHERE id = 'plan_vip';
UPDATE subscription_plans SET name = 'Plano Gratuito', price = 0.00, credits = 200, currency = 'BRL', features = ARRAY['100 créditos por mês', 'Recursos básicos', 'Suporte da comunidade'], stripe_product_id = 'prod_SyYQmZkivJM5A7' WHERE id = 'plan_free_br';
UPDATE subscription_plans SET name = 'Plano Básico', price = 45.00, credits = 1000, currency = 'BRL', features = ARRAY['1000 créditos por mês', 'Suporte prioritário', 'Recursos avançados'], stripe_product_id = 'prod_SyYToyDtOUI77G' WHERE id = 'plan_basic_br';
UPDATE subscription_plans SET name = 'Plano Pro', price = 75.00, credits = 2000, currency = 'BRL', features = ARRAY['2000 créditos por mês', 'Suporte premium', 'Todos os recursos', 'Acesso antecipado'], stripe_product_id = 'prod_SyYWNbi47WMsVh' WHERE id = 'plan_pro_br';
UPDATE subscription_plans SET name = 'Plano VIP', price = 125.00, credits = 5000, currency = 'BRL', features = ARRAY['5000 créditos por mês', 'Suporte VIP', 'Todos os recursos', 'Benefícios exclusivos'], stripe_product_id = 'prod_SyYYCUxunSxrty' WHERE id = 'plan_vip_br';