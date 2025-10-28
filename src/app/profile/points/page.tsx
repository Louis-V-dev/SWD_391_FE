'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PointsDashboard } from '@/components/points/PointsDashboard';
import { RedeemPointsModal } from '@/components/points/RedeemPointsModal';
import { usePointTransactions, useExpiringPoints } from '@/hooks/usePoints';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Gift, Clock, AlertTriangle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function UserPointsPage() {
  const { user } = useAuth();
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const { transactions, loading, refetch } = usePointTransactions(user?.userId, page, 20);
  const { expiringPoints, notify } = useExpiringPoints(user?.userId, 7);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Points</h1>
        <p className="text-gray-600 mt-2">Manage and track your sustainability points</p>
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

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button onClick={() => setIsRedeemModalOpen(true)} className="flex items-center gap-2">
          <Gift className="h-4 w-4" />
          Redeem Points
        </Button>
      </div>

      {/* All Transactions */}
      <Card className="mt-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Transaction History</h2>
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : !transactions?.content || transactions.content.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <>
              {transactions.content.map((transaction) => (
                <div key={transaction.transactionId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                        <Badge
                          variant={transaction.transactionType.startsWith('EARNED') ? 'success' : 'warning'}
                        >
                          {transaction.transactionType.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">{transaction.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                        <span>
                          Balance: {transaction.balanceBefore} → {transaction.balanceAfter}
                        </span>
                        {transaction.expiresAt && (
                          <span className="text-orange-600 flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Expires {new Date(transaction.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      transaction.transactionType.startsWith('EARNED')
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}>
                      {transaction.transactionType.startsWith('EARNED') ? '+' : '-'}
                      {transaction.pointsAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {transactions.totalPages > 1 && (
                <div className="flex items-center justify-between p-6 border-t">
                  <div className="text-sm text-gray-700">
                    Page {page + 1} of {transactions.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= transactions.totalPages - 1}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Redeem Modal */}
      <RedeemPointsModal
        userId={user.userId}
        isOpen={isRedeemModalOpen}
        onClose={() => setIsRedeemModalOpen(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}



















