'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import DonationsAPI, { DonatedItem } from '@/api/donations';
import { Package, Search, Eye, Plus, TrendingUp, CheckCircle, Clock, Filter } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminDonationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [donations, setDonations] = useState<DonatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const statuses = [
    { value: 'ALL', label: 'All', icon: Package },
    { value: 'PENDING_VALUATION', label: 'Pending Valuation', icon: Clock },
    { value: 'VALUATED', label: 'Valuated', icon: TrendingUp },
    { value: 'ACCEPTED', label: 'Accepted', icon: CheckCircle },
    { value: 'READY_FOR_SALE', label: 'Ready for Sale', icon: Package },
  ];

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN' && user?.role !== 'STAFF') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    loadDonations();
  }, [currentPage, selectedStatus]);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const response = selectedStatus === 'ALL'
        ? await DonationsAPI.getAllDonations(currentPage, 20)
        : await DonationsAPI.getDonationsByStatus(selectedStatus, currentPage, 20);
      
      setDonations(response.content || response);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to load donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadDonations();
      return;
    }

    try {
      setLoading(true);
      const response = await DonationsAPI.searchDonations(searchQuery, currentPage, 20);
      setDonations(response.content || response);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to search donations:', error);
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

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING_VALUATION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      VALUATED: 'bg-blue-100 text-blue-800 border-blue-200',
      ACCEPTED: 'bg-green-100 text-green-800 border-green-200',
      READY_FOR_SALE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  if (isLoading || !user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Package className="w-8 h-8 text-primary" />
                Donation Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage walk-in donations, valuations, and processing
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/donations/create')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              New Donation
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => {
                setSelectedStatus(status.value);
                setCurrentPage(0);
              }}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedStatus === status.value
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card text-muted-foreground hover:bg-accent'
              }`}
            >
              <status.icon className="w-4 h-4" />
              {status.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by customer name, phone, or donation code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-accent hover:bg-accent/80 rounded-lg transition-colors font-medium"
            >
              Search
            </button>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  loadDonations();
                }}
                className="px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Item</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Estimated Value</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Points</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Staff</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                ) : donations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                      No donations found
                    </td>
                  </tr>
                ) : (
                  donations.map((donation) => (
                    <tr key={donation.donatedItemId} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-primary">
                          {donation.donationCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {donation.customer?.firstName && donation.customer?.lastName
                              ? `${donation.customer.firstName} ${donation.customer.lastName}`
                              : donation.customerName || '—'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {donation.customer?.email || donation.customerEmail || donation.customerPhone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{donation.name}</p>
                          <p className="text-sm text-muted-foreground">{donation.category?.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(donation.donationStatus)}
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">
                        {formatCurrency(donation.estimatedValue)}
                      </td>
                      <td className="px-6 py-4">
                        {donation.pointsAwarded ? (
                          <span className="text-green-600 font-semibold">
                            +{donation.pointsAwarded.toLocaleString()} pts
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {donation.staff?.firstName} {donation.staff?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(donation.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/admin/donations/${donation.donatedItemId}`)}
                          className="p-2 hover:bg-accent rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5 text-primary" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

