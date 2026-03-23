/**
 * API Configuration
 * 
 * For LOCAL DEVELOPMENT:
 * Set USE_LOCAL_SERVER = true and ensure your backend server is running on localhost:5000
 * 
 * For PRODUCTION:
 * Set USE_LOCAL_SERVER = false to use Render backend
 */

// ⚠️ CHANGE THIS TO SWITCH BETWEEN LOCAL AND PRODUCTION
export const USE_LOCAL_SERVER = false; // Set to true for local development

// API Base URLs
// Replace 192.168.x.x with YOUR computer's actual IP address from "ipconfig"
const LOCAL_API_URL = 'http://192.168.x.x:5000'; // ← CHANGE THIS to your IP
const PRODUCTION_API_URL = 'https://govconnect-ad4s.onrender.com';

// Get the appropriate API URL based on environment
export const API_BASE_URL = USE_LOCAL_SERVER ? LOCAL_API_URL : PRODUCTION_API_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,

  // Data endpoints
  INTERNSHIPS: `${API_BASE_URL}/api/data/internships`,
  SCHOLARSHIPS: `${API_BASE_URL}/api/data/scholarships`,
  SCHEMES: `${API_BASE_URL}/api/data/schemes`,
  TRAINING: `${API_BASE_URL}/api/data/training`,

  // Recommendation endpoint (userId will be appended)
  RECOMMEND: `${API_BASE_URL}/api/recommend`,
};

// Helper function to get data details endpoint
export const getDataDetailsEndpoint = (category: string, id: string) => {
  return `${API_BASE_URL}/api/data/${category}/${id}`;
};

// Debug helper - logs which environment is being used
export const logApiConfig = () => {
  console.log('🔗 API Configuration:', {
    environment: USE_LOCAL_SERVER ? 'LOCAL' : 'PRODUCTION',
    baseUrl: API_BASE_URL,
  });
};
