import { CategoryId } from "./categories";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  categoryIds: CategoryId[];  // subCategories?: SubCategory[];
  description?: string;
}

export interface productsSlice {
  products: Product[];
  loading?: boolean;
  error?: string;
  selectedCategoryId?: CategoryId;
}

