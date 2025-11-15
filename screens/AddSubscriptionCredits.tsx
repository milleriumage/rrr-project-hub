import React, { useState } from 'react';
import { supabase } from '../src/integrations/supabase/client';

const AddSubscriptionCredits: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddCredits = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.functions.invoke('add-subscription-credits', {
        body: {},
      });

      if (error) throw error;

      setMessage(`Sucesso! ${data.credits_added} créditos adicionados. Novo saldo: ${data.new_balance}`);
    } catch (error: any) {
      console.error('Error adding credits:', error);
      setMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto bg-card rounded-xl p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Adicionar Créditos da Assinatura</h1>
        
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('Sucesso') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleAddCredits}
          disabled={loading}
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Adicionando...' : 'Adicionar Créditos da Assinatura Ativa'}
        </button>

        <p className="text-sm text-muted-foreground mt-4">
          Este botão adiciona os créditos do seu plano ativo ao seu saldo. Use apenas se seus créditos não foram adicionados automaticamente.
        </p>
      </div>
    </div>
  );
};

export default AddSubscriptionCredits;
