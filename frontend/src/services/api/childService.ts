/**
 * Child Service - 아이 정보 API 연동
 */
import { apiClient } from '@/api/client';
import type { KidCreate, KidResponse } from '@/api/types';

export interface ChildRegistrationData {
  name: string;
  birthDate: string; // YYYY-MM-DD format string
  gender: 'boy' | 'girl';
}

/**
 * 아이 등록
 */
const KIDS_BASE_PATH = '/api/v1/kids/';

export async function registerChild(childData: ChildRegistrationData): Promise<KidResponse> {
  const apiData: KidCreate = {
    name: childData.name,
    birth_date: childData.birthDate,
    gender: childData.gender === 'boy' ? 'male' : 'female',
  };

  return await apiClient.post<KidResponse>(KIDS_BASE_PATH, apiData);
}

/**
 * 현재 사용자의 아이 목록 조회
 */
export async function getChildren(): Promise<KidResponse[]> {
  return await apiClient.get<KidResponse[]>(KIDS_BASE_PATH);
}

/**
 * 아이 등록 여부 확인 (온보딩 완료 여부)
 */
export async function hasChildRegistered(): Promise<boolean> {
  const children = await getChildren();
  return Array.isArray(children) && children.length > 0;
}

/**
 * 특정 아이 정보 조회
 */
export async function getChildById(kidId: number): Promise<KidResponse> {
  return await apiClient.get<KidResponse>(`${KIDS_BASE_PATH}${kidId}`);
}

/**
 * 아이 정보 삭제
 */
export async function deleteChild(kidId: number): Promise<void> {
  await apiClient.delete(`${KIDS_BASE_PATH}${kidId}`);
}

/**
 * 아이 사진 업로드
 */
export async function uploadChildPhoto(kidId: number, file: File): Promise<KidResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return await apiClient.uploadFile<KidResponse>(`${KIDS_BASE_PATH}${kidId}/photo`, formData);
}
