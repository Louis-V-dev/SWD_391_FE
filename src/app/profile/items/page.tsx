'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Plus,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ItemsAPI } from '@/api/items';
import type { ItemSummaryResponse } from '@/types';

export default function MyItemsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ItemSummaryResponse[]>([]);

  useEffect(() => {
    if (user?.userId) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      const data = await ItemsAPI.getItemsByOwner(user.userId, { page: 0, size: 20 });
      setItems(data.content || []);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
          <Button onClick={() => router.push('/admin/items/create')}>
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
            {items.map((item: any) => (
              <Card key={item.itemId} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/item/${item.itemId}`)}>
                <div className="aspect-square bg-muted relative">
                  {item.imageUrl || item.mainImageUrl ? (
                    <img src={item.imageUrl || item.mainImageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 flex items-center justify-center">
                      <Package className="w-16 h-16 text-green-600/50" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      (item.status || item.itemStatus) === 'AVAILABLE' 
                        ? 'bg-green-100 text-green-800' 
                        : (item.status || item.itemStatus) === 'SOLD'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status || item.itemStatus}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-1">{item.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      {item.price || item.pointPrice || 0} pts
                    </span>
                    {item.condition && (
                      <span className="text-sm text-muted-foreground capitalize">
                        {item.condition.toLowerCase().replace('_', ' ')}
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
}




