// Configuration for data source
// Set to true to use mock data, false to use React Query API calls

export const USE_MOCK_DATA = false; // Change this to false when backend is ready

export const config = {
  useMockData: USE_MOCK_DATA,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  retryAttempts: 3,
  staleTime: 5 * 60 * 1000, // 5 minutes
};
