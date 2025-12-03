'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { capturePaypalOrder, getUserSubscription } from '@/services/subscription-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/store';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUserSubscription } = useEditorStore();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const processPayment = async () => {
      const token = searchParams.get('token');
      const payerId = searchParams.get('PayerID');

      if (!token) {
        setStatus('error');
        setMessage('Invalid payment information');
        return;
      }

      try {
        console.log('💳 Capturing payment with token:', token);
        const response = await capturePaypalOrder(token);
        
        if (response.success) {
          console.log('✅ Payment captured successfully');
          setStatus('success');
          setMessage('Payment successful! Your premium subscription is now active.');
          
          // Refresh subscription state
          console.log('🔄 Refreshing subscription state...');
          const subResponse = await getUserSubscription();
          if (subResponse.success) {
            console.log('✅ Subscription updated:', subResponse.data);
            setUserSubscription(subResponse.data);
          }
        } else {
          setStatus('error');
          setMessage(response.message || 'Failed to process payment');
        }
      } catch (error) {
        console.error('❌ Payment processing error:', error);
        setStatus('error');
        setMessage('An error occurred while processing your payment');
      }
    };

    processPayment();
  }, [searchParams, setUserSubscription]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'processing' && (
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'processing' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'error' && 'Payment Failed'}
          </CardTitle>
          <CardDescription className="mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          {status === 'success' && (
            <Button onClick={() => router.push('/editor')} className="w-full">
              Go to Editor
            </Button>
          )}
          {status === 'error' && (
            <>
              <Button onClick={() => router.push('/editor')} variant="outline">
                Back to Home
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
