import { auth } from "./auth";
import { AuthMiddleware } from "@/lib/middleware/auth";
import {routeConfig} from "@/config/routes";

export default auth((req) => {
  const authMiddleware = new AuthMiddleware(req, !!req.auth);
  return authMiddleware.handleRequest();
});

export const config = {
  matcher: [
    "/",
    ...routeConfig.auth.paths.map(path => `${path}/:path*`),
    ...Object.values(routeConfig.special)
  ]
};
