/**
 * Chat API Hooks
 */
import { useState, useCallback } from 'react';
import { apiClient } from '../client';
import type {
  ChatSessionCreate,
  ChatSessionResponse,
  ChatMessageCreate,
  ChatMessageResponse,
} from '../types';

export function useChat() {
  const [sessions, setSessions] = useState<ChatSessionResponse[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSessionResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async (kidId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ChatSessionResponse[]>('/api/v1/chat/sessions', {
        kid_id: kidId.toString(),
      });
      setSessions(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sessions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (data: ChatSessionCreate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<ChatSessionResponse>('/api/v1/chat/sessions', data);
      setSessions((prev) => [response, ...prev]);
      setCurrentSession(response);
      setMessages([]);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const selectSession = useCallback(async (sessionId: number) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch session details
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
      }

      // Fetch messages for this session
      const messagesResponse = await apiClient.get<ChatMessageResponse[]>(
        `/api/v1/chat/sessions/${sessionId}/messages`
      );
      setMessages(messagesResponse);
      return messagesResponse;
    } catch (err: any) {
      setError(err.message || 'Failed to load session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessions]);

  const sendMessage = useCallback(
    async (sessionId: number, data: ChatMessageCreate) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<ChatMessageResponse>(
          `/api/v1/chat/sessions/${sessionId}/messages`,
          data
        );
        // Response includes both user message and AI response
        setMessages((prev) => [...prev, response]);
        return response;
      } catch (err: any) {
        setError(err.message || 'Failed to send message');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteSession = useCallback(async (sessionId: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/api/v1/chat/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  return {
    sessions,
    currentSession,
    messages,
    loading,
    error,
    fetchSessions,
    createSession,
    selectSession,
    sendMessage,
    deleteSession,
  };
}
