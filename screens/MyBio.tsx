import React from 'react';
import { useCredits } from '../hooks/useCredits';
import VitrineView from './VitrineView';

const MyBio: React.FC = () => {
  const { currentUser } = useCredits();

  if (!currentUser || !currentUser.vitrineSlug) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-neutral-800 rounded-lg p-6 shadow-lg text-center">
          <p className="text-neutral-400">Please set up your vitrine slug in Account settings to view your bio.</p>
        </div>
      </div>
    );
  }

  return <VitrineView slug={currentUser.vitrineSlug} />;
};

export default MyBio;
