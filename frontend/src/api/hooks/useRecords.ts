/**
 * Records API Hooks
 */
import { useState, useCallback } from 'react';
import { apiClient } from '../client';
import type {
  RecordResponse,
  RecordType,
  MealRecordCreate,
  SleepRecordCreate,
  HealthRecordCreate,
  GrowthRecordCreate,
  StoolRecordCreate,
} from '../types';

interface RecordFilters {
  kid_id: number;
  record_type?: RecordType;
  start_date?: string;
  end_date?: string;
}

export function useRecords() {
  const [records, setRecords] = useState<RecordResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (filters: RecordFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        kid_id: filters.kid_id.toString(),
      };
      if (filters.record_type) params.record_type = filters.record_type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const response = await apiClient.get<RecordResponse[]>('/api/v1/records', params);
      setRecords(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch records');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMealRecord = useCallback(async (data: MealRecordCreate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<RecordResponse>('/api/v1/records/meal', data);
      setRecords((prev) => [response, ...prev]);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create meal record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSleepRecord = useCallback(async (data: SleepRecordCreate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<RecordResponse>('/api/v1/records/sleep', data);
      setRecords((prev) => [response, ...prev]);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create sleep record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createHealthRecord = useCallback(async (data: HealthRecordCreate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<RecordResponse>('/api/v1/records/health', data);
      setRecords((prev) => [response, ...prev]);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create health record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createGrowthRecord = useCallback(async (data: GrowthRecordCreate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<RecordResponse>('/api/v1/records/growth', data);
      setRecords((prev) => [response, ...prev]);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create growth record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createStoolRecord = useCallback(async (data: StoolRecordCreate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<RecordResponse>('/api/v1/records/stool', data);
      setRecords((prev) => [response, ...prev]);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to create stool record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRecord = useCallback(async (recordId: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/api/v1/records/${recordId}`);
      setRecords((prev) => prev.filter((record) => record.id !== recordId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete record');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
