'use client';

import { useState } from 'react';
import { usePointRedemption, usePointSummary } from '@/hooks/usePoints';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Gift, Percent, Award } from 'lucide-react';

interface RedeemPointsModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RedeemPointsModal({ userId, isOpen, onClose, onSuccess }: RedeemPointsModalProps) {
  const [pointsToRedeem, setPointsToRedeem] = useState('');
  const [redemptionType, setRedemptionType] = useState<'DISCOUNT' | 'VOUCHER' | 'DONATION'>('DISCOUNT');
  const { summary } = usePointSummary(userId);
  const { redeem, loading, error } = usePointRedemption(userId);

  if (!isOpen) return null;

  const handleRedeem = async () => {
    const points = parseInt(pointsToRedeem);
    if (isNaN(points) || points <= 0) {
      alert('Please enter a valid number of points');
      return;
    }

    try {
      await redeem({
        userId,
        pointsToRedeem: points,
        redemptionType,
        description: `Redeemed ${points} points for ${redemptionType.toLowerCase()}`
      });
      
      onSuccess?.();
      onClose();
    } catch (err) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Redeem Points</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Available Points */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <p className="text-sm text-green-700 dark:text-green-400">Available Points</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {summary?.availablePoints.toLocaleString() || 0}
            </p>
          </div>

          {/* Redemption Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Redemption Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setRedemptionType('DISCOUNT')}
                className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  redemptionType === 'DISCOUNT'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Percent className="h-6 w-6" />
                <span className="text-xs font-medium">Discount</span>
              </button>
              <button
                onClick={() => setRedemptionType('VOUCHER')}
                className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  redemptionType === 'VOUCHER'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Gift className="h-6 w-6" />
                <span className="text-xs font-medium">Voucher</span>
              </button>
              <button
                onClick={() => setRedemptionType('DONATION')}
                className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  redemptionType === 'DONATION'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Award className="h-6 w-6" />
                <span className="text-xs font-medium">Donation</span>
              </button>
            </div>
          </div>

          {/* Points Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Points to Redeem
            </label>
            <Input
              type="number"
              value={pointsToRedeem}
              onChange={(e) => setPointsToRedeem(e.target.value)}
              placeholder="Enter points"
              min="1"
              max={summary?.availablePoints || 0}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum: 100 points
            </p>
          </div>

          {/* Estimated Value */}
          {pointsToRedeem && !isNaN(parseInt(pointsToRedeem)) && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Value</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {(parseInt(pointsToRedeem) * 100).toLocaleString()} VND
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 point = 100 VND</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRedeem}
            disabled={loading || !pointsToRedeem}
            className="flex-1 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            {loading ? 'Redeeming...' : 'Redeem Points'}
          </Button>
        </div>
      </div>
    </div>
  );
}



















