const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiError extends Error {
  constructor(public status: number, public message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRerfreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

async function request<T>(endpoint: string, options: RequestInit = {}, isMultipart = false): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers = new Headers(options.headers);
  // Do NOT set Content-Type for multipart (FormData) — browser sets it with boundary
  if (!isMultipart) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized (Token Expired)
  if (response.status === 401 && typeof window !== 'undefined') {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken && !isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          localStorage.setItem('accessToken', refreshData.accessToken);
          localStorage.setItem('refreshToken', refreshData.refreshToken);
          isRefreshing = false;
          onRerfreshed(refreshData.accessToken);
          
          // Retry original request
          return request<T>(endpoint, options, isMultipart);
        }
      } catch (e) {
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Let the AuthProvider or the page handle the redirect by throwing
        throw new ApiError(401, 'Session expired. Please log in again.');
      }
    } else if (isRefreshing) {
      // Wait for refresh to complete then retry
      return new Promise<T>((resolve) => {
        subscribeTokenRefresh((newToken) => {
          resolve(request<T>(endpoint, options, isMultipart));
        });
      });
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'Something went wrong', data);
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
  // For multipart/form-data uploads (images, files) — DO NOT JSON.stringify, pass FormData directly
  upload: <T>(endpoint: string, formData: FormData, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'POST', body: formData }, true),
  uploadPut: <T>(endpoint: string, formData: FormData, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: formData }, true),
};
