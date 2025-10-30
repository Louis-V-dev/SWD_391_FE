'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import DonationsAPI, { DonatedItem, ValuationRequest } from '@/api/donations';
import { 
  Package, ArrowLeft, User, Phone, Mail, Calendar, DollarSign, 
  TrendingUp, CheckCircle, ShoppingBag, Trash, Settings 
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function DonationDetailsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const donationId = params.id as string;

  const [donation, setDonation] = useState<DonatedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Valuation form state
  const [conditionScore, setConditionScore] = useState(3.0);
  const [estimatedValue, setEstimatedValue] = useState('');
  const [processingType, setProcessingType] = useState('READY_TO_SELL');
  const [materialComposition, setMaterialComposition] = useState('{"cotton": 100}');
  const [conditionDescription, setConditionDescription] = useState('');

  const processingTypes = [
    { value: 'READY_TO_SELL', label: 'Ready to Sell', icon: ShoppingBag },
    { value: 'NEED_CLEANING', label: 'Need Cleaning', icon: Settings },
    { value: 'NEED_REPAIR', label: 'Need Repair', icon: Settings },
    { value: 'NEED_ALTERATION', label: 'Need Alteration', icon: Settings },
    { value: 'WILL_RECYCLE', label: 'Will Recycle', icon: Package },
    { value: 'WILL_DISPOSE', label: 'Will Dispose', icon: Trash },
  ];

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN' && user?.role !== 'STAFF') {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    loadDonation();
  }, [donationId]);

  const loadDonation = async () => {
    try {
      setLoading(true);
      const data = await DonationsAPI.getDonationById(donationId);
      setDonation(data);
      
      // Pre-fill form if already valuated
      if (data.conditionScore) setConditionScore(data.conditionScore);
      if (data.estimatedValue) setEstimatedValue(data.estimatedValue.toString());
      if (data.processingType) setProcessingType(data.processingType);
      if (data.materialComposition) setMaterialComposition(JSON.stringify(data.materialComposition, null, 2));
      if (data.conditionDescription) setConditionDescription(data.conditionDescription);
    } catch (error) {
      console.error('Failed to load donation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValuate = async () => {
    if (!donation || !user) return;

    try {
      setProcessing(true);
      const valuation: ValuationRequest = {
        conditionScore,
        materialComposition: JSON.parse(materialComposition),
        estimatedValue: parseFloat(estimatedValue),
        processingType,
        conditionDescription,
      };

      await DonationsAPI.valuateDonation(donationId, valuation, user.userId);
      alert('Valuation completed successfully!');
      loadDonation();
    } catch (error) {
      console.error('Failed to valuate donation:', error);
      alert('Failed to complete valuation');
    } finally {
      setProcessing(false);
    }
  };

  const handleAccept = async () => {
    if (!donation || !user) return;

    try {
      setProcessing(true);
      await DonationsAPI.acceptDonation(donationId, user.userId);
      alert('Donation accepted and points awarded!');
      loadDonation();
    } catch (error) {
      console.error('Failed to accept donation:', error);
      alert('Failed to accept donation');
    } finally {
      setProcessing(false);
    }
  };

  const handleConvertToSale = async () => {
    if (!donation || !user) return;

    const sellingPrice = prompt('Enter selling price (VND):');
    if (!sellingPrice) return;

    try {
      setProcessing(true);
      await DonationsAPI.convertToItemAndSale(donationId, user.userId, parseFloat(sellingPrice));
      alert('Item is now ready for sale!');
      loadDonation();
    } catch (error) {
      console.error('Failed to convert donation:', error);
      alert('Failed to convert donation');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading || !donation) {
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Header */}
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
            Donation Details
          </h1>
          <p className="text-muted-foreground mt-2">
            {donation.donationCode}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Donation Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Donation Info Card */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Donation Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {donation.customer?.firstName && donation.customer?.lastName
                      ? `${donation.customer.firstName} ${donation.customer.lastName}`
                      : donation.customerName || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{donation.customerPhone || donation.customerEmail || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Staff</p>
                  <p className="font-medium">
                    {donation.staff?.firstName} {donation.staff?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(donation.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      donation.donationStatus === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      donation.donationStatus === 'PENDING_VALUATION' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {donation.donationStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                {donation.pointsAwarded && (
                  <div>
                    <p className="text-sm text-muted-foreground">Points Awarded</p>
                    <p className="font-bold text-green-600 text-lg">
                      +{donation.pointsAwarded.toLocaleString()} pts
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Item Details Card */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Item Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-lg">{donation.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-foreground">{donation.description || '—'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-medium">{donation.size || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="font-medium">{donation.color || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Original Price</p>
                    <p className="font-medium">{formatCurrency(donation.originalPrice)}</p>
                  </div>
                </div>
                {donation.conditionScore && (
                  <div>
                    <p className="text-sm text-muted-foreground">Condition Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(donation.conditionScore / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-primary">{donation.conditionScore.toFixed(1)}/5.0</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Valuation Form - Only show if PENDING_VALUATION */}
            {donation.donationStatus === 'PENDING_VALUATION' && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Valuation Form
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Condition Score (1.0 - 5.0)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.1"
                      value={conditionScore}
                      onChange={(e) => setConditionScore(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Poor (1.0)</span>
                      <span className="font-bold text-primary text-lg">{conditionScore.toFixed(1)}</span>
                      <span>Excellent (5.0)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Estimated Value (VND)
                    </label>
                    <input
                      type="number"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                      placeholder="Enter estimated value"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Processing Type
                    </label>
                    <select
                      value={processingType}
                      onChange={(e) => setProcessingType(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                    >
                      {processingTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Material Composition (JSON)
                    </label>
                    <textarea
                      value={materialComposition}
                      onChange={(e) => setMaterialComposition(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background font-mono text-sm"
                      rows={3}
                      placeholder='{"cotton": 70, "polyester": 30}'
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Condition Description
                    </label>
                    <textarea
                      value={conditionDescription}
                      onChange={(e) => setConditionDescription(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                      rows={3}
                      placeholder="Describe the item condition..."
                    />
                  </div>

                  <button
                    onClick={handleValuate}
                    disabled={processing || !estimatedValue}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {processing ? 'Processing...' : 'Complete Valuation'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Status</h3>
              <div className="space-y-3">
                <div className={`p-4 rounded-lg border-2 ${
                  donation.donationStatus === 'PENDING_VALUATION' ? 'bg-yellow-50 border-yellow-300' :
                  donation.donationStatus === 'VALUATED' ? 'bg-blue-50 border-blue-300' :
                  donation.donationStatus === 'ACCEPTED' ? 'bg-green-50 border-green-300' :
                  'bg-gray-50 border-gray-300'
                }`}>
                  <p className="font-bold text-center">
                    {donation.donationStatus.replace(/_/g, ' ')}
                  </p>
                </div>

                {donation.estimatedValue && (
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground text-center">Estimated Value</p>
                    <p className="text-2xl font-bold text-center text-primary">
                      {formatCurrency(donation.estimatedValue)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                {donation.donationStatus === 'VALUATED' && (
                  <button
                    onClick={handleAccept}
                    disabled={processing}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Accept & Award Points
                  </button>
                )}

                {donation.donationStatus === 'ACCEPTED' && (
                  <button
                    onClick={handleConvertToSale}
                    disabled={processing}
                    className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Convert to Sale Item
                  </button>
                )}

                {donation.convertedToItemId && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium text-center">
                      ✓ Converted to Item
                    </p>
                    <p className="text-xs text-green-600 text-center mt-1 font-mono">
                      {donation.convertedToItemId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

