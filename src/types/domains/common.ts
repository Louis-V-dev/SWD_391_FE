// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];  // Backend uses 'content' not 'data'
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;  // Current page number
  first: boolean;
  last: boolean;
  empty: boolean;
  pageable?: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  // Legacy fields for backward compatibility
  data?: T[];
  total?: number;
  page?: number;
  limit?: number;
}

// UI Types
export interface Theme {
  mode: 'light' | 'dark';
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Form Types
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
}
