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
  created_at: string;
  updated_at: string;
}

// ============ Record Types ============
export type RecordType = 'growth' | 'sleep' | 'meal' | 'health' | 'stool' | 'misc';
export type MealType = 'breast_milk' | 'formula' | 'baby_food' | 'snack' | 'other';
export type SleepQuality = 'good' | 'normal' | 'bad';
export type Symptom = 'fever' | 'cough' | 'runny_nose' | 'vomiting' | 'diarrhea' | 'rash' | 'other';
export type StoolAmount = 'small' | 'medium' | 'large';
export type StoolCondition = 'hard' | 'normal' | 'soft' | 'watery';
export type StoolColor = 'yellow' | 'green' | 'brown' | 'black' | 'red' | 'white';

export interface RecordCreate {
  kid_id: number;
  record_type: RecordType;
  title?: string;
  memo?: string;
  image_url?: string;
}

export interface RecordResponse {
  id: number;
  kid_id: number;
  record_type: RecordType;
  title: string | null;
  memo: string | null;
  image_url: string | null;
  created_at: string;
}

// Specific record types
export interface MealRecordCreate {
  record: RecordCreate;
  meal_type: MealType;
  meal_detail?: string;
  amount_ml?: number;
  burp?: boolean;
}

export interface SleepRecordCreate {
  record: RecordCreate;
  start_datetime: string;
  end_datetime: string;
  quality?: SleepQuality;
}

export interface HealthRecordCreate {
  record: RecordCreate;
  temperature?: number;
  symptom?: Symptom;
  medication?: string;
  hospital_visit?: boolean;
}

export interface GrowthRecordCreate {
  record: RecordCreate;
  height_cm?: number;
  weight_kg?: number;
  head_cm?: number;
}

export interface StoolRecordCreate {
  record: RecordCreate;
  amount?: StoolAmount;
  condition?: StoolCondition;
  color?: StoolColor;
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
export type CommunityCategory = 'recipes' | 'tips' | 'talk';

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
  author_nickname: string;
  comments_count: number;
  is_liked: boolean;
}

export interface PostListResponse {
  posts: PostResponse[];
  total: number;
  page: number;
  per_page: number;
}

export interface CommentCreate {
  content: string;
}

export interface CommentResponse {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  author_nickname: string;
}

// ============ File Upload Types ============
export interface FileUploadResponse {
  filename: string;
  url: string;
}
