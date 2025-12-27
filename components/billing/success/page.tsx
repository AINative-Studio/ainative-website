// src/app/billing/success/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-500/20 p-3 rounded-full">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-400 mb-6">
          Thank you for your purchase. Your subscription has been activated.
        </p>
        <div className="space-y-3">
          <Button 
            onClick={() => router.push('/dashboard')} 
            className="w-full"
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/billing')}
            className="w-full"
          >
            View Billing
          </Button>
        </div>
      </div>
    </div>
  );
}