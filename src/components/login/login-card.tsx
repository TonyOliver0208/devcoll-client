"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { RefreshCw } from "lucide-react";
import { checkAuthServiceHealth } from "@/auth";
import { toast, Toaster } from "react-hot-toast";

function LoginCard() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  useEffect(() => {
    // Show error toast if there's an error in URL
    if (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
        style: {
          borderRadius: '12px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#DC2626',
          fontSize: '14px'
        }
      });
    }
  }, [error]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "OAuthSignin":
        return "Sign in failed. Please try again.";
      case "OAuthCallback":
        return "Authentication failed. Please try again.";
      case "OAuthCreateAccount":
        return "Account creation failed. Please try again.";
      case "Callback":
        return "Service temporarily unavailable. Please try again.";
      default:
        return "Sign in failed. Please try again.";
    }
  };

  const handleSignIn = async (provider: "google" | "github") => {
    setIsLoading(true);
    setLoadingProvider(provider);

    try {
      // Quick health check before attempting sign in
      const isHealthy = await checkAuthServiceHealth();
      
      if (!isHealthy) {
        toast.error("Service temporarily unavailable. Please try again in a moment.", {
          duration: 4000,
          position: "top-center",
          style: {
            borderRadius: '12px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            fontSize: '14px'
          }
        });
        return;
      }

      // Proceed with sign in
      await signIn(provider, { callbackUrl: "/" });
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      toast.error("Sign in failed. Please try again.", {
        duration: 4000,
        position: "top-center",
        style: {
          borderRadius: '12px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#DC2626',
          fontSize: '14px'
        }
      });
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <>
      <Toaster 
        toastOptions={{
          className: '',
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontSize: '14px',
            fontWeight: '500'
          }
        }}
      />
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4 transition-all duration-300">
        <div className="space-y-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800">
              Welcome to DevColl
            </h3>
            <p className="mt-3 text-gray-500">
              Sign in with your Google or GitHub account to join the developer
              community
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              disabled={isLoading}
              className={`
                w-full h-12 flex items-center justify-center gap-3 
                bg-white text-gray-700 border border-gray-300
                hover:bg-gray-50 hover:border-blue-200 hover:shadow-md
                transition-all duration-200
                group transform hover:scale-[1.01] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              `}
              onClick={() => handleSignIn("google")}
            >
              {loadingProvider === "google" ? (
                <RefreshCw className="h-[18px] w-[18px] animate-spin" />
              ) : (
                <div className="flex items-center justify-center">
                  <Image
                    src="/google.svg"
                    alt="Google"
                    width={18}
                    height={18}
                    className="w-[18px] h-[18px]"
                  />
                </div>
              )}
              <span className="font-medium">
                {loadingProvider === "google"
                  ? "Signing in..."
                  : "Continue with Google"}
              </span>
            </Button>

            <Button
              variant="outline"
              disabled={isLoading}
              className={`
                w-full h-12 flex items-center justify-center gap-3 
                bg-[#24292F] text-white border-[#24292F]
                hover:bg-[#31373D] hover:border-[#31373D] hover:shadow-md
                transition-all duration-200
                group transform hover:scale-[1.01] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              `}
              onClick={() => handleSignIn("github")}
            >
              {loadingProvider === "github" ? (
                <RefreshCw className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Image
                  src="/github-mark-white.svg"
                  alt="GitHub"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              )}
              <span className="font-medium">
                {loadingProvider === "github"
                  ? "Signing in..."
                  : "Continue with GitHub"}
              </span>
            </Button>
          </div>
          
          {/* Clean footer message */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{" "}
              <a href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginCard;
