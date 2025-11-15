import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';

interface InlineLoginModalProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const InlineLoginModal: React.FC<InlineLoginModalProps> = ({ onClose, onSwitchToSignup }) => {
  const { signIn } = useAuth();
  const { registerOrLoginUser } = useCredits();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!email || !password) {
        setError('Por favor, preencha todos os campos.');
        setIsSubmitting(false);
        return;
      }

      const { error: authError } = await signIn(email, password);
      
      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu email antes de fazer login.');
        } else {
          setError(authError.message);
        }
        setIsSubmitting(false);
      } else {
        // Login bem-sucedido
        onClose();
      }
    } catch (err: any) {
      setError('Erro inesperado. Tente novamente.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-neutral-800 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Login</h2>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>

        <p className="text-sm text-neutral-400">
          Entre com sua conta para acessar o conteúdo exclusivo
        </p>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-neutral-300" htmlFor="email">Email</label>
            <input 
              id="email" 
              type="email" 
              placeholder="voce@exemplo.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full mt-1 px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50" 
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-neutral-300" htmlFor="password">Senha</label>
            <input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full mt-1 px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 font-bold text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={onSwitchToSignup}
            className="text-sm text-brand-light hover:text-brand-primary transition-colors"
          >
            Não tem uma conta? <span className="font-semibold">Cadastre-se</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InlineLoginModal;
