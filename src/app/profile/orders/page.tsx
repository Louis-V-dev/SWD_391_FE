'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { OrdersAPI, OrderResponse } from '@/api/orders';
import {
  ShoppingBag,
  Calendar,
  Package,
  Eye,
  CheckCircle2,
  Clock3,
  Truck,
  PackageCheck,
  CircleArrowRight,
  Ship,
  RefreshCcw
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
const relativeFormatter = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });

const formatRelativeTime = (value?: string) => {
  if (!value) {
    return '';
  }

  const diffInMs = new Date(value).getTime() - Date.now();
  const diffInSeconds = Math.round(diffInMs / 1000);
  const absSeconds = Math.abs(diffInSeconds);

  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; threshold: number; divisor: number }> = [
    { unit: 'second', threshold: 60, divisor: 1 },
    { unit: 'minute', threshold: 3600, divisor: 60 },
    { unit: 'hour', threshold: 86400, divisor: 3600 },
    { unit: 'day', threshold: 604800, divisor: 86400 },
    { unit: 'week', threshold: 2629800, divisor: 604800 },
    { unit: 'month', threshold: 31557600, divisor: 2629800 },
    { unit: 'year', threshold: Number.POSITIVE_INFINITY, divisor: 31557600 }
  ];

  const unit = units.find((entry) => absSeconds < entry.threshold) ?? units[units.length - 1];
  const valueRounded = Math.round(diffInSeconds / unit.divisor);

  return relativeFormatter.format(valueRounded, unit.unit);
};

const statusLabels: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đã gửi hàng',
  DELIVERED: 'Đã giao',
  ARRIVED: 'Đã đến điểm nhận',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy'
};

const statusColors: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  PROCESSING: '#0ea5e9',
  SHIPPED: '#6366f1',
  DELIVERED: '#8b5cf6',
  ARRIVED: '#14b8a6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444'
};

const timelineOrder: Array<{ key: string; icon: React.ComponentType<{ className?: string }>; label: string }> = [
  { key: 'PENDING', icon: CircleArrowRight, label: 'Tạo đơn' },
  { key: 'CONFIRMED', icon: CheckCircle2, label: 'Xác nhận' },
  { key: 'PROCESSING', icon: RefreshCcw, label: 'Chuẩn bị hàng' },
  { key: 'SHIPPED', icon: Ship, label: 'Đang vận chuyển' },
  { key: 'DELIVERED', icon: Truck, label: 'Đã giao' },
  { key: 'ARRIVED', icon: PackageCheck, label: 'Chờ nhận' },
  { key: 'COMPLETED', icon: Package, label: 'Hoàn tất' }
];

export default function MyOrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [confirmingMap, setConfirmingMap] = useState<Record<string, boolean>>({});

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

  const confirmReceipt = async (orderId: string) => {
    if (!user?.userId) return;
    setConfirmingMap((prev) => ({ ...prev, [orderId]: true }));
    try {
      const updated = await OrdersAPI.confirmReceipt(orderId, user.userId);
      setOrders((prev) => prev.map((order) => (order.orderId === updated.orderId ? updated : order)));
    } catch (error) {
      console.error('Failed to confirm receipt:', error);
    } finally {
      setConfirmingMap((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const renderTimeline = (order: OrderResponse) => {
    const statusIndex = timelineOrder.findIndex((step) => step.key === order.status);

    return (
      <div className="flex flex-wrap items-center gap-4 mt-4">
        {timelineOrder.map((step, idx) => {
          const Icon = step.icon;
          const timestamp =
            step.key === 'PENDING'
              ? order.createdAt
              : (order as any)[`${step.key.toLowerCase()}At` as keyof OrderResponse];
          const isComplete = statusIndex >= idx;

          return (
            <div key={step.key} className="flex items-center gap-2 text-sm">
              <Icon className={`w-4 h-4 ${isComplete ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex flex-col">
                <span className={`font-medium ${isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
                {timestamp && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(timestamp as string).toLocaleString('vi-VN')} ({formatRelativeTime(timestamp as string)})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
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
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <ShoppingBag className="w-10 h-10 text-primary" />
            Đơn hàng của tôi
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Xem lịch sử mua hàng, trạng thái giao vận và xác nhận khi đã nhận hàng.
          </p>
        </div>

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
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-3">
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
                        <div
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: `${statusColors[order.status] || '#6b7280'}`, color: 'white' }}
                        >
                          {statusLabels[order.status] || order.status}
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {order.totalAmount.toLocaleString()} điểm
                        </div>
                      </div>

                      {order.arrivedAt && !order.completedAt && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">
                          <PackageCheck className="w-4 h-4" />
                          Đơn hàng đã đến điểm nhận.
                          {order.autoCompleteScheduledAt ? (
                            <>
                              Vui lòng bấm "Đã nhận" trong vòng 3 ngày.
                              <span className="text-xs text-emerald-700">
                                Hệ thống sẽ tự động hoàn tất vào {new Date(order.autoCompleteScheduledAt).toLocaleString('vi-VN')}.
                              </span>
                            </>
                          ) : null}
                        </div>
                      )}

                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <p>Tổng sản phẩm: {order.totalItems || 0}</p>
                        {order.trackingNumber && <p>Mã vận đơn: {order.trackingNumber}</p>}
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

                      {renderTimeline(order)}
                    </div>

                    <div className="flex flex-col items-stretch gap-2 min-w-[200px]">
                      <button
                        onClick={() => router.push(`/profile/orders/${order.orderId}`)}
                        className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5 text-primary" />
                        Xem chi tiết
                      </button>

                      {order.status === 'ARRIVED' && !order.completedAt && (
                        <button
                          onClick={() => confirmReceipt(order.orderId)}
                          disabled={confirmingMap[order.orderId]}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-70"
                        >
                          {confirmingMap[order.orderId] ? 'Đang xác nhận...' : 'Tôi đã nhận hàng'}
                        </button>
                      )}

                      <div className="text-xs text-muted-foreground text-center mt-2">
                        Cập nhật lần cuối {formatRelativeTime(order.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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

