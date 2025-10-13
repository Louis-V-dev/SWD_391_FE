'use client';

import { usePointSummary, useRecentTransactions } from '@/hooks/usePoints';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loader2, TrendingUp, TrendingDown, Clock, Award } from 'lucide-react';

interface PointsDashboardProps {
  userId: string;
}

export function PointsDashboard({ userId }: PointsDashboardProps) {
  const { summary, loading: summaryLoading } = usePointSummary(userId);
  const { transactions, loading: transactionsLoading } = useRecentTransactions(userId, 5);

  if (summaryLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Points Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Points</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">
                {summary.availablePoints.toLocaleString()}
              </h3>
            </div>
            <Award className="h-10 w-10 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earned</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">
                {summary.totalEarnedPoints.toLocaleString()}
              </h3>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <h3 className="text-2xl font-bold text-orange-600 mt-1">
                {summary.totalSpentPoints.toLocaleString()}
              </h3>
            </div>
            <TrendingDown className="h-10 w-10 text-orange-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">
                {summary.expiringPoints.toLocaleString()}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                in {summary.expiringInDays} days
              </p>
            </div>
            <Clock className="h-10 w-10 text-red-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Points Breakdown */}
      {summary.pointsByType && Object.keys(summary.pointsByType).length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Points by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(summary.pointsByType).map(([type, points]) => (
              <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 uppercase">{type.replace('_', ' ')}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{points.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <a href="/profile/points" className="text-sm text-green-600 hover:text-green-700">
            View All
          </a>
        </div>

        {transactionsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.transactionId}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={transaction.transactionType.startsWith('EARNED') ? 'success' : 'warning'}
                  >
                    {transaction.transactionType.replace('_', ' ')}
                  </Badge>
                  <span
                    className={`text-lg font-bold ${
                      transaction.transactionType.startsWith('EARNED')
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}
                  >
                    {transaction.transactionType.startsWith('EARNED') ? '+' : '-'}
                    {transaction.pointsAmount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}









