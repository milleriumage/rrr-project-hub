import React, { useEffect, useState } from 'react';
import { useCredits } from '../hooks/useCredits';
import { ContentItem } from '../types';
import OnlyFansCard from '../components/OnlyFansCard';
import ConfirmPurchaseModal from '../components/ConfirmPurchaseModal';
import ViewContentModal from '../components/ViewContentModal';
import Notification from '../components/Notification';

interface VitrineViewProps {
  slug: string;
  contentId?: string;
}

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

const VitrineView: React.FC<VitrineViewProps> = ({ slug, contentId }) => {
  const { allUsers, contentItems, unlockedContentIds, currentUser, followUser, unfollowUser } = useCredits();
  const [creator, setCreator] = useState(allUsers.find(u => u.vitrineSlug === slug));
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isViewContentModalOpen, setIsViewContentModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const foundCreator = allUsers.find(u => u.vitrineSlug === slug);
    setCreator(foundCreator);

    // Se um contentId específico foi fornecido, abra-o automaticamente
    if (contentId && foundCreator) {
      const content = contentItems.find(c => c.id === contentId && c.creatorId === foundCreator.id);
      if (content) {
        handleCardClick(content);
      }
    }
  }, [slug, contentId, allUsers, contentItems]);

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

  const handleCopyLink = () => {
    if (!creator) return;
    const url = `${window.location.origin}/vitrine/${creator.vitrineSlug}`;
    navigator.clipboard.writeText(url);
    setNotification({ message: 'Showcase link copied!', type: 'success' });
    setTimeout(() => setNotification(null), 2000);
  };

  const handleFollow = () => {
    if (!creator || !currentUser) return;
    if (currentUser.following.includes(creator.id)) {
      unfollowUser(creator.id);
      setNotification({ message: `Unfollowed ${creator.username}`, type: 'success' });
    } else {
      followUser(creator.id);
      setNotification({ message: `Following ${creator.username}!`, type: 'success' });
    }
    setTimeout(() => setNotification(null), 2000);
  };

  if (!creator) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Creator Not Found</h1>
          <p className="text-neutral-400">The showcase you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const creatorContent = contentItems.filter(item => item.creatorId === creator.id);
  const isFollowing = currentUser?.following.includes(creator.id);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {notification && <Notification message={notification.message} type={notification.type} />}

      {/* Creator Header */}
      <div className="bg-neutral-800 rounded-xl p-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <img 
              src={creator.profilePictureUrl} 
              alt={creator.username}
              className="w-24 h-24 rounded-full border-4 border-brand-primary"
            />
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{creator.username}</h1>
              <p className="text-neutral-400 text-sm capitalize">{creator.role}</p>
              <div className="flex gap-6 mt-3">
                <div className="text-center">
                  <p className="font-bold text-white text-xl">{creator.followers.length}</p>
                  <p className="text-xs text-neutral-400">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-white text-xl">{creator.following.length}</p>
                  <p className="text-xs text-neutral-400">Following</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-white text-xl">{creatorContent.length}</p>
                  <p className="text-xs text-neutral-400">Posts</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            {currentUser && currentUser.id !== creator.id && (
              <button
                onClick={handleFollow}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isFollowing
                    ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
                    : 'bg-brand-primary hover:bg-brand-secondary text-white'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CopyIcon />
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          {creator.username}'s Content
        </h2>
        {creatorContent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creatorContent.map(item => (
              <OnlyFansCard key={item.id} item={item} onCardClick={handleCardClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-400 text-lg">No content available yet.</p>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default VitrineView;
