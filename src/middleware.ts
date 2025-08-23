import { auth } from "./auth";
import { AuthMiddleware } from "@/lib/middleware/auth";
import {routeConfig} from "@/config/routes";

export default auth((req) => {
  const authMiddleware = new AuthMiddleware(req, !!req.auth);
  return authMiddleware.handleRequest();
});

export const config = {
  matcher: [
    '/',
    '/profile/:path*',
    '/settings/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
    '/forgot-password'
  ]
};
