/**
 * useApi Hook
 * Simplified API integration hook for React components
 */

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import apiClient from '../services/ApiClient';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: AxiosError) => void;
  autoFetch?: boolean;
}

/**
 * Generic API hook for GET requests
 */
export function useApiGet<T = any>(
  url: string,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: options.autoFetch !== false,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.client.get(url);
      setState(prev => ({ ...prev, data: response.data, loading: false }));
      options.onSuccess?.(response.data);
    } catch (error) {
      const err = error as AxiosError;
      const message = apiClient.getErrorMessage(err);
      setState(prev => ({ ...prev, error: message, loading: false }));
      options.onError?.(err);
    }
  }, [url, options]);

  return { ...state, refetch: fetch };
}

/**
 * Generic API hook for POST/PATCH requests
 */
export function useApiMutation<T = any, D = any>(
  method: 'post' | 'patch' | 'put' | 'delete' = 'post',
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (url: string, data?: D) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        let response;
        if (method === 'delete') {
          response = await apiClient.client.delete(url);
        } else {
          response = await apiClient.client[method](url, data);
        }
        setState(prev => ({ ...prev, data: response.data, loading: false }));
        options.onSuccess?.(response.data);
        return response.data;
      } catch (error) {
        const err = error as AxiosError;
        const message = apiClient.getErrorMessage(err);
        setState(prev => ({ ...prev, error: message, loading: false }));
        options.onError?.(err);
        throw err;
      }
    },
    [method, options]
  );

  return { ...state, mutate };
}

/**
 * API hook for document CRUD operations
 */
export function useDocuments() {
  const { data: documents, loading, error, refetch } = useApiGet('/documents/');
  const createMutation = useApiMutation('post');
  const updateMutation = useApiMutation('patch');
  const deleteMutation = useApiMutation('delete');

  return {
    documents,
    loading,
    error,
    refetch,
    createDocument: (data: FormData) => createMutation.mutate('/documents/', data),
    updateDocument: (id: string, data: any) => updateMutation.mutate(`/documents/${id}/`, data),
    deleteDocument: (id: string) => deleteMutation.mutate(`/documents/${id}/`),
  };
}

/**
 * API hook for work records CRUD operations
 */
export function useWorkRecords() {
  const { data: records, loading, error, refetch } = useApiGet('/work-records/');
  const createMutation = useApiMutation('post');
  const updateMutation = useApiMutation('patch');
  const deleteMutation = useApiMutation('delete');

  return {
    records,
    loading,
    error,
    refetch,
    createRecord: (data: any) => createMutation.mutate('/work-records/', data),
    updateRecord: (id: string, data: any) => updateMutation.mutate(`/work-records/${id}/`, data),
    deleteRecord: (id: string) => deleteMutation.mutate(`/work-records/${id}/`),
  };
}

/**
 * API hook for search functionality
 */
export function useSearch(query: string, scope?: string) {
  const [state, setState] = useState<UseApiState<any>>({
    data: null,
    loading: false,
    error: null,
  });

  const search = useCallback(async () => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, data: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.search(query, scope);
      setState(prev => ({ ...prev, data: response, loading: false }));
    } catch (error) {
      const err = error as AxiosError;
      const message = apiClient.getErrorMessage(err);
      setState(prev => ({ ...prev, error: message, loading: false }));
    }
  }, [query, scope]);

  return { ...state, search };
}
