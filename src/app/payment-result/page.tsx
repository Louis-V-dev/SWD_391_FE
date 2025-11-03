'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMomoCallback, usePaymentStatus } from '@/hooks/usePayment';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleCallback } = useMomoCallback();
  const { checkStatus } = usePaymentStatus();
  const { refreshPoints } = useAuth();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [message, setMessage] = useState('Đang xử lý thanh toán...');
  const [details, setDetails] = useState<any>(null);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Prevent duplicate processing (React Strict Mode runs effects twice in dev)
    if (hasProcessed) {
      console.log('⚠️ Payment already processed, skipping duplicate call');
      return;
    }
    
    const processPayment = async () => {
      setHasProcessed(true);
      
      // Get parameters from URL
      const requestId = searchParams.get('requestId');
      const orderId = searchParams.get('orderId');
      const resultCode = searchParams.get('resultCode');
      const momoMessage = searchParams.get('message');

      if (!requestId || !orderId || !resultCode) {
        setStatus('failed');
        setMessage('Thiếu thông tin thanh toán');
        return;
      }

      // Call backend to process payment
      try {
        await handleCallback({
          requestId,
          orderId,
          resultCode,
          message: momoMessage || ''
        });

        // Check payment status
        const statusResult = await checkStatus(orderId);
        
        setDetails({
          orderId,
          requestId,
          resultCode,
          message: momoMessage
        });

        if (resultCode === '0') {
          setStatus('success');
          setMessage('Thanh toán thành công!');
          
          // CRITICAL: Refresh points immediately after successful payment
          console.log('✅ Payment successful - refreshing points...');
          if (refreshPoints) {
            await refreshPoints();
            console.log('✅ Points refreshed successfully');
          }
          
          // Clear payment ID from session storage (payment completed, don't cancel)
          sessionStorage.removeItem('lastPaymentId');
        } else {
          setStatus('failed');
          setMessage(momoMessage || 'Thanh toán thất bại');
          // Keep payment ID in session for failed payments (user might retry)
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        setStatus('failed');
        setMessage('Có lỗi xảy ra khi xử lý thanh toán');
      }
    };

    processPayment();
  }, [searchParams, handleCallback, checkStatus, refreshPoints, hasProcessed]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {status === 'processing' && (
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-700 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {status === 'failed' && (
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-shake">
              <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="text-center mb-6">
          <h1 className={`text-2xl font-bold mb-2 ${
            status === 'success' ? 'text-green-600 dark:text-green-400' :
            status === 'failed' ? 'text-red-600 dark:text-red-400' :
            'text-blue-600 dark:text-blue-400'
          }`}>
            {status === 'processing' && 'Đang Xử Lý'}
            {status === 'success' && 'Thành Công'}
            {status === 'failed' && 'Thất Bại'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>

        {/* Payment Details */}
        {details && status !== 'processing' && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Mã đơn hàng:</span>
              <span className="font-mono text-gray-900 dark:text-white text-xs">{details.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Mã giao dịch:</span>
              <span className="font-mono text-gray-900 dark:text-white text-xs">{details.requestId}</span>
            </div>
            {status === 'success' && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-green-600 dark:text-green-400 text-center">
                  ✓ Điểm đã được cộng vào tài khoản của bạn
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {status === 'success' && (
            <>
              <Button
                onClick={() => router.push('/profile/points')}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Xem Điểm Của Tôi
              </Button>
              <Button
                onClick={() => router.push('/marketplace')}
                variant="outline"
                className="w-full"
              >
                Tiếp Tục Mua Sắm
              </Button>
            </>
          )}
          
          {status === 'failed' && (
            <>
              <Button
                onClick={() => router.push('/profile/points')}
                variant="outline"
                className="w-full"
              >
                Thử Lại
              </Button>
              <Button
                onClick={() => router.push('/marketplace')}
                variant="outline"
                className="w-full"
              >
                Quay Về Trang Chủ
              </Button>
            </>
          )}

          {status === 'processing' && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Vui lòng không đóng trang này...
            </p>
          )}
        </div>

        {/* Support Link */}
        {status === 'failed' && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cần hỗ trợ? {' '}
              <a href="mailto:support@greenloop.com" className="text-blue-500 hover:underline">
                Liên hệ chúng tôi
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}

