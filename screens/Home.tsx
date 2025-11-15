
import React, { useState, useMemo } from 'react';
import { type Screen, type ContentItem } from '../types';
import { useCredits } from '../hooks/useCredits';
import OnlyFansCard from '../components/OnlyFansCard';
import ConfirmPurchaseModal from '../components/ConfirmPurchaseModal';
import Notification from '../components/Notification';
import Feed from '../components/Feed';
import ViewContentModal from '../components/ViewContentModal';
import InlineLoginModal from '../components/InlineLoginModal';

interface HomeProps {
  navigate: (screen: Screen) => void;
}

const Home: React.FC<HomeProps> = ({ navigate }) => {
  const { contentItems, unlockedContentIds, currentUser, activeTagFilter, setTagFilter, viewingCreatorId, setViewCreator, allUsers, showcasedUserIds } = useCredits();
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isViewContentModalOpen, setIsViewContentModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'showcase' | 'feed' | 'following'>('showcase');
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedContentId, setHighlightedContentId] = useState<string | null>(null);
  const [showInlineLogin, setShowInlineLogin] = useState(false);

  // Verificar URL para link compartilhado de conteúdo específico
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('content');
    if (contentId) {
      const content = contentItems.find(c => c.id === contentId);
      if (content) {
        setHighlightedContentId(contentId);
        handleCardClick(content);
      }
    }
  }, []);
  const handleCardClick = (item: ContentItem) => {
    setSelectedItem(item);
    if (!currentUser) { // Guest user - show inline login
        setShowInlineLogin(true);
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
  }
  
  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      setTagFilter(searchTerm);
  }

  const viewingCreator = useMemo(() => {
    if (!viewingCreatorId) return null;
    return allUsers.find(u => u.id === viewingCreatorId);
  }, [viewingCreatorId, allUsers]);

  const filteredContent = useMemo(() => {
    let items = contentItems;
    if (viewingCreatorId) {
        return items.filter(item => item.creatorId === viewingCreatorId);
    }
    if (activeTagFilter) {
        return items.filter(item => item.tags.includes(activeTagFilter.toLowerCase()));
    }
    if (activeTab === 'showcase' && showcasedUserIds.length > 0) {
        return items.filter(item => showcasedUserIds.includes(item.creatorId));
    }
    if (activeTab === 'following' && currentUser) {
        return items.filter(item => currentUser.following.includes(item.creatorId));
    }
    return items;
  }, [contentItems, activeTab, currentUser, activeTagFilter, viewingCreatorId, showcasedUserIds]);


  const TabButton: React.FC<{tab: 'showcase' | 'feed' | 'following', label: string, disabled?: boolean}> = ({tab, label, disabled}) => (
    <button
        onClick={() => {
            setViewCreator(null);
            setActiveTab(tab);
        }}
        disabled={disabled}
        className={`px-3 sm:px-4 py-2 text-sm sm:text-lg font-semibold rounded-t-lg transition-colors disabled:cursor-not-allowed disabled:text-neutral-600 whitespace-nowrap ${activeTab === tab && !viewingCreatorId ? 'border-b-2 border-brand-primary text-white' : 'text-neutral-400 hover:text-white'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="space-y-8">
      {notification && <Notification message={notification.message} type={notification.type} />}
      
      {viewingCreator ? (
        <div>
            <button onClick={() => setViewCreator(null)} className="text-sm text-brand-light hover:underline mb-2">&larr; Back to Home</button>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                    <img src={viewingCreator.profilePictureUrl} className="h-12 w-12 sm:h-16 sm:w-16 rounded-full"/>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-white">{viewingCreator.username}'s Showcase</h1>
                        <p className="text-sm sm:text-base text-neutral-300">Browse all content from this creator.</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        const url = `${window.location.origin}/vitrine/${viewingCreator.vitrineSlug}`;
                        navigator.clipboard.writeText(url);
                        setNotification({ message: 'Showcase link copied!', type: 'success' });
                        setTimeout(() => setNotification(null), 2000);
                    }}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                    Copy Link
                </button>
            </div>
        </div>
      ) : activeTagFilter ? (
        <div>
             <button onClick={() => setTagFilter(null)} className="text-sm text-brand-light hover:underline mb-2">&larr; Clear Filter</button>
            <h1 className="text-3xl font-bold text-white">Showing content for tag: <span className="text-brand-primary">{activeTagFilter}</span></h1>
        </div>
      ) : (
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Exclusive Content</h1>
            <p className="text-sm sm:text-base text-neutral-300">Discover new creators and unlock instant access.</p>
        </div>
      )}


       <div className="border-b border-neutral-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {!viewingCreatorId && (
            <div className="flex space-x-2 sm:space-x-4 overflow-x-auto w-full sm:w-auto">
                <TabButton tab="showcase" label="Showcase" />
                <TabButton tab="feed" label="Feed" />
                <TabButton tab="following" label="Following" disabled={!currentUser} />
            </div>
        )}
        <form onSubmit={handleSearch} className="flex items-center w-full sm:w-auto">
            <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by tag... (#art)"
                className="bg-neutral-800 border border-neutral-700 rounded-l-full py-2 px-4 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary w-full sm:w-auto text-sm sm:text-base"
            />
            <button type="submit" className="bg-brand-primary text-white p-2 rounded-r-full hover:bg-brand-secondary flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
        </form>
      </div>

      {(activeTab === 'showcase' || viewingCreatorId) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContent.map(item => (
            <OnlyFansCard key={item.id} item={item} onCardClick={handleCardClick} />
          ))}
        </div>
      )}

      {(activeTab === 'feed' || activeTab === 'following') && !viewingCreatorId && (
        <Feed items={filteredContent} onUnlockClick={handleCardClick} />
      )}

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
            window.location.href = '/';
          }}
        />
      )}
    </div>
  );
};

export default Home;