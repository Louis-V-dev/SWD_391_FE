'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import DonationsAPI, { DonationCreateRequest } from '@/api/donations';
import { searchUsers } from '@/api';
import { Package, ArrowLeft, Search, UserPlus } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function CreateDonationPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  
  // New customer fields
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  
  // Item details
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN' && user?.role !== 'STAFF') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleSearchCustomer = async () => {
    if (!customerSearch.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await searchUsers(customerSearch);
      const users = response.data?.content || response.content || response || [];
      setSearchResults(users);
    } catch (error) {
      console.error('Failed to search customers:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      
      const donationData: DonationCreateRequest = {
        name: itemName,
        description,
        categoryId,
        size: size || undefined,
        color: color || undefined,
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      };

      // Use selected customer or new customer info
      if (selectedCustomer) {
        donationData.customerId = selectedCustomer.userId;
      } else {
        donationData.customerName = newCustomerName;
        donationData.customerPhone = newCustomerPhone;
        donationData.customerEmail = newCustomerEmail;
      }

      const result = await DonationsAPI.createDonation(donationData, user.userId);
      alert(`Donation created successfully! Code: ${result.donationCode}`);
      router.push(`/admin/donations/${result.donatedItemId}`);
    } catch (error) {
      console.error('Failed to create donation:', error);
      alert('Failed to create donation');
    } finally {
      setSubmitting(false);
    }
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Donations
          </button>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Receive Walk-in Donation
          </h1>
          <p className="text-muted-foreground mt-2">
            Register items received from customers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Section */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            
            {/* Customer Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Search Existing Customer
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchCustomer())}
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearchCustomer}
                  className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto">
                  {searchResults.map((customer) => (
                    <button
                      key={customer.userId}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setSearchResults([]);
                        setCustomerSearch('');
                      }}
                      className="w-full px-4 py-3 hover:bg-accent text-left border-b last:border-b-0 transition-colors"
                    >
                      <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCustomer ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </p>
                    <p className="text-sm text-green-600">{selectedCustomer.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Or enter new customer information
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                      placeholder="Customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                      placeholder="Email address"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Item Details Section */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Item Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                  placeholder="e.g., White Cotton Shirt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                  rows={3}
                  placeholder="Describe the item..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Size
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                    placeholder="S, M, L, XL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                    placeholder="White, Black, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Original Price (VND)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg bg-background"
                    placeholder="500000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-background"
                  placeholder="Category UUID (get from /api/categories)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use category endpoint or selection UI to get valid category ID
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border rounded-lg hover:bg-accent transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !itemName || !categoryId || (!selectedCustomer && !newCustomerName)}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? 'Creating...' : 'Create Donation'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

