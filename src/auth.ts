import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import axios, { AxiosError } from "axios";

// Auth-service configuration via API Gateway
// Backend runs on port 4000 with /api/v1 prefix
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:4000/api/v1";
const AUTH_API_BASE = `${API_GATEWAY_URL}/auth`;

// Create axios instance with default config
const authApi = axios.create({
  baseURL: AUTH_API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for consistent error handling
authApi.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    console.error("🚨 [Auth API] Request failed:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      isBackendDown:
        error.code === "ECONNREFUSED" || error.code === "ENOTFOUND",
    });
    return Promise.reject(error);
  }
);

// Type for auth service responses
interface AuthServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
  requestId?: string;
}

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    refreshTokenExpires?: number;
    error?: string;
  }
}

/**
 * MANDATORY: Call auth-service via API Gateway to validate Google tokens and get internal tokens
 */
async function exchangeGoogleTokens(account: any) {
  try {
    console.log("🔄 [NextAuth] MANDATORY: Validating with auth-service...");
    console.log("🔍 [NextAuth] Request details:", {
      url: `${AUTH_API_BASE}/google`,
      hasIdToken: !!account.id_token,
      tokenLength: account.id_token?.length || 0
    });

    const response: AuthServiceResponse = await authApi.post("/google", {
      token: account.id_token,
      tokenType: "id_token"
    });

    console.log("✅ [NextAuth] Backend validation successful - user authorized");
    console.log("🔍 [NextAuth] Response structure:", {
      success: response.success,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : []
    });

    if (response.success && response.data) {
      const { accessToken, refreshToken, expiresIn, refreshExpiresIn } = response.data;

      console.log("🔍 [NextAuth] Token validation:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        expiresIn,
        refreshExpiresIn
      });

      return {
        accessToken,
        refreshToken,
        accessTokenExpires: expiresIn
          ? Date.now() + expiresIn * 1000
          : Date.now() + 15 * 60 * 1000,
        refreshTokenExpires: refreshExpiresIn
          ? Date.now() + refreshExpiresIn * 1000
          : Date.now() + 7 * 24 * 60 * 60 * 1000,
      };
    }

    console.error("❌ [NextAuth] Auth service returned invalid response structure");
    throw new Error("Auth service returned invalid response");
  } catch (error) {
    console.error("🚨 [NextAuth] exchangeGoogleTokens failed:");
    
    if (axios.isAxiosError(error)) {
      console.error("🔍 [NextAuth] Axios error details:", {
        code: error.code,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
        console.error("🚨 [NextAuth] AUTH SERVICE IS DOWN - Login blocked!");
        console.error("🔧 Please start your auth-service and api-gateway");
      } else if (error.response?.status === 401) {
        console.error("🚫 [NextAuth] Google token rejected by auth-service");
      } else {
        console.error("❌ [NextAuth] Auth service error:", error.response?.data);
      }
    } else {
      console.error("❌ [NextAuth] Non-axios error:", error);
    }

    throw error; // This will be caught by signIn callback
  }
}

/**
 * Refresh internal tokens using auth-service via API Gateway
 */
async function refreshAccessToken(token: any) {
  try {
    console.log("🔄 [NextAuth] Refreshing access token with backend...");
    console.log("🔍 [NextAuth] Refresh token preview:", {
      hasRefreshToken: !!token.refreshToken,
      refreshTokenLength: token.refreshToken?.length || 0,
      accessTokenExpires: token.accessTokenExpires ? new Date(token.accessTokenExpires).toISOString() : 'N/A'
    });

    const response: AuthServiceResponse = await authApi.post(
      "/refresh",
      { refreshToken: token.refreshToken },
      {
        headers: {
          Authorization: `Bearer ${token.refreshToken}`,
        },
      }
    );

    console.log("✅ [NextAuth] Token refresh successful");

    if (response.success && response.data) {
      const newAccessTokenExpires = response.data.expiresIn
        ? Date.now() + response.data.expiresIn * 1000
        : Date.now() + 15 * 60 * 1000;
      
      console.log("🔍 [NextAuth] New token details:", {
        hasNewAccessToken: !!response.data.accessToken,
        hasNewRefreshToken: !!response.data.refreshToken,
        newAccessTokenExpires: new Date(newAccessTokenExpires).toISOString()
      });

      return {
        ...token,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken || token.refreshToken,
        accessTokenExpires: newAccessTokenExpires,
        error: undefined,
      };
    }

    console.error("❌ [NextAuth] Invalid refresh response structure");
    return { ...token, error: "RefreshAccessTokenError" };
  } catch (error) {
    console.error("❌ [NextAuth] Token refresh failed:", error);
    
    // Log specific error details
    if (axios.isAxiosError(error)) {
      console.error("🔍 [NextAuth] Refresh error details:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        isInvalidToken: error.response?.status === 401
      });
      
      // 401 means the refresh token is invalid/expired
      if (error.response?.status === 401) {
        console.error("🚫 [NextAuth] Refresh token is invalid/expired - marking for re-authentication");
      }
    }
    
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export async function getCurrentUser(accessToken: string) {
  try {
    const response: AuthServiceResponse = await authApi.get("/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.success ? response.data : null;
  } catch (error) {
    console.error("❌ [Auth] Error getting current user:", error);
    return null;
  }
}

export async function logoutUser(accessToken: string, refreshToken?: string) {
  try {
    const response: AuthServiceResponse = await authApi.post(
      "/logout",
      { refreshToken },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.success || false;
  } catch (error) {
    console.error("❌ [Auth] Error during logout:", error);
    return false;
  }
}

export async function logoutAllDevices(accessToken: string) {
  try {
    const response: AuthServiceResponse = await authApi.post(
      "/logout-all",
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.success || false;
  } catch (error) {
    console.error("❌ [Auth] Error during logout all devices:", error);
    return false;
  }
}

/**
 * Helper function to get user-friendly error messages for authentication errors
 */
export function getAuthErrorMessage(error?: string | null): { title: string; message: string; action: string } {
  switch (error) {
    case "ServiceUnavailable":
      return {
        title: "Authentication Service Unavailable",
        message: "Our authentication service is currently unavailable. Please try again in a few minutes.",
        action: "Try Again Later"
      };
    
    case "AuthenticationFailed":
      return {
        title: "Authentication Failed",
        message: "We couldn't verify your Google account. Please try signing in again.",
        action: "Try Again"
      };
    
    case "AuthServiceError":
      return {
        title: "Authentication Error",
        message: "There was a problem with the authentication service. Please try again or contact support if the issue persists.",
        action: "Try Again"
      };
    
    case "Configuration":
      return {
        title: "Configuration Error",
        message: "There's a configuration issue with the authentication service. Please contact support.",
        action: "Contact Support"
      };

    default:
      return {
        title: "Sign In Error",
        message: "An unexpected error occurred during sign in. Please try again.",
        action: "Try Again"
      };
  }
}

/**
 * Check if the authentication service is available
 * Use this internally to validate service status before auth attempts
 */
export async function checkAuthServiceHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_GATEWAY_URL}/health`, {
      timeout: 3000, // Shorter timeout for health checks
    });
    return response.status === 200;
  } catch (error) {
    console.error("❌ [Auth] Service health check failed:", error);
    return false;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    // Custom error page for authentication failures
    error: '/auth/error',
    signIn: '/auth/signin', // Optional: Custom sign-in page
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days - matches refresh token lifetime
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    // 🔥 CRITICAL: This callback completely blocks sign-in if backend validation fails
    async signIn({ user, account, profile }) {
      console.log("🔐 [NextAuth] SignIn callback - checking backend validation");
      console.log("🔍 [NextAuth] SignIn params:", {
        hasUser: !!user,
        hasAccount: !!account,
        hasProfile: !!profile,
        accountType: account?.type,
        accountProvider: account?.provider
      });

      // For OAuth providers, MANDATORY backend validation
      if ((account?.type === "oauth" || account?.type === "oidc") && account?.provider === "google") {
        console.log("🔄 [NextAuth] OAuth sign-in detected - backend validation REQUIRED");
        console.log("🔍 [NextAuth] Account details:", {
          provider: account.provider,
          type: account.type,
          hasAccessToken: !!account.access_token,
          hasIdToken: !!account.id_token,
          hasRefreshToken: !!account.refresh_token
        });

        try {
          console.log("🔄 [NextAuth] About to call exchangeGoogleTokens...");
          
          // Attempt backend validation and get tokens - this MUST succeed
          const authTokens = await exchangeGoogleTokens(account);
          
          console.log("✅ [NextAuth] Backend validation successful - allowing sign-in");
          
          // Store tokens on account object for JWT callback to use
          (account as any).backendTokens = authTokens;
          
          return true; // ✅ Allow authentication to continue
        } catch (error) {
          console.error("🚨 [NextAuth] Backend validation FAILED - BLOCKING sign-in");
          console.error("🚫 [NextAuth] User will NOT be authenticated");
          console.error("🔍 [NextAuth] Error details:", error);

          // Add specific error handling for different scenarios
          if (axios.isAxiosError(error)) {
            if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
              // Backend service is down
              console.error("🚨 [NextAuth] Redirecting to service unavailable error");
              return false; // Block sign-in
            } else if (error.response?.status === 401) {
              // Google token rejected by auth service
              console.error("🚫 [NextAuth] Redirecting to authentication error");
              return false; // Block sign-in
            } else {
              // Other auth service errors
              console.error("❌ [NextAuth] Redirecting to general auth error");
              console.error("❌ [NextAuth] Status:", error.response?.status);
              console.error("❌ [NextAuth] Data:", error.response?.data);
              return false; // Block sign-in
            }
          }

          // Generic error
          console.error("❌ [NextAuth] Generic error - blocking sign-in");
          return false; // Block sign-in
        }
      }

      console.log("✅ [NextAuth] Non-OAuth sign-in or different provider - allowing");
      return true; // Allow other sign-in methods
    },

    async jwt({ token, account, user, trigger }) {
      // Initial sign in - use backend tokens from signIn callback (already validated)
      if (account && (account.type === "oauth" || account.type === "oidc")) {
        console.log("🔐 [NextAuth] JWT callback - using backend tokens from signIn");
        console.log("🔍 [NextAuth] Account details:", {
          provider: account.provider,
          type: account.type,
          hasIdToken: !!account.id_token,
          hasBackendTokens: !!(account as any).backendTokens
        });

        // Use tokens from signIn callback instead of calling backend again
        const authTokens = (account as any).backendTokens;
        
        if (authTokens) {
          console.log("✅ [NextAuth] Using backend tokens from signIn callback");
          console.log("🔍 [NextAuth] Token summary:", {
            hasAccessToken: !!authTokens.accessToken,
            hasRefreshToken: !!authTokens.refreshToken,
            accessTokenExpires: new Date(authTokens.accessTokenExpires).toISOString()
          });
          
          return {
            ...token,
            accessToken: authTokens.accessToken,
            refreshToken: authTokens.refreshToken,
            accessTokenExpires: authTokens.accessTokenExpires,
            refreshTokenExpires: authTokens.refreshTokenExpires,
            error: undefined, // Clear any previous errors
          };
        } else {
          console.error("🚨 [NextAuth] No backend tokens found from signIn callback");
          return { ...token, error: "NoBackendTokens" };
        }
      }

      // 🔥 If there's a token error, don't continue - force re-authentication
      if (token.error === "RefreshAccessTokenError") {
        console.error("🚫 [NextAuth] Token refresh previously failed - session invalid");
        return { ...token, error: "RefreshAccessTokenError" };
      }

      // Handle token refresh
      if (
        token.accessTokenExpires &&
        Date.now() < (token.accessTokenExpires as number)
      ) {
        console.log("✅ [NextAuth] Access token still valid");
        return token;
      }

      // Access token expired, refresh it
      if (token.refreshToken) {
        console.log("🔄 [NextAuth] Access token expired, refreshing...");
        return refreshAccessToken(token);
      }

      console.error("❌ [NextAuth] No valid refresh token available");
      return { ...token, error: "RefreshAccessTokenError" };
    },

    async session({ session, token }) {
      console.log("📋 [NextAuth] Session callback - creating session");

      // 🔥 CRITICAL: If token refresh failed, throw error to force re-authentication
      if (token.error === "RefreshAccessTokenError") {
        console.error("🚫 [NextAuth] Session blocked - refresh token failed, user must re-login");
        throw new Error("Session expired. Please sign in again.");
      }

      // 🔥 CRITICAL: Only create session if we have valid backend tokens
      if (!token.accessToken || !token.refreshToken) {
        console.error(
          "🚫 [NextAuth] Session creation BLOCKED - missing backend tokens"
        );
        console.error("🔍 [NextAuth] Token state:", {
          hasAccessToken: !!token.accessToken,
          hasRefreshToken: !!token.refreshToken,
          tokenError: token.error,
        });

        // 🔥 CRITICAL: Throw error to prevent session creation
        throw new Error("Authentication failed: No valid backend tokens");
      }

      // Attach backend tokens to session
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;

      if (token.sub) {
        session.user.id = token.sub;
      }

      console.log(
        "✅ [NextAuth] Session created successfully with backend tokens"
      );
      console.log("🔍 [NextAuth] Session summary:", {
        user: session.user.email,
        hasAccessToken: !!session.accessToken,
        hasRefreshToken: !!session.refreshToken,
      });

      return session;
    },
  },
});
