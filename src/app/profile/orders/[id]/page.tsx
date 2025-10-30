'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useParams } from 'next/navigation';
import SalesAPI, { Sale } from '@/api/sales';
import { ShoppingBag, ArrowLeft, Calendar, Package, DollarSign } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function OrderDetailsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = parseInt(params.id as string);

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await SalesAPI.getSaleById(orderId);
      setSale(data);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading || !sale) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/profile/orders')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to My Orders
            </button>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-primary" />
              Order Details
            </h1>
            <p className="text-muted-foreground mt-2">
              Order #{sale.saleId}
            </p>
          </div>

          {/* Order Info Card */}
          <div className="bg-card rounded-lg border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Order Date
                </p>
                <p className="font-medium text-lg">
                  {new Date(sale.saleDate).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(sale.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Items ({sale.details?.length || 0})
            </h2>

            {sale.details && sale.details.length > 0 ? (
              <div className="space-y-4">
                {sale.details.map((detail) => (
                  <div key={detail.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Item #{detail.itemId}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {detail.quantity} × {formatCurrency(detail.unitPrice)}
                      </p>
                      {detail.discount > 0 && (
                        <p className="text-sm text-green-600">
                          Discount: -{formatCurrency(detail.discount)}
                        </p>
                      )}
                      {detail.tax > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Tax: +{formatCurrency(detail.tax)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(detail.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Summary */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(sale.totalAmount)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No items found</p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
            >
              Print Receipt
            </button>
            <button
              onClick={() => router.push('/profile/orders')}
              className="px-6 py-3 bg-accent hover:bg-accent/80 rounded-lg transition-colors font-medium"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

