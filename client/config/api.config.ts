import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * API Configuration
 * 
 * For LOCAL DEVELOPMENT:
 * Set USE_LOCAL_SERVER = true (default) to connect to your backend server running on port 5000
 * 
 * For PRODUCTION:
 * Set USE_LOCAL_SERVER = false to use Render backend
 */

export const USE_LOCAL_SERVER = true; // Set to true for local development

const getLocalHostUrl = () => {
  // Extract host IP dynamically from Expo manifest (works seamlessly for Expo Go on physical phones & emulators)
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  // Fallback to computer's current Wi-Fi LAN IP / localhost
  return 'http://192.168.0.217:5000';
};

const LOCAL_API_URL = getLocalHostUrl();
const PRODUCTION_API_URL = 'https://govconnect-ad4s.onrender.com';

// Get the appropriate API URL based on environment
export const API_BASE_URL = USE_LOCAL_SERVER ? LOCAL_API_URL : PRODUCTION_API_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  COMPLETE_PROFILE: `${API_BASE_URL}/api/user/complete-profile`,
  PARSE_RESUME: `${API_BASE_URL}/api/resume/parse`,

  // Data endpoints
  INTERNSHIPS: `${API_BASE_URL}/api/data/internships`,
  SCHOLARSHIPS: `${API_BASE_URL}/api/data/scholarships`,
  SCHEMES: `${API_BASE_URL}/api/data/schemes`,
  TRAINING: `${API_BASE_URL}/api/data/training`,

  // Recommendation endpoint (userId will be appended)
  RECOMMEND: `${API_BASE_URL}/api/recommend`,
};

// Helper function to get user endpoint
export const getUserEndpoint = (userId: string) => {
  return `${API_BASE_URL}/api/user/${userId}`;
};

// Helper function to get data details endpoint
export const getDataDetailsEndpoint = (category: string, id: string) => {
  return `${API_BASE_URL}/api/data/${category}/${id}`;
};

/**
 * Helper function to safely fetch JSON from an API endpoint without throwing
 * "SyntaxError: Unexpected token '<'" on HTML 404/500 error pages.
 */
export const safeFetchJson = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options);
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw new Error(`Server error (${res.status})`);
    }
    throw new Error('Server returned non-JSON response');
  }
  if (!res.ok) {
    throw new Error(json?.message || json?.error || `Server error (${res.status})`);
  }
  return json;
};

// Debug helper - logs which environment is being used
export const logApiConfig = () => {
  console.log('🔗 API Configuration:', {
    environment: USE_LOCAL_SERVER ? 'LOCAL' : 'PRODUCTION',
    baseUrl: API_BASE_URL,
  });
};
