'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardCheck,
  Loader2,
  PackageCheck,
  Ship,
  Truck,
  CheckCircle2,
  Ban,
  RefreshCcw,
  Clock3
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OrdersAPI, OrderResponse } from '@/api/orders';

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

const PAGE_SIZE = 20;

const STATUS_SEQUENCE: Array<{ key: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'PENDING', label: 'Pending', icon: ClipboardCheck },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Processing', icon: RefreshCcw },
  { key: 'SHIPPED', label: 'Shipped', icon: Ship },
  { key: 'DELIVERED', label: 'Delivered', icon: Truck },
  { key: 'ARRIVED', label: 'Arrived', icon: PackageCheck },
  { key: 'COMPLETED', label: 'Completed', icon: CheckCircle2 }
];

type ActionKey =
  | 'confirm'
  | 'processing'
  | 'ship'
  | 'deliver'
  | 'arrive'
  | 'complete'
  | 'cancel';

type LoadingMap = Record<string, ActionKey | null>;

type StatusTimestamps = Record<string, string | undefined>;

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
});

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState<LoadingMap>({});

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await OrdersAPI.getAdminManagedOrders({ page, size: PAGE_SIZE });
      setOrders(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Failed to load admin orders', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = useMemo<Record<string, string>>(() => ({
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-sky-100 text-sky-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-purple-100 text-purple-700',
    ARRIVED: 'bg-teal-100 text-teal-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-rose-100 text-rose-700'
  }), []);

  const timestampMap = (order: OrderResponse): StatusTimestamps => ({
    PENDING: order.createdAt,
    CONFIRMED: order.confirmedAt,
    PROCESSING: order.updatedAt && order.status === 'PROCESSING' ? order.updatedAt : undefined,
    SHIPPED: order.shippedAt,
    DELIVERED: order.deliveredAt,
    ARRIVED: order.arrivedAt,
    COMPLETED: order.completedAt
  });

  const handleAction = async (order: OrderResponse, action: ActionKey) => {
    setActionLoading((prev) => ({ ...prev, [order.orderId]: action }));

    try {
      let updated: OrderResponse | null = null;
      switch (action) {
        case 'confirm':
          updated = await OrdersAPI.updateStatus(order.orderId, 'CONFIRMED');
          break;
        case 'processing':
          updated = await OrdersAPI.updateStatus(order.orderId, 'PROCESSING');
          break;
        case 'ship': {
          const trackingNumber = prompt('Enter tracking number for this order');
          if (!trackingNumber) {
            setActionLoading((prev) => ({ ...prev, [order.orderId]: null }));
            return;
          }
          updated = await OrdersAPI.markAsShipped(order.orderId, trackingNumber);
          break;
        }
        case 'deliver':
          updated = await OrdersAPI.markAsDelivered(order.orderId);
          break;
        case 'arrive':
          updated = await OrdersAPI.markAsArrived(order.orderId);
          break;
        case 'complete':
          updated = await OrdersAPI.completeOrder(order.orderId);
          break;
        case 'cancel': {
          const reason = prompt('Provide a reason for cancellation (optional)') || undefined;
          updated = await OrdersAPI.cancelOrder(order.orderId, reason);
          break;
        }
        default:
          break;
      }

      if (updated) {
        setOrders((prev) => prev.map((item) => (item.orderId === updated!.orderId ? updated! : item)));
      }
    } catch (error) {
      console.error(`Failed to ${action} order`, error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [order.orderId]: null }));
    }
  };

  const canCancel = (status: string) => status === 'PENDING' || status === 'CONFIRMED';

  const renderActions = (order: OrderResponse) => {
    const current = order.status;
    const activeAction = actionLoading[order.orderId] ?? null;

    return (
      <div className="flex flex-wrap gap-2">
        {current === 'PENDING' && (
          <Button
            size="sm"
            onClick={() => handleAction(order, 'confirm')}
            disabled={activeAction !== null}
          >
            Confirm
          </Button>
        )}

        {current === 'CONFIRMED' && (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAction(order, 'processing')}
              disabled={activeAction !== null}
            >
              Processing
            </Button>
            <Button
              size="sm"
              onClick={() => handleAction(order, 'ship')}
              disabled={activeAction !== null}
            >
              Mark Shipped
            </Button>
          </>
        )}

        {current === 'PROCESSING' && (
          <Button
            size="sm"
            onClick={() => handleAction(order, 'ship')}
            disabled={activeAction !== null}
          >
            Mark Shipped
          </Button>
        )}

        {current === 'SHIPPED' && (
          <Button
            size="sm"
            onClick={() => handleAction(order, 'deliver')}
            disabled={activeAction !== null}
          >
            Mark Delivered
          </Button>
        )}

        {current === 'DELIVERED' && (
          <Button
            size="sm"
            onClick={() => handleAction(order, 'arrive')}
            disabled={activeAction !== null}
          >
            Mark Arrived
          </Button>
        )}

        {current === 'ARRIVED' && (
          <Button
            size="sm"
            onClick={() => handleAction(order, 'complete')}
            disabled={activeAction !== null}
          >
            Complete Order
          </Button>
        )}

        {canCancel(current) && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleAction(order, 'cancel')}
            disabled={activeAction !== null}
          >
            Cancel Order
          </Button>
        )}
      </div>
    );
  };

  const renderTimeline = (order: OrderResponse) => {
    const timestamps = timestampMap(order);

    return (
      <div className="flex flex-wrap items-center gap-4 mt-4">
        {STATUS_SEQUENCE.map(({ key, label, icon: Icon }) => {
          const isCompleted = order.status === key || STATUS_SEQUENCE.findIndex((s) => s.key === order.status) > STATUS_SEQUENCE.findIndex((s) => s.key === key);
          const ts = timestamps[key];

          return (
            <div key={key} className="flex items-center gap-2 text-sm">
              <Icon className={`w-4 h-4 ${isCompleted ? 'text-emerald-600' : 'text-muted-foreground'}`} />
              <div className="flex flex-col">
                <span className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {ts && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(ts).toLocaleString()} ({formatRelativeTime(ts)})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Orders</h1>
            <p className="text-muted-foreground">
              Manage orders created by admin or verified items. Auto-complete occurs three days after arrival.
            </p>
          </div>
          <Button variant="outline" onClick={() => fetchOrders()} disabled={loading}>
            <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No admin-managed orders found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.orderId} className="border">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <span>Order #{order.orderCode}</span>
                      <Badge className={statusColors[order.status] ?? 'bg-gray-100 text-gray-700'}>
                        {order.statusDisplayName || order.status}
                      </Badge>
                    </CardTitle>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div>Buyer: {order.buyerName} ({order.buyerEmail})</div>
                      <div>Total Points: {order.totalAmount?.toLocaleString()} pts</div>
                      {order.autoCompleteScheduledAt && (
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-4 h-4" />
                          Auto-completes {formatRelativeTime(order.autoCompleteScheduledAt)}
                        </div>
                      )}
                      {order.trackingNumber && <div>Tracking: {order.trackingNumber}</div>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="text-right text-lg font-semibold text-foreground">
                      {currencyFormatter.format(order.totalAmount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated {formatRelativeTime(order.updatedAt)}
                    </div>
                    {renderActions(order)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">Items</h4>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {order.items?.map((item) => (
                          <li key={item.itemId}>
                            • {item.itemName} × {item.quantity} — {currencyFormatter.format(item.subtotal)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {renderTimeline(order)}
                    {order.notes && (
                      <div className="text-sm text-muted-foreground">
                        Buyer Notes: {order.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
