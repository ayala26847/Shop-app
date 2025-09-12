import { CategoryId } from "./categories";

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  categoryIds: CategoryId[];
  description?: string;
  inStock: boolean;
  rating?: number;
  reviewsCount?: number;
  discount?: number;
}

export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedCategoryId?: CategoryId;
}

