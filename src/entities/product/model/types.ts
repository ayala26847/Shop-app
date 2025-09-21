// Product entity types and interfaces

import { BaseEntity } from '../../../shared/types/common';
import { ProductId, CategoryId, Price, URL } from '../../../shared/types/brand';

export interface Product extends BaseEntity {
  id: ProductId;
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: Price;
  compareAtPrice?: Price;
  costPrice?: Price;
  images: ProductImage[];
  categoryId: CategoryId;
  category?: ProductCategory;
  variants: ProductVariant[];
  attributes: ProductAttribute[];
  inventory: ProductInventory;
  seo: ProductSEO;
  status: ProductStatus;
  tags: string[];
  weight?: number;
  dimensions?: ProductDimensions;
  isDigital: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isOnSale: boolean;
  averageRating: number;
  reviewCount: number;
  viewCount: number;
  purchaseCount: number;
  wishlistCount: number;
}

export interface ProductImage {
  id: string;
  url: URL;
  alt: string;
  title?: string;
  isPrimary: boolean;
  order: number;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  productId: ProductId;
  name: string;
  sku: string;
  price: Price;
  compareAtPrice?: Price;
  costPrice?: Price;
  images: ProductImage[];
  attributes: Record<string, string>;
  inventory: ProductInventory;
  isActive: boolean;
  order: number;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date';
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  options?: string[];
  order: number;
}

export interface ProductInventory {
  trackQuantity: boolean;
  quantity: number;
  allowBackorder: boolean;
  minQuantity: number;
  maxQuantity: number;
  lowStockThreshold: number;
  locations: InventoryLocation[];
}

export interface InventoryLocation {
  id: string;
  name: string;
  quantity: number;
  reserved: number;
  available: number;
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: URL;
  ogImage?: URL;
  twitterCard?: string;
  structuredData?: Record<string, any>;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in' | 'm' | 'ft';
}

export interface ProductCategory {
  id: CategoryId;
  name: string;
  slug: string;
  description?: string;
  image?: URL;
  parentId?: CategoryId;
  level: number;
  path: string;
  isActive: boolean;
  order: number;
  productCount: number;
  children?: ProductCategory[];
}

export interface ProductReview {
  id: string;
  productId: ProductId;
  userId: string;
  rating: number;
  title: string;
  content: string;
  isVerified: boolean;
  isHelpful: number;
  isNotHelpful: number;
  images?: URL[];
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface ProductSearchParams {
  query?: string;
  categoryId?: CategoryId;
  categoryIds?: CategoryId[];
  minPrice?: Price;
  maxPrice?: Price;
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  tags?: string[];
  attributes?: Record<string, string[]>;
  rating?: number;
  sortBy?: ProductSortField;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductSortField {
  field: 'name' | 'price' | 'createdAt' | 'updatedAt' | 'rating' | 'popularity' | 'sales';
  direction: 'asc' | 'desc';
}

export interface ProductCreateData {
  name: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: Price;
  compareAtPrice?: Price;
  costPrice?: Price;
  categoryId: CategoryId;
  images: Omit<ProductImage, 'id'>[];
  variants?: Omit<ProductVariant, 'id' | 'productId'>[];
  attributes?: Omit<ProductAttribute, 'id'>[];
  inventory?: Partial<ProductInventory>;
  seo?: Partial<ProductSEO>;
  tags?: string[];
  weight?: number;
  dimensions?: ProductDimensions;
  isDigital?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
}

export interface ProductUpdateData {
  name?: string;
  description?: string;
  shortDescription?: string;
  sku?: string;
  price?: Price;
  compareAtPrice?: Price;
  costPrice?: Price;
  categoryId?: CategoryId;
  images?: Omit<ProductImage, 'id'>[];
  variants?: Omit<ProductVariant, 'id' | 'productId'>[];
  attributes?: Omit<ProductAttribute, 'id'>[];
  inventory?: Partial<ProductInventory>;
  seo?: Partial<ProductSEO>;
  status?: ProductStatus;
  tags?: string[];
  weight?: number;
  dimensions?: ProductDimensions;
  isDigital?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
}

export interface ProductFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}

export interface ProductAggregation {
  field: string;
  function: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct';
  alias?: string;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  newProducts: number;
  onSaleProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  averagePrice: Price;
  totalValue: Price;
  topCategories: Array<{
    categoryId: CategoryId;
    name: string;
    count: number;
  }>;
  topSellingProducts: Array<{
    productId: ProductId;
    name: string;
    sales: number;
  }>;
}

export interface ProductRecommendation {
  productId: ProductId;
  score: number;
  reason: string;
  type: 'similar' | 'complementary' | 'trending' | 'personalized';
}

export interface ProductComparison {
  products: Product[];
  attributes: string[];
  differences: Array<{
    attribute: string;
    values: Record<string, any>;
  }>;
}

export interface ProductWishlist {
  id: string;
  userId: string;
  productId: ProductId;
  createdAt: string;
  product?: Product;
}

export interface ProductCartItem {
  id: string;
  userId: string;
  productId: ProductId;
  variantId?: string;
  quantity: number;
  price: Price;
  addedAt: string;
  product?: Product;
  variant?: ProductVariant;
}

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived';
export type ProductType = 'simple' | 'variable' | 'digital' | 'service';
export type ProductVisibility = 'public' | 'private' | 'password';
