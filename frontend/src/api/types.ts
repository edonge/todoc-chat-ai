/**
 * API Type Definitions
 * Matches backend Pydantic schemas
 */

// ============ Auth Types ============
export interface UserCreate {
  username: string;
  password: string;
  nickname?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  nickname: string | null;
  created_at: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ============ Kid Types ============
export interface KidCreate {
  name: string;
  birth_date: string; // YYYY-MM-DD format
  gender?: string;
}

export interface KidUpdate {
  name?: string;
  birth_date?: string;
  gender?: string;
}

export interface KidResponse {
  id: number;
  user_id: number;
  name: string;
  birth_date: string;
  gender: string | null;
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
}

// ============ Record Types ============
export type RecordType = 'growth' | 'sleep' | 'meal' | 'health' | 'stool' | 'misc';
export type MealType = 'breast_milk' | 'formula' | 'baby_food';
export type SleepQuality = 'good' | 'normal' | 'bad';
export type Symptom = 'cough' | 'fever' | 'runny_nose' | 'vomit' | 'diarrhea' | 'other';
export type StoolAmount = 'low' | 'medium' | 'high';
export type StoolCondition = 'normal' | 'diarrhea' | 'constipation';
export type StoolColor = 'yellow' | 'brown' | 'green' | 'other';

// Base record response with details
export interface RecordResponse {
  id: number;
  kid_id: number;
  record_type: RecordType;
  title: string | null;
  memo: string | null;
  image_url: string | null;
  created_at: string;
  // Growth details
  height_cm?: number | null;
  weight_kg?: number | null;
  // Sleep details
  start_datetime?: string | null;
  end_datetime?: string | null;
  sleep_quality?: SleepQuality | null;
  // Meal details
  meal_type?: MealType | null;
  meal_detail?: string | null;
  burp?: boolean | null;
  // Health details
  temperature?: number | null;
  symptom?: Symptom | null;
  symptom_other?: string | null;
  // Stool details
  amount?: StoolAmount | null;
  condition?: StoolCondition | null;
  color?: StoolColor | null;
}

// Specific record create types (flat structure matching backend)
export interface MealRecordCreate {
  title?: string;
  memo?: string;
  image_url?: string;
  meal_type: MealType;
  meal_detail?: string;
  burp?: boolean;
}

export interface MealRecordResponse {
  id: number;
  meal_type: MealType;
  meal_detail: string | null;
  burp: boolean | null;
  record: RecordResponse | null;
}

export interface SleepRecordCreate {
  title?: string;
  memo?: string;
  image_url?: string;
  start_datetime: string;
  end_datetime: string;
  sleep_quality: SleepQuality;
}

export interface SleepRecordResponse {
  id: number;
  start_datetime: string;
  end_datetime: string;
  sleep_quality: SleepQuality;
  record: RecordResponse | null;
}

export interface HealthRecordCreate {
  title?: string;
  memo?: string;
  image_url?: string;
  temperature?: number;
  symptom: Symptom;
  symptom_other?: string;
}

export interface HealthRecordResponse {
  id: number;
  temperature: number | null;
  symptom: Symptom;
  symptom_other: string | null;
  record: RecordResponse | null;
}

export interface GrowthRecordCreate {
  title?: string;
  memo?: string;
  image_url?: string;
  height_cm?: number;
  weight_kg?: number;
}

export interface GrowthRecordResponse {
  id: number;
  height_cm: number | null;
  weight_kg: number | null;
  record: RecordResponse | null;
}

export interface StoolRecordCreate {
  title?: string;
  memo?: string;
  image_url?: string;
  amount: StoolAmount;
  condition: StoolCondition;
  color: StoolColor;
}

export interface StoolRecordResponse {
  id: number;
  amount: StoolAmount;
  condition: StoolCondition;
  color: StoolColor;
  record: RecordResponse | null;
}

// ============ Chat Types ============
export type SenderType = 'user' | 'ai';

export interface ChatSessionCreate {
  kid_id: number;
}

export interface ChatSessionResponse {
  id: number;
  kid_id: number;
  created_at: string;
  updated_at: string;
  messages?: ChatMessageResponse[];
}

export interface ChatMessageCreate {
  content: string;
  ai_mode_id?: number;
}

export interface ChatMessageResponse {
  id: number;
  session_id: number;
  sender: SenderType;
  ai_mode_id: number | null;
  content: string;
  created_at: string;
}

// ============ Community Types ============
export type CommunityCategory = 'general' | 'marketplace' | 'recipe';

export interface AuthorResponse {
  id: number;
  username: string;
}

export interface PostCreate {
  kid_id?: number;
  category: CommunityCategory;
  title: string;
  content: string;
  image_url?: string;
}

export interface PostUpdate {
  title?: string;
  content?: string;
  image_url?: string;
}

export interface PostResponse {
  id: number;
  user_id: number;
  kid_id: number | null;
  category: CommunityCategory;
  title: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author: AuthorResponse | null;
  comment_count: number;
  is_liked: boolean;
  kid_name: string | null;
  kid_image_url: string | null;
}

export interface PostListResponse {
  posts: PostResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface CommentCreate {
  content: string;
}

export interface CommentResponse {
  id: number;
  post_id: number;
  content: string;
  created_at: string;
  author: AuthorResponse;
}

// ============ File Upload Types ============
export interface FileUploadResponse {
  filename: string;
  url: string;
}
