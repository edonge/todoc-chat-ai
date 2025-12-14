/**
 * Chat Service - 채팅 API 연동
 */
import { apiClient } from '@/api/client';
import type { ChatSessionResponse, ChatMessageResponse } from '@/api/types';

const CHAT_BASE_PATH = '/api/v1/chat';

// AI Mode IDs (백엔드 ai_modes 테이블과 매칭)
export const AI_MODE_IDS = {
  doctor: 1,
  mom: 2,
  nutritionist: 3,
} as const;

export type AIModeType = keyof typeof AI_MODE_IDS;

/**
 * 채팅 세션 목록 조회
 */
export async function getChatSessions(kidId: number): Promise<ChatSessionResponse[]> {
  return await apiClient.get<ChatSessionResponse[]>(`${CHAT_BASE_PATH}/sessions?kid_id=${kidId}`);
}

/**
 * 새 채팅 세션 생성
 */
export async function createChatSession(kidId: number): Promise<ChatSessionResponse> {
  return await apiClient.post<ChatSessionResponse>(`${CHAT_BASE_PATH}/sessions`, {
    kid_id: kidId,
  });
}

/**
 * 특정 채팅 세션 조회 (메시지 포함)
 */
export async function getChatSession(sessionId: number): Promise<ChatSessionResponse> {
  return await apiClient.get<ChatSessionResponse>(`${CHAT_BASE_PATH}/sessions/${sessionId}`);
}

/**
 * 채팅 세션 삭제
 */
export async function deleteChatSession(sessionId: number): Promise<void> {
  await apiClient.delete(`${CHAT_BASE_PATH}/sessions/${sessionId}`);
}

/**
 * 메시지 전송 및 AI 응답 받기
 */
export async function sendMessage(
  sessionId: number,
  content: string,
  aiMode: AIModeType
): Promise<ChatMessageResponse> {
  return await apiClient.post<ChatMessageResponse>(
    `${CHAT_BASE_PATH}/sessions/${sessionId}/messages`,
    {
      content,
      ai_mode_id: AI_MODE_IDS[aiMode],
    }
  );
}
