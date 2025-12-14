/**
 * Daily Tip Service - 데일리 팁 API 연동
 */
import { apiClient } from '@/api/client';

export interface DailyTipResponse {
  id: number;
  content: string;
  language: string;
  created_at: string;
  updated_at: string;
}

const DAILY_TIPS_BASE_PATH = '/api/v1/daily-tips';

/**
 * 랜덤 팁 조회 (언어별)
 */
export async function getRandomTip(language: 'kor' | 'eng'): Promise<DailyTipResponse | null> {
  try {
    return await apiClient.get<DailyTipResponse>(`${DAILY_TIPS_BASE_PATH}/random?language=${language}`);
  } catch {
    return null;
  }
}
