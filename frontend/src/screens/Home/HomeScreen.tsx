import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Camera, Lightbulb, Moon, Utensils, Heart, TrendingUp, Droplets } from 'lucide-react';
import { format } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { getChildren, uploadChildPhoto } from '@/services/api/childService';
import { getRandomTip } from '@/services/api/dailyTipService';
import { useRecords } from '@/api/hooks/useRecords';
import { useSelectedKid } from '@/api/hooks/useKids';
import type { RecordResponse, RecordType } from '@/api/types';

interface HomeScreenProps {
  onAddRecord: () => void;
}

export default function HomeScreen({ onAddRecord }: HomeScreenProps) {
  const { t, language } = useLanguage();
  const { selectedKidId, selectKid } = useSelectedKid();
  const { records, fetchRecords } = useRecords(selectedKidId);
  const [babyId, setBabyId] = useState<number | null>(null);
  const [babyName, setBabyName] = useState('');
  const [babyPhoto, setBabyPhoto] = useState('');
  const [babyGender, setBabyGender] = useState<'male' | 'female' | null>(null);
  const [babyBirthDate, setBabyBirthDate] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [isTipLoading, setIsTipLoading] = useState(true);
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
          setBabyId(child.id);
          setBabyName(child.name);
          setBabyGender(child.gender as 'male' | 'female');
          setBabyBirthDate(child.birth_date);
          if (child.image_url) {
            // API URL과 이미지 경로 조합
            const apiUrl = (import.meta as any).env?.VITE_API_URL || '';
            setBabyPhoto(apiUrl + child.image_url);
          }
          // 선택된 아이 ID 설정
          if (!selectedKidId) {
            selectKid(child.id);
          }
        }
      } catch (error) {
        console.error('Error fetching child info:', error);
      }
    };
    fetchChildInfo();
  }, [selectedKidId, selectKid]);

  // 최근 기록 가져오기
  useEffect(() => {
    if (selectedKidId) {
      fetchRecords({ limit: 5 }).catch(console.error);
    }
  }, [selectedKidId, fetchRecords]);

  // 데일리 팁 가져오기 (홈화면 접속 시마다)
  useEffect(() => {
    const fetchDailyTip = async () => {
      setIsTipLoading(true);
      try {
        const tipLanguage = language === 'ko' ? 'kor' : 'eng';
        const tip = await getRandomTip(tipLanguage);
        setDailyTip(tip?.content || null);
      } catch (error) {
        console.error('Error fetching daily tip:', error);
        setDailyTip(null);
      } finally {
        setIsTipLoading(false);
      }
    };
    fetchDailyTip();
  }, [language]);

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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && babyId) {
      setIsUploading(true);
      try {
        // 먼저 미리보기 표시
        const reader = new FileReader();
        reader.onloadend = () => {
          setBabyPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);

        // 서버에 업로드
        const updatedKid = await uploadChildPhoto(babyId, file);
        if (updatedKid.image_url) {
          const apiUrl = (import.meta as any).env?.VITE_API_URL || '';
          setBabyPhoto(apiUrl + updatedKid.image_url);
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const babyInfo = {
    name: babyName || (language === 'ko' ? '아기' : 'Baby'),
    gender: babyGender === 'male' ? t('home.boy') : babyGender === 'female' ? t('home.girl') : '',
    age: calculateAge(),
    photo: babyPhoto,
  };

  // API 기록을 표시용 포맷으로 변환
  const getRecordIcon = (type: RecordType) => {
    switch (type) {
      case 'sleep': return Moon;
      case 'meal': return Utensils;
      case 'health': return Heart;
      case 'growth': return TrendingUp;
      case 'stool': return Droplets;
      default: return Heart;
    }
  };

  const getRecordColor = (type: RecordType) => {
    switch (type) {
      case 'sleep': return '#9ADBC6';
      case 'meal': return '#FFC98B';
      case 'health': return '#ef4444';
      case 'growth': return '#6AA6FF';
      case 'stool': return '#38bdf8';
      default: return '#6b7280';
    }
  };

  const getRecordLabel = (record: RecordResponse) => {
    const typeLabels: Record<RecordType, string> = {
      sleep: language === 'ko' ? '수면' : 'Sleep',
      meal: language === 'ko' ? '식사' : 'Meal',
      health: language === 'ko' ? '건강' : 'Health',
      growth: language === 'ko' ? '성장' : 'Growth',
      stool: language === 'ko' ? '기저귀' : 'Diaper',
      misc: language === 'ko' ? '기타' : 'Other',
    };
    return record.title || typeLabels[record.record_type] || '';
  };

  const recentRecords = records.slice(0, 2).map((record: RecordResponse) => ({
    type: record.record_type,
    label: getRecordLabel(record),
    time: format(new Date(record.created_at), 'HH:mm'),
    icon: getRecordIcon(record.record_type),
    color: getRecordColor(record.record_type),
  }));

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
                    style={{ display: 'none', visibility: 'hidden', position: 'absolute', width: 0, height: 0 }}
                  />
                  <div
                    onClick={handlePhotoClick}
                    className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#6AA6FF]/20 shadow-md cursor-pointer hover:border-[#6AA6FF]/50 transition-colors flex items-center justify-center bg-gray-100 dark:bg-gray-700 relative"
                  >
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
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
                    {recentRecords.map((record, idx) => {
                      const Icon = record.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${record.color}20` }}
                          >
                            <Icon className="h-3.5 w-3.5" style={{ color: record.color }} />
                          </div>
                          <span className="text-[#F3F3F3] dark:text-[#F3F3F3] truncate">
                            {record.label}
                          </span>
                          <span className="text-[#A5A5A5] dark:text-[#A5A5A5] ml-auto flex-shrink-0">{record.time}</span>
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
            <CardHeader className="bg-gradient-to-r from-[#9ADBC6]/10 to-[#FFC98B]/10 dark:from-[#9ADBC6]/20 dark:to-[#FFC98B]/20 border-b border-[#9ADBC6]/20 dark:border-[#9ADBC6]/30 px-4 py-4">
              <CardTitle className="text-[#9ADBC6] flex items-center gap-2 text-base">
                <Lightbulb className="h-5 w-5" />
                <span>{language === 'ko' ? 'Todoc의 조언' : "Todoc's Advice"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isTipLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-5 h-5 border-2 border-[#9ADBC6] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : dailyTip ? (
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {dailyTip}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  {language === 'ko' ? '오늘의 팁을 불러올 수 없습니다.' : 'Unable to load today\'s tip.'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
