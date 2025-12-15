
import { useState, useEffect } from 'react';
import {
  Bot,
  TrendingUp,
  Heart,
  Moon,
  Utensils,
  Sparkles,
  ArrowLeft,
  Calendar as CalendarIcon,
  Droplets,
  Pencil,
  Loader2,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { toast } from 'sonner';
import { cn } from '@/components/ui/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRecords } from '@/api/hooks/useRecords';
import { useKids, useSelectedKid } from '@/api/hooks/useKids';
import type { RecordResponse, MealType, SleepQuality, Symptom, StoolAmount, StoolCondition, StoolColor } from '@/api/types';

// --- MOCK DATA & TYPES ---
interface JournalEntry {
  id: string;
  category: string;
  title: string;
  content: string;
  timestamp: string;
  date: Date;
  details?: any;
}

// Diaper details structure:
// { amount: 'low' | 'medium' | 'high', condition: 'normal' | 'diarrhea' | 'constipation', color: 'yellow' | 'brown' | 'green' | 'other' }

// 더미 데이터 제거됨 - API에서 가져올 예정

const recordCategories = (t: (key: any) => string) => [
  { id: 'growth', label: t('category.growth'), icon: <TrendingUp className="h-5 w-5" />, color: 'var(--primary)' },
  { id: 'sleep', label: t('category.sleep'), icon: <Moon className="h-5 w-5" />, color: 'var(--accent)' },
  { id: 'meal', label: t('category.meal'), icon: <Utensils className="h-5 w-5" />, color: 'var(--secondary)' },
  { id: 'health', label: t('category.health'), icon: <Heart className="h-5 w-5" />, color: 'var(--destructive)' },
  { id: 'diaper', label: t('category.diaper'), icon: <Droplets className="h-5 w-5" />, color: '#38bdf8' },
  { id: 'other', label: t('category.other'), icon: <Pencil className="h-5 w-5" />, color: '#6b7280' },
];

// --- SUB-COMPONENTS ---

const JournalEntryCard = ({ entry }: { entry: JournalEntry }) => {
  const { t, language } = useLanguage();
  const categoryInfo = recordCategories(t).find(cat => cat.id === entry.category);
  if (!categoryInfo) return null;

  // Helper function to translate symptom names
  const translateSymptom = (symptom: string): string => {
    const symptomMap: { [key: string]: string } = {
      'Cough': 'health.cough',
      'Fever': 'health.fever',
      'Runny Nose': 'health.runnyNose',
      'Rash': 'health.rash',
      'Vomiting': 'health.vomiting',
      'Diarrhea': 'health.diarrhea',
    };
    return symptomMap[symptom] ? t(symptomMap[symptom] as any) : symptom;
  };

  return (
    <Card className="w-full overflow-hidden" style={{ borderLeft: `4px solid ${categoryInfo.color}` }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm" style={{ color: categoryInfo.color }}>
            {categoryInfo.icon}
            <span className="font-medium">{categoryInfo.label}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground/80">
            <CalendarIcon className="h-3 w-3" />
            <span>
              {entry.category === 'sleep' && entry.details?.startTime instanceof Date
                ? format(entry.details.startTime, 'PPP', { locale: language === 'ko' ? ko : enUS })
                : entry.timestamp}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-1">{entry.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{entry.content}</p>

        {/* Render details based on category */}
        {entry.details && (
          <div className="bg-muted/30 p-3 rounded-md text-sm space-y-1">
            {entry.category === 'growth' && (
              <div className="grid grid-cols-2 gap-2">
                {entry.details.height && <div>{t('growth.heightLabel')}: <span className="font-medium">{entry.details.height} cm</span></div>}
                {entry.details.weight && <div>{t('growth.weightLabel')}: <span className="font-medium">{entry.details.weight} kg</span></div>}
                {entry.details.headCircumference && <div className="col-span-2">{t('growth.headLabel')}: <span className="font-medium">{entry.details.headCircumference} cm</span></div>}
              </div>
            )}
            {entry.category === 'sleep' && (
              <div className="space-y-2">
                {entry.details.startTime && (
                  <div>{t('sleep.startLabel')}: <span className="font-medium">
                    {entry.details.startTime instanceof Date 
                      ? format(entry.details.startTime, 'yyyy-MM-dd HH:mm')
                      : entry.details.startTime}
                  </span></div>
                )}
                {entry.details.endTime && (
                  <div>{t('sleep.endLabel')}: <span className="font-medium">
                    {entry.details.endTime instanceof Date 
                      ? format(entry.details.endTime, 'yyyy-MM-dd HH:mm')
                      : entry.details.endTime}
                  </span></div>
                )}
                {entry.details.quality && (
                  <div>{t('sleep.qualityLabel')}: <span className="font-medium">
                    {entry.details.quality === 'Good' ? t('sleep.good') :
                     entry.details.quality === 'Fair' ? t('sleep.fair') :
                     entry.details.quality === 'Poor' ? t('sleep.poor') :
                     entry.details.quality}
                  </span></div>
                )}
              </div>
            )}
            {entry.category === 'meal' && (
              <div className="space-y-2">
                {entry.details.foodType && <div>{t('meal.foodLabel')}: <span className="font-medium">{entry.details.foodType}</span></div>}
                {entry.details.amount && <div>{t('meal.amountLabel')}: <span className="font-medium">{entry.details.amount}</span></div>}
                {entry.details.didBurp && <div>{t('meal.burpComplete')}</div>}
              </div>
            )}
            {entry.category === 'health' && (
              <div className="space-y-1">
                {entry.details.temperature && <div>{t('health.tempLabel')}: <span className="font-medium">{entry.details.temperature}°C</span></div>}
                {((entry.details.symptoms && entry.details.symptoms.length > 0) || entry.details.symptom_other) && (
                  <div>
                    {t('health.symptomsLabel')}: <span className="font-medium">
                      {entry.details.symptoms && entry.details.symptoms.length > 0
                        ? entry.details.symptoms
                            .filter((s: string) => s !== 'other')
                            .map((s: string) => translateSymptom(s))
                            .concat(entry.details.symptom_other ? [entry.details.symptom_other] : [])
                            .join(', ')
                        : entry.details.symptom_other || ''}
                    </span>
                  </div>
                )}
              </div>
            )}
            {entry.category === 'diaper' && entry.details && (
              <div className="space-y-1">
                {entry.details.amount && (
                  <div>{t('diaper.amountLabel')}: <span className="font-medium">
                    {t(`diaper.${entry.details.amount}` as any) || entry.details.amount}
                  </span></div>
                )}
                {entry.details.condition && (
                  <div>{t('diaper.conditionLabel')}: <span className="font-medium">
                    {t(`diaper.${entry.details.condition}` as any) || entry.details.condition}
                  </span></div>
                )}
                {entry.details.color && (
                  <div>{t('diaper.colorLabel')}: <span className="font-medium">
                    {t(`diaper.${entry.details.color}` as any) || entry.details.color}
                  </span></div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const JournalForm = ({ categoryId, onSave, onBack, isDarkMode }: { categoryId: string; onSave: (data: any) => void; onBack: () => void; isDarkMode: boolean }) => {
  const { t, language } = useLanguage();
  const categoryInfo = recordCategories(t).find(cat => cat.id === categoryId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Dynamic state for specific categories
  // For sleep category, initialize startTime with current date and time
  // For health category, initialize with empty symptoms array and other symptom tracking
  // For diaper category, initialize with default values
  const [details, setDetails] = useState<any>(
    categoryId === 'sleep' 
      ? { startTime: new Date() } 
      : categoryId === 'health'
      ? { symptoms: [], isOtherChecked: false, otherSymptomText: '' }
      : categoryId === 'diaper'
      ? { amount: 'medium', condition: 'normal', color: 'yellow' }
      : {}
  );

  if (!categoryInfo) return null;

  const handleSave = () => {
    // For sleep category, use details.startTime for validation and date
    const entryDate = categoryId === 'sleep' && details.startTime 
      ? new Date(details.startTime.getFullYear(), details.startTime.getMonth(), details.startTime.getDate())
      : date;
    
    if (!title || !entryDate) {
      toast.error(t('form.fillRequired'));
      return;
    }

    if (categoryId === 'sleep' && !details.startTime) {
      toast.error(t('form.selectStartTime'));
      return;
    }
    
    // Transform health record details before saving
    let transformedDetails = details;
    if (categoryId === 'health') {
      const symptomsArray = details.symptoms || [];
      const finalDetails: any = {
        temperature: details.temperature,
      };
      
      // If "Other" is checked, add "other" to symptoms array
      if (details.isOtherChecked) {
        finalDetails.symptoms = [...symptomsArray, 'other'];
        // If custom symptom text exists, add symptom_other field
        if (details.otherSymptomText && details.otherSymptomText.trim()) {
          finalDetails.symptom_other = details.otherSymptomText.trim();
        }
      } else {
        finalDetails.symptoms = symptomsArray;
      }
      
      transformedDetails = finalDetails;
    }
    
    onSave({
      category: categoryId,
      title,
      content,
      date: entryDate,
      details: transformedDetails,
    });
  };

  const renderSpecificFields = () => {
    switch (categoryId) {
      case 'growth':
        return (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
            <div>
              <label className="text-xs font-medium mb-1.5 block">{t('growth.height')}</label>
              <Input
                type="number"
                placeholder="0.0"
                value={details.height || ''}
                onChange={e => setDetails({ ...details, height: e.target.value })}
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">{t('growth.weight')}</label>
              <Input
                type="number"
                placeholder="0.0"
                value={details.weight || ''}
                onChange={e => setDetails({ ...details, weight: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium mb-1.5 block">{t('growth.headCircumference')}</label>
              <Input
                type="number"
                placeholder="0.0"
                value={details.headCircumference || ''}
                onChange={e => setDetails({ ...details, headCircumference: e.target.value })}
                className="bg-white"
              />
            </div>
          </div>
        );
      case 'sleep':
        // Helper function to merge date and time
        const mergeDateTime = (datePart: Date, timeString: string): Date => {
          const [hours, minutes] = timeString.split(':').map(Number);
          const merged = new Date(datePart);
          merged.setHours(hours || 0, minutes || 0, 0, 0);
          return merged;
        };

        // Helper function to get time string from Date object
        const getTimeString = (dateObj: Date | undefined): string => {
          if (!dateObj || !(dateObj instanceof Date)) return '';
          const hours = dateObj.getHours().toString().padStart(2, '0');
          const minutes = dateObj.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        };

        // Helper function to handle date selection
        const handleStartDateSelect = (selectedDate: Date | undefined) => {
          if (!selectedDate) return;
          const currentStartTime = details.startTime instanceof Date ? details.startTime : new Date();
          const merged = new Date(selectedDate);
          merged.setHours(currentStartTime.getHours(), currentStartTime.getMinutes(), 0, 0);
          setDetails({ ...details, startTime: merged });
        };

        const handleEndDateSelect = (selectedDate: Date | undefined) => {
          if (!selectedDate) return;
          const currentEndTime = details.endTime instanceof Date ? details.endTime : new Date();
          const merged = new Date(selectedDate);
          merged.setHours(currentEndTime.getHours(), currentEndTime.getMinutes(), 0, 0);
          setDetails({ ...details, endTime: merged });
        };

        // Helper function to handle time input change
        const handleStartTimeChange = (timeString: string) => {
          const currentStartTime = details.startTime instanceof Date ? details.startTime : new Date();
          const merged = mergeDateTime(currentStartTime, timeString);
          setDetails({ ...details, startTime: merged });
        };

        const handleEndTimeChange = (timeString: string) => {
          const currentEndTime = details.endTime instanceof Date ? details.endTime : new Date();
          const merged = mergeDateTime(currentEndTime, timeString);
          setDetails({ ...details, endTime: merged });
        };

        const startTimeDate = details.startTime instanceof Date 
          ? new Date(details.startTime.getFullYear(), details.startTime.getMonth(), details.startTime.getDate())
          : new Date();
        const endTimeDate = details.endTime instanceof Date
          ? new Date(details.endTime.getFullYear(), details.endTime.getMonth(), details.endTime.getDate())
          : undefined;

        return (
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            <div>
              <label className="text-xs font-medium mb-1.5 block">{t('sleep.startTime')}</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal bg-white",
                        !details.startTime && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {details.startTime instanceof Date
                        ? format(details.startTime, "PPP", { locale: language === 'ko' ? ko : enUS })
                        : <span>{t('form.pickDate')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startTimeDate}
                      onSelect={handleStartDateSelect}
                      initialFocus
                      locale={language === 'ko' ? ko : enUS}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={getTimeString(details.startTime)}
                  onChange={e => handleStartTimeChange(e.target.value)}
                  className="flex-1 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">{t('sleep.endTime')}</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal bg-white",
                        !details.endTime && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {details.endTime instanceof Date
                        ? format(details.endTime, "PPP", { locale: language === 'ko' ? ko : enUS })
                        : <span>{t('form.pickDate')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endTimeDate}
                      onSelect={handleEndDateSelect}
                      initialFocus
                      locale={language === 'ko' ? ko : enUS}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={getTimeString(details.endTime)}
                  onChange={e => handleEndTimeChange(e.target.value)}
                  className="flex-1 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">{t('sleep.quality')}</label>
              <div className="flex gap-2">
                {['Good', 'Fair', 'Poor'].map(q => (
                  <Button
                    key={q}
                    variant={details.quality === q ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDetails({ ...details, quality: q })}
                    className="flex-1"
                  >
                    {t(`sleep.${q.toLowerCase()}` as any)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'meal':
        return (
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            <div>
              <label className="text-xs font-medium mb-1.5 block">{t('meal.foodType')}</label>
              <Input
                placeholder={t('meal.foodPlaceholder')}
                value={details.foodType || ''}
                onChange={e => setDetails({ ...details, foodType: e.target.value })}
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">{t('meal.amount')}</label>
              <Input
                placeholder={t('meal.amountPlaceholder')}
                value={details.amount || ''}
                onChange={e => setDetails({ ...details, amount: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="didBurp"
                checked={details.didBurp || false}
                onCheckedChange={(checked: boolean | 'indeterminate') => {
                  setDetails({ ...details, didBurp: checked === true });
                }}
              />
              <label
                htmlFor="didBurp"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {t('form.didBurp' as any)}
              </label>
            </div>
          </div>
        );
      case 'health':
        return (
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            <div>
              <label className="text-xs font-medium mb-1.5 block">{t('health.temperature')}</label>
              <Input
                type="number"
                placeholder="36.5"
                value={details.temperature || ''}
                onChange={e => setDetails({ ...details, temperature: e.target.value })}
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">{t('health.symptoms')}</label>
              <div className="grid grid-cols-2 gap-2">
                {['Cough', 'Fever', 'Runny Nose', 'Rash', 'Vomiting', 'Diarrhea'].map(s => {
                  const symptomKey = s.toLowerCase().replace(/\s+/g, '') as 'cough' | 'fever' | 'runnynose' | 'rash' | 'vomiting' | 'diarrhea';
                  const translationKey = symptomKey === 'runnynose' ? 'runnyNose' : symptomKey;
                  return (
                    <div key={s} className="flex items-center space-x-2 bg-white dark:bg-gray-700 p-2 rounded border">
                      <input
                        type="checkbox"
                        id={`symptom-${s}`}
                        checked={details.symptoms?.includes(s) || false}
                        onChange={(e) => {
                          const current = details.symptoms || [];
                          if (e.target.checked) {
                            setDetails({ ...details, symptoms: [...current, s] });
                          } else {
                            setDetails({ ...details, symptoms: current.filter((i: string) => i !== s) });
                          }
                        }}
                        className="h-4 w-4 rounded border-2 border-gray-300 dark:border-gray-400 bg-white dark:bg-gray-500 text-primary focus:ring-primary focus:ring-2"
                      />
                      <label htmlFor={`symptom-${s}`} className="text-xs" style={{ color: '#000000' }}>{t(`health.${translationKey}` as any)}</label>
                    </div>
                  );
                })}
                {/* Other symptom option */}
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 p-2 rounded border">
                  <input
                    type="checkbox"
                    id="symptom-other"
                    checked={details.isOtherChecked || false}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setDetails({ 
                        ...details, 
                        isOtherChecked: isChecked,
                        // Clear text when unchecked
                        otherSymptomText: isChecked ? (details.otherSymptomText || '') : ''
                      });
                    }}
                    className="h-4 w-4 rounded border-2 border-gray-300 dark:border-gray-400 bg-white dark:bg-gray-500 text-primary focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="symptom-other" className="text-xs" style={{ color: '#000000' }}>{t('health.other')}</label>
                </div>
              </div>
              {/* Custom symptom text input - shown when "Other" is checked */}
              {details.isOtherChecked && (
                <div className="mt-2">
                  <Input
                    type="text"
                    placeholder={t('health.otherPlaceholder')}
                    value={details.otherSymptomText || ''}
                    onChange={(e) => {
                      setDetails({ ...details, otherSymptomText: e.target.value });
                    }}
                    className="bg-white mt-1"
                  />
                </div>
              )}
            </div>
          </div>
        );
      case 'diaper':
        return (
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            {/* Amount Section */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">{t('diaper.amount')}</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(amount => (
                  <Button
                    key={amount}
                    variant={details.amount === amount ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDetails({ ...details, amount })}
                    className="flex-1"
                  >
                    {t(`diaper.${amount}` as any)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Condition Section */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">{t('diaper.condition')}</label>
              <div className="flex gap-2">
                {(['normal', 'diarrhea', 'constipation'] as const).map(condition => (
                  <Button
                    key={condition}
                    variant={details.condition === condition ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDetails({ ...details, condition })}
                    className="flex-1"
                  >
                    {t(`diaper.${condition}` as any)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Section */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">{t('diaper.color')}</label>
              <div className="grid grid-cols-2 gap-2">
                {(['yellow', 'brown', 'green', 'other'] as const).map(color => (
                  <Button
                    key={color}
                    variant={details.color === color ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDetails({ ...details, color })}
                    className="flex-1"
                  >
                    {t(`diaper.${color}` as any)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'other':
        // No specific fields - only uses common Title and Comment fields
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-background text-foreground p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 
          className={`text-lg font-semibold ${categoryId === 'health' ? 'health-entry-title' : ''}`}
          style={categoryId !== 'health' ? { color: categoryInfo.color } : undefined}
        >
          {t('form.new')} {categoryInfo.label} {t('form.entry')}
        </h2>
      </div>
      <div className="space-y-6">
        <div className="space-y-4">
          {/* Hide main date picker for sleep category */}
          {categoryId !== 'sleep' && (
            <div>
              <label className="text-sm font-medium mb-2 block">{t('form.date')}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: language === 'ko' ? ko : enUS }) : <span>{t('form.pickDate')}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={language === 'ko' ? ko : enUS}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">{t('form.title')}</label>
            <Input
              placeholder={t('form.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-muted-foreground/20"
            />
          </div>

          {/* Dynamic Fields Section */}
          {renderSpecificFields()}

          <div>
            <label className="text-sm font-medium mb-2 block">{t('form.comment')}</label>
            <Textarea
              placeholder={t('form.commentPlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] border-muted-foreground/20"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          type="button"
          style={{
            backgroundColor:
              categoryId === 'growth' ? '#6AA6FF' :
              categoryId === 'sleep' ? '#9ADBC6' :
              categoryId === 'meal' ? '#FFC98B' :
              categoryId === 'health' ? '#ef4444' :
              categoryId === 'diaper' ? '#38bdf8' :
              categoryId === 'other' ? '#6b7280' :
              '#6b7280',
            color: 'white'
          }}
          className="w-full h-12 text-base font-semibold shadow-md transition-all hover:scale-[1.02] rounded-md"
        >
          {t('form.saveEntry')}
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function RecordScreen({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const { t, language } = useLanguage();
  const { selectedKidId } = useSelectedKid();
  const { fetchKids } = useKids();
  const {
    records,
    loading,
    fetchRecords,
    createMealRecord,
    createSleepRecord,
    createHealthRecord,
    createGrowthRecord,
    createStoolRecord,
    deleteRecord,
  } = useRecords(selectedKidId);

  const [view, setView] = useState<{ screen: 'list' | 'form'; categoryId: string | null }>({ screen: 'list', categoryId: null });
  const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);

  // Fetch kids and records on mount
  useEffect(() => {
    fetchKids().catch(console.error);
  }, [fetchKids]);

  useEffect(() => {
    if (selectedKidId) {
      fetchRecords().catch(console.error);
    }
  }, [selectedKidId, fetchRecords]);

  // Map symptom names to backend enum values
  const mapSymptomToEnum = (symptom: string): Symptom => {
    const symptomMap: Record<string, Symptom> = {
      'Cough': 'cough',
      'Fever': 'fever',
      'Runny Nose': 'runny_nose',
      'Vomiting': 'vomit',
      'Diarrhea': 'diarrhea',
      'other': 'other',
    };
    return symptomMap[symptom] || 'other';
  };

  // Map quality to backend enum
  const mapQualityToEnum = (quality: string): SleepQuality => {
    const qualityMap: Record<string, SleepQuality> = {
      'Good': 'good',
      'Fair': 'normal',
      'Poor': 'bad',
    };
    return qualityMap[quality] || 'normal';
  };

  // Map meal type to backend enum
  const mapMealTypeToEnum = (foodType: string): MealType => {
    const lowerType = foodType.toLowerCase();
    if (lowerType.includes('breast') || lowerType.includes('모유')) return 'breast_milk';
    if (lowerType.includes('formula') || lowerType.includes('분유')) return 'formula';
    return 'baby_food';
  };

  const handleSaveEntry = async (newEntryData: { category: string; title: string; content: string; date: Date; details?: any }) => {
    if (!selectedKidId) {
      toast.error(language === 'ko' ? '아이를 먼저 선택해주세요.' : 'Please select a kid first.');
      return;
    }

    try {
      const baseData = {
        title: newEntryData.title || undefined,
        memo: newEntryData.content || undefined,
      };

      switch (newEntryData.category) {
        case 'growth':
          await createGrowthRecord({
            ...baseData,
            height_cm: newEntryData.details?.height ? parseFloat(newEntryData.details.height) : undefined,
            weight_kg: newEntryData.details?.weight ? parseFloat(newEntryData.details.weight) : undefined,
          });
          break;

        case 'sleep':
          if (!newEntryData.details?.startTime || !newEntryData.details?.endTime) {
            toast.error(language === 'ko' ? '시작/종료 시간을 입력해주세요.' : 'Please enter start/end time.');
            return;
          }
          await createSleepRecord({
            ...baseData,
            start_datetime: newEntryData.details.startTime.toISOString(),
            end_datetime: newEntryData.details.endTime.toISOString(),
            sleep_quality: mapQualityToEnum(newEntryData.details.quality || 'Fair'),
          });
          break;

        case 'meal':
          await createMealRecord({
            ...baseData,
            meal_type: mapMealTypeToEnum(newEntryData.details?.foodType || ''),
            meal_detail: newEntryData.details?.amount || newEntryData.details?.foodType,
            burp: newEntryData.details?.didBurp || false,
          });
          break;

        case 'health':
          const symptom = newEntryData.details?.symptoms?.[0]
            ? mapSymptomToEnum(newEntryData.details.symptoms[0])
            : (newEntryData.details?.isOtherChecked ? 'other' : 'other');
          await createHealthRecord({
            ...baseData,
            temperature: newEntryData.details?.temperature ? parseFloat(newEntryData.details.temperature) : undefined,
            symptom,
            symptom_other: newEntryData.details?.symptom_other || newEntryData.details?.otherSymptomText,
          });
          break;

        case 'diaper':
          await createStoolRecord({
            ...baseData,
            amount: (newEntryData.details?.amount || 'medium') as StoolAmount,
            condition: (newEntryData.details?.condition || 'normal') as StoolCondition,
            color: (newEntryData.details?.color || 'yellow') as StoolColor,
          });
          break;

        default:
          toast.error(language === 'ko' ? '지원하지 않는 카테고리입니다.' : 'Unsupported category.');
          return;
      }

      const categoryLabel = recordCategories(t).find(cat => cat.id === newEntryData.category)?.label || '';
      toast.success(`${categoryLabel} ${t('form.saved')}`);
      setView({ screen: 'list', categoryId: null });
    } catch (err) {
      console.error('Failed to save record:', err);
      toast.error(language === 'ko' ? '기록 저장에 실패했습니다.' : 'Failed to save record.');
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    try {
      await deleteRecord(recordId);
      toast.success(language === 'ko' ? '기록이 삭제되었습니다.' : 'Record deleted.');
    } catch (err) {
      console.error('Failed to delete record:', err);
      toast.error(language === 'ko' ? '기록 삭제에 실패했습니다.' : 'Failed to delete record.');
    }
  };

  // Convert API records to JournalEntry format for display
  const entries: JournalEntry[] = records.map((record: RecordResponse) => {
    // Build details object based on record type
    let details: any = {};

    if (record.record_type === 'growth') {
      details = {
        height: record.height_cm?.toString(),
        weight: record.weight_kg?.toString(),
      };
    } else if (record.record_type === 'sleep') {
      details = {
        startTime: record.start_datetime ? new Date(record.start_datetime) : undefined,
        endTime: record.end_datetime ? new Date(record.end_datetime) : undefined,
        quality: record.sleep_quality === 'good' ? 'Good' : record.sleep_quality === 'bad' ? 'Poor' : 'Fair',
      };
    } else if (record.record_type === 'meal') {
      details = {
        foodType: record.meal_type,
        amount: record.meal_detail,
        didBurp: record.burp,
      };
    } else if (record.record_type === 'health') {
      details = {
        temperature: record.temperature?.toString(),
        symptoms: record.symptom ? [record.symptom] : [],
        symptom_other: record.symptom_other,
      };
    } else if (record.record_type === 'stool') {
      details = {
        amount: record.amount,
        condition: record.condition,
        color: record.color,
      };
    }

    return {
      id: record.id.toString(),
      category: record.record_type === 'stool' ? 'diaper' : record.record_type,
      title: record.title || '',
      content: record.memo || '',
      timestamp: format(new Date(record.created_at), 'PPP', { locale: language === 'ko' ? ko : enUS }),
      date: new Date(record.created_at),
      details,
    };
  });

  if (view.screen === 'form' && view.categoryId) {
    return (
      <JournalForm
        categoryId={view.categoryId}
        onSave={handleSaveEntry}
        onBack={() => setView({ screen: 'list', categoryId: null })}
        isDarkMode={isDarkMode}
      />
    );
  }

  const displayedEntries = showAllEntries ? entries : entries.slice(0, 3);

  return (
    <div className="h-full w-full overflow-auto bg-background text-foreground p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-primary">{t('record.title')}</h1>
      </div>

      <div className="space-y-4">
        <div className="pt-2">
          <h2 className="font-medium text-muted-foreground mb-3">{t('record.addNew')}</h2>
          <div className="grid grid-cols-3 gap-3">
            {recordCategories(t).map((cat) => {
              // Enhanced colors for dark mode visibility - brighter and more saturated
              const getIconColor = () => {
                if (cat.id === 'health') {
                  return 'text-red-600 dark:text-red-400';
                }
                if (cat.id === 'other') {
                  return 'text-gray-600 dark:text-gray-300';
                }
                return '';
              };
              
              return (
                <Card
                  key={cat.id}
                  className="flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setView({ screen: 'form', categoryId: cat.id })}
                >
                  <div 
                    className={`mb-2 ${getIconColor()}`} 
                    style={cat.id !== 'health' && cat.id !== 'other' ? { color: cat.color } : undefined}
                  >
                    {cat.icon}
                  </div>
                  <p className={`text-xs font-medium`}>{cat.label}</p>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="pt-6 space-y-3">
          <h2 className="font-medium text-muted-foreground">{t('record.recent')}</h2>
          {!selectedKidId ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                {language === 'ko' ? '아이를 먼저 등록해주세요.' : 'Please register a kid first.'}
              </p>
              <p className="text-muted-foreground text-sm">
                {language === 'ko' ? '홈 화면에서 아이 정보를 등록할 수 있습니다.' : 'You can register kid info from the home screen.'}
              </p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : entries.length > 0 ? (
            <>
              {displayedEntries.map(entry => (
                <div key={entry.id} className="relative group">
                  <JournalEntryCard entry={entry} />
                  <button
                    onClick={() => handleDeleteRecord(parseInt(entry.id))}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50"
                    title={language === 'ko' ? '삭제' : 'Delete'}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
              {entries.length > 3 && !showAllEntries && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAllEntries(true)}
                >
                  {t('record.seeMore')} ({entries.length - 3} {t('record.olderEntries')})
                </Button>
              )}
              {showAllEntries && entries.length > 3 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAllEntries(false)}
                >
                  {t('record.showLess')}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">{t('record.noEntries')}</p>
              <p className="text-muted-foreground text-sm">{t('record.noEntriesDesc')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-20 right-4 flex flex-col gap-3 z-10">
        <Drawer open={isAiSheetOpen} onOpenChange={setIsAiSheetOpen}>
          <DrawerTrigger asChild>
            <Button size="icon" className="rounded-full h-14 w-14 bg-gradient-to-br from-primary to-accent shadow-lg">
              <Bot className="h-7 w-7 text-white" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t('ai.title')}
              </DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <p className="text-muted-foreground text-sm">{t('ai.comingSoon')}</p>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
