export interface RouteOptions {
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  roles?: string[];
  permissions?: string[];
}

export interface RouteConfig {
  public: {
    paths: readonly string[];
    options: RouteOptions;
  };
  auth: {
    paths: readonly string[];
    options: RouteOptions;
  };
  special: {
    readonly [key: string]: string;
  };
}

export type RouteType = 'public' | 'auth' | 'special';
export type MiddlewareResponse = Response | null;
