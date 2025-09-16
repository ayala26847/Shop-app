import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../types/database'

// Product types based on database schema
type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']
type ProductVariant = Database['public']['Tables']['product_variants']['Row']
type ProductVariantInsert = Database['public']['Tables']['product_variants']['Insert']
type Category = Database['public']['Tables']['categories']['Row']

// Enhanced product type with relationships
export interface EnhancedProduct extends Product {
  categories?: Category[]
  variants?: ProductVariant[]
  total_variants?: number
  available_variants?: number
  main_image?: string
  is_in_stock?: boolean
  display_price?: number
  has_variants?: boolean
}

// API response types
export interface ProductsResponse {
  products: EnhancedProduct[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ProductFilters {
  category?: string
  search?: string
  inStock?: boolean
  featured?: boolean
  priceMin?: number
  priceMax?: number
  sortBy?: 'name' | 'price' | 'created_at' | 'rating'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Helper function to handle Supabase errors
const handleError = (error: any): string => {
  if (error?.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Product', 'ProductVariant', 'Category', 'Inventory'],
  endpoints: (builder) => ({
    // Get all categories
    getCategories: builder.query<Category[], void>({
      queryFn: async () => {
        try {
          const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleError(error),
              },
            }
          }

          return { data: categories || [] }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleError(error),
            },
          }
        }
      },
      providesTags: ['Category'],
    }),

    // Get category by ID
    getCategory: builder.query<Category, string>({
      queryFn: async (categoryId) => {
        try {
          const { data: category, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', categoryId)
            .eq('is_active', true)
            .single()

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleError(error),
              },
            }
          }

          return { data: category }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleError(error),
            },
          }
        }
      },
      providesTags: ['Category'],
    }),
    // Get products with filters and pagination
    getProducts: builder.query<ProductsResponse, ProductFilters>({
      queryFn: async (filters = {}) => {
        try {
          const {
            category,
            search,
            inStock,
            featured,
            priceMin,
            priceMax,
            sortBy = 'created_at',
            sortOrder = 'desc',
            page = 1,
            limit = 12
          } = filters

          let query

          if (category) {
            // When filtering by category, use inner join to ensure only products in that category
            query = supabase
              .from('products')
              .select(`
                *,
                product_categories!inner(
                  category:categories(*)
                ),
                variants:product_variants(
                  id,
                  title,
                  price,
                  inventory_quantity,
                  is_active
                )
              `)
              .eq('is_active', true)
              .eq('product_categories.category_id', category)
          } else {
            // When not filtering by category, use left join to include all products
            query = supabase
              .from('products')
              .select(`
                *,
                product_categories(
                  category:categories(*)
                ),
                variants:product_variants(
                  id,
                  title,
                  price,
                  inventory_quantity,
                  is_active
                )
              `)
              .eq('is_active', true)
          }

          if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`)
          }

          if (inStock) {
            query = query.gt('inventory_quantity', 0)
          }

          if (featured !== undefined) {
            query = query.eq('featured', featured)
          }

          if (priceMin !== undefined) {
            query = query.gte('price', priceMin)
          }

          if (priceMax !== undefined) {
            query = query.lte('price', priceMax)
          }

          // Apply sorting
          const ascending = sortOrder === 'asc'
          query = query.order(sortBy, { ascending })

          // Apply pagination
          const from = (page - 1) * limit
          const to = from + limit - 1
          query = query.range(from, to)

          const { data: products, error, count } = await query

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleError(error),
              },
            }
          }

          // Transform products to include computed fields
          const enhancedProducts: EnhancedProduct[] = (products || []).map(product => {
            const variants = product.variants || []
            const activeVariants = variants.filter(v => v.is_active)
            const categories = product.product_categories?.map(pc => pc.category).filter(Boolean) || []

            // Calculate display price (base price or lowest variant price)
            let displayPrice = product.price
            if (activeVariants.length > 0) {
              const variantPrices = activeVariants
                .map(v => v.price)
                .filter(p => p !== null) as number[]
              if (variantPrices.length > 0) {
                displayPrice = Math.min(displayPrice, ...variantPrices)
              }
            }

            // Check stock availability
            const baseStock = product.inventory_quantity || 0
            const variantStock = activeVariants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0)
            const totalStock = product.track_inventory ?
              (activeVariants.length > 0 ? variantStock : baseStock) :
              999 // Assume in stock if not tracking

            return {
              ...product,
              categories,
              variants: activeVariants,
              total_variants: variants.length,
              available_variants: activeVariants.length,
              main_image: product.images?.[0] || null,
              is_in_stock: totalStock > 0,
              display_price: displayPrice,
              has_variants: activeVariants.length > 0,
            }
          })

          return {
            data: {
              products: enhancedProducts,
              total: count || 0,
              page,
              limit,
              hasMore: (count || 0) > page * limit,
            },
          }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleError(error),
            },
          }
        }
      },
      providesTags: ['Product'],
    }),

    // Get single product by ID or slug
    getProduct: builder.query<EnhancedProduct, { id?: string; slug?: string }>({
      queryFn: async ({ id, slug }) => {
        try {
          if (!id && !slug) {
            throw new Error('Either id or slug must be provided')
          }

          let query = supabase
            .from('products')
            .select(`
              *,
              product_categories(
                category:categories(*)
              ),
              variants:product_variants(*)
            `)
            .eq('is_active', true)

          if (id) {
            query = query.eq('id', id)
          } else if (slug) {
            query = query.eq('slug', slug)
          }

          const { data: products, error } = await query

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleError(error),
              },
            }
          }

          const product = products?.[0]
          if (!product) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'Product not found',
              },
            }
          }

          // Transform product data
          const variants = product.variants || []
          const activeVariants = variants.filter(v => v.is_active)
          const categories = product.product_categories?.map(pc => pc.category).filter(Boolean) || []

          const enhancedProduct: EnhancedProduct = {
            ...product,
            categories,
            variants: activeVariants,
            total_variants: variants.length,
            available_variants: activeVariants.length,
            main_image: product.images?.[0] || null,
            is_in_stock: (product.inventory_quantity || 0) > 0,
            display_price: product.price,
            has_variants: activeVariants.length > 0,
          }

          return { data: enhancedProduct }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleError(error),
            },
          }
        }
      },
      providesTags: (result, error, { id, slug }) => [
        { type: 'Product', id: id || slug }
      ],
    }),

    // Get product variants
    getProductVariants: builder.query<ProductVariant[], string>({
      queryFn: async (productId) => {
        try {
          const { data: variants, error } = await supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', productId)
            .eq('is_active', true)
            .order('title')

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleError(error),
              },
            }
          }

          return { data: variants || [] }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleError(error),
            },
          }
        }
      },
      providesTags: (result, error, productId) => [
        { type: 'ProductVariant', id: productId }
      ],
    }),

    // Check inventory for product/variant
    checkInventory: builder.query<{ available: number; inStock: boolean }, { productId: string; variantId?: string }>({
      queryFn: async ({ productId, variantId }) => {
        try {
          if (variantId) {
            // Check variant inventory
            const { data: variant, error } = await supabase
              .from('product_variants')
              .select('inventory_quantity')
              .eq('id', variantId)
              .single()

            if (error) {
              return {
                error: {
                  status: 'CUSTOM_ERROR',
                  error: handleError(error),
                },
              }
            }

            const available = variant?.inventory_quantity || 0
            return {
              data: {
                available,
                inStock: available > 0,
              },
            }
          } else {
            // Check product inventory
            const { data: product, error } = await supabase
              .from('products')
              .select('inventory_quantity, track_inventory')
              .eq('id', productId)
              .single()

            if (error) {
              return {
                error: {
                  status: 'CUSTOM_ERROR',
                  error: handleError(error),
                },
              }
            }

            const available = product?.track_inventory ? (product.inventory_quantity || 0) : 999
            return {
              data: {
                available,
                inStock: available > 0,
              },
            }
          }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleError(error),
            },
          }
        }
      },
      providesTags: (result, error, { productId, variantId }) => [
        { type: 'Inventory', id: variantId || productId }
      ],
    }),

    // Update inventory (admin function)
    updateInventory: builder.mutation<
      void,
      { productId: string; variantId?: string; quantity: number; operation: 'set' | 'add' | 'subtract' }
    >({
      queryFn: async ({ productId, variantId, quantity, operation }) => {
        try {
          if (variantId) {
            // Update variant inventory
            let updateQuery

            if (operation === 'set') {
              updateQuery = supabase
                .from('product_variants')
                .update({ inventory_quantity: quantity })
                .eq('id', variantId)
            } else {
              // For add/subtract, we need to get current value first
              const { data: current, error: fetchError } = await supabase
                .from('product_variants')
                .select('inventory_quantity')
                .eq('id', variantId)
                .single()

              if (fetchError) throw fetchError

              const currentQty = current?.inventory_quantity || 0
              const newQty = operation === 'add' ?
                currentQty + quantity :
                Math.max(0, currentQty - quantity)

              updateQuery = supabase
                .from('product_variants')
                .update({ inventory_quantity: newQty })
                .eq('id', variantId)
            }

            const { error } = await updateQuery
            if (error) throw error
          } else {
            // Update product inventory
            let updateQuery

            if (operation === 'set') {
              updateQuery = supabase
                .from('products')
                .update({ inventory_quantity: quantity })
                .eq('id', productId)
            } else {
              const { data: current, error: fetchError } = await supabase
                .from('products')
                .select('inventory_quantity')
                .eq('id', productId)
                .single()

              if (fetchError) throw fetchError

              const currentQty = current?.inventory_quantity || 0
              const newQty = operation === 'add' ?
                currentQty + quantity :
                Math.max(0, currentQty - quantity)

              updateQuery = supabase
                .from('products')
                .update({ inventory_quantity: newQty })
                .eq('id', productId)
            }

            const { error } = await updateQuery
            if (error) throw error
          }

          return { data: undefined }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleError(error),
            },
          }
        }
      },
      invalidatesTags: (result, error, { productId, variantId }) => [
        { type: 'Inventory', id: variantId || productId },
        { type: 'Product', id: productId }
      ],
    }),

    // Create product (admin function)
    createProduct: builder.mutation<Product, ProductInsert>({
      queryFn: async (productData) => {
        try {
          const { data: product, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single()

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleError(error),
              },
            }
          }

          return { data: product }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleError(error),
            },
          }
        }
      },
      invalidatesTags: ['Product'],
    }),

    // Update product (admin function)
    updateProduct: builder.mutation<Product, { id: string; data: ProductUpdate }>({
      queryFn: async ({ id, data }) => {
        try {
          const { data: product, error } = await supabase
            .from('products')
            .update(data)
            .eq('id', id)
            .select()
            .single()

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleError(error),
              },
            }
          }

          return { data: product }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleError(error),
            },
          }
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        'Product'
      ],
    }),

    // Create product variant (admin function)
    createProductVariant: builder.mutation<ProductVariant, ProductVariantInsert>({
      queryFn: async (variantData) => {
        try {
          const { data: variant, error } = await supabase
            .from('product_variants')
            .insert(variantData)
            .select()
            .single()

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleError(error),
              },
            }
          }

          return { data: variant }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleError(error),
            },
          }
        }
      },
      invalidatesTags: (result, error, variantData) => [
        { type: 'ProductVariant', id: variantData.product_id },
        { type: 'Product', id: variantData.product_id }
      ],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useGetProductVariantsQuery,
  useCheckInventoryQuery,
  useUpdateInventoryMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useCreateProductVariantMutation,
} = productsApi