/**
 * API Client Service
 * 
 * This service provides a centralized client for making API requests to the backend.
 * It handles authentication, error handling, and request/response interceptors.
 */

import { logError } from './errorLogging';

// API base URL from environment variables
// @ts-ignore - Vite provides import.meta.env but TypeScript doesn't recognize it
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Default request options
const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Get the authentication token from local storage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Add authentication headers to the request if a token is available
 */
const addAuthHeaders = (options: RequestInit): RequestInit => {
  const token = getAuthToken();
  
  if (!token) {
    return options;
  }
  
  return {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  };
};

/**
 * Handle API response
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  // Check if the response is OK (status code 200-299)
  if (!response.ok) {
    // Try to parse the error response
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    
    // Create an error object
    const error = new Error(errorData.message || 'An error occurred while fetching data');
    
    // Log the error
    logError(error, {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorData,
    });
    
    // Throw the error
    throw error;
  }
  
  // Parse the response as JSON
  return response.json();
};

/**
 * Make a GET request to the API
 */
export const get = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  try {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const requestOptions = addAuthHeaders({
      ...defaultOptions,
      ...options,
      method: 'GET',
    });
    
    const response = await fetch(url, requestOptions);
    return handleResponse<T>(response);
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('GET request failed');
    logError(errorObj, { endpoint, originalError: error });
    throw error;
  }
};

/**
 * Make a POST request to the API
 */
export const post = async <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
  try {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const requestOptions = addAuthHeaders({
      ...defaultOptions,
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    const response = await fetch(url, requestOptions);
    return handleResponse<T>(response);
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('POST request failed');
    logError(errorObj, { endpoint, data, originalError: error });
    throw error;
  }
};

/**
 * Make a PUT request to the API
 */
export const put = async <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
  try {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const requestOptions = addAuthHeaders({
      ...defaultOptions,
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    const response = await fetch(url, requestOptions);
    return handleResponse<T>(response);
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('PUT request failed');
    logError(errorObj, { endpoint, data, originalError: error });
    throw error;
  }
};

/**
 * Make a DELETE request to the API
 */
export const del = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  try {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const requestOptions = addAuthHeaders({
      ...defaultOptions,
      ...options,
      method: 'DELETE',
    });
    
    const response = await fetch(url, requestOptions);
    return handleResponse<T>(response);
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('DELETE request failed');
    logError(errorObj, { endpoint, originalError: error });
    throw error;
  }
};

/**
 * API client object with all HTTP methods
 */
export const api = {
  get,
  post,
  put,
  delete: del,
};

export default api;