/**
 * App.tsx - 메인 앱 컴포넌트
 * 인증 상태에 따른 화면 라우팅
 */
import { useState, useEffect, useCallback } from 'react';
import Header from './components/common/Header';
import DialNavigation from './screens/Navigation/DialNavigation';
import HomeScreen from './screens/Home/HomeScreen';
import RecordScreen from './screens/Record/RecordScreen';
import ChatScreen from './screens/Chat/ChatScreen';
import CommunityScreen from './screens/Community/CommunityScreen';
import LoginScreen from './screens/Login/LoginScreen';
import ChildRegistrationScreen from './screens/ChildRegistration/ChildRegistrationScreen';
import { Toaster } from './components/ui/sonner';
import { useAuthContext } from './contexts/AuthContext';
import { hasChildRegistered, getChildren } from './services/api/childService';
import useAuthStore from './store/useAuthStore';

const ONBOARDING_STORAGE_KEY = 'todoc_has_onboarded';

export default function App() {
  const { isLoading: authLoading, logout } = useAuthContext();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored === null) return null;
    return stored === 'true';
  });
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false);
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedBaby, setSelectedBaby] = useState('1');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const persistOnboardingState = useCallback((value: boolean | null) => {
    setHasCompletedOnboarding(value);
    if (typeof window === 'undefined') return;
    if (value) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  }, []);

  // 로그인 후 온보딩(아이 등록) 상태 확인
  useEffect(() => {
    const checkOnboarding = async () => {
      if (isAuthenticated && hasCompletedOnboarding === null) {
        setIsCheckingOnboarding(true);
        try {
          const hasChild = await hasChildRegistered();
          persistOnboardingState(hasChild);

          // 아이가 있으면 첫 번째 아이 선택
          if (hasChild) {
            const children = await getChildren();
            if (children.length > 0) {
              setSelectedBaby(children[0].id.toString());
            }
          }
        } catch (error) {
          console.error('Error checking onboarding:', error);
          persistOnboardingState(false);
        } finally {
          setIsCheckingOnboarding(false);
        }
      } else if (!isAuthenticated) {
        // 로그아웃 시 온보딩 상태 초기화
        persistOnboardingState(null);
      }
    };

    checkOnboarding();
  }, [isAuthenticated, hasCompletedOnboarding, persistOnboardingState]);

  // 로그아웃 시 상태 초기화
  const handleLogout = () => {
    logout();
    persistOnboardingState(null);
    setCurrentTab('home');
    setSelectedBaby('1');
  };

  // 온보딩 완료 처리
  const handleOnboardingComplete = async () => {
    persistOnboardingState(true);
    // 새로 등록한 아이 정보 가져오기
    try {
      const children = await getChildren();
      if (children.length > 0) {
        setSelectedBaby(children[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setIsDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6AA6FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // 로그인 안됨 → 로그인 화면
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <Toaster position="top-center" />
      </>
    );
  }

  // 온보딩 확인 중
  if (isCheckingOnboarding || hasCompletedOnboarding === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6AA6FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // 로그인됨 + 온보딩 미완료 → 아이 등록 화면
  if (!hasCompletedOnboarding) {
    return (
      <>
        <ChildRegistrationScreen onComplete={handleOnboardingComplete} />
        <Toaster position="top-center" />
      </>
    );
  }

  // 로그인됨 + 온보딩 완료 → 메인 앱
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
        return <HomeScreen onAddRecord={handleAddRecord} />;
      case 'record':
        return <RecordScreen isDarkMode={isDarkMode} />;
      case 'chat':
        return <ChatScreen />;
      case 'community':
        return <CommunityScreen />;
      default:
        return <HomeScreen onAddRecord={handleAddRecord} />;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <Header
        onSettingsClick={handleSettingsClick}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
      />

      {/* Main Content Area */}
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
