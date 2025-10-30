'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import DonationsAPI, { DonatedItem } from '@/api/donations';
import { Package, Calendar, TrendingUp, Award } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MyDonationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [donations, setDonations] = useState<DonatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.userId) {
      loadDonations();
    }
  }, [user, currentPage]);

  const loadDonations = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const response = await DonationsAPI.getDonationsByCustomer(user.userId, currentPage, 20);
      setDonations(response.content || response);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to load donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_VALUATION: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      VALUATED: 'text-blue-600 bg-blue-50 border-blue-200',
      ACCEPTED: 'text-green-600 bg-green-50 border-green-200',
      READY_FOR_SALE: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Package className="w-10 h-10 text-primary" />
            My Donations
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your donated items and earned points
          </p>
        </div>

        {/* Donations List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Donations Yet</h3>
            <p className="text-muted-foreground">
              Visit our collection points to donate items and earn points!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation) => (
              <div key={donation.donatedItemId} className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-mono text-sm text-primary font-medium">{donation.donationCode}</p>
                    <h3 className="text-lg font-semibold text-foreground mt-1">{donation.name}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(donation.donationStatus)}`}>
                    {donation.donationStatus.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {new Date(donation.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {donation.estimatedValue && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {formatCurrency(donation.estimatedValue)}
                      </span>
                    </div>
                  )}

                  {donation.pointsAwarded && (
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-green-600 text-lg">
                        +{donation.pointsAwarded.toLocaleString()} points
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {donation.description || 'No description'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

