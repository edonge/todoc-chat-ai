import { Settings, ChevronDown, Moon, Sun, Globe, HelpCircle, Sliders, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';

interface HeaderProps {
  selectedBaby: string;
  onBabyChange: (value: string) => void;
  onSettingsClick: () => void;
  onLogout?: () => void;
  isDarkMode: boolean;
  onDarkModeToggle: (enabled: boolean) => void;
}

export default function Header({ selectedBaby, onBabyChange, onSettingsClick, onLogout, isDarkMode, onDarkModeToggle }: HeaderProps) {
  const [language, setLanguage] = useState('ko');

  const handleDarkModeToggle = () => {
    const newMode = !isDarkMode;
    onDarkModeToggle(newMode);
    toast.info(newMode ? 'Switched to Dark Mode' : 'Switched to Light Mode');
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'ko' ? 'en' : 'ko';
    setLanguage(newLang);
    toast.info(newLang === 'ko' ? 'Switched to Korean' : 'Switched to English');
  };

  const handleCustomerService = () => {
    toast.info('Redirecting to Customer Service');
  };

  const handleSettings = () => {
    toast.info('Redirecting to Settings');
    onSettingsClick();
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      toast.success('You have been logged out');
    }
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-between bg-[#FFFDF9] dark:bg-gray-900 border-b border-[#6AA6FF]/20 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6AA6FF] to-[#9ADBC6] flex items-center justify-center">
          <span className="text-white">📖</span>
        </div>
        <h1 className="text-[#6AA6FF] dark:text-[#9ADBC6]">ToDoc 2.0</h1>
      </div>

      <Select value={selectedBaby} onValueChange={onBabyChange}>
        <SelectTrigger className="w-[140px] border-[#6AA6FF]/30 dark:border-[#9ADBC6]/30 bg-white dark:bg-gray-800 dark:text-white">
          <SelectValue placeholder="Select Baby" />
        </SelectTrigger>
        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
          <SelectItem value="1">First Child</SelectItem>
          <SelectItem value="2">Second Child</SelectItem>
          <SelectItem value="3">Third Child</SelectItem>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#6AA6FF] dark:text-[#9ADBC6] hover:bg-[#6AA6FF]/10 dark:hover:bg-[#9ADBC6]/20"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 dark:bg-gray-800 dark:border-gray-700">
          <DropdownMenuItem onClick={handleDarkModeToggle}>
            {isDarkMode ? (
              <Sun className="h-4 w-4 mr-2" />
            ) : (
              <Moon className="h-4 w-4 mr-2" />
            )}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLanguageToggle}>
            <Globe className="h-4 w-4 mr-2" />
            {language === 'ko' ? 'English' : 'Korean'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCustomerService}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Support
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSettings}>
            <Sliders className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}