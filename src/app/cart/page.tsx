'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { OrdersAPI, OrderCreateRequest } from '@/api/orders';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface CartItem {
  itemId: string;
  itemName: string;
  itemImage?: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/cart');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prevCart => {
      const updated = prevCart.map(item => 
        item.itemId === itemId 
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );
      localStorage.setItem('cart', JSON.stringify(updated));
      // Dispatch after state update
      setTimeout(() => window.dispatchEvent(new Event('cartUpdated')), 0);
      return updated;
    });
  };

  const removeItem = (itemId: string) => {
    setCart(prevCart => {
      const updated = prevCart.filter(item => item.itemId !== itemId);
      localStorage.setItem('cart', JSON.stringify(updated));
      // Dispatch after state update
      setTimeout(() => window.dispatchEvent(new Event('cartUpdated')), 0);
      return updated;
    });
  };

  const calculateSubtotal = (item: CartItem) => {
    return item.price * item.quantity;
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + calculateSubtotal(item), 0);
  };

  // Removed handleCheckout - now redirects to /checkout page

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (isLoading) {
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </button>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <ShoppingCart className="w-10 h-10 text-primary" />
              Shopping Cart
            </h1>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-lg border">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Add items from the marketplace to get started!
              </p>
              <button
                onClick={() => router.push('/marketplace')}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div key={item.itemId} className="bg-card rounded-lg border p-6 flex gap-4">
                    {/* Item Image */}
                    <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0">
                      {item.itemImage ? (
                        <img 
                          src={item.itemImage} 
                          alt={item.itemName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground mb-1">
                        {item.itemName}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatCurrency(item.price)} each
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.itemId, -1)}
                          className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.itemId, 1)}
                          className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal & Remove */}
                    <div className="text-right flex flex-col justify-between">
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(calculateSubtotal(item))}
                      </p>
                      <button
                        onClick={() => removeItem(item.itemId)}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg border p-6 sticky top-24">
                  <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({cart.length} items)</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax</span>
                      <span>{formatCurrency(0)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push('/checkout')}
                    disabled={cart.length === 0}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Tiến hành thanh toán
                  </button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Secure checkout powered by Green Loop
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

