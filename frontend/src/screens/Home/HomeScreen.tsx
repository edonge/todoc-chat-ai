import { useState, useMemo } from 'react';
import { Plus, Bot, TrendingUp, Heart, Moon, Utensils, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface HomeScreenProps {
  onAddRecord: () => void;
  onOpenChat: () => void;
}

export default function HomeScreen({ onAddRecord, onOpenChat }: HomeScreenProps) {
  const { t, language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(0);
  const [babyName, setBabyName] = useState('Hajun');
  const [isEditingName, setIsEditingName] = useState(false);

  const adjectives = ['Wonderful', 'Cute', 'Lovely', 'Pretty', 'Smart', 'Healthy', 'Brave', 'Bright', 'Angelic', 'Precious'];

  const randomAdjective = useMemo(() => {
    return adjectives[Math.floor(Math.random() * adjectives.length)];
  }, []);

  const babyInfo = {
    name: babyName,
    gender: t('home.boy'),
    age: `8 ${t('home.months')}`,
    photo: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop',
  };

  const recentRecords = [
    { type: 'sleep', time: '14:30', duration: '2 hours', icon: Moon, color: '#9ADBC6' },
    { type: 'meal', time: '12:00', amount: '150ml', icon: Utensils, color: '#FFC98B' },
    { type: 'health', time: '09:00', temp: '36.5°C', icon: Heart, color: '#6AA6FF' },
  ];

  const aiInsights = [
    {
      type: t('home.aiInsight1Type'),
      message: t('home.aiInsight1Message'),
      time: t('home.aiInsight1Time'),
    },
    {
      type: t('home.aiInsight2Type'),
      message: t('home.aiInsight2Message'),
      time: t('home.aiInsight2Time'),
    },
  ];

  return (
    <div className="h-full w-full overflow-auto p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-[#6AA6FF] dark:text-[#9ADBC6] mb-2">{t('home.title')}</h2>
          <p className="text-sm text-[#CFCFCF] dark:text-[#CFCFCF]">
            {language === 'ko'
              ? format(new Date(), 'yyyy년 M월 d일 EEEE', { locale: ko })
              : format(new Date(), 'EEEE, MMMM d, yyyy', { locale: enUS })}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-card shadow-xl border-2 border-[#6AA6FF]/20 dark:border-[#9ADBC6]/30 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <input
                      type="text"
                      value={babyName}
                      onChange={(e) => setBabyName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                      className="text-lg font-bold text-[#6AA6FF] dark:text-[#9ADBC6] border-b-2 border-[#6AA6FF] dark:border-[#9ADBC6] outline-none px-1 bg-transparent"
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span className="text-[#CFCFCF] dark:text-[#CFCFCF]">{randomAdjective}</span>
                      <span className="text-[#6AA6FF] dark:text-[#9ADBC6]">{babyInfo.name}</span>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-[#A5A5A5] dark:text-[#A5A5A5] hover:text-[#6AA6FF] dark:hover:text-[#9ADBC6] transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </h3>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={onAddRecord}
                  className="bg-[#6AA6FF] hover:bg-[#5a96ef] text-white rounded-full h-9 w-9 p-0 shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#6AA6FF]/20 shadow-md">
                    <img
                      src={babyInfo.photo}
                      alt={babyInfo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <Badge className="bg-[#6AA6FF]/10 text-[#6AA6FF] hover:bg-[#6AA6FF]/20">
                      {babyInfo.gender}
                    </Badge>
                    <Badge className="bg-[#FFC98B]/10 text-[#FFC98B] hover:bg-[#FFC98B]/20">
                      {babyInfo.age}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {recentRecords.slice(0, 2).map((record, idx) => {
                      const Icon = record.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${record.color}20` }}
                          >
                            <Icon className="h-3.5 w-3.5" style={{ color: record.color }} />
                          </div>
                          <span className="text-[#F3F3F3] dark:text-[#F3F3F3]">
                            {record.type === 'sleep' && `${t('home.nap')} ${record.duration}`}
                            {record.type === 'meal' && `${t('home.feed')} ${record.amount}`}
                            {record.type === 'health' && `${t('home.temp')} ${record.temp}`}
                          </span>
                          <span className="text-[#A5A5A5] dark:text-[#A5A5A5] ml-auto">{record.time}</span>
                        </div>
                      );
                    })}
                    {recentRecords.length === 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-300 text-center py-2">
                        {t('home.firstRecord')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-xl border-2 border-[#9ADBC6]/20 dark:border-[#9ADBC6]/30 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#9ADBC6]/10 to-[#FFC98B]/10 dark:from-[#9ADBC6]/20 dark:to-[#FFC98B]/20 border-b border-[#9ADBC6]/20 dark:border-[#9ADBC6]/30">
              <CardTitle className="flex items-center justify-between text-[#9ADBC6]">
                <span>🤖 {t('home.aiInsights')}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onOpenChat}
                  className="text-[#9ADBC6] hover:bg-[#9ADBC6]/10 dark:hover:bg-[#9ADBC6]/20 h-8"
                >
                  <Bot className="h-4 w-4 mr-1" />
                  <span className="text-xs">{t('home.chat')}</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {aiInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-gradient-to-r from-[#9ADBC6]/5 to-[#FFC98B]/5 dark:from-[#9ADBC6]/10 dark:to-[#FFC98B]/10 border border-[#9ADBC6]/20 dark:border-[#9ADBC6]/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        insight.type === 'Doctor AI'
                          ? 'bg-[#6AA6FF]/10 text-[#6AA6FF] dark:bg-[#6AA6FF]/20'
                          : 'bg-[#FFC98B]/20 text-[#FFC98B] dark:bg-[#FFC98B]/30'
                      }`}
                    >
                      {insight.type}
                    </Badge>
                    <span className="text-xs text-[#A5A5A5] dark:text-[#A5A5A5]">{insight.time}</span>
                  </div>
                  <p className="text-sm text-[#F3F3F3] dark:text-[#F3F3F3]">{insight.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card border-[#6AA6FF]/30">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-[#6AA6FF]" />
              <p className="text-xs text-[#CFCFCF] dark:text-[#CFCFCF]">{t('home.growth')}</p>
              <p className="text-[#6AA6FF] dark:text-[#8BC5FF]">{t('home.normal')}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-[#FFC98B]/30">
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 mx-auto mb-2 text-[#FFC98B]" />
              <p className="text-xs text-[#CFCFCF] dark:text-[#CFCFCF]">{t('home.health')}</p>
              <p className="text-[#FFC98B] dark:text-[#FFD8A8]">{t('home.good')}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-[#9ADBC6]/30">
            <CardContent className="p-4 text-center">
              <Moon className="h-6 w-6 mx-auto mb-2 text-[#9ADBC6]" />
              <p className="text-xs text-[#CFCFCF] dark:text-[#CFCFCF]">{t('home.sleep')}</p>
              <p className="text-[#9ADBC6] dark:text-[#B5E8D8]">{t('home.good')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
