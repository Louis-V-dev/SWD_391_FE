'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Plus,
  Loader2,
  ClipboardList,
  ClipboardCheck,
  Ship,
  Truck,
  PackageCheck,
  CheckCircle2,
  RefreshCcw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ItemsAPI } from '@/api/items';
import { OrdersAPI, OrderResponse } from '@/api/orders';
import type { ItemSummaryResponse, ItemStatus } from '@/types';
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

const statusBadges: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-sky-100 text-sky-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-purple-100 text-purple-700',
  ARRIVED: 'bg-teal-100 text-teal-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700'
};

type SellerAction = 'processing' | 'ship' | 'deliver' | 'arrive';

type LoadingState = Record<string, SellerAction | null>;

export default function MyItemsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<'items' | 'orders'>('items');

  const [loadingItems, setLoadingItems] = useState(true);
  const [items, setItems] = useState<ItemSummaryResponse[]>([]);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [sellerOrders, setSellerOrders] = useState<OrderResponse[]>([]);
  const [orderLoadingMap, setOrderLoadingMap] = useState<LoadingState>({});

  useEffect(() => {
    if (user?.userId) {
      loadItems();
      loadSellerOrders();
    } else {
      setItems([]);
      setSellerOrders([]);
      setLoadingItems(false);
      setLoadingOrders(false);
    }
  }, [user]);

  const loadItems = async () => {
    if (!user?.userId) return;
    
    setLoadingItems(true);
    try {
      const data = await ItemsAPI.getItemsByOwner(user.userId, { page: 0, size: 20 });
      setItems(data.content || []);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const loadSellerOrders = async () => {
    if (!user?.userId) return;

    setLoadingOrders(true);
    try {
      const response = await OrdersAPI.getOrdersBySeller(user.userId, { page: 0, size: 50 });
      setSellerOrders(response.content || []);
    } catch (error) {
      console.error('Failed to load seller orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleOrderAction = async (order: OrderResponse, action: SellerAction) => {
    setOrderLoadingMap((prev) => ({ ...prev, [order.orderId]: action }));
    try {
      let updated: OrderResponse | null = null;
      switch (action) {
        case 'processing':
          updated = await OrdersAPI.updateStatus(order.orderId, 'PROCESSING');
          break;
        case 'ship': {
          const trackingNumber = window.prompt('Enter tracking number for this order');
          if (!trackingNumber) {
            setOrderLoadingMap((prev) => ({ ...prev, [order.orderId]: null }));
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
        default:
          break;
      }

      if (updated) {
        setSellerOrders((prev) => prev.map((item) => (item.orderId === updated!.orderId ? updated! : item)));
      }
    } catch (error) {
      console.error(`Failed to ${action} order`, error);
    } finally {
      setOrderLoadingMap((prev) => ({ ...prev, [order.orderId]: null }));
    }
  };

  const orderActions = useMemo<Record<string, SellerAction[]>>(
    () => ({
      PENDING: [],
      CONFIRMED: ['processing', 'ship'],
      PROCESSING: ['ship'],
      SHIPPED: ['deliver'],
      DELIVERED: ['arrive']
    }),
    []
  );

  const renderOrderActions = (order: OrderResponse) => {
    const actions = orderActions[order.status as keyof typeof orderActions] ?? [];
    const activeAction = orderLoadingMap[order.orderId] ?? null;
    if (actions.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {actions.includes('processing') && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOrderAction(order, 'processing')}
              disabled={activeAction !== null}
          >
            Start Processing
          </Button>
        )}

        {actions.includes('ship') && (
          <Button
            size="sm"
            onClick={() => handleOrderAction(order, 'ship')}
              disabled={activeAction !== null}
          >
            Mark Shipped
          </Button>
        )}

        {actions.includes('deliver') && (
          <Button
            size="sm"
            onClick={() => handleOrderAction(order, 'deliver')}
              disabled={activeAction !== null}
          >
            Mark Delivered
          </Button>
        )}

        {actions.includes('arrive') && (
          <Button
            size="sm"
            onClick={() => handleOrderAction(order, 'arrive')}
              disabled={activeAction !== null}
          >
            Mark Arrived
          </Button>
        )}
      </div>
    );
  };

  const renderViewSwitcher = () => (
    <div className="flex gap-2">
      <Button variant={view === 'items' ? 'default' : 'outline'} onClick={() => setView('items')}>
        <Package className="w-4 h-4 mr-2" /> My Items
      </Button>
      <Button variant={view === 'orders' ? 'default' : 'outline'} onClick={() => setView('orders')}>
        <ClipboardList className="w-4 h-4 mr-2" /> Sales Orders
      </Button>
    </div>
  );

  const orderIconMap: Record<string, ReactNode> = {
    PENDING: <ClipboardList className="w-4 h-4" />,
    CONFIRMED: <ClipboardCheck className="w-4 h-4" />,
    PROCESSING: <RefreshCcw className="w-4 h-4" />,
    SHIPPED: <Ship className="w-4 h-4" />,
    DELIVERED: <Truck className="w-4 h-4" />,
    ARRIVED: <PackageCheck className="w-4 h-4" />,
    COMPLETED: <CheckCircle2 className="w-4 h-4" />
  };

  const renderItemsView = () => {
    if (loadingItems) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>My Items</CardTitle>
            <CardDescription>Items you have listed</CardDescription>
          </div>
          <Button onClick={() => router.push('/item/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No items yet</p>
          </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item: ItemSummaryResponse) => (
                <Card
                  key={item.itemId}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/item/${item.itemId}`)}
                >
                <div className="aspect-square bg-muted relative">
                  {item.primaryImageUrl ? (
                    <img src={item.primaryImageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 flex items-center justify-center">
                      <Package className="w-16 h-16 text-green-600/50" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                      item.itemStatus === 'READY_FOR_SALE' 
                        ? 'bg-green-100 text-green-800' 
                        : item.itemStatus === 'SOLD'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                      {item.itemStatus}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-1">{item.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      {item.resellPrice
                        ? `$${item.resellPrice.toFixed(2)}`
                        : item.currentEstimatedValue
                        ? `$${item.currentEstimatedValue.toFixed(2)}`
                        : '$0.00'}
                    </span>
                    {item.conditionText && (
                      <span className="text-sm text-muted-foreground capitalize">
                        {item.conditionText.toLowerCase()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    );
  };

  const renderOrdersView = () => {
    if (loadingOrders) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales Orders</CardTitle>
              <CardDescription>Manage the orders where you are the seller.</CardDescription>
            </div>
            <Button variant="outline" onClick={loadSellerOrders}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sellerOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No sales orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sellerOrders.map((order) => (
                <Card key={order.orderId} className="border">
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <span className="flex items-center gap-2">
                          {orderIconMap[order.status] || <Package className="w-4 h-4" />}
                          Order #{order.orderCode}
                        </span>
                        <Badge className={statusBadges[order.status] ?? 'bg-gray-100 text-gray-700'}>
                          {order.statusDisplayName || order.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Buyer: {order.buyerName} · {order.totalAmount?.toLocaleString()} pts
                      </CardDescription>
                      {order.arrivedAt && order.autoCompleteScheduledAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Auto-completes {formatRelativeTime(order.autoCompleteScheduledAt)}
                          , unless buyer confirms receipt sooner.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <span className="text-sm text-muted-foreground">
                        Updated {formatRelativeTime(order.updatedAt)}
                      </span>
                      {renderOrderActions(order)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">Items</h4>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {order.items?.map((item) => (
                          <li key={item.itemId}>
                            • {item.itemName} × {item.quantity} — {item.subtotal.toLocaleString()} pts
                          </li>
                        ))}
                      </ul>
                    </div>
                    {order.trackingNumber && (
                      <p className="text-sm text-muted-foreground">Tracking: {order.trackingNumber}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(order.createdAt).toLocaleString()} · Status last updated {new Date(order.updatedAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Marketplace</h1>
          <p className="text-muted-foreground">Manage your items and sales orders.</p>
        </div>
        {renderViewSwitcher()}
      </div>

      {view === 'items' ? renderItemsView() : renderOrdersView()}
    </div>
  );
}




