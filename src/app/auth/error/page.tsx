"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAuthErrorMessage, checkAuthServiceHealth } from "@/auth";
import { useState, useEffect } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isServiceHealthy, setIsServiceHealthy] = useState<boolean | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const errorInfo = getAuthErrorMessage(error);

  useEffect(() => {
    // Check service health on component mount
    checkServiceHealth();
  }, []);

  const checkServiceHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const healthy = await checkAuthServiceHealth();
      setIsServiceHealthy(healthy);
    } catch (error) {
      setIsServiceHealthy(false);
    }
    setIsCheckingHealth(false);
  };

  const handleRetry = () => {
    // Redirect back to sign in
    window.location.href = "/api/auth/signin";
  };

  const getServiceStatusMessage = () => {
    if (isCheckingHealth) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Checking service status...
        </div>
      );
    }

    if (isServiceHealthy === true) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          Service is available - you can try again
        </div>
      );
    }

    if (isServiceHealthy === false) {
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <div className="h-2 w-2 bg-red-500 rounded-full"></div>
          Service is currently unavailable
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            {errorInfo.title}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {errorInfo.message}
          </p>

          {/* Service Status Indicator */}
          <div className="mb-6 p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Service Status:</span>
              {getServiceStatusMessage()}
            </div>
            
            <button
              onClick={checkServiceHealth}
              disabled={isCheckingHealth}
              className="mt-2 text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
            >
              Check again
            </button>
          </div>

          {/* Error Details (Development Mode) */}
          {process.env.NODE_ENV === "development" && error && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
              <p className="text-xs font-mono text-gray-600">
                <strong>Error Code:</strong> {error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={isServiceHealthy === false}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {errorInfo.action}
            </button>
            
            <Link
              href="/"
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              If this problem persists, please{" "}
              <a
                href="/contact"
                className="text-blue-600 hover:text-blue-500"
              >
                contact support
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}