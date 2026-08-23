/**
 * Vyuha Python FastAPI Backend Client
 */

export const API_BASE_URL = 'http://localhost:8000/api';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // 3-second timeout — if the backend is offline the local ML fallback kicks in immediately
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'An unexpected API error occurred.' }));
      throw new Error(errorData.detail || `HTTP Error ${response.status}`);
    }

    return response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
