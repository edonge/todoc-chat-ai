import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Bot, TrendingUp, Heart, Moon, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { getChildren } from '@/services/api/childService';

interface HomeScreenProps {
  onAddRecord: () => void;
  onOpenChat: () => void;
}

export default function HomeScreen({ onAddRecord, onOpenChat }: HomeScreenProps) {
  const { t, language } = useLanguage();
  const [babyName, setBabyName] = useState('');
  const [babyPhoto, setBabyPhoto] = useState('');
  const [babyGender, setBabyGender] = useState<'male' | 'female' | null>(null);
  const [babyBirthDate, setBabyBirthDate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjectives = ['Wonderful', 'Cute', 'Lovely', 'Pretty', 'Smart', 'Healthy', 'Brave', 'Bright', 'Angelic', 'Precious'];

  const randomAdjective = useMemo(() => {
    return adjectives[Math.floor(Math.random() * adjectives.length)];
  }, []);

  // API에서 아이 정보 가져오기
  useEffect(() => {
    const fetchChildInfo = async () => {
      try {
        const children = await getChildren();
        if (children && children.length > 0) {
          const child = children[0];
          setBabyName(child.name);
          setBabyGender(child.gender as 'male' | 'female');
          setBabyBirthDate(child.birth_date);
        }
      } catch (error) {
        console.error('Error fetching child info:', error);
      }
    };
    fetchChildInfo();
  }, []);

  // 나이 계산
  const calculateAge = () => {
    if (!babyBirthDate) return '';
    const birth = new Date(babyBirthDate);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 1) {
      const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
      return `${days} ${language === 'ko' ? '일' : 'days'}`;
    }
    if (months < 12) {
      return `${months} ${language === 'ko' ? '개월' : 'months'}`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} ${language === 'ko' ? '세' : 'years'}`;
    }
    return `${years}${language === 'ko' ? '세 ' : 'y '}${remainingMonths}${language === 'ko' ? '개월' : 'm'}`;
  };

  // 사진 업로드 핸들러
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBabyPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const babyInfo = {
    name: babyName || (language === 'ko' ? '아기' : 'Baby'),
    gender: babyGender === 'male' ? t('home.boy') : babyGender === 'female' ? t('home.girl') : '',
    age: calculateAge(),
    photo: babyPhoto,
  };

  // TODO: API에서 최근 기록 가져오기
  const recentRecords: { type: string; time: string; duration?: string; amount?: string; temp?: string; icon: any; color: string }[] = [];

  // TODO: API에서 AI 인사이트 가져오기
  const aiInsights: { type: string; message: string; time: string }[] = [];

  // 상태 카드용 데이터 (기록 없으면 '-')
  const growthStatus = '-';
  const healthStatus = '-';
  const sleepStatus = '-';

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
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="text-[#CFCFCF] dark:text-[#CFCFCF]">{randomAdjective}</span>
                    <span className="text-[#6AA6FF] dark:text-[#9ADBC6]">{babyInfo.name}</span>
                  </h3>
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
                  {/* 사진 영역 - 클릭하면 업로드 */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={handlePhotoClick}
                    className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#6AA6FF]/20 shadow-md cursor-pointer hover:border-[#6AA6FF]/50 transition-colors flex items-center justify-center bg-gray-100 dark:bg-gray-700"
                  >
                    {babyPhoto ? (
                      <img
                        src={babyPhoto}
                        alt={babyInfo.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <Camera className="h-6 w-6 mx-auto text-gray-400 dark:text-gray-500 mb-1" />
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          {language === 'ko' ? '사진 추가' : 'Add photo'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    {babyInfo.gender && (
                      <Badge className="bg-[#6AA6FF]/10 text-[#6AA6FF] hover:bg-[#6AA6FF]/20">
                        {babyInfo.gender}
                      </Badge>
                    )}
                    {babyInfo.age && (
                      <Badge className="bg-[#FFC98B]/10 text-[#FFC98B] hover:bg-[#FFC98B]/20">
                        {babyInfo.age}
                      </Badge>
                    )}
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
              {aiInsights.length > 0 ? (
                aiInsights.map((insight, idx) => (
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
                ))
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                  {language === 'ko' ? 'AI 인사이트가 없습니다' : 'No AI insights yet'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card border-[#6AA6FF]/30">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-[#6AA6FF]" />
              <p className="text-xs text-[#CFCFCF] dark:text-[#CFCFCF]">{t('home.growth')}</p>
              <p className="text-[#6AA6FF] dark:text-[#8BC5FF]">{growthStatus}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-[#FFC98B]/30">
            <CardContent className="p-4 text-center">
              <Heart className="h-6 w-6 mx-auto mb-2 text-[#FFC98B]" />
              <p className="text-xs text-[#CFCFCF] dark:text-[#CFCFCF]">{t('home.health')}</p>
              <p className="text-[#FFC98B] dark:text-[#FFD8A8]">{healthStatus}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-[#9ADBC6]/30">
            <CardContent className="p-4 text-center">
              <Moon className="h-6 w-6 mx-auto mb-2 text-[#9ADBC6]" />
              <p className="text-xs text-[#CFCFCF] dark:text-[#CFCFCF]">{t('home.sleep')}</p>
              <p className="text-[#9ADBC6] dark:text-[#B5E8D8]">{sleepStatus}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
