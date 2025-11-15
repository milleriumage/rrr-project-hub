-- Adicionar 200 créditos da transação bem-sucedida
UPDATE profiles 
SET credits_balance = credits_balance + 200 
WHERE id = 'ab7db2ec-2380-4740-a43d-08732855d5d7';

-- Registrar a transação
INSERT INTO transactions (user_id, type, amount, description)
VALUES (
  'ab7db2ec-2380-4740-a43d-08732855d5d7',
  'credit_purchase',
  200,
  'Manual credit addition - BRL 200 credits from successful Stripe checkout'
);