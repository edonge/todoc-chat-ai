/**
 * Kids API Hooks
 */
import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../client';
import type { KidCreate, KidUpdate, KidResponse } from '../types';

export function useKids() {
  const [kids, setKids] = useState<KidResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKids = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<KidResponse[]>('/api/v1/kids');
      setKids(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch kids');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createKid = useCallback(async (data: KidCreate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<KidResponse>('/api/v1/kids', data);
      setKids((prev) => [...prev, response]);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create kid');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateKid = useCallback(async (kidId: number, data: KidUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put<KidResponse>(`/api/v1/kids/${kidId}`, data);
      setKids((prev) => prev.map((kid) => (kid.id === kidId ? response : kid)));
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update kid');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteKid = useCallback(async (kidId: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/api/v1/kids/${kidId}`);
      setKids((prev) => prev.filter((kid) => kid.id !== kidId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete kid');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getKidById = useCallback(async (kidId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<KidResponse>(`/api/v1/kids/${kidId}`);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch kid');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    kids,
    loading,
    error,
    fetchKids,
    createKid,
    updateKid,
    deleteKid,
    getKidById,
  };
}

// Hook for managing selected kid
export function useSelectedKid() {
  const [selectedKidId, setSelectedKidId] = useState<number | null>(() => {
    const saved = localStorage.getItem('selected_kid_id');
    return saved ? parseInt(saved, 10) : null;
  });

  const selectKid = useCallback((kidId: number | null) => {
    setSelectedKidId(kidId);
    if (kidId) {
      localStorage.setItem('selected_kid_id', kidId.toString());
    } else {
      localStorage.removeItem('selected_kid_id');
    }
  }, []);

  return {
    selectedKidId,
    selectKid,
  };
}
