import { API_BASE_URL } from '@/config/api';

/**
 * Creates a fully qualified API URL by appending the endpoint to the base URL
 */
export const createApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with '/' and remove any trailing '/'
  const formattedEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`;
    
  return `${API_BASE_URL}${formattedEndpoint}`;
};

/**
 * Helper to handle API response and extract data or throw appropriate errors
 */
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || `API error: ${response.status} ${response.statusText}`
    );
  }
  
  const data = await response.json();
  return data;
};

/**
 * Standard fetch options with JSON headers
 */
export const defaultFetchOptions = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}; 