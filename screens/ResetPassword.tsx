import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../src/integrations/supabase/client';

const ResetPassword: React.FC = () => {
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Detectar se estamos em um fluxo de recuperação de senha
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!newPassword || !confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Sua senha foi redefinida com sucesso! Redirecionando...');
        setNewPassword('');
        setConfirmPassword('');
        
        // Redirecionar para a página inicial após 2 segundos
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (err: any) {
      setError('Erro inesperado. Tente novamente.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900 p-4">
        <div className="w-full max-w-md p-8 bg-neutral-800 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-4">Link Inválido</h1>
          <p className="text-neutral-400 mb-6">
            Este link de recuperação de senha é inválido ou já foi usado.
          </p>
          <a 
            href="/"
            className="block w-full py-3 font-bold text-center text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Voltar ao Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-neutral-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            Redefinir Senha
          </h1>
          <p className="mt-2 text-neutral-400">Digite sua nova senha</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg">
            <p className="text-sm text-green-200">{success}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-neutral-300" htmlFor="newPassword">
              Nova Senha
            </label>
            <input 
              id="newPassword" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full mt-1 px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50" 
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-neutral-300" htmlFor="confirmPassword">
              Confirmar Nova Senha
            </label>
            <input 
              id="confirmPassword" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full mt-1 px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting || success !== ''}
            className="w-full py-3 font-bold text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processando...' : 'Redefinir Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
