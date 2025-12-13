import { Settings, ChevronDown, Moon, Sun, Globe, HelpCircle, Sliders, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  selectedBaby: string;
  onBabyChange: (value: string) => void;
  onSettingsClick: () => void;
  onLogout?: () => void;
  isDarkMode: boolean;
  onDarkModeToggle: (enabled: boolean) => void;
}

export default function Header({ selectedBaby, onBabyChange, onSettingsClick, onLogout, isDarkMode, onDarkModeToggle }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  const handleDarkModeToggle = () => {
    const newMode = !isDarkMode;
    onDarkModeToggle(newMode);
    toast.info(newMode ? 'Switched to Dark Mode' : 'Switched to Light Mode');
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'ko' ? 'en' : 'ko';
    setLanguage(newLang);
    toast.info(newLang === 'ko' ? '한국어로 전환되었습니다' : 'Switched to English');
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
    <header className="fixed top-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-between bg-background border-b border-[#6AA6FF]/20 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6AA6FF] to-[#9ADBC6] flex items-center justify-center">
          <span className="text-white">📖</span>
        </div>
        <h1 className="text-[#6AA6FF] dark:text-[#9ADBC6]">ToDoc</h1>
      </div>

      <Select value={selectedBaby} onValueChange={onBabyChange}>
        <SelectTrigger className="w-[140px] border-[#6AA6FF]/30 dark:border-[#9ADBC6]/30 bg-card text-foreground">
          <SelectValue placeholder={t('header.selectBaby')} />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="1">{t('header.firstChild')}</SelectItem>
          <SelectItem value="2">{t('header.secondChild')}</SelectItem>
          <SelectItem value="3">{t('header.thirdChild')}</SelectItem>
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
            {t('header.settings')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            {t('header.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}