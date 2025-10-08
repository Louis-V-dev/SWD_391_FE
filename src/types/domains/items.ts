import { User } from './auth';

// Item Status Enum
export enum ItemStatus {
  SUBMITTED = 'SUBMITTED',
  PENDING_COLLECTION = 'PENDING_COLLECTION',
  COLLECTED = 'COLLECTED',
  VALUING = 'VALUING',
  VALUED = 'VALUED',
  PROCESSING = 'PROCESSING',
  READY_FOR_SALE = 'READY_FOR_SALE',
  LISTED = 'LISTED',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
  DONATED = 'DONATED',
  RECYCLED = 'RECYCLED',
  REJECTED = 'REJECTED'
}

// Acquisition Method Enum
export enum AcquisitionMethod {
  COLLECTED = 'COLLECTED',
  PURCHASED = 'PURCHASED',
  TRADED = 'TRADED',
  DONATED = 'DONATED',
  IMPORTED = 'IMPORTED'
}

// Category and Brand Types
export interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  isActive?: boolean;
}

export interface Brand {
  brandId: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  sustainabilityRating?: number;
  isVerified?: boolean;
  isPartner?: boolean;
}

// Item Response Interface (full details)
export interface ItemResponse {
  itemId: string;
  itemCode: string;
  name: string;
  description?: string;
  displayName: string;
  
  // Category and Brand
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  brandId?: string;
  brandName?: string;
  brandLogoUrl?: string;
  
  // Physical properties
  size?: string;
  color?: string;
  materialComposition?: { [key: string]: number };
  weightGrams?: number;
  dimensions?: { [key: string]: number };
  
  // Condition and valuation
  conditionScore?: number;
  conditionText?: string;
  conditionDescription?: string;
  originalPrice?: number;
  currentEstimatedValue?: number;
  
  // Ownership
  originalOwnerId?: string;
  originalOwnerName?: string;
  currentOwnerId?: string;
  currentOwnerName?: string;
  acquisitionMethod?: AcquisitionMethod;
  
  // Status
  itemStatus: ItemStatus;
  isVerified?: boolean;
  verificationDate?: string;
  verifiedById?: string;
  verifiedByName?: string;
  
  // Sustainability metrics
  carbonFootprintKg?: number;
  waterSavedLiters?: number;
  energySavedKwh?: number;
  isSustainable?: boolean;
  
  // Media
  images?: string[];
  videos?: string[];
  primaryImageUrl?: string;
  
  // Metadata
  tags?: string[];
  metadata?: { [key: string]: any };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Computed flags
  availableForListing?: boolean;
  inMarketplace?: boolean;
  hasImages?: boolean;
  hasVideos?: boolean;
}

// Item Summary Interface (for lists)
export interface ItemSummaryResponse {
  itemId: string;
  itemCode: string;
  name: string;
  displayName: string;
  
  categoryId?: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  
  size?: string;
  color?: string;
  
  conditionScore?: number;
  conditionText?: string;
  currentEstimatedValue?: number;
  
  itemStatus: ItemStatus;
  isVerified?: boolean;
  
  primaryImageUrl?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Keep backward compatibility
export type Item = ItemResponse;

// Item Request Types
export interface CreateItemRequest {
  categoryId: string;
  brandId?: string;
  name: string;
  description?: string;
  size?: string;
  color?: string;
  conditionScore: number;
  conditionDescription?: string;
  originalPrice?: number;
  currentEstimatedValue?: number;
  materialComposition?: { [key: string]: number };
  weightGrams?: number;
  dimensions?: { [key: string]: number };
  acquisitionMethod: AcquisitionMethod;
  images?: string[];
  videos?: string[];
  tags?: string[];
  metadata?: { [key: string]: any };
  carbonFootprintKg?: number;
  waterSavedLiters?: number;
  energySavedKwh?: number;
}

export interface UpdateItemRequest {
  categoryId?: string;
  brandId?: string;
  name?: string;
  description?: string;
  size?: string;
  color?: string;
  conditionScore?: number;
  conditionDescription?: string;
  originalPrice?: number;
  currentEstimatedValue?: number;
  materialComposition?: { [key: string]: number };
  weightGrams?: number;
  dimensions?: { [key: string]: number };
  acquisitionMethod?: AcquisitionMethod;
  itemStatus?: ItemStatus;
  images?: string[];
  videos?: string[];
  tags?: string[];
  metadata?: { [key: string]: any };
  carbonFootprintKg?: number;
  waterSavedLiters?: number;
  energySavedKwh?: number;
}

// Status Update Request
export interface ItemStatusUpdateRequest {
  newStatus: ItemStatus;
  reason?: string;
}
