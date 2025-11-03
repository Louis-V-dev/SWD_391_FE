'use client';

import { useState } from 'react';
import { useBuyPoints } from '@/hooks/usePayment';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

interface BuyPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Predefined point packages (10,000 min - 10,000,000 max)
const POINT_PACKAGES = [
  { points: 10000, price: 10000, popular: false, label: '10K' },
  { points: 50000, price: 50000, popular: true, label: '50K' },
  { points: 100000, price: 100000, popular: false, label: '100K' },
  { points: 500000, price: 500000, popular: false, label: '500K' },
];

const PRICE_PER_POINT = 1; // 1 VND per point
const MIN_POINTS = 10000;    // Minimum 10,000 points
const MAX_POINTS = 10000000; // Maximum 10,000,000 points

export function BuyPointsModal({ isOpen, onClose }: BuyPointsModalProps) {
  const { user } = useAuth();
  const { buyPoints, loading, error } = useBuyPoints();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [customPoints, setCustomPoints] = useState('');

  if (!isOpen || !user) return null;

  const handleBuyPoints = async () => {
    const points = selectedPackage || parseInt(customPoints);
    
    if (!points || points < MIN_POINTS) {
      alert(`Vui lòng nhập tối thiểu ${MIN_POINTS.toLocaleString()} điểm`);
      return;
    }

    if (points > MAX_POINTS) {
      alert(`Tối đa ${MAX_POINTS.toLocaleString()} điểm mỗi giao dịch`);
      return;
    }

    try {
      await buyPoints({
        userId: user.userId,
        pointsAmount: points,
        description: `Mua ${points} điểm`
      });
      // Will redirect to MoMo payment page
    } catch (err) {
      // Error is handled in the hook
      console.error('Failed to initiate payment:', err);
    }
  };

  const calculatePrice = (points: number) => {
    return points * PRICE_PER_POINT;
  };

  const selectedPoints = selectedPackage || parseInt(customPoints) || 0;
  const totalPrice = calculatePrice(selectedPoints);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mua Điểm
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Chọn gói điểm hoặc nhập số điểm tùy chỉnh
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Package Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Chọn Gói Điểm
            </label>
            <div className="grid grid-cols-2 gap-3">
              {POINT_PACKAGES.map((pkg) => (
                <button
                  key={pkg.points}
                  onClick={() => {
                    setSelectedPackage(pkg.points);
                    setCustomPoints('');
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    selectedPackage === pkg.points
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Phổ Biến
                    </span>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {pkg.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {pkg.points.toLocaleString()} điểm
                    </div>
                    <div className="mt-2 text-lg font-semibold text-green-600 dark:text-green-400">
                      {pkg.price.toLocaleString()} VNĐ
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hoặc Nhập Số Điểm Tùy Chỉnh
            </label>
            <Input
              type="number"
              value={customPoints}
              onChange={(e) => {
                setCustomPoints(e.target.value);
                setSelectedPackage(null);
              }}
              placeholder={`Nhập số điểm (${MIN_POINTS.toLocaleString()} - ${MAX_POINTS.toLocaleString()})`}
              min={MIN_POINTS}
              max={MAX_POINTS}
              step="1000"
              className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tối thiểu: {MIN_POINTS.toLocaleString()} điểm | Tối đa: {MAX_POINTS.toLocaleString()} điểm
            </p>
          </div>

          {/* Price Summary */}
          {selectedPoints > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Số điểm:</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedPoints.toLocaleString()} điểm
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Đơn giá:</span>
                  <span className="text-gray-900 dark:text-white">
                    {PRICE_PER_POINT.toLocaleString()} VNĐ/điểm
                  </span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Tổng tiền:
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {totalPrice.toLocaleString()} VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Thanh toán qua MoMo
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Bạn sẽ được chuyển đến trang thanh toán MoMo để hoàn tất giao dịch. 
                  Điểm sẽ được cộng vào tài khoản sau khi thanh toán thành công.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-2xl">
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Hủy
            </Button>
          <Button
            onClick={handleBuyPoints}
            disabled={loading || selectedPoints < MIN_POINTS}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                <>Thanh toán qua MoMo</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

