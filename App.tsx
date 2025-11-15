import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CreditsProvider } from './context/CreditsContext';
import { Screen } from './types';
import Home from './screens/Home';
import Store from './screens/Store';
import ManageSubscription from './screens/ManageSubscription';
import History from './screens/History';
import RewardsAd from './screens/RewardsAd';
import CreateContent from './screens/CreateContent';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CreatorPayouts from './screens/CreatorPayouts';
import DeveloperPanel from './screens/DeveloperPanel';
import TimeoutScreen from './components/TimeoutScreen';
import MyCreations from './screens/MyCreations';
import Login from './screens/Login';
import Account from './screens/Account';
import UXKit from './screens/UXKit';
import DesignStudio from './screens/DesignStudio';
import PixPayment from './screens/PixPayment';
import LivePixPayment from './screens/LivePixPayment';
import UserPlanManagement from './screens/UserPlanManagement';
import ShowcaseManagement from './screens/ShowcaseManagement';
import OutfitGenerator from './screens/OutfitGenerator';
import ThemeGenerator from './screens/ThemeGenerator';
import VitrineView from './screens/VitrineView';
import MyBio from './screens/MyBio';
import MyFuns from './screens/MyFuns';
import CreatorChat from './screens/CreatorChat';

import { useCredits } from './hooks/useCredits';

const MainLayout: React.FC = () => {
  const { currentScreen, setCurrentScreen, currentUser, isTimedOut, timeoutInfo, setViewCreatorBySlug } = useCredits();

  // Verificar se há parâmetros de URL para vitrine ou chat
  useEffect(() => {
    const path = window.location.pathname;
    const vitrineMatch = path.match(/^\/vitrine\/([^\/]+)(?:\/(.+))?$/);
    const chatMatch = path.match(/^\/chat\/([^\/]+)$/);
    const chatGeneralMatch = path === '/chat';
    
    if (vitrineMatch) {
      const [, slug, contentId] = vitrineMatch;
      setViewCreatorBySlug(slug);
      // O contentId será tratado no componente Home
    } else if (chatMatch) {
      const [, slug] = chatMatch;
      setViewCreatorBySlug(slug);
      setCurrentScreen('creator-chat');
    } else if (chatGeneralMatch) {
      setCurrentScreen('creator-chat');
    }
  }, [setViewCreatorBySlug, setCurrentScreen]);

  // Allow public access to certain screens (chat, vitrine) even without login
  const isPublicScreen = currentScreen === 'creator-chat' || currentScreen === 'view-creator';
  
  if (!currentUser && !isPublicScreen) return null;

  if (currentUser && isTimedOut(currentUser.id)) {
    return <TimeoutScreen message={timeoutInfo(currentUser.id)!.message} endTime={timeoutInfo(currentUser.id)!.endTime} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
      case 'view-creator':
        return <Home navigate={setCurrentScreen} />;
      case 'store':
        return <Store navigate={setCurrentScreen} />;
      case 'manage-subscription':
        return <ManageSubscription navigate={setCurrentScreen} />;
      case 'history':
        return <History />;
      case 'rewards':
        return <RewardsAd navigate={setCurrentScreen} />;
      case 'create-content':
        return <CreateContent navigate={setCurrentScreen} />;
      case 'my-creations':
        return <MyCreations />;
      case 'creator-payouts':
        return <CreatorPayouts />;
      case 'developer-panel':
        return <DeveloperPanel />;
      case 'user-plan-management':
        return <UserPlanManagement />;
      case 'showcase-management':
        return <ShowcaseManagement />;
      case 'outfit-generator':
        return <OutfitGenerator />;
      case 'theme-generator':
        return <ThemeGenerator />;
      case 'my-bio':
        return <MyBio />;
      case 'my-funs':
        return <MyFuns />;
      case 'creator-chat':
        return <CreatorChat />;
      case 'account':
        return <Account />;
       case 'ux-kit':
        return <UXKit />;
      case 'design-studio':
        return <DesignStudio />;
      case 'pix-payment':
        return <PixPayment />;
      case 'livepix-payment':
        return <LivePixPayment />;
      default:
        return <Home navigate={setCurrentScreen} />;
    }
  };

  // Public screens don't show sidebar
  const showSidebar = !isPublicScreen || currentUser;

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 font-sans overflow-hidden">
      {showSidebar && <Sidebar />}
      <main className="flex-1 flex flex-col overflow-hidden w-full md:w-auto">
        {currentUser && <Navbar navigate={setCurrentScreen} />}
        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          {renderScreen()}
        </div>
      </main>
      
    </div>
  );
}

const AppContent: React.FC = () => {
  const { isLoggedIn, viewingCreatorId, theme, setViewCreatorBySlug, setCurrentScreen } = useCredits();

  // Check if current URL is a public route
  const isPublicRoute = () => {
    const path = window.location.pathname;
    return path.match(/^\/vitrine\/([^\/]+)(?:\/(.+))?$/) || path.match(/^\/chat\/([^\/]+)$/) || path === '/chat';
  };

  // Check URL for public routes (chat/vitrine) before checking login
  useEffect(() => {
    const path = window.location.pathname;
    
    // If user is not logged in and not on a public route, don't process the URL
    if (!isLoggedIn && !isPublicRoute()) {
      return;
    }
    
    const vitrineMatch = path.match(/^\/vitrine\/([^\/]+)(?:\/(.+))?$/);
    const chatMatch = path.match(/^\/chat\/([^\/]+)$/);
    const chatGeneralMatch = path === '/chat';
    
    if (vitrineMatch) {
      const [, slug] = vitrineMatch;
      setViewCreatorBySlug(slug);
    } else if (chatMatch) {
      const [, slug] = chatMatch;
      setViewCreatorBySlug(slug);
      setCurrentScreen('creator-chat');
    } else if (chatGeneralMatch) {
      setCurrentScreen('creator-chat');
    }
  }, [setViewCreatorBySlug, setCurrentScreen, isLoggedIn]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Allow access to public routes OR logged in users OR when viewing a creator
  if (isLoggedIn || (viewingCreatorId && isPublicRoute())) {
    return <MainLayout />;
  }

  return <Login />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CreditsProvider>
        <AppContent />
      </CreditsProvider>
    </AuthProvider>
  );
};

export default App;