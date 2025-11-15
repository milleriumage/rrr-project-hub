import React, { useState, useEffect, useRef } from 'react';
import { useCredits } from '../hooks/useCredits';
import { useAuth } from '../hooks/useAuth';
import { ContentItem } from '../types';
import OnlyFansCard from '../components/OnlyFansCard';
import ConfirmPurchaseModal from '../components/ConfirmPurchaseModal';
import ViewContentModal from '../components/ViewContentModal';
import Notification from '../components/Notification';
import InlineLoginModal from '../components/InlineLoginModal';
import { supabase } from '../src/integrations/supabase/client';

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: Date;
  cost: number;
  read: boolean;
  sender_name?: string;
  sender_photo?: string;
}

const CreatorChat: React.FC = () => {
  const { currentUser, allUsers, contentItems, balance, addCredits, unlockedContentIds, setCurrentScreen, registerOrLoginUser } = useCredits();
  const { user: authUser } = useAuth();
  const [creatorSlug, setCreatorSlug] = useState<string>('');
  const [creator, setCreator] = useState<any>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isViewContentModalOpen, setIsViewContentModalOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [showCreatorList, setShowCreatorList] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded'>('loading');
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [chatHeight, setChatHeight] = useState<'small' | 'medium' | 'large'>('small');
  const [customChatHeight, setCustomChatHeight] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showInlineLogin, setShowInlineLogin] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const CREDIT_COST_PER_1000_CHARS = 50;

  // Sistema de créditos para visitantes (não logados)
  const GUEST_INITIAL_CREDITS = 100;
  const GUEST_CREDITS_KEY = 'guestChatCredits';

  const [guestCredits, setGuestCredits] = useState<number>(() => {
    const stored = localStorage.getItem(GUEST_CREDITS_KEY);
    return stored ? parseInt(stored) : GUEST_INITIAL_CREDITS;
  });

  // Atualizar localStorage quando guestCredits mudar
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem(GUEST_CREDITS_KEY, guestCredits.toString());
    }
  }, [guestCredits, currentUser]);

  // Função para obter o saldo correto (usuário logado ou visitante)
  const getCurrentBalance = () => {
    return currentUser ? balance : guestCredits;
  };

  // Lista de criadores disponíveis (incluindo o próprio usuário)
  const availableCreators = allUsers;
  
  // Perfil do usuário logado (username, foto e créditos)
  const [currentUserProfile, setCurrentUserProfile] = useState<{ username: string; profile_picture_url: string | null; credits_balance: number } | null>(null);

  // Sincronizar usuário autenticado com currentUser
  useEffect(() => {
    if (authUser && (!currentUser || currentUser.id !== authUser.id)) {
      // Forçar login do usuário autenticado no CreditsContext
      const syncUser = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (profile) {
          const user: any = {
            id: profile.id,
            username: profile.username,
            email: authUser.email || '',
            profilePictureUrl: profile.profile_picture_url,
            role: 'user',
            followers: [],
            following: [],
            vitrineSlug: profile.vitrine_slug,
          };
          // Usar registerOrLoginUser para sincronizar
          if (authUser.email) {
            registerOrLoginUser(authUser.id, authUser.email, profile.username);
          }
        }
      };
      syncUser();
    }
  }, [authUser, currentUser, registerOrLoginUser]);

  // Buscar perfil do usuário logado
  useEffect(() => {
    if (!authUser || !currentUser || currentUser.id !== authUser.id) {
      setCurrentUserProfile(null);
      return;
    }

    const fetchCurrentUserProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('username, profile_picture_url, credits_balance')
        .eq('id', currentUser.id)
        .single();
      
      if (data) {
        setCurrentUserProfile(data);
      }
    };

    fetchCurrentUserProfile();
  }, [currentUser, authUser]);

  // Atualizar perfil quando o saldo de créditos mudar
  useEffect(() => {
    if (!currentUser || !currentUserProfile) return;

    const updateBalance = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('id', currentUser.id)
        .single();
      
      if (data && data.credits_balance !== currentUserProfile.credits_balance) {
        setCurrentUserProfile(prev => prev ? { ...prev, credits_balance: data.credits_balance } : null);
      }
    };

    updateBalance();
  }, [balance, currentUser]);

  useEffect(() => {
    // Obter slug ou ID da URL
    const path = window.location.pathname;
    const match = path.match(/^\/chat\/([^\/]+)$/);
    if (match) {
      const identifier = match[1];
      setCreatorSlug(identifier);
      // Tentar encontrar por vitrineSlug ou por ID
      const foundCreator = allUsers.find(u => u.vitrineSlug === identifier || u.id === identifier);
      if (foundCreator) {
        setCreator(foundCreator);
        setShowCreatorList(false);
      }
    } else if (path === '/chat') {
      // Rota geral /chat - mostrar lista de criadores
      setShowCreatorList(true);
    }
  }, [allUsers]);

  useEffect(() => {
    // Scroll suave para o final das mensagens quando expandido
    if (messagesEndRef.current && isChatExpanded) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isChatExpanded]);

  // Drag to resize event listeners - MUST be at component level, not inside conditionals
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !chatContainerRef.current) return;
      
      const containerRect = chatContainerRef.current.getBoundingClientRect();
      const newHeight = e.clientY - containerRect.top;
      
      // Limitar altura entre 300px e 900px
      if (newHeight >= 300 && newHeight <= 900) {
        setCustomChatHeight(newHeight);
        setChatHeight('medium'); // Reset preset selection
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const creatorContent = creator ? contentItems.filter(item => item.creatorId === creator.id) : [];

  const handleHomeClick = () => {
    if (authUser) {
      setCurrentScreen('home');
      window.history.pushState({}, '', '/');
    } else {
      setShowInlineLogin(true);
    }
  };

  // Carregar mensagens do banco de dados quando o criador é selecionado
  useEffect(() => {
    if (!creator) return;

    const loadMessages = async () => {
      setLoadingState('loading');
      
      // Se não estiver logado, não há mensagens do banco
      if (!currentUser) {
        setMessages([]);
        setLoadingState('loaded');
        return;
      }

      // Se o usuário logado é o próprio criador, carregar TODAS as mensagens enviadas PARA ele
      const query = currentUser.id === creator.id
        ? `receiver_id.eq.${creator.id}`
        : `and(sender_id.eq.${currentUser.id},receiver_id.eq.${creator.id}),and(sender_id.eq.${creator.id},receiver_id.eq.${currentUser.id})`;

      console.log('[CreatorChat] Loading messages with query:', query);
      console.log('[CreatorChat] CurrentUser:', currentUser.id, 'Creator:', creator.id, 'Is own chat:', currentUser.id === creator.id);

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(query)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[CreatorChat] Error loading messages:', error);
        return;
      }

      console.log('[CreatorChat] Loaded messages:', data?.length || 0, 'messages');

      if (data) {
        // Buscar perfis dos remetentes (excluir guest UUID especial)
        const guestUUID = '00000000-0000-0000-0000-000000000000';
        const senderIds = [...new Set(data.map(msg => msg.sender_id).filter(id => id !== guestUUID))];
        
        let profiles: Array<{id: string, username: string, profile_picture_url: string | null}> = [];
        if (senderIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, profile_picture_url')
            .in('id', senderIds);
          profiles = profilesData || [];
        }

        const profileMap = new Map(profiles.map(p => [p.id, p]));

        const formattedMessages = data.map(msg => {
          const profile = profileMap.get(msg.sender_id);
          const isGuest = msg.sender_id === guestUUID;
          
          return {
            ...msg,
            created_at: new Date(msg.created_at),
            sender_name: isGuest ? 'Guest' : profile?.username,
            sender_photo: isGuest 
              ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
              : profile?.profile_picture_url
          };
        }) as Message[];
        setMessages(formattedMessages);
      }
      
      setLoadingState('loaded');
    };

    loadMessages();
  }, [creator, currentUser]);

  // Escutar novas mensagens em tempo real
  useEffect(() => {
    if (!creator) return;

    console.log('[CreatorChat] Setting up realtime listener - CurrentUser:', currentUser?.id, 'Creator:', creator.id);

    // Criar canal de realtime com nome único baseado no criador
    // TODOS os clientes interessados no criador devem usar o MESMO nome de canal
    const channelName = `chat-room-${creator.id}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          console.log('[CreatorChat] 🔔 Nova mensagem recebida:', {
            sender: payload.new.sender_id,
            receiver: payload.new.receiver_id,
            message: payload.new.message
          });
          console.log('[CreatorChat] Context - CurrentUser:', currentUser?.id, 'Creator:', creator.id, 'Is creator viewing own chat:', currentUser?.id === creator.id);
          
          // Lógica de relevância:
          // 1. Se o usuário logado É o criador (está vendo sua inbox): aceita TODAS mensagens PARA ele
          // 2. Se o usuário NÃO é o criador: aceita apenas mensagens entre ele e o criador
          // 3. Se NÃO está logado (guest): aceita apenas mensagens PARA o criador (para ver respostas)
          
          let isRelevant = false;
          
          if (currentUser) {
            if (currentUser.id === creator.id) {
              // Criador vendo sua própria inbox - aceita TODAS mensagens enviadas PARA ele
              isRelevant = payload.new.receiver_id === creator.id;
              console.log('[CreatorChat] Creator inbox mode - relevant:', isRelevant);
            } else {
              // Usuário comum - aceita mensagens entre ele e o criador
              isRelevant = 
                (payload.new.sender_id === currentUser.id && payload.new.receiver_id === creator.id) ||
                (payload.new.sender_id === creator.id && payload.new.receiver_id === currentUser.id);
              console.log('[CreatorChat] User chat mode - relevant:', isRelevant);
            }
          } else {
            // Guest - aceita apenas mensagens PARA o criador (para ver respostas públicas)
            isRelevant = payload.new.receiver_id === creator.id;
            console.log('[CreatorChat] Guest mode - relevant:', isRelevant);
          }

          if (!isRelevant) {
            console.log('[CreatorChat] ❌ Message not relevant, ignoring');
            return;
          }

          console.log('[CreatorChat] ✅ Message is relevant, adding to messages');

          // Buscar perfil do remetente (exceto para guests)
          const guestUUID = '00000000-0000-0000-0000-000000000000';
          const isGuestMessage = payload.new.sender_id === guestUUID;
          
          let profile = null;
          if (!isGuestMessage) {
            const { data } = await supabase
              .from('profiles')
              .select('username, profile_picture_url')
              .eq('id', payload.new.sender_id)
              .single();
            profile = data;
          }

          const newMessage = {
            ...payload.new,
            created_at: new Date(payload.new.created_at),
            sender_name: isGuestMessage ? 'Guest' : profile?.username,
            sender_photo: isGuestMessage 
              ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
              : profile?.profile_picture_url
          } as Message;
          
          setMessages(prev => {
            // Evitar duplicatas
            if (prev.some(m => m.id === newMessage.id)) {
              console.log('[CreatorChat] Message already exists, skipping');
              return prev;
            }
            console.log('[CreatorChat] Adding message to state');
            return [...prev, newMessage];
          });
          
          // Scroll para a nova mensagem
          requestAnimationFrame(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          });
        }
      )
      .subscribe((status) => {
        console.log('[CreatorChat] Realtime subscription status:', status);
      });

    return () => {
      console.log('[CreatorChat] Cleaning up realtime listener');
      supabase.removeChannel(channel);
    };
  }, [creator, currentUser]);

  const handlePrevCard = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : creatorContent.length - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleNextCard = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentCardIndex((prev) => (prev < creatorContent.length - 1 ? prev + 1 : 0));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const calculateCreditCost = (text: string) => {
    return Math.ceil((text.length / 1000) * CREDIT_COST_PER_1000_CHARS);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    setCharCount(text.length);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !creator) return;

    const cost = calculateCreditCost(inputText);
    const currentBalance = getCurrentBalance();
    
    if (currentBalance < cost) {
      if (!currentUser) {
        // Usuário não logado sem créditos - pedir login
        setNotification({ 
          message: `No credits left! You need ${cost} credits to send this message. Please login to continue chatting.`, 
          type: 'error' 
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        // Usuário logado sem créditos
        setNotification({ 
          message: `Insufficient credits. Need ${cost} credits to send this message.`, 
          type: 'error' 
        });
      }
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // UUID especial para guests (00000000-0000-0000-0000-000000000000)
    const guestUUID = '00000000-0000-0000-0000-000000000000';
    const senderId = currentUser?.id || guestUUID;
    
    // Deduzir créditos apropriados
    if (currentUser) {
      // Usuários logados: deduzir do banco e registrar transação
      addCredits(-cost, `Message sent to ${creator.username}`, 'purchase' as any);
      
      try {
        await supabase
          .from('transactions')
          .insert({
            user_id: currentUser.id,
            type: 'purchase',
            amount: -cost,
            description: `Chat message to ${creator.username}`,
            related_content_id: null
          });
      } catch (error) {
        console.error('Error saving transaction:', error);
      }
    } else {
      // Guests: deduzir créditos locais apenas
      setGuestCredits(prev => prev - cost);
    }

    // Salvar mensagem no banco de dados (funciona para guests e usuários logados)
    console.log('[CreatorChat] Sending message - Sender:', senderId, 'Receiver:', creator.id, 'Is guest:', !currentUser);
    
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: senderId,
        receiver_id: creator.id,
        message: inputText,
        cost
      });

    if (error) {
      console.error('[CreatorChat] Error sending message:', error);
      setNotification({ 
        message: 'Failed to send message. Please try again.', 
        type: 'error' 
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    console.log('[CreatorChat] Message sent successfully - sender:', senderId, 'receiver:', creator.id, 'Is guest:', !currentUser);

    setInputText('');
    setCharCount(0);
  };

  const handleCopyLink = () => {
    if (!creator) return;
    // Usar vitrineSlug se disponível, caso contrário usar ID
    const identifier = creator.vitrineSlug || creator.id;
    const url = `${window.location.origin}/chat/${identifier}`;
    navigator.clipboard.writeText(url);
    setNotification({ message: 'Chat link copied!', type: 'success' });
    setTimeout(() => setNotification(null), 2000);
  };

  const handleCardClick = (item: ContentItem) => {
    setSelectedItem(item);
    if (!currentUser) {
      setIsPurchaseModalOpen(true);
      return;
    }
    if (unlockedContentIds.includes(item.id)) {
      setIsViewContentModalOpen(true);
    } else {
      setIsPurchaseModalOpen(true);
    }
  };

  const handlePurchaseSuccess = () => {
    setNotification({ message: 'Content unlocked successfully!', type: 'success' });
    setIsPurchaseModalOpen(false);
    setIsViewContentModalOpen(true);
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePurchaseError = (error: string) => {
    setNotification({ message: error, type: 'error' });
    setIsPurchaseModalOpen(false);
    setSelectedItem(null);
    setTimeout(() => setNotification(null), 3000);
  };

  const closeAllModals = () => {
    setIsPurchaseModalOpen(false);
    setIsViewContentModalOpen(false);
    setSelectedItem(null);
  };

  if (!creator && availableCreators.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">No Creators Available</h1>
          <p className="text-neutral-400">There are no creators with showcase available to chat.</p>
        </div>
      </div>
    );
  }

  if (showCreatorList) {
    const handleShareGeneralChat = () => {
      const url = `${window.location.origin}/chat`;
      navigator.clipboard.writeText(url);
      setNotification({ message: 'General chat link copied!', type: 'success' });
      setTimeout(() => setNotification(null), 2000);
    };

    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Select a Creator to Chat</h1>
            <p className="text-neutral-400">Choose from available creators below</p>
          </div>
          
          {/* Botão de compartilhar chat geral */}
          <button
            onClick={handleShareGeneralChat}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg transition-all hover-scale"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share Funators
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableCreators
            .filter((c, index, self) => self.findIndex(u => u.id === c.id) === index)
            .map(c => {
            const handleShareCreatorChat = (e: React.MouseEvent) => {
              e.stopPropagation();
              const identifier = c.vitrineSlug || c.id;
              const url = `${window.location.origin}/chat/${identifier}`;
              navigator.clipboard.writeText(url);
              setNotification({ message: `${c.username}'s chat link copied!`, type: 'success' });
              setTimeout(() => setNotification(null), 2000);
            };

            return (
              <div key={c.id} className="relative group">
                <button
                  onClick={() => {
                    const identifier = c.vitrineSlug || c.id;
                    window.history.pushState({}, '', `/chat/${identifier}`);
                    setCreator(c);
                    setShowCreatorList(false);
                  }}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl p-4 transition-all hover-scale text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src={c.profilePictureUrl} 
                      alt={c.username}
                      className="w-12 h-12 rounded-full border-2 border-brand-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{c.username}</h3>
                      <p className="text-xs text-neutral-400">{c.followers.length} followers</p>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500">
                    {contentItems.filter(item => item.creatorId === c.id).length} posts
                  </div>
                </button>
                
                {/* Botão de compartilhar específico do criador */}
                <button
                  onClick={handleShareCreatorChat}
                  className="absolute top-2 right-2 p-2 bg-neutral-900/90 hover:bg-brand-primary text-neutral-400 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  aria-label={`Share ${c.username}'s chat`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!creator) return null;

  const currentCard = creatorContent[currentCardIndex];

  const chatHeightClasses = {
    small: 'h-[400px]',
    medium: 'h-[550px]',
    large: 'h-[700px]'
  };

  // Drag to resize functionality - MOVED to top with other hooks
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Show loading state to avoid flickering
  if (loadingState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-neutral-400">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto relative">
      {notification && <Notification message={notification.message} type={notification.type} />}

      {/* Botão flutuante quando minimizado */}
      {!isChatExpanded && (
        <button
          onClick={() => setIsChatExpanded(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 z-50 p-4 bg-brand-primary hover:bg-brand-secondary text-white rounded-full shadow-2xl transition-all hover-scale flex items-center gap-2"
          aria-label="Expandir chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span className="font-semibold">Chat</span>
        </button>
      )}

      {/* Header com informações do criador e Card Carousel */}
      <div className={`bg-neutral-900 border-b border-neutral-800 p-3 md:p-4 space-y-3 md:space-y-4 transition-all ${!isChatExpanded ? 'md:min-h-[calc(100vh-200px)]' : ''}`}>
        {/* Creator Info com botão Home */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img 
              src={creator.profilePictureUrl} 
              alt={creator.username}
              className="w-10 h-10 rounded-full border-2 border-brand-primary"
            />
            <div>
              <h2 className="text-base font-bold text-white">{creator.username}</h2>
              <p className="text-xs text-neutral-400">
                {creator.followers.length} followers
              </p>
            </div>
          </div>
          
          <button
            onClick={handleHomeClick}
            className="flex-shrink-0 p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            aria-label="Ir para Home"
            title={authUser ? "Ir para Home" : "Fazer Login"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </button>
        </div>

        {/* Card Carousel */}
        <div className={`relative ${!isChatExpanded ? 'flex items-center justify-center py-4 md:py-8' : ''}`}>
          {creatorContent.length > 0 ? (
            <div className={`${!isChatExpanded ? 'relative w-full' : 'flex items-center justify-center gap-2 md:gap-4'}`}>
              {/* Botões de navegação - Overlay transparente no mobile quando minimizado */}
              <button
                onClick={handlePrevCard}
                disabled={isTransitioning}
                className={`rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white transition-all hover-scale backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                  !isChatExpanded 
                    ? 'absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-neutral-800/60' 
                    : 'flex-shrink-0 p-2 md:p-3'
                }`}
                aria-label="Previous card"
              >
                <ChevronLeftIcon />
              </button>
              
              <div className={`overflow-hidden ${!isChatExpanded ? 'w-full max-w-sm md:max-w-lg mx-auto' : 'w-full max-w-md'}`}>
                <div 
                  key={currentCardIndex}
                  className="animate-fade-in transition-all duration-300"
                >
                  {currentCard && (
                    <OnlyFansCard item={currentCard} onCardClick={handleCardClick} />
                  )}
                </div>
              </div>

              <button
                onClick={handleNextCard}
                disabled={isTransitioning}
                className={`rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white transition-all hover-scale backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                  !isChatExpanded 
                    ? 'absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-neutral-800/60' 
                    : 'flex-shrink-0 p-2 md:p-3'
                }`}
                aria-label="Next card"
              >
                <ChevronRightIcon />
              </button>
            </div>
          ) : (
            <div className="text-center py-8 bg-neutral-800/50 rounded-xl border border-neutral-700">
              <p className="text-neutral-400 text-sm">
                This creator hasn't posted any content yet
              </p>
            </div>
          )}
          {creatorContent.length > 0 && (
            <div className="text-center mt-3 text-xs text-neutral-500 font-medium">
              Post {currentCardIndex + 1} of {creatorContent.length}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {isChatExpanded && (
        <div 
          ref={chatContainerRef}
          className={`bg-neutral-900 flex flex-col transition-all duration-300 relative ${customChatHeight ? '' : chatHeightClasses[chatHeight]}`}
          style={customChatHeight ? { height: `${customChatHeight}px` } : undefined}
        >
          {/* Barra de Resize na parte inferior */}
          <div 
            onMouseDown={handleMouseDown}
            className={`absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-10 group hover:bg-brand-primary/20 transition-colors ${isDragging ? 'bg-brand-primary/30' : ''}`}
            title="Arraste para ajustar a altura"
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-1 bg-neutral-600 rounded-full group-hover:bg-brand-primary transition-colors"></div>
          </div>

          {/* Header do Chat com Botões de Controle */}
          <div className="bg-neutral-800 border-b border-neutral-700 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <h3 className="text-xs font-semibold text-white">Chat</h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Chat Height Controls */}
              <div className="flex items-center gap-1 bg-neutral-700/50 rounded-lg p-1">
                <button
                  onClick={() => { setChatHeight('small'); setCustomChatHeight(null); }}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${chatHeight === 'small' && !customChatHeight ? 'bg-brand-primary text-white' : 'text-neutral-400 hover:text-white'}`}
                  title="Small"
                >
                  S
                </button>
                <button
                  onClick={() => { setChatHeight('medium'); setCustomChatHeight(null); }}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${chatHeight === 'medium' && !customChatHeight ? 'bg-brand-primary text-white' : 'text-neutral-400 hover:text-white'}`}
                  title="Medium"
                >
                  M
                </button>
                <button
                  onClick={() => { setChatHeight('large'); setCustomChatHeight(null); }}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${chatHeight === 'large' && !customChatHeight ? 'bg-brand-primary text-white' : 'text-neutral-400 hover:text-white'}`}
                  title="Large"
                >
                  L
                </button>
              </div>
              <button
                onClick={() => setIsChatExpanded(false)}
                className="p-1.5 hover:bg-neutral-700 rounded-lg transition-colors text-neutral-400 hover:text-white"
                aria-label="Minimizar chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 14 10 14 10 20"></polyline>
                  <polyline points="20 10 14 10 14 4"></polyline>
                  <line x1="14" y1="10" x2="21" y2="3"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
              </button>
            </div>
          </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scroll-smooth overscroll-contain">
          <div className="min-h-full flex flex-col justify-end">
          {messages.length === 0 && (
            <div className="text-center text-neutral-500 py-8 animate-fade-in">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              {currentUser && currentUser.id === creator.id ? (
                <>
                  <p className="text-sm font-semibold text-white mb-1">Your Inbox</p>
                  <p className="text-xs text-neutral-400">Messages from your fans will appear here</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-white mb-1">Start chatting with {creator.username}</p>
                  <p className="text-xs text-neutral-400">💬 {CREDIT_COST_PER_1000_CHARS} credits per 1,000 characters</p>
                  {!currentUser && (
                    <p className="text-xs text-brand-primary mt-2 font-medium">
                      ✨ You have {guestCredits} free credits as a guest
                    </p>
                  )}
                </>
              )}
            </div>
          )}
          {messages.map((msg, index) => {
            const guestUUID = '00000000-0000-0000-0000-000000000000';
            const isOwnMessage = currentUser ? msg.sender_id === currentUser.id : msg.sender_id === guestUUID;
            const messageTime = new Date(msg.created_at);
            
            // Priorizar dados do perfil do usuário logado para suas próprias mensagens
            const senderPhoto = isOwnMessage && currentUserProfile?.profile_picture_url 
              ? currentUserProfile.profile_picture_url 
              : msg.sender_photo || creator.profilePictureUrl;
              
            const senderName = isOwnMessage && currentUserProfile?.username 
              ? currentUserProfile.username 
              : msg.sender_name || creator.username;
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex flex-col gap-1 max-w-[80%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {/* Nome e foto do usuário acima da mensagem */}
                  <div className={`flex items-center gap-1.5 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                    <img 
                      src={senderPhoto} 
                      alt={senderName}
                      className={`w-5 h-5 rounded-full border ${isOwnMessage ? 'border-brand-primary' : 'border-neutral-700'} flex-shrink-0`}
                    />
                    <span className="text-[10px] font-medium text-neutral-400">{senderName}</span>
                  </div>
                  
                  {/* Mensagem */}
                  <div
                    className={`rounded-xl px-3 py-2 shadow transition-all ${
                      isOwnMessage
                        ? 'bg-brand-primary text-white rounded-br-none'
                        : 'bg-neutral-800 text-white border border-neutral-700 rounded-bl-none'
                    }`}
                  >
                    <p className="text-xs leading-relaxed break-words">{msg.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] opacity-50">
                        {messageTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.cost > 0 && (
                        <>
                          <span className="text-[10px] opacity-50">-{msg.cost} credits</span>
                          {isOwnMessage && currentUserProfile && (
                            <span className="text-[10px] text-green-500 font-medium">
                              {currentUserProfile.credits_balance} credits
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-neutral-800 p-3 bg-neutral-900/95 backdrop-blur-sm">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-transparent text-white text-sm placeholder:text-neutral-500 transition-all"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="flex items-center justify-between mt-1 px-1">
                <span className="text-[10px] text-neutral-500">
                  {charCount} chars • {currentUser ? 'Your' : 'Guest'} balance: {currentUser && currentUserProfile ? currentUserProfile.credits_balance : guestCredits} credits
                </span>
                <span className={`text-[10px] font-semibold ${calculateCreditCost(inputText) > (currentUser && currentUserProfile ? currentUserProfile.credits_balance : guestCredits) ? 'text-red-400' : 'text-accent-green'}`}>
                  {calculateCreditCost(inputText)} credits
                </span>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={handleCopyLink}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-lg text-xs transition-all"
                title="Share"
              >
                <CopyIcon />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="px-3 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div 
          className={`absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-brand-primary/20 transition-colors ${isDragging ? 'bg-brand-primary/30' : ''}`}
          onMouseDown={handleMouseDown}
          title="Drag to resize"
        />
        </div>
      )}

      {/* Modals */}
      {isPurchaseModalOpen && selectedItem && (
        <ConfirmPurchaseModal
          item={selectedItem}
          onClose={closeAllModals}
          onConfirm={handlePurchaseSuccess}
          onError={handlePurchaseError}
        />
      )}

      {isViewContentModalOpen && selectedItem && (
        <ViewContentModal 
          item={selectedItem}
          onClose={closeAllModals}
        />
      )}

      {showInlineLogin && (
        <InlineLoginModal 
          onClose={() => setShowInlineLogin(false)}
          onSwitchToSignup={() => {
            setShowInlineLogin(false);
            setCurrentScreen('home');
            window.history.pushState({}, '', '/');
          }}
        />
      )}
    </div>
  );
};

export default CreatorChat;
