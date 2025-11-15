
import React, { useState, useEffect } from 'react';
import { supabase } from '../src/integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import Notification from '../components/Notification';

interface CreatorTransaction {
  id: string;
  buyer_id: string;
  card_title: string;
  original_price: number;
  amount_received: number;
  timestamp: string;
}

interface Profile {
  earned_balance: number;
  last_withdrawal_at: string | null;
  paypal_email: string | null;
  stripe_email: string | null;
}

const PayoutsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;

const CreatorPayouts: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [transactions, setTransactions] = useState<CreatorTransaction[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paypalEmail, setPaypalEmail] = useState('');
    const [stripeEmail, setStripeEmail] = useState('');
    const [isEditingPayment, setIsEditingPayment] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    
    const creditValueUSD = 0.01;
    const platformCommission = 0.50;
    const withdrawalCooldownHours = 24;

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            
            const { data, error } = await supabase
                .from('profiles')
                .select('earned_balance, last_withdrawal_at, paypal_email, stripe_email')
                .eq('id', user.id)
                .single();
            
            if (data) {
                setProfile(data);
                setPaypalEmail(data.paypal_email || '');
                setStripeEmail(data.stripe_email || '');
            }
        };
        
        fetchProfile();
    }, [user]);
    
    // Fetch creator transactions
    useEffect(() => {
        const fetchTransactions = async () => {
            if (!user) return;
            
            const { data, error } = await supabase
                .from('creator_transactions')
                .select('*')
                .eq('creator_id', user.id)
                .order('timestamp', { ascending: false });
            
            if (data) {
                setTransactions(data);
                
                // Calcular o total de ganhos a partir das transações
                const totalEarned = data.reduce((sum, tx) => sum + tx.amount_received, 0);
                
                // Atualizar o earned_balance no perfil se diferente
                if (profile && profile.earned_balance !== totalEarned) {
                    setProfile(prev => prev ? { ...prev, earned_balance: totalEarned } : null);
                    
                    // Atualizar no banco de dados também
                    await supabase
                        .from('profiles')
                        .update({ earned_balance: totalEarned })
                        .eq('id', user.id);
                }
            }
        };
        
        fetchTransactions();
    }, [user, profile?.earned_balance]);
    
    // Calculate withdrawal timer
    useEffect(() => {
        if (!profile?.last_withdrawal_at) {
            setTimeLeft(0);
            return;
        }
        
        const lastWithdrawal = new Date(profile.last_withdrawal_at).getTime();
        const cooldownMs = withdrawalCooldownHours * 60 * 60 * 1000;
        const nextWithdrawal = lastWithdrawal + cooldownMs;
        
        const timer = setInterval(() => {
            const remaining = Math.max(0, nextWithdrawal - Date.now());
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [profile?.last_withdrawal_at, withdrawalCooldownHours]);
    
    const formatTime = (ms: number) => {
        if (ms <= 0) return "0s";
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        if (hours > 0 || days > 0) timeString += `${hours}h `;
        if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m `;
        timeString += `${seconds}s`;
        
        return timeString.trim();
    };

    const isWithdrawalReady = timeLeft <= 0;
    
    const handleWithdrawal = async () => {
        if (!isWithdrawalReady || isProcessing || !user || !profile) return;
        
        setIsProcessing(true);
        
        // Update last_withdrawal_at
        const { error } = await supabase
            .from('profiles')
            .update({ last_withdrawal_at: new Date().toISOString() })
            .eq('id', user.id);
        
        setIsProcessing(false);
        
        if (!error) {
            setNotification({
                message: `Withdrawal request submitted for $${(profile.earned_balance * creditValueUSD).toFixed(2)}. Please contact support to complete your payout.`,
                type: 'success'
            });
            setTimeout(() => setNotification(null), 5000);
            
            // Refresh profile
            const { data } = await supabase
                .from('profiles')
                .select('earned_balance, last_withdrawal_at, paypal_email, stripe_email')
                .eq('id', user.id)
                .single();
            
            if (data) setProfile(data);
        } else {
            setNotification({
                message: 'Failed to process withdrawal. Please try again.',
                type: 'error'
            });
            setTimeout(() => setNotification(null), 3000);
        }
    };
    
    const handleSavePaymentInfo = async () => {
        if (!user) return;
        
        const { error } = await supabase
            .from('profiles')
            .update({ 
                paypal_email: paypalEmail || null,
                stripe_email: stripeEmail || null
            })
            .eq('id', user.id);
        
        if (!error) {
            setNotification({
                message: 'Payment information updated successfully!',
                type: 'success'
            });
            setTimeout(() => setNotification(null), 3000);
            setIsEditingPayment(false);
        } else {
            setNotification({
                message: 'Failed to update payment information.',
                type: 'error'
            });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    if (!user || !profile) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center py-12">
                    <p className="text-neutral-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {notification && <Notification message={notification.message} type={notification.type} />}
            
            <div>
                <h1 className="text-3xl font-bold text-white">Creator Payouts</h1>
                <p className="text-neutral-400">Manage your earnings and withdrawals.</p>
            </div>

            {/* Payment Information Section */}
            <div className="bg-neutral-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Payment Information</h2>
                    <button 
                        onClick={() => setIsEditingPayment(!isEditingPayment)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                        {isEditingPayment ? 'Cancel' : 'Edit'}
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">PayPal Email</label>
                        <input
                            type="email"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            disabled={!isEditingPayment}
                            placeholder="your-paypal@email.com"
                            className="w-full bg-neutral-700 text-white rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Stripe Email</label>
                        <input
                            type="email"
                            value={stripeEmail}
                            onChange={(e) => setStripeEmail(e.target.value)}
                            disabled={!isEditingPayment}
                            placeholder="your-stripe@email.com"
                            className="w-full bg-neutral-700 text-white rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    
                    {isEditingPayment && (
                        <button
                            onClick={handleSavePaymentInfo}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                        >
                            Save Payment Information
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-neutral-800 rounded-lg p-6 text-center">
                    <h2 className="text-sm font-semibold text-neutral-400 uppercase">Earned Balance</h2>
                    <p className="text-5xl font-bold text-blue-400 mt-2">{profile.earned_balance.toLocaleString('en-US')}</p>
                    <p className="text-neutral-300 mt-1">credits</p>
                </div>
                <div className="bg-neutral-800 rounded-lg p-6 text-center">
                     <h2 className="text-sm font-semibold text-neutral-400 uppercase">Estimated Value</h2>
                    <p className="text-5xl font-bold text-accent-green mt-2">${(profile.earned_balance * creditValueUSD).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    <p className="text-neutral-300 mt-1">USD (1 credit = ${creditValueUSD})</p>
                </div>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Withdraw Funds</h2>
                <div className="text-center border border-neutral-700 rounded-lg p-4">
                    {isWithdrawalReady ? (
                        <>
                            <p className="text-accent-green mb-2 font-semibold">Withdrawal Ready!</p>
                            <p className="text-neutral-400 text-sm">Click below to request withdrawal. You will need to contact support to complete the process.</p>
                        </>
                    ) : (
                        <>
                            <p className="text-neutral-400 mb-2">Next withdrawal available in:</p>
                            <p className="text-3xl font-mono font-bold text-white">{formatTime(timeLeft)}</p>
                        </>
                    )}
                </div>
                <button 
                    disabled={!isWithdrawalReady || isProcessing}
                    onClick={handleWithdrawal}
                    className="w-full mt-4 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed hover:bg-brand-secondary"
                >
                    <PayoutsIcon />
                    <span className="ml-2">{isProcessing ? 'Processing...' : `Withdraw $${(profile.earned_balance * creditValueUSD).toFixed(2)}`}</span>
                </button>
                <p className="text-center text-xs text-neutral-500 mt-2">*A platform fee of {platformCommission * 100}% applies to all earnings.</p>
                {isWithdrawalReady && (
                    <p className="text-center text-sm text-blue-400 mt-2">After requesting withdrawal, please contact support to complete your payout.</p>
                )}
            </div>

            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Earnings History</h2>
                 <div className="bg-neutral-800 rounded-lg shadow-lg">
                    {transactions.length > 0 ? (
                        <ul className="divide-y divide-neutral-700">
                            {transactions.map((tx) => (
                                <li key={tx.id} className="p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-white">Sale of "{tx.card_title}"</p>
                                        <p className="text-sm text-neutral-400">
                                            Purchased on {new Date(tx.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-blue-400">
                                           +{tx.amount_received.toLocaleString('en-US')}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                           (Original: {tx.original_price})
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-neutral-400">No earnings found yet.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default CreatorPayouts;
