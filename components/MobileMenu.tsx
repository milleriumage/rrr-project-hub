import React from 'react';
import { Screen, UserRole } from '../types';
import { useCredits } from '../hooks/useCredits';
import { SidebarVisibility } from '../context/CreditsContext';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const FunsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const StoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V7"/><path d="M2 7v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7"/></svg>;
const PixIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4Z"/></svg>;
const LivePixIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M12 8v4l2 2"></path></svg>;
const AccountIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const PlusSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>;
const CreationsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>;
const PayoutsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const DevIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const UserPlanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ShowcaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const UXKitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 3-3 3 3"/><path d="m9 10 3 3 3-3"/></svg>;

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: Screen) => void;
}

interface NavConfig {
  screen: Screen;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  visibility?: keyof SidebarVisibility;
}

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const { currentScreen, userRole, sidebarVisibility, shareVitrine } = useCredits();

  if (!isOpen) return null;

  const navItems: NavConfig[] = [
    { screen: 'home', label: 'Home', icon: <HomeIcon />, roles: ['user', 'creator', 'developer'] },
    { screen: 'my-bio', label: 'My Bio', icon: <UserIcon />, roles: ['user', 'creator', 'developer'] },
    { screen: 'my-funs', label: 'My Funs', icon: <FunsIcon />, roles: ['user', 'creator', 'developer'] },
    { screen: 'creator-chat', label: 'Creator Chat', icon: <ChatIcon />, roles: ['user', 'creator', 'developer'] },
  ];

  const rechargeItems: NavConfig[] = [
    { screen: 'store', label: 'Store', icon: <StoreIcon />, roles: ['user', 'creator', 'developer'], visibility: 'store' },
    { screen: 'pix-payment', label: 'Recarga via PIX', icon: <PixIcon />, roles: ['user', 'creator', 'developer'] },
    { screen: 'livepix-payment', label: 'Live PIX', icon: <LivePixIcon />, roles: ['user', 'creator', 'developer'] },
    { screen: 'history', label: 'History', icon: <HistoryIcon />, roles: ['user', 'creator', 'developer'] },
  ];

  const configItems: NavConfig[] = [
    { screen: 'account', label: 'My Account', icon: <AccountIcon />, roles: ['user', 'creator', 'developer'] },
    { screen: 'manage-subscription', label: 'My Subscription', icon: <StarIcon />, roles: ['user', 'creator'], visibility: 'manageSubscription' },
  ];

  const creatorItems: NavConfig[] = [
    { screen: 'create-content', label: 'Create Content', icon: <PlusSquareIcon />, roles: ['user', 'creator', 'developer'], visibility: 'createContent' },
    { screen: 'my-creations', label: 'My Creations', icon: <CreationsIcon />, roles: ['user', 'creator', 'developer'], visibility: 'myCreations' },
    { screen: 'creator-payouts', label: 'Creator Payouts', icon: <PayoutsIcon />, roles: ['user', 'creator', 'developer'], visibility: 'creatorPayouts' },
  ];

  const devItems: NavConfig[] = [
    { screen: 'developer-panel', label: 'Developer Panel', icon: <DevIcon />, roles: ['developer'] },
    { screen: 'user-plan-management', label: 'User Plans', icon: <UserPlanIcon />, roles: ['developer'] },
    { screen: 'showcase-management', label: 'Showcase Mgmt', icon: <ShowcaseIcon />, roles: ['developer'] },
    { screen: 'ux-kit', label: 'UX Kit', icon: <UXKitIcon />, roles: ['developer'] },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-neutral-800 shadow-xl">
        <div className="flex justify-between items-center p-4 border-b border-neutral-700">
          <h1 className="text-xl font-bold text-white">
            FUN<span className="text-brand-primary">FANS</span>
          </h1>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white">
            <CloseIcon />
          </button>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {/* Share Funators e Funators Chat */}
          <div className="p-4 space-y-2 border-b border-neutral-700">
            <button
              onClick={() => {
                shareVitrine();
                onClose();
              }}
              className="w-full flex items-center p-3 rounded-lg bg-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
            >
              <span className="w-5 h-5 mr-3"><ShareIcon /></span>
              <span className="font-semibold">Share Funators</span>
            </button>
            
            <button
              onClick={() => onNavigate('creator-chat')}
              className="w-full flex items-center p-3 rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple hover:text-white transition-colors"
            >
              <span className="w-5 h-5 mr-3"><ChatIcon /></span>
              <span className="font-semibold">Funators Chat</span>
            </button>
          </div>
          
          <nav className="p-4">
            {navItems
              .filter(item => item.roles.includes(userRole))
              .filter(item => !item.visibility || sidebarVisibility[item.visibility])
              .map(item => (
                <button
                  key={item.screen}
                  onClick={() => onNavigate(item.screen)}
                  className={`w-full flex items-center p-3 rounded-lg mb-2 transition-colors ${
                    currentScreen === item.screen
                      ? 'bg-brand-primary text-white'
                      : 'text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <span className="w-5 h-5 mr-3">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                </button>
              ))}
          </nav>

          {creatorItems.some(i => i.roles.includes(userRole) && (!i.visibility || sidebarVisibility[i.visibility])) && (
            <>
              <div className="px-6 py-2">
                <div className="border-t border-neutral-700"></div>
              </div>
              <div className="px-4">
                <p className="px-2 text-xs font-semibold uppercase text-neutral-500 mb-2">Creator Tools</p>
                {creatorItems
                  .filter(i => i.roles.includes(userRole))
                  .filter(i => !i.visibility || sidebarVisibility[i.visibility])
                  .map(item => (
                    <button
                      key={item.screen}
                      onClick={() => onNavigate(item.screen)}
                      className={`w-full flex items-center p-3 rounded-lg mb-2 transition-colors ${
                        currentScreen === item.screen
                          ? 'bg-brand-primary text-white'
                          : 'text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <span className="w-5 h-5 mr-3">{item.icon}</span>
                      <span className="font-semibold">{item.label}</span>
                    </button>
                  ))}
              </div>
            </>
          )}

          {rechargeItems.some(i => i.roles.includes(userRole) && (!i.visibility || sidebarVisibility[i.visibility])) && (
            <>
              <div className="px-6 py-2">
                <div className="border-t border-neutral-700"></div>
              </div>
              <div className="px-4">
                <p className="px-2 text-xs font-semibold uppercase text-neutral-500 mb-2">Recharge</p>
                {rechargeItems
                  .filter(i => i.roles.includes(userRole))
                  .filter(i => !i.visibility || sidebarVisibility[i.visibility])
                  .map(item => (
                    <button
                      key={item.screen}
                      onClick={() => onNavigate(item.screen)}
                      className={`w-full flex items-center p-3 rounded-lg mb-2 transition-colors ${
                        currentScreen === item.screen
                          ? 'bg-brand-primary text-white'
                          : 'text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <span className="w-5 h-5 mr-3">{item.icon}</span>
                      <span className="font-semibold">{item.label}</span>
                    </button>
                  ))}
              </div>
            </>
          )}

          {configItems.some(i => i.roles.includes(userRole) && (!i.visibility || sidebarVisibility[i.visibility])) && (
            <>
              <div className="px-6 py-2">
                <div className="border-t border-neutral-700"></div>
              </div>
              <div className="px-4">
                <p className="px-2 text-xs font-semibold uppercase text-neutral-500 mb-2">Settings</p>
                {configItems
                  .filter(i => i.roles.includes(userRole))
                  .filter(i => !i.visibility || sidebarVisibility[i.visibility])
                  .map(item => (
                    <button
                      key={item.screen}
                      onClick={() => onNavigate(item.screen)}
                      className={`w-full flex items-center p-3 rounded-lg mb-2 transition-colors ${
                        currentScreen === item.screen
                          ? 'bg-brand-primary text-white'
                          : 'text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <span className="w-5 h-5 mr-3">{item.icon}</span>
                      <span className="font-semibold">{item.label}</span>
                    </button>
                  ))}
              </div>
            </>
          )}

          {devItems.some(i => i.roles.includes(userRole)) && (
            <>
              <div className="px-6 py-2">
                <div className="border-t border-neutral-700"></div>
              </div>
              <div className="px-4">
                <p className="px-2 text-xs font-semibold uppercase text-neutral-500 mb-2">Developer</p>
                {devItems
                  .filter(i => i.roles.includes(userRole))
                  .map(item => (
                    <button
                      key={item.screen}
                      onClick={() => onNavigate(item.screen)}
                      className={`w-full flex items-center p-3 rounded-lg mb-2 transition-colors ${
                        currentScreen === item.screen
                          ? 'bg-brand-primary text-white'
                          : 'text-neutral-300 hover:bg-neutral-700'
                      }`}
                    >
                      <span className="w-5 h-5 mr-3">{item.icon}</span>
                      <span className="font-semibold">{item.label}</span>
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const MobileMenuButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="md:hidden p-2 text-white hover:bg-neutral-700 rounded-lg transition-colors"
    aria-label="Menu"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  </button>
);
