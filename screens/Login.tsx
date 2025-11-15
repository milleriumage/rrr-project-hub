import React, { useState, useRef, useEffect } from 'react';
import { useCredits } from '../hooks/useCredits';
import { useAuth } from '../hooks/useAuth';
import OnlyFansCard from '../components/OnlyFansCard';
import SupportButton from '../components/SupportButton';
import { supabase } from '../src/integrations/supabase/client';

const DemoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-1"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>
);

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);


const Login: React.FC = () => {
  const { registerOrLoginUser, allUsers, contentItems } = useCredits();
  const { signUp, signIn, resetPassword, user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotEmail, setShowForgotEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);

  const showcaseItems = contentItems.slice(0, 4);

  // Auto-login quando o usuário do Supabase estiver autenticado
  useEffect(() => {
    if (user && !loading) {
      // Se for dev@funfans.com, usar o ID fixo da sessão DEV
      if (user.email === 'dev@funfans.com') {
        registerOrLoginUser('20251103-002', 'dev@funfans.com', 'DevAdmin');
      } else {
        registerOrLoginUser(user.id, user.email || '', user.email?.split('@')[0]);
      }
    }
  }, [user, loading, registerOrLoginUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (showForgotPassword) {
        // Recuperação de senha
        if (!email) {
          setError('Por favor, insira seu email.');
          setIsSubmitting(false);
          return;
        }

        const { error } = await resetPassword(email);
        
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Link de recuperação enviado para seu email! Verifique sua caixa de entrada.');
          setEmail('');
          setTimeout(() => {
            setShowForgotPassword(false);
            setSuccess('');
          }, 3000);
        }
      } else if (activeTab === 'register') {
        // Cadastro
        if (!email || !password || !confirmPassword) {
          setError('Por favor, preencha todos os campos.');
          setIsSubmitting(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          setIsSubmitting(false);
          return;
        }

        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres.');
          setIsSubmitting(false);
          return;
        }

        const { error } = await signUp(email, password);
        
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Este email já está cadastrado. Tente fazer login.');
          } else {
            setError(error.message);
          }
        } else {
          setSuccess('Cadastro realizado! Verifique seu email para o link de validação.');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        // Login
        if (!email || !password) {
          setError('Por favor, preencha todos os campos.');
          setIsSubmitting(false);
          return;
        }

        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Email ou senha incorretos.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Por favor, confirme seu email antes de fazer login.');
          } else {
            setError(error.message);
          }
        }
        // O login automático acontece via useEffect acima
      }
    } catch (err: any) {
      setError('Erro inesperado. Tente novamente.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setIsSubmitting(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://chatlink.links/',
        }
      });
      
      if (error) {
        setError(error.message);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError('Erro ao fazer login com Google.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (userId: string) => {
    const demoUser = allUsers.find(u => u.id === userId);
    if (demoUser) {
      registerOrLoginUser(demoUser.id, demoUser.email, demoUser.username);
    }
    setIsDemoOpen(false);
  };
  
  // Close demo dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (demoRef.current && !demoRef.current.contains(event.target as Node)) {
                setIsDemoOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [demoRef]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 p-3 sm:p-4">
        <div className="w-full max-w-md relative">
            <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 bg-neutral-800 rounded-xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white tracking-wider">
                        FUN<span className="text-brand-primary">FANS</span>
                    </h1>
                    <p className="mt-2 text-neutral-400">
                        {showForgotPassword ? 'Recover Password' : showForgotEmail ? 'Recover Email' : 'Your exclusive content hub.'}
                    </p>
                </div>
                
                {!showForgotPassword && !showForgotEmail && (
                    <div className="flex border-b border-neutral-700">
                        <button 
                            onClick={() => {
                                setActiveTab('login');
                                setError('');
                                setSuccess('');
                            }}
                            className={`w-1/2 py-3 font-semibold text-center transition-colors ${activeTab === 'login' ? 'text-white border-b-2 border-brand-primary' : 'text-neutral-400 hover:text-white'}`}
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => {
                                setActiveTab('register');
                                setError('');
                                setSuccess('');
                            }}
                            className={`w-1/2 py-3 font-semibold text-center transition-colors ${activeTab === 'register' ? 'text-white border-b-2 border-brand-primary' : 'text-neutral-400 hover:text-white'}`}
                        >
                            Sign Up
                        </button>
                    </div>
                )}

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

                {showForgotEmail ? (
                    <div className="space-y-4">
                        <p className="text-sm text-neutral-300">
                            If you forgot your email, please contact support through the icon in the bottom corner of the screen.
                        </p>
                        <button 
                            onClick={() => {
                                setShowForgotEmail(false);
                                setError('');
                            }}
                            className="w-full py-3 font-bold text-white bg-neutral-700 rounded-lg hover:bg-neutral-600 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-medium text-neutral-300" htmlFor="email">Email</label>
                            <input 
                                id="email" 
                                type="email" 
                                placeholder="you@example.com"
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full mt-1 px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50" 
                            />
                        </div>
                        
                        {!showForgotPassword && (
                            <>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-sm font-medium text-neutral-300" htmlFor="password">Password</label>
                                        <div className="flex gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setShowForgotEmail(true);
                                                    setError('');
                                                }}
                                                className="text-xs text-neutral-400 hover:text-brand-light"
                                            >
                                                Forgot email?
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setShowForgotPassword(true);
                                                    setActiveTab('login');
                                                    setError('');
                                                }}
                                                className="text-xs text-neutral-400 hover:text-brand-light"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                    </div>
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
                                
                                {activeTab === 'register' && (
                                    <div>
                                        <label className="text-sm font-medium text-neutral-300" htmlFor="confirmPassword">Confirm Password</label>
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
                                )}
                            </>
                        )}
                        
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-3 font-bold text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Processing...' : 
                             showForgotPassword ? 'Send Recovery Link' :
                             activeTab === 'login' ? 'Sign In' : 'Create Account'}
                        </button>

                        {!showForgotPassword && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-neutral-600"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-neutral-800 text-neutral-400">ou</span>
                                    </div>
                                </div>

                                <button 
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={isSubmitting}
                                    className="w-full py-3 px-4 flex items-center justify-center gap-3 font-semibold text-white bg-neutral-700 border border-neutral-600 rounded-lg hover:bg-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <GoogleIcon />
                                    Continue with Google
                                </button>
                            </>
                        )}
                        
                        {showForgotPassword && (
                            <button 
                                type="button"
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setError('');
                                    setSuccess('');
                                }}
                                className="w-full py-2 font-semibold text-neutral-400 hover:text-white transition-colors"
                            >
                                Back to Login
                            </button>
                        )}
                    </form>
                )}

            </div>
        </div>
        
        <div className="mt-8 sm:mt-12 w-full max-w-5xl px-2">
            <h2 className="text-center text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Discover a World of Content</h2>
             <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 pointer-events-none">
                 {showcaseItems.map(item => (
                    <div key={item.id} className="opacity-70">
                        <OnlyFansCard item={{...item, blurLevel: 8}} onCardClick={() => {}} />
                    </div>
                 ))}
             </div>
        </div>
    <SupportButton />
    </div>
  );
};

export default Login;