'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Recycle, 
  User, 
  Bell, 
  Menu, 
  X,
  Search,
  LogOut,
  Settings,
  ChevronDown,
  Gift,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { hasAdminAccess } from '@/lib/auth-utils';

interface HeaderProps {
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
  className?: string;
}

export default function Header({ 
  showSearch = true, 
  showNotifications = true, 
  showUserMenu = true,
  className = ""
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const { user, userPoints, logout } = useAuth();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));
    };

    updateCartCount();
    
    // Listen for cart updates
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  // Force re-render when userPoints changes
  useEffect(() => {
    // This will cause the component to re-render when points are updated from DB
  }, [userPoints]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: 'Home', href: '/', current: pathname === '/' },
    { name: 'Marketplace', href: '/marketplace', current: pathname === '/marketplace' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!user) return '?';
    const first = user.firstName?.charAt(0) || user.username?.charAt(0) || '?';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  return (
    <nav className={`sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm${className ? ' ' + className : ''}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Recycle className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Green Loop</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  item.current
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          {showSearch && (
            <div className="hidden lg:block flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="header-search"
                  name="search"
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </form>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search - Mobile */}
            {showSearch && (
              <div className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* User Points - Always from Database */}
            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm font-semibold text-primary">
                  {userPoints.toLocaleString()}
                </span>
              </div>
            )}

            {/* Shopping Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Notifications */}
            {showNotifications && (
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            {showUserMenu && (
              <div className="flex items-center space-x-2">
                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-xs font-medium text-primary">
                          {getUserInitials()}
                        </span>
                      </div>
                      <span className="hidden sm:inline">{user.firstName || 'User'}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-card border border-border z-50"
                        >
                          <div className="py-1">
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-border">
                              <p className="text-sm font-medium text-foreground">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                              <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-primary/10 rounded text-primary">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-xs font-semibold">
                                  {userPoints.toLocaleString()} điểm
                                </span>
                              </div>
                            </div>

                            {/* Menu Items */}

                            <Link
                              href="/profile/donations"
                              className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Gift className="mr-3 h-4 w-4" />
                              My Donations
                            </Link>

                            <Link
                              href="/profile/orders"
                              className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <ShoppingBag className="mr-3 h-4 w-4" />
                              My Orders
                            </Link>

                            <Link
                              href="/profile/settings"
                              className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Settings className="mr-3 h-4 w-4" />
                              Settings
                            </Link>


                            <div className="border-t border-border my-1"></div>

                            {/* Logout */}
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            >
                              <LogOut className="mr-3 h-4 w-4" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/auth/login">Sign In</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/auth/register">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              {showSearch && (
                <div className="px-3 py-2">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="header-search-mobile"
                      name="search"
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </form>
                </div>
              )}

              {/* Mobile Navigation */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    item.current
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile User Actions */}
              {user ? (
                <div className="px-3 py-2 space-y-2 border-t">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="w-full justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/auth/register">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
