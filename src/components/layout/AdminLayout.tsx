'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  Bell,
  Search,
  Recycle,
  AlertCircle,
  Building2,
  FolderTree
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { hasAdminAccess } from '@/lib/auth-utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Items', href: '/admin/items', icon: Package },
  { name: 'Brands', href: '/admin/brands', icon: Building2 },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Listings', href: '/admin/listings', icon: ShoppingBag },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check admin access
  useEffect(() => {
    // Wait for auth to finish loading
    if (!mounted || isLoading) return;
    
    // If no user, redirect to login
    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent(pathname));
      return;
    }
    
    // Debug: Log user role and type
    console.log('User role:', user.role);
    console.log('User type:', user.userType);
    console.log('User role type:', typeof user.role);
    console.log('User type type:', typeof user.userType);
    
    // Check if user has admin access through EITHER role OR userType
    const adminAccess = hasAdminAccess(user);
    
    console.log('Has admin access:', adminAccess);
    
    if (!adminAccess) {
      setAccessDenied(true);
      // Redirect to homepage after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [user, isLoading, mounted, pathname, router]);

  const handleLogout = () => {
    logout();
  };

  // Get user initials safely
  const getUserInitials = () => {
    if (!user) return '?';
    const first = user.firstName?.charAt(0) || user.username?.charAt(0) || '?';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  const getUserName = () => {
    if (!user) return 'Loading...';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || 'User';
  };

  const getUserEmail = () => {
    if (!user) return '';
    return user.email || '';
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied error
  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access the admin panel.
                <br />
                Only admins and staff members can access this area.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to homepage in 3 seconds...
              </p>
              <Button onClick={() => router.push('/')} className="w-full">
                Go to Homepage Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render admin layout if no user
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Recycle className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Green Loop</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-medium text-primary">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {getUserName()}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {getUserEmail()}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/">View Site</Link>
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-background">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
