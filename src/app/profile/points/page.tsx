'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PointsDashboard } from '@/components/points/PointsDashboard';
import { BuyPointsModal } from '@/components/points/BuyPointsModal';
import { useExpiringPoints } from '@/hooks/usePoints';
import { usePaymentHistory } from '@/hooks/usePayment';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import * as paymentApi from '@/api/payment';

export default function UserPointsPage() {
  const { user, refreshPoints } = useAuth();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [showCancelNotification, setShowCancelNotification] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const { history, loading, fetchHistory } = usePaymentHistory(user?.userId);
  const { expiringPoints, notify } = useExpiringPoints(user?.userId, 7);

  // Check for payment return (success or failure)
  useEffect(() => {
    const handlePaymentReturn = async () => {
      // Check URL parameters for MoMo callback
      const urlParams = new URLSearchParams(window.location.search);
      const resultCode = urlParams.get('resultCode');
      const orderId = urlParams.get('orderId');
      const lastPaymentId = sessionStorage.getItem('lastPaymentId');

      if (resultCode !== null && orderId) {
        // MoMo returned with payment result
        console.log('Payment returned with resultCode:', resultCode);
        
        if (resultCode === '0') {
          // Payment successful (resultCode 0 = success in MoMo)
          console.log('✅ Payment successful!');
          setShowSuccessNotification(true);
          
          // Refresh points immediately
          if (refreshPoints) {
            await refreshPoints();
          }
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => setShowSuccessNotification(false), 5000);
        } else {
          // Payment failed or cancelled
          console.log('❌ Payment failed or cancelled');
          
          if (lastPaymentId) {
            try {
              await paymentApi.cancelPayment(lastPaymentId);
              setShowCancelNotification(true);
              setTimeout(() => setShowCancelNotification(false), 5000);
            } catch (error) {
              console.error('Failed to cancel payment:', error);
            }
          }
        }
        
        // Clear session storage
        sessionStorage.removeItem('lastPaymentId');
        
        // Refresh payment history
        if (fetchHistory) {
          await fetchHistory();
        }
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handlePaymentReturn();
  }, [fetchHistory, refreshPoints]);
  
  // Fetch payment history on mount
  useEffect(() => {
    if (fetchHistory) {
      fetchHistory();
    }
  }, [fetchHistory]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-200">Payment Successful!</h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Your points have been added to your account.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Cancellation Notification */}
      {showCancelNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 shadow-lg">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 dark:text-orange-200">Payment Cancelled</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Your payment has been cancelled. No charges were made.
                </p>
              </div>
              <button
                onClick={() => setShowCancelNotification(false)}
                className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Points</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and track your sustainability points</p>
      </div>

      {/* Expiring Points Alert */}
      {expiringPoints.length > 0 && (
        <Card className="p-4 mb-6 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">Points Expiring Soon!</h3>
              <p className="text-sm text-orange-700 mt-1">
                You have {expiringPoints.reduce((sum, t) => sum + t.pointsAmount, 0)} points expiring in the next 7 days.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => notify()}
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Remind Me
            </Button>
          </div>
        </Card>
      )}

      {/* Points Dashboard */}
      <PointsDashboard userId={user.userId} />

      {/* Payment History */}
      <Card className="mt-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment History</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">All your point purchases via MoMo</p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : !history || history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No payment history yet</p>
              <Button
                onClick={() => setIsBuyModalOpen(true)}
                className="mt-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                Buy Your First Points
              </Button>
            </div>
          ) : (
            <>
              {history.map((payment) => (
                <div key={payment.paymentId} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900 dark:text-white">{payment.description}</h3>
                        <Badge
                          variant={
                            payment.paymentStatus === 'COMPLETED' ? 'success' :
                            payment.paymentStatus === 'PENDING' ? 'warning' :
                            payment.paymentStatus === 'CANCELLED' ? 'outline' :
                            payment.paymentStatus === 'FAILED' ? 'error' : 'outline'
                          }
                        >
                          {payment.paymentStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{new Date(payment.createdAt).toLocaleString()}</span>
                        <span className="text-gray-600 dark:text-gray-300">
                          Amount: {payment.amount?.toLocaleString()} VND
                        </span>
                        {payment.updatedAt && payment.updatedAt !== payment.createdAt && (
                          <span className="text-xs">
                            Updated: {new Date(payment.updatedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        payment.paymentStatus === 'COMPLETED'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {payment.paymentStatus === 'COMPLETED' ? '+' : ''}
                        {payment.pointsPurchased?.toLocaleString()} pts
                      </div>
                      {payment.paymentStatus === 'CANCELLED' && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Not charged</p>
                      )}
                      {payment.paymentStatus === 'FAILED' && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">Transaction failed</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Card>

      {/* Buy Points Modal */}
      <BuyPointsModal
        isOpen={isBuyModalOpen}
        onClose={() => {
          setIsBuyModalOpen(false);
          if (fetchHistory) {
            fetchHistory();
          }
        }}
      />
    </div>
  );
}



















