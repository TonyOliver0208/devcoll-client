"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  RefreshCw,
  Home,
  Mail,
  Copy,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { getErrorMessage, isNetworkError, isServerError } from "@/lib/errors";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Simple error logging - backend handles complex tracking
    console.error("App Error:", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  const isNetworkIssue = isNetworkError(error);
  const isServerIssue = isServerError(error);
  const errorMessage = getErrorMessage(error);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    // Add small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      reset();
    } finally {
      setIsRetrying(false);
    }
  };

  const copyErrorDetails = async () => {
    const errorInfo = `Error ID: ${error.digest || "Unknown"}
Error Message: ${error.message}
Timestamp: ${new Date().toLocaleString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}`;

    try {
      await navigator.clipboard.writeText(errorInfo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.log("Failed to copy error details");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div
            className={`mx-auto h-16 w-16 mb-6 rounded-full flex items-center justify-center ${
              isServerIssue ? "bg-red-100" : "bg-orange-100"
            }`}
          >
            <AlertCircle
              className={`h-8 w-8 ${
                isServerIssue ? "text-red-600" : "text-orange-600"
              }`}
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isNetworkIssue ? "Connection Problem" : "Something Went Wrong"}
          </h1>

          <p className="text-gray-600 mb-4 leading-relaxed">{errorMessage}</p>

          {retryCount > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Retry attempt: {retryCount}{" "}
                {retryCount >= 3 && "(Consider refreshing the page)"}
              </p>
            </div>
          )}

          {process.env.NODE_ENV === "development" && (
            <details className="text-left bg-gray-50 rounded-lg p-4 mb-6 border">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-3 hover:text-gray-900">
                🔍 Error Details (Development)
              </summary>
              <div className="space-y-2 text-xs">
                <div className="bg-red-50 p-3 rounded border-l-4 border-red-200">
                  <p className="font-mono text-red-800 break-all">
                    <strong>Error:</strong> {error.message}
                  </p>
                </div>
                {error.digest && (
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                    <p className="text-blue-800">
                      <strong>Error ID:</strong> {error.digest}
                    </p>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRetrying ? "animate-spin" : ""}`}
            />
            {isRetrying
              ? "Retrying..."
              : retryCount > 0
              ? `Try Again (${retryCount + 1})`
              : "Try Again"}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/" className="block">
              <Button
                variant="outline"
                className="w-full py-2.5 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>

            <Link href="/questions" className="block">
              <Button
                variant="outline"
                className="w-full py-2.5 border-gray-300 hover:bg-gray-50"
              >
                Questions
              </Button>
            </Link>
          </div>

          {process.env.NODE_ENV === "development" && (
            <Button
              onClick={copyErrorDetails}
              variant="outline"
              className="w-full py-2.5 text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Error Details
                </>
              )}
            </Button>
          )}

          {isServerIssue && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3 text-center">
                Still having trouble? Contact our support team.
              </p>
              <Button
                variant="outline"
                className="w-full py-2.5 text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
                onClick={() =>
                  window.open(
                    "mailto:support@devcoll.com?subject=App Error&body=" +
                      encodeURIComponent(
                        `Error ID: ${error.digest || "Unknown"}\nError: ${
                          error.message
                        }\nTimestamp: ${new Date().toLocaleString()}`
                      ),
                    "_blank"
                  )
                }
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 mb-2">
            Error ID: {error.digest || "Unknown"}
          </p>
          <p className="text-xs text-gray-500">
            Timestamp: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
