'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import {
  User as UserIcon,
  Settings,
  Package,
  MapPin,
  ShoppingBag,
  Award,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const sidebarItems = [
  { id: 'overview', name: 'Overview', icon: UserIcon, path: '/profile' },
  { id: 'items', name: 'My Items', icon: Package, path: '/profile/items' },
  { id: 'address', name: 'Addresses', icon: MapPin, path: '/profile/addresses' },
  { id: 'points', name: 'Points', icon: Award, path: '/profile/points' },
  { id: 'orders', name: 'Orders', icon: ShoppingBag, path: '/profile/orders' },
  { id: 'settings', name: 'Settings', icon: Settings, path: '/profile/settings' },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router, mounted]);

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-24">
                <Card>
                  <CardContent className="p-4">
                    {/* User Info */}
                    <div className="mb-6 pb-6 border-b border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center overflow-hidden">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.firstName || 'Profile'} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-6 h-6 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-1">
                      {sidebarItems.map((item) => {
                        const isActive = pathname === item.path;
                        
                        return (
                          <button
                            key={item.id}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-green-50 text-green-600 font-medium dark:bg-green-900/20'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}




