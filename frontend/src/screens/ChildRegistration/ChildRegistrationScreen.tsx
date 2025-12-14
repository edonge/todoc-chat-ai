import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { registerChild, getChildren } from '@/services/api/childService';
import { isValidYYYYMMDD, isDateInPast } from '@/utils/dateValidation';

interface ChildRegistrationScreenProps {
  onComplete: () => void;
}

export interface ChildRegistrationData {
  name: string;
  birthDate: string; // YYYY-MM-DD format string
  gender: 'boy' | 'girl';
}

export default function ChildRegistrationScreen({ onComplete }: ChildRegistrationScreenProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ensureSingleKid = async () => {
      try {
        const children = await getChildren();
        if (children.length > 0) {
          onComplete();
        }
      } catch (err) {
        console.error('Error verifying existing child registration:', err);
      }
    };

    ensureSingleKid();
  }, [onComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError(t('childRegistration.nameRequired'));
      return;
    }

    if (!birthDate.trim()) {
      setError(t('childRegistration.dateRequired'));
      return;
    }

    // Validate YYYY-MM-DD format
    const trimmedDate = birthDate.trim();
    if (!isValidYYYYMMDD(trimmedDate)) {
      setError(t('childRegistration.dateFormatError'));
      return;
    }

    // Check if birth date is in the past
    if (!isDateInPast(trimmedDate)) {
      setError(t('childRegistration.dateFutureError'));
      return;
    }

    if (!gender) {
      setError(t('childRegistration.genderRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const childData: ChildRegistrationData = {
        name: name.trim(),
        birthDate: trimmedDate, // Already validated and trimmed
        gender: gender as 'boy' | 'girl',
      };

      // API call - this will be implemented when backend is ready
      await registerChild(childData);

      // On success, proceed to main app
      onComplete();
    } catch (err) {
      console.error('Error registering child:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : t('childRegistration.submitError')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#6AA6FF]/20 via-[#FFFDF9] to-[#9ADBC6]/20 p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-[#6AA6FF]/20">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6AA6FF] to-[#9ADBC6] flex items-center justify-center shadow-lg">
              <span className="text-4xl">👶</span>
            </div>
          </div>
          <CardTitle className="text-[#6AA6FF]">{t('childRegistration.title')}</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t('childRegistration.subtitle')}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Child's Name */}
            <div className="space-y-2">
              <Label htmlFor="child-name" className="text-sm font-medium">
                {t('childRegistration.nameLabel')}
              </Label>
              <Input
                id="child-name"
                type="text"
                placeholder={t('childRegistration.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 border-[#6AA6FF]/30"
                disabled={isSubmitting}
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="birth-date" className="text-sm font-medium">
                {t('childRegistration.dateLabel')}
              </Label>
              <Input
                id="birth-date"
                type="text"
                placeholder={t('childRegistration.datePlaceholder')}
                value={birthDate}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only numbers and hyphens, limit length to 10 (YYYY-MM-DD)
                  const cleaned = value.replace(/[^\d-]/g, '').slice(0, 10);
                  setBirthDate(cleaned);
                  // Clear error when user starts typing
                  if (error && error.includes('date')) {
                    setError(null);
                  }
                }}
                className="h-12 border-[#6AA6FF]/30 font-mono"
                disabled={isSubmitting}
                maxLength={10}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('childRegistration.dateFormatExample' as any)}
              </p>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium">
                {t('childRegistration.genderLabel')}
              </Label>
              <Select
                value={gender}
                onValueChange={(value: 'boy' | 'girl') => setGender(value)}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  id="gender"
                  className="h-12 border-[#6AA6FF]/30"
                >
                  <SelectValue placeholder={t('childRegistration.genderPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boy">{t('childRegistration.genderBoy')}</SelectItem>
                  <SelectItem value="girl">{t('childRegistration.genderGirl')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-[#6AA6FF] hover:bg-[#5a96ef] text-white transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('childRegistration.submitting') : t('childRegistration.submitButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
