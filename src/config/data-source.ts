// Configuration for data source
// Set to true to use mock data, false to use React Query API calls

export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || false;

export const config = {
  useMockData: USE_MOCK_DATA,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000/api/v1',
  retryAttempts: 3,
  staleTime: 5 * 60 * 1000, // 5 minutes
};
