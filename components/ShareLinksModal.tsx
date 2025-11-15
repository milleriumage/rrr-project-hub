import React, { useState } from 'react';

interface ShareLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareVitrine: () => void;
  shareChatLink: () => void;
  shareCreatorChatList: () => void;
  onFunatorsChat: () => void;
}

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

const ShareLinksModal: React.FC<ShareLinksModalProps> = ({
  isOpen,
  onClose,
  shareVitrine,
  shareChatLink,
  shareCreatorChatList,
  onFunatorsChat
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (action: () => void, linkName: string) => {
    action();
    setCopiedLink(linkName);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-700">
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <h2 className="text-2xl font-bold text-white">Share Links</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors p-2 hover:bg-neutral-700 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-3">
          {/* Showcase Link */}
          <div className="flex flex-col">
            <button
              onClick={() => handleCopy(shareVitrine, 'showcase')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary transition-colors border border-brand-primary/30"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-3">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <rect x="7" y="7" width="3" height="9"/>
                  <rect x="14" y="7" width="3" height="5"/>
                </svg>
                <span className="font-semibold">Showcase Link</span>
              </div>
              <div className="flex items-center">
                {copiedLink === 'showcase' ? (
                  <span className="text-sm mr-2">Copied!</span>
                ) : null}
                <CopyIcon />
              </div>
            </button>
          </div>

          {/* FunChat */}
          <div className="flex flex-col">
            <button
              onClick={() => handleCopy(shareChatLink, 'funchat')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-accent-purple/20 hover:bg-accent-purple/30 text-accent-purple transition-colors border border-accent-purple/30"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-3">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span className="font-semibold">FunChat</span>
              </div>
              <div className="flex items-center">
                {copiedLink === 'funchat' ? (
                  <span className="text-sm mr-2">Copied!</span>
                ) : null}
                <CopyIcon />
              </div>
            </button>
          </div>

          {/* Feed Creator */}
          <div className="flex flex-col">
            <button
              onClick={() => handleCopy(shareCreatorChatList, 'feed')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-accent-green/20 hover:bg-accent-green/30 text-accent-green transition-colors border border-accent-green/30"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-3">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span className="font-semibold">Feed Creator</span>
              </div>
              <div className="flex items-center">
                {copiedLink === 'feed' ? (
                  <span className="text-sm mr-2">Copied!</span>
                ) : null}
                <CopyIcon />
              </div>
            </button>
          </div>

          {/* Funators Chat */}
          <div className="flex flex-col">
            <button
              onClick={onFunatorsChat}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-accent-orange/20 hover:bg-accent-orange/30 text-accent-orange transition-colors border border-accent-orange/30"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-3">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <circle cx="9" cy="10" r="1"/>
                  <circle cx="15" cy="10" r="1"/>
                  <path d="M9 14a5 5 0 0 0 6 0"/>
                </svg>
                <span className="font-semibold">Funators Chat</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareLinksModal;
