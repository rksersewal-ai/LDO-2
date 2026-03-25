/**
 * API Client Service
 * Centralized HTTP client for all backend API calls with JWT authentication
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface ApiErrorResponse {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8765/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add JWT token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses and errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Auth Endpoints
  // ─────────────────────────────────────────────────────────────────────────

  async login(username: string, password: string) {
    const response = await this.client.post<{
      access: string;
      refresh: string;
      user: any;
    }>('/auth/login/', { username, password });
    
    const { access, user } = response.data;
    localStorage.setItem('auth_token', access);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { token: access, user };
  }

  async logout() {
    try {
      await this.client.post('/auth/logout/');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  async refreshToken() {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('No token found');
    
    const response = await this.client.post<{ access: string }>('/auth/token/refresh/', {
      refresh: token,
    });
    
    const { access } = response.data;
    localStorage.setItem('auth_token', access);
    return access;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Document Endpoints
  // ─────────────────────────────────────────────────────────────────────────

  async getDocuments(filters?: Record<string, any>) {
    const response = await this.client.get('/documents/', { params: filters });
    return response.data;
  }

  async getDocument(id: string) {
    const response = await this.client.get(`/documents/${id}/`);
    return response.data;
  }

  async createDocument(data: FormData) {
    const response = await this.client.post('/documents/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateDocument(id: string, data: Partial<any>) {
    const response = await this.client.patch(`/documents/${id}/`, data);
    return response.data;
  }

  async deleteDocument(id: string) {
    await this.client.delete(`/documents/${id}/`);
  }

  async uploadDocumentVersion(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post(`/documents/${id}/versions/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Work Records Endpoints
  // ─────────────────────────────────────────────────────────────────────────

  async getWorkRecords(filters?: Record<string, any>) {
    const response = await this.client.get('/work-records/', { params: filters });
    return response.data;
  }

  async getWorkRecord(id: string) {
    const response = await this.client.get(`/work-records/${id}/`);
    return response.data;
  }

  async createWorkRecord(data: any) {
    const response = await this.client.post('/work-records/', data);
    return response.data;
  }

  async updateWorkRecord(id: string, data: Partial<any>) {
    const response = await this.client.patch(`/work-records/${id}/`, data);
    return response.data;
  }

  async deleteWorkRecord(id: string) {
    await this.client.delete(`/work-records/${id}/`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PL (Product/Locomotive) Endpoints
  // ─────────────────────────────────────────────────────────────────────────

  async getPlItems(filters?: Record<string, any>) {
    const response = await this.client.get('/pl-items/', { params: filters });
    return response.data;
  }

  async getPlItem(id: string) {
    const response = await this.client.get(`/pl-items/${id}/`);
    return response.data;
  }

  async createPlItem(data: any) {
    const response = await this.client.post('/pl-items/', data);
    return response.data;
  }

  async updatePlItem(id: string, data: Partial<any>) {
    const response = await this.client.patch(`/pl-items/${id}/`, data);
    return response.data;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Case/Discrepancy Endpoints
  // ─────────────────────────────────────────────────────────────────────────

  async getCases(filters?: Record<string, any>) {
    const response = await this.client.get('/cases/', { params: filters });
    return response.data;
  }

  async getCase(id: string) {
    const response = await this.client.get(`/cases/${id}/`);
    return response.data;
  }

  async createCase(data: any) {
    const response = await this.client.post('/cases/', data);
    return response.data;
  }

  async updateCase(id: string, data: Partial<any>) {
    const response = await this.client.patch(`/cases/${id}/`, data);
    return response.data;
  }

  async closeCase(id: string, resolution: string) {
    const response = await this.client.post(`/cases/${id}/close/`, { resolution });
    return response.data;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OCR Endpoints
  // ─────────────────────────────────────────────────────────────────────────

  async getOcrJobs(filters?: Record<string, any>) {
    const response = await this.client.get('/ocr/jobs/', { params: filters });
    return response.data;
  }

  async getOcrJob(id: string) {
    const response = await this.client.get(`/ocr/jobs/${id}/`);
    return response.data;
  }

  async startOcrJob(documentId: string) {
    const response = await this.client.post('/ocr/jobs/', { document_id: documentId });
    return response.data;
  }

  async getOcrResult(documentId: string) {
    const response = await this.client.get(`/ocr/results/${documentId}/`);
    return response.data;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Approval Endpoints
  // ─────────────────────────────────────────────────────────────────────────

  async getApprovals(filters?: Record<string, any>) {
    const response = await this.client.get('/approvals/', { params: filters });
    return response.data;
  }

  async getApproval(id: string) {
    const response = await this.client.get(`/approvals/${id}/`);
    return response.data;
  }

  async approveRequest(id: string, comment?: string) {
    const response = await this.client.post(`/approvals/${id}/approve/`, { comment });
    return response.data;
  }

  async rejectRequest(id: string, reason: string) {
    const response = await this.client.post(`/approvals/${id}/reject/`, { reason });
    return response.data;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Audit Log Endpoints
  // ─────────────────────────────────────────────────────────────────────────

  async getAuditLog(filters?: Record<string, any>) {
    const response = await this.client.get('/audit/log/', { params: filters });
    return response.data;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Search Endpoints
  // ─────────────────────────────────────────────────────────────────────────

  async search(query: string, scope?: string) {
    const response = await this.client.get('/search/', {
      params: { q: query, scope },
    });
    return response.data;
  }

  async getSearchHistory() {
    const response = await this.client.get('/search/history/');
    return response.data;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Health & Status Endpoints
  // ─────────────────────────────────────────────────────────────────────────

  async getSystemHealth() {
    const response = await this.client.get('/health/status/');
    return response.data;
  }

  async getDashboardStats() {
    const response = await this.client.get('/dashboard/stats/');
    return response.data;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Error Handling Utility
  // ─────────────────────────────────────────────────────────────────────────

  static getErrorMessage(error: AxiosError<ApiErrorResponse>): string {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An error occurred';
  }

  static getFieldErrors(error: AxiosError<ApiErrorResponse>): Record<string, string> {
    const errors: Record<string, string> = {};
    if (error.response?.data?.errors) {
      Object.entries(error.response.data.errors).forEach(([field, messages]) => {
        errors[field] = Array.isArray(messages) ? messages[0] : messages;
      });
    }
    return errors;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
