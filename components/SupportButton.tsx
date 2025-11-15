import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import SupportModal from './SupportModal';

const SupportButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
        aria-label="Support"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <SupportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default SupportButton;
