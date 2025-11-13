'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { OrdersAPI, OrderCreateRequest } from '@/api/orders';
import { handleApiError } from '@/api';
import { formatApiError } from '@/utils/errorMessages';
import { ShoppingCart, MapPin, CreditCard, AlertCircle, Edit2, Check, X, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface CartItem {
  itemId: string;
  itemName: string;
  itemImage?: string;
  price: number;
  quantity: number;
}

interface DeliveryInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  notes?: string;
}

export default function CheckoutPage() {
  const { user, userPoints, isLoading, refreshPoints } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  
  // User delivery information
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    fullName: '',
    phone: '',
    address: '',
    city: 'TP. Hồ Chí Minh',
    district: '',
    ward: '',
    notes: '',
  });

  // Modal
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/checkout');
    } else if (user) {
      // Load user info
      setDeliveryInfo(prev => ({
        ...prev,
        fullName: user.fullName || user.username || '',
        phone: user.phone || '',
      }));
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length === 0) {
        router.push('/cart');
      }
      setCart(parsedCart);
    } else {
      router.push('/cart');
    }
  }, [router]);

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const totalAmount = calculateTotal();
  const shippingFee = 0; // Free shipping
  const finalTotal = totalAmount + shippingFee;

  const handleDeliveryInfoChange = (field: keyof DeliveryInfo, value: string) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateDeliveryInfo = (): boolean => {
    if (!deliveryInfo.fullName.trim()) {
      alert('Vui lòng nhập họ tên');
      return false;
    }
    if (!deliveryInfo.phone.trim() || !/^0\d{9}$/.test(deliveryInfo.phone)) {
      alert('Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 0)');
      return false;
    }
    if (!deliveryInfo.address.trim()) {
      alert('Vui lòng nhập địa chỉ nhận hàng');
      return false;
    }
    return true;
  };

  const handleConfirmOrder = async () => {
    if (!user) return;
    
    // Validate delivery info
    if (!validateDeliveryInfo()) {
      return;
    }

    // Check point balance
    if (userPoints < finalTotal) {
      setShowInsufficientModal(true);
      return;
    }

    try {
      setLoading(true);
      
      const orderData: OrderCreateRequest = {
        buyerId: user.userId,
        items: cart.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.price,
          discount: 0,
          tax: 0,
        })),
        shippingAddress: `${deliveryInfo.address}, ${deliveryInfo.ward}, ${deliveryInfo.district}, ${deliveryInfo.city}`,
        notes: deliveryInfo.notes || 'Đơn hàng từ marketplace',
      };

      const orders = await OrdersAPI.checkout(orderData);
      
      // Clear cart
      localStorage.removeItem('cart');
      setCart([]);
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Refresh points from database after transaction commits
      setTimeout(async () => {
        await refreshPoints();
        alert(`Đặt hàng thành công! ${orders.length} đơn hàng đã được tạo.`);
        router.push(`/profile/orders`);
      }, 500);
    } catch (error: unknown) {
      console.error('Failed to create order:', error);
      const backendMessage = handleApiError(error);
      const friendlyMessage = formatApiError(
        backendMessage,
        'checkout',
        'Không thể hoàn tất đơn hàng. Vui lòng thử lại.'
      );
      alert(friendlyMessage);
    } finally {
      setLoading(false);
    }
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
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Xác nhận đơn hàng</h1>
            <p className="text-muted-foreground">Kiểm tra thông tin trước khi đặt hàng</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Delivery & Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Thông tin giao hàng
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditing(!editing)}
                  >
                    {editing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    {editing ? 'Hủy' : 'Chỉnh sửa'}
                  </Button>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Họ và tên *</label>
                        <Input
                          value={deliveryInfo.fullName}
                          onChange={(e) => handleDeliveryInfoChange('fullName', e.target.value)}
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Số điện thoại *</label>
                        <Input
                          value={deliveryInfo.phone}
                          onChange={(e) => handleDeliveryInfoChange('phone', e.target.value)}
                          placeholder="0912345678"
                          maxLength={10}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Địa chỉ *</label>
                        <Input
                          value={deliveryInfo.address}
                          onChange={(e) => handleDeliveryInfoChange('address', e.target.value)}
                          placeholder="Số nhà, tên đường"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Phường/Xã</label>
                          <Input
                            value={deliveryInfo.ward}
                            onChange={(e) => handleDeliveryInfoChange('ward', e.target.value)}
                            placeholder="Phường 1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Quận/Huyện</label>
                          <Input
                            value={deliveryInfo.district}
                            onChange={(e) => handleDeliveryInfoChange('district', e.target.value)}
                            placeholder="Quận 1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Ghi chú</label>
                        <Input
                          value={deliveryInfo.notes}
                          onChange={(e) => handleDeliveryInfoChange('notes', e.target.value)}
                          placeholder="Ghi chú cho người bán (không bắt buộc)"
                        />
                      </div>
                      <Button onClick={() => setEditing(false)} className="w-full">
                        <Check className="w-4 h-4 mr-2" />
                        Lưu thông tin
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Người nhận</p>
                        <p className="font-medium">{deliveryInfo.fullName || 'Chưa cập nhật'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Số điện thoại</p>
                        <p className="font-medium">{deliveryInfo.phone || 'Chưa cập nhật'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Địa chỉ</p>
                        <p className="font-medium">
                          {deliveryInfo.address ? 
                            `${deliveryInfo.address}, ${deliveryInfo.ward}, ${deliveryInfo.district}, ${deliveryInfo.city}` : 
                            'Chưa cập nhật'}
                        </p>
                      </div>
                      {deliveryInfo.notes && (
                        <div>
                          <p className="text-sm text-muted-foreground">Ghi chú</p>
                          <p className="font-medium">{deliveryInfo.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cart Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Sản phẩm ({cart.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.itemId} className="flex gap-4 p-4 bg-accent/50 rounded-lg">
                        <img 
                          src={item.itemImage || 'https://via.placeholder.com/80x80?text=No+Image'} 
                          alt={item.itemName}
                          className="w-20 h-20 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No+Image';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.itemName}</h4>
                          <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                          <p className="text-primary font-semibold mt-1">
                            {(item.price * item.quantity).toLocaleString()} điểm
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Point Balance */}
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Số dư điểm của bạn</p>
                    <p className="text-2xl font-bold text-primary">{userPoints.toLocaleString()} điểm</p>
                  </div>

                  {/* Price Summary */}
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-medium">{totalAmount.toLocaleString()} điểm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí vận chuyển</span>
                      <span className="font-medium text-green-600">Miễn phí</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{finalTotal.toLocaleString()} điểm</span>
                    </div>
                  </div>

                  {/* Point Check Warning */}
                  {userPoints < finalTotal && (
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Không đủ điểm</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Bạn cần thêm {(finalTotal - userPoints).toLocaleString()} điểm
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Confirm Button */}
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleConfirmOrder}
                    disabled={loading || userPoints < finalTotal}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Xác nhận đặt hàng'
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Insufficient Points Modal */}
      {showInsufficientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-6 h-6" />
                Không đủ điểm thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Bạn cần <span className="font-bold text-foreground">{finalTotal.toLocaleString()} điểm</span> để hoàn tất đơn hàng này.
              </p>
              <p className="text-muted-foreground">
                Số dư hiện tại: <span className="font-bold text-foreground">{userPoints.toLocaleString()} điểm</span>
              </p>
              <p className="text-muted-foreground">
                Thiếu: <span className="font-bold text-destructive">{(finalTotal - userPoints).toLocaleString()} điểm</span>
              </p>

              <div className="space-y-2 pt-4">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => router.push('/earn-points')}
                >
                  Tìm cách kiếm điểm
                </Button>
                <Button 
                  className="w-full" 
                  disabled
                  variant="default"
                >
                  Mua điểm (Sắp ra mắt)
                </Button>
                <Button 
                  className="w-full" 
                  variant="ghost"
                  onClick={() => setShowInsufficientModal(false)}
                >
                  Đóng
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}

