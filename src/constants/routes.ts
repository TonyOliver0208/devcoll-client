export const AUTH_ROUTES = {
  PROFILE: '/profile',
  SETTINGS: '/settings',
  DASHBOARD: '/dashboard',
  ADD_QUESTION: '/questions/add'
} as const;

export const PUBLIC_ROUTES = {
  HOME: '/',
  QUESTIONS: '/questions',
  POSTS: '/posts',
  MEDIA: '/media'
} as const;

export const SPECIAL_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password'
} as const;

export const DEFAULT_ROUTE_OPTIONS = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
  }
} as const;
