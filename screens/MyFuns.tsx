import React, { useState, useMemo } from 'react';
import { useCredits } from '../hooks/useCredits';
import OnlyFansCard from '../components/OnlyFansCard';
import ViewContentModal from '../components/ViewContentModal';
import { ContentItem } from '../types';

const MyFuns: React.FC = () => {
  const { contentItems, unlockedContentIds, currentUser } = useCredits();
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  const purchasedContent = useMemo(() => {
    return contentItems.filter(item => unlockedContentIds.includes(item.id));
  }, [contentItems, unlockedContentIds]);

  const handleCardClick = (item: ContentItem) => {
    setSelectedContent(item);
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Funs</h1>
        <p className="text-neutral-400">Content you've purchased and unlocked</p>
      </div>

      {purchasedContent.length === 0 ? (
        <div className="bg-neutral-800 rounded-lg p-12 text-center">
          <div className="mb-4">
            <svg 
              className="w-20 h-20 mx-auto text-neutral-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No purchased content yet</h3>
          <p className="text-neutral-400 mb-6">
            Start exploring the store to unlock amazing content from creators!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {purchasedContent.map(item => (
              <OnlyFansCard 
                key={item.id} 
                item={item} 
                onCardClick={handleCardClick}
              />
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-neutral-400">
              Total purchased: <span className="text-white font-semibold">{purchasedContent.length}</span> {purchasedContent.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </>
      )}

      {selectedContent && (
        <ViewContentModal 
          item={selectedContent} 
          onClose={() => setSelectedContent(null)} 
        />
      )}
    </div>
  );
};

export default MyFuns;
