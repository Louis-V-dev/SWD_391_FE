'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { OrdersAPI, OrderResponse } from '@/api/orders';
import { ShoppingBag, Calendar, Package, Eye } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MyOrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
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
      loadOrders();
    }
  }, [user, currentPage]);

  const loadOrders = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const response = await OrdersAPI.getOrdersByBuyer(user.userId, { page: currentPage, size: 20 });
      setOrders(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to load orders:', error);
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
            <ShoppingBag className="w-10 h-10 text-primary" />
            Đơn hàng của tôi
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Xem lịch sử mua hàng và chi tiết đơn hàng
          </p>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Chưa có đơn hàng</h3>
            <p className="text-muted-foreground mb-6">
              Bắt đầu mua sắm thời trang bền vững!
            </p>
            <button
              onClick={() => router.push('/marketplace')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Khám phá Marketplace
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.orderId} className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-xl font-semibold text-foreground">
                        Đơn hàng #{order.orderCode}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {order.totalItems || 0} sản phẩm
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded-full text-sm font-medium" 
                           style={{
                             backgroundColor: order.status === 'COMPLETED' ? '#10b981' : 
                                            order.status === 'CANCELLED' ? '#ef4444' : '#f59e0b',
                             color: 'white'
                           }}>
                        {order.statusDisplayName}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {order.totalAmount.toLocaleString()} điểm
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Sản phẩm:</p>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <p key={item.itemId} className="text-sm text-foreground">
                              • {item.itemName} × {item.quantity} - {item.subtotal.toLocaleString()} điểm
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => router.push(`/profile/orders/${order.orderId}`)}
                    className="p-3 hover:bg-accent rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-5 h-5 text-primary" />
                  </button>
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
              Trước
            </button>
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Trang {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

