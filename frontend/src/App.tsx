import { useState } from 'react';
import Header from './components/common/Header';
import DialNavigation from './screens/Navigation/DialNavigation';
import HomeScreen from './screens/Home/HomeScreen';
import RecordScreen from './screens/Record/RecordScreen';
import ChatScreen from './screens/Chat/ChatScreen';
import CommunityScreen from './screens/Community/CommunityScreen';
import LoginScreen from './screens/Login/LoginScreen';
import ChildRegistrationScreen from './screens/ChildRegistration/ChildRegistrationScreen';
import { Toaster } from './components/ui/sonner';
import { hasChildRegistered } from './services/api/childService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedBaby, setSelectedBaby] = useState('1');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check if user has completed onboarding when they log in
  const handleLogin = async () => {
    setIsLoggedIn(true);
    setIsCheckingOnboarding(true);
    
    try {
      const hasChild = await hasChildRegistered();
      setHasCompletedOnboarding(hasChild);
    } catch (error) {
      console.error('Error checking child registration:', error);
      // If there's an error, assume onboarding is needed
      setHasCompletedOnboarding(false);
    } finally {
      setIsCheckingOnboarding(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setHasCompletedOnboarding(null);
    setCurrentTab('home');
  };

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setIsDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster position="top-center" />
      </>
    );
  }

  // Show loading state while checking onboarding status
  if (isCheckingOnboarding) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6AA6FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show child registration screen if logged in but hasn't completed onboarding
  if (hasCompletedOnboarding === false) {
    return (
      <>
        <ChildRegistrationScreen onComplete={handleOnboardingComplete} />
        <Toaster position="top-center" />
      </>
    );
  }

  const handleAddRecord = () => {
    setCurrentTab('record');
  };

  const handleOpenChat = () => {
    setCurrentTab('chat');
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const renderScreen = () => {
    switch (currentTab) {
      case 'home':
        return <HomeScreen onAddRecord={handleAddRecord} onOpenChat={handleOpenChat} />;
      case 'record':
        return <RecordScreen isDarkMode={isDarkMode} />;
      case 'chat':
        return <ChatScreen />;
      case 'community':
        return <CommunityScreen />;
      default:
        return <HomeScreen onAddRecord={handleAddRecord} onOpenChat={handleOpenChat} />;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <Header
        selectedBaby={selectedBaby}
        onBabyChange={setSelectedBaby}
        onSettingsClick={handleSettingsClick}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
      />

      {/* Main Content Area - Add bottom padding to prevent dial overlap */}
      <main className="flex-1 pt-16 pb-24 overflow-hidden bg-background">
        {renderScreen()}
      </main>

      {/* Dial Navigation */}
      <DialNavigation currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Toast Notifications */}
      <Toaster position="top-center" />
    </div>
  );
}
