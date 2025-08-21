import { RouteConfig } from '@/types/route';
import { AUTH_ROUTES, PUBLIC_ROUTES, SPECIAL_ROUTES, DEFAULT_ROUTE_OPTIONS } from '@/constants/routes';

export const routeConfig: RouteConfig = {
  public: {
    paths: Object.values(PUBLIC_ROUTES),
    options: {
      ...DEFAULT_ROUTE_OPTIONS
    }
  },
  auth: {
    paths: Object.values(AUTH_ROUTES),
    options: {
      ...DEFAULT_ROUTE_OPTIONS,
      roles: ['user'],
      permissions: ['read']
    }
  },
  special: SPECIAL_ROUTES
} as const;

// Helper functions to check route types
export const isPublicRoute = (path: string): boolean => {
  return routeConfig.public.paths.some(publicPath => 
    path.startsWith(publicPath)
  );
};

export const isAuthRoute = (path: string): boolean => {
  return routeConfig.auth.paths.some(authPath => 
    path.startsWith(authPath)
  );
};

export const isSpecialRoute = (path: string): boolean => {
  return Object.values(routeConfig.special).some(specialPath => 
    path.startsWith(specialPath)
  );
};
