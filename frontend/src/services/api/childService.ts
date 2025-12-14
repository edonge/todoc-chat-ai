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
export async function registerChild(childData: ChildRegistrationData): Promise<KidResponse> {
  const apiData: KidCreate = {
    name: childData.name,
    birth_date: childData.birthDate,
    gender: childData.gender === 'boy' ? 'male' : 'female',
  };

  return await apiClient.post<KidResponse>('/api/v1/kids/', apiData);
}

/**
 * 현재 사용자의 아이 목록 조회
 */
export async function getChildren(): Promise<KidResponse[]> {
  return await apiClient.get<KidResponse[]>('/api/v1/kids');
}

/**
 * 아이 등록 여부 확인 (온보딩 완료 여부)
 */
export async function hasChildRegistered(): Promise<boolean> {
  try {
    const children = await getChildren();
    return children && children.length > 0;
  } catch (error) {
    console.error('Error checking child registration:', error);
    return false;
  }
}

/**
 * 특정 아이 정보 조회
 */
export async function getChildById(kidId: number): Promise<KidResponse> {
  return await apiClient.get<KidResponse>(`/api/v1/kids/${kidId}`);
}

/**
 * 아이 정보 삭제
 */
export async function deleteChild(kidId: number): Promise<void> {
  await apiClient.delete(`/api/v1/kids/${kidId}`);
}

/**
 * 아이 사진 업로드
 */
export async function uploadChildPhoto(kidId: number, file: File): Promise<KidResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return await apiClient.uploadFile<KidResponse>(`/api/v1/kids/${kidId}/photo`, formData);
}
