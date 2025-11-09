import Link from "next/link";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/layout/AppLayout";

export default function NotFound() {
  return (
    <AppLayout fullWidth>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 w-full">
        <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Question Not Found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The question you're looking for doesn't exist or may have been removed.
        </p>
        
        <div className="space-y-4">
          <div className="flex gap-4 justify-center">
            <Link href="/questions">
              <Button variant="outline">
                Browse Questions
              </Button>
            </Link>
            <Link href="/">
              <Button>
                Go Home
              </Button>
            </Link>
          </div>
          
          <Link 
            href="/questions" 
            className="block text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Questions
          </Link>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
