/**
 * Records API Hooks
 */
import { useState, useCallback } from 'react';
import { apiClient } from '../client';
import type {
  RecordResponse,
  RecordType,
  MealRecordCreate,
  MealRecordResponse,
  SleepRecordCreate,
  SleepRecordResponse,
  HealthRecordCreate,
  HealthRecordResponse,
  GrowthRecordCreate,
  GrowthRecordResponse,
  StoolRecordCreate,
  StoolRecordResponse,
} from '../types';

interface RecordFilters {
  record_type?: RecordType;
  date_from?: string;
  date_to?: string;
  limit?: number;
}

// Union type for all record responses
export type AnyRecordResponse =
  | MealRecordResponse
  | SleepRecordResponse
  | HealthRecordResponse
  | GrowthRecordResponse
  | StoolRecordResponse;

export function useRecords(kidId: number | null) {
  const [records, setRecords] = useState<RecordResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (filters: RecordFilters = {}) => {
    if (!kidId) return [];

    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filters.record_type) params.record_type = filters.record_type;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      if (filters.limit) params.limit = filters.limit.toString();

      const response = await apiClient.get<RecordResponse[]>(
        `/api/v1/kids/${kidId}/records`,
        params
      );
      setRecords(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch records');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [kidId]);

  const createMealRecord = useCallback(async (data: MealRecordCreate) => {
    if (!kidId) throw new Error('No kid selected');

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<MealRecordResponse>(
        `/api/v1/kids/${kidId}/records/meal`,
        data
      );
      // Add to records list using the base record info
      if (response.record) {
        setRecords((prev) => [response.record!, ...prev]);
      }
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create meal record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [kidId]);

  const createSleepRecord = useCallback(async (data: SleepRecordCreate) => {
    if (!kidId) throw new Error('No kid selected');

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<SleepRecordResponse>(
        `/api/v1/kids/${kidId}/records/sleep`,
        data
      );
      if (response.record) {
        setRecords((prev) => [response.record!, ...prev]);
      }
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create sleep record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [kidId]);

  const createHealthRecord = useCallback(async (data: HealthRecordCreate) => {
    if (!kidId) throw new Error('No kid selected');

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<HealthRecordResponse>(
        `/api/v1/kids/${kidId}/records/health`,
        data
      );
      if (response.record) {
        setRecords((prev) => [response.record!, ...prev]);
      }
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create health record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [kidId]);

  const createGrowthRecord = useCallback(async (data: GrowthRecordCreate) => {
    if (!kidId) throw new Error('No kid selected');

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<GrowthRecordResponse>(
        `/api/v1/kids/${kidId}/records/growth`,
        data
      );
      if (response.record) {
        setRecords((prev) => [response.record!, ...prev]);
      }
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create growth record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [kidId]);

  const createStoolRecord = useCallback(async (data: StoolRecordCreate) => {
    if (!kidId) throw new Error('No kid selected');

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<StoolRecordResponse>(
        `/api/v1/kids/${kidId}/records/stool`,
        data
      );
      if (response.record) {
        setRecords((prev) => [response.record!, ...prev]);
      }
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create stool record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [kidId]);

  const deleteRecord = useCallback(async (recordId: number) => {
    if (!kidId) throw new Error('No kid selected');

    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/api/v1/kids/${kidId}/records/${recordId}`);
      setRecords((prev) => prev.filter((record) => record.id !== recordId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [kidId]);

  return {
    records,
    loading,
    error,
    fetchRecords,
    createMealRecord,
    createSleepRecord,
    createHealthRecord,
    createGrowthRecord,
    createStoolRecord,
    deleteRecord,
  };
}
