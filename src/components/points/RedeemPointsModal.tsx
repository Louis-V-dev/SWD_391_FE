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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Redeem Points</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Available Points */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">Available Points</p>
            <p className="text-2xl font-bold text-green-900">
              {summary?.availablePoints.toLocaleString() || 0}
            </p>
          </div>

          {/* Redemption Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Redemption Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setRedemptionType('DISCOUNT')}
                className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  redemptionType === 'DISCOUNT'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Percent className="h-6 w-6" />
                <span className="text-xs font-medium">Discount</span>
              </button>
              <button
                onClick={() => setRedemptionType('VOUCHER')}
                className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  redemptionType === 'VOUCHER'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Gift className="h-6 w-6" />
                <span className="text-xs font-medium">Voucher</span>
              </button>
              <button
                onClick={() => setRedemptionType('DONATION')}
                className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                  redemptionType === 'DONATION'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Award className="h-6 w-6" />
                <span className="text-xs font-medium">Donation</span>
              </button>
            </div>
          </div>

          {/* Points Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points to Redeem
            </label>
            <Input
              type="number"
              value={pointsToRedeem}
              onChange={(e) => setPointsToRedeem(e.target.value)}
              placeholder="Enter points"
              min="1"
              max={summary?.availablePoints || 0}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum: 100 points
            </p>
          </div>

          {/* Estimated Value */}
          {pointsToRedeem && !isNaN(parseInt(pointsToRedeem)) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Estimated Value</p>
              <p className="text-lg font-bold text-gray-900">
                {(parseInt(pointsToRedeem) * 100).toLocaleString()} VND
              </p>
              <p className="text-xs text-gray-500 mt-1">1 point = 100 VND</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
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
            className="flex-1"
          >
            {loading ? 'Redeeming...' : 'Redeem Points'}
          </Button>
        </div>
      </div>
    </div>
  );
}



















