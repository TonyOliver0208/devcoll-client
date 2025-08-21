import { NextRequest } from 'next/server';
import { routeConfig } from '@/config/routes';
import { MiddlewareResponse, RouteType } from '@/types/route';
import { SPECIAL_ROUTES } from '@/constants/routes';

export class AuthMiddleware {
  private readonly request: NextRequest;
  private readonly isAuthenticated: boolean;
  private readonly currentPath: string;

  constructor(request: NextRequest, isAuthenticated: boolean) {
    this.request = request;
    this.isAuthenticated = isAuthenticated;
    this.currentPath = request.nextUrl.pathname;
  }

  private redirect(path: string): Response {
    return Response.redirect(new URL(path, this.request.url));
  }

  private getRouteType(): RouteType | null {
    if (this.isSpecialRoute()) return 'special';
    if (this.isPublicRoute()) return 'public';
    if (this.isAuthRoute()) return 'auth';
    return null;
  }

  private isSpecialRoute(): boolean {
    return Object.values(SPECIAL_ROUTES).some(path => 
      this.currentPath.startsWith(path)
    );
  }

  private isPublicRoute(): boolean {
    return routeConfig.public.paths.some(path => 
      this.currentPath.startsWith(path)
    );
  }

  private isAuthRoute(): boolean {
    return routeConfig.auth.paths.some(path => 
      this.currentPath.startsWith(path)
    );
  }

  private handleAuthenticatedUser(): MiddlewareResponse {
    if (this.currentPath.startsWith(SPECIAL_ROUTES.LOGIN)) {
      return this.redirect('/');
    }
    return null;
  }

  private handleUnauthenticatedUser(): MiddlewareResponse {
    const routeType = this.getRouteType();
    
    if (routeType === 'public' || routeType === 'special') {
      return null;
    }
    
    return this.redirect(SPECIAL_ROUTES.LOGIN);
  }

  public handleRequest(): MiddlewareResponse {
    try {
      return this.isAuthenticated 
        ? this.handleAuthenticatedUser()
        : this.handleUnauthenticatedUser();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return this.redirect(SPECIAL_ROUTES.LOGIN);
    }
  }
}
