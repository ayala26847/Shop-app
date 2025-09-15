import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../types/database'

// Cart types based on database schema
type CartItem = Database['public']['Tables']['cart_items']['Row']
type CartItemInsert = Database['public']['Tables']['cart_items']['Insert']
type CartItemUpdate = Database['public']['Tables']['cart_items']['Update']

// Enhanced cart item with product information
export interface EnhancedCartItem extends CartItem {
  product?: {
    id: string
    name: string
    price: number
    images: string[] | null
    inventory_quantity: number
    track_inventory: boolean
    is_active: boolean
  }
  variant?: {
    id: string
    title: string
    price: number | null
    inventory_quantity: number
    is_active: boolean
  }
  subtotal: number
  is_available: boolean
  stock_available: number
}

export interface CartSummary {
  items: EnhancedCartItem[]
  itemCount: number
  subtotal: number
  unavailableItems: EnhancedCartItem[]
}

export interface AddToCartRequest {
  productId: string
  variantId?: string
  quantity: number
}

export interface UpdateCartItemRequest {
  itemId: string
  quantity: number
}

// Helper function to generate session ID for guests
const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem('guest_session_id')
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('guest_session_id', sessionId)
  }
  return sessionId
}

// Helper function to handle Supabase errors
const handleError = (error: any): string => {
  if (error?.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Cart', 'CartItem'],
  endpoints: (builder) => ({
    // Get cart items for current user/session
    getCart: builder.query<CartSummary, void>({
      queryFn: async (_, { getState }) => {
        try {
          // Get current user
          const { data: { user } } = await supabase.auth.getUser()

          let query = supabase
            .from('cart_items')
            .select(`
              *,
              product:products(
                id,
                name,
                price,
                images,
                inventory_quantity,
                track_inventory,
                is_active
              ),
              variant:product_variants(
                id,
                title,
                price,
                inventory_quantity,
                is_active
              )
            `)

          if (user) {
            // Authenticated user cart
            query = query.eq('user_id', user.id)
          } else {
            // Guest cart
            const sessionId = getOrCreateSessionId()
            query = query.eq('session_id', sessionId)
          }

          const { data: cartItems, error } = await query

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleError(error),
              },
            }
          }

          // Transform cart items with calculated fields
          const enhancedItems: EnhancedCartItem[] = (cartItems || []).map(item => {
            const product = item.product
            const variant = item.variant

            // Calculate price (variant price takes precedence)
            const itemPrice = variant?.price ?? product?.price ?? 0

            // Calculate stock availability
            let stockAvailable = 0
            let isAvailable = false

            if (product) {
              if (variant) {
                stockAvailable = variant.inventory_quantity || 0
                isAvailable = variant.is_active && stockAvailable >= item.quantity
              } else {
                stockAvailable = product.track_inventory ? (product.inventory_quantity || 0) : 999
                isAvailable = product.is_active && stockAvailable >= item.quantity
              }
            }

            return {
              ...item,
              product,
              variant,
              subtotal: itemPrice * item.quantity,
              is_available: isAvailable,
              stock_available: stockAvailable,
            }
          })

          // Separate available and unavailable items
          const availableItems = enhancedItems.filter(item => item.is_available)
          const unavailableItems = enhancedItems.filter(item => !item.is_available)

          // Calculate totals
          const itemCount = availableItems.reduce((sum, item) => sum + item.quantity, 0)
          const subtotal = availableItems.reduce((sum, item) => sum + item.subtotal, 0)

          return {
            data: {
              items: enhancedItems,
              itemCount,
              subtotal,
              unavailableItems,
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
      providesTags: ['Cart'],
    }),

    // Add item to cart
    addToCart: builder.mutation<CartItem, AddToCartRequest>({
      queryFn: async ({ productId, variantId, quantity }) => {
        try {
          // Get current user
          const { data: { user } } = await supabase.auth.getUser()

          // First, check inventory availability
          let stockQuery
          if (variantId) {
            stockQuery = supabase
              .from('product_variants')
              .select('inventory_quantity, is_active')
              .eq('id', variantId)
              .single()
          } else {
            stockQuery = supabase
              .from('products')
              .select('inventory_quantity, track_inventory, is_active')
              .eq('id', productId)
              .single()
          }

          const { data: stockData, error: stockError } = await stockQuery

          if (stockError) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'Product not found',
              },
            }
          }

          // Check if product/variant is active
          if (!stockData.is_active) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'This product is no longer available',
              },
            }
          }

          // Check inventory
          const availableStock = variantId
            ? stockData.inventory_quantity || 0
            : (stockData.track_inventory ? (stockData.inventory_quantity || 0) : 999)

          if (availableStock < quantity) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: `Only ${availableStock} items available in stock`,
              },
            }
          }

          // Check if item already exists in cart
          let existingItemQuery = supabase
            .from('cart_items')
            .select('*')
            .eq('product_id', productId)

          if (variantId) {
            existingItemQuery = existingItemQuery.eq('variant_id', variantId)
          } else {
            existingItemQuery = existingItemQuery.is('variant_id', null)
          }

          if (user) {
            existingItemQuery = existingItemQuery.eq('user_id', user.id)
          } else {
            const sessionId = getOrCreateSessionId()
            existingItemQuery = existingItemQuery.eq('session_id', sessionId)
          }

          const { data: existingItems } = await existingItemQuery

          if (existingItems && existingItems.length > 0) {
            // Update existing item
            const existingItem = existingItems[0]
            const newQuantity = existingItem.quantity + quantity

            // Check if new quantity exceeds stock
            if (availableStock < newQuantity) {
              return {
                error: {
                  status: 'CUSTOM_ERROR',
                  error: `Cannot add ${quantity} more items. Only ${availableStock - existingItem.quantity} more available`,
                },
              }
            }

            const { data: updatedItem, error: updateError } = await supabase
              .from('cart_items')
              .update({ quantity: newQuantity })
              .eq('id', existingItem.id)
              .select()
              .single()

            if (updateError) {
              return {
                error: {
                  status: 'CUSTOM_ERROR',
                  error: handleError(updateError),
                },
              }
            }

            return { data: updatedItem }
          } else {
            // Create new cart item
            const cartItemData: CartItemInsert = {
              product_id: productId,
              variant_id: variantId || null,
              quantity,
              user_id: user?.id || null,
              session_id: user ? null : getOrCreateSessionId(),
            }

            const { data: newItem, error: insertError } = await supabase
              .from('cart_items')
              .insert(cartItemData)
              .select()
              .single()

            if (insertError) {
              return {
                error: {
                  status: 'CUSTOM_ERROR',
                  error: handleError(insertError),
                },
              }
            }

            return { data: newItem }
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
      invalidatesTags: ['Cart'],
    }),

    // Update cart item quantity
    updateCartItem: builder.mutation<CartItem, UpdateCartItemRequest>({
      queryFn: async ({ itemId, quantity }) => {
        try {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            const { error } = await supabase
              .from('cart_items')
              .delete()
              .eq('id', itemId)

            if (error) {
              return {
                error: {
                  status: 'CUSTOM_ERROR',
                  error: handleError(error),
                },
              }
            }

            return { data: null as any } // Item deleted
          } else {
            // Get current item to check inventory
            const { data: currentItem, error: fetchError } = await supabase
              .from('cart_items')
              .select(`
                *,
                product:products(inventory_quantity, track_inventory),
                variant:product_variants(inventory_quantity)
              `)
              .eq('id', itemId)
              .single()

            if (fetchError) {
              return {
                error: {
                  status: 'CUSTOM_ERROR',
                  error: handleError(fetchError),
                },
              }
            }

            // Check inventory
            const product = currentItem.product
            const variant = currentItem.variant

            const availableStock = variant
              ? variant.inventory_quantity || 0
              : (product?.track_inventory ? (product.inventory_quantity || 0) : 999)

            if (availableStock < quantity) {
              return {
                error: {
                  status: 'CUSTOM_ERROR',
                  error: `Only ${availableStock} items available in stock`,
                },
              }
            }

            // Update quantity
            const { data: updatedItem, error: updateError } = await supabase
              .from('cart_items')
              .update({ quantity })
              .eq('id', itemId)
              .select()
              .single()

            if (updateError) {
              return {
                error: {
                  status: 'CUSTOM_ERROR',
                  error: handleError(updateError),
                },
              }
            }

            return { data: updatedItem }
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
      invalidatesTags: ['Cart'],
    }),

    // Remove item from cart
    removeFromCart: builder.mutation<void, string>({
      queryFn: async (itemId) => {
        try {
          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId)

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleError(error),
              },
            }
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
      invalidatesTags: ['Cart'],
    }),

    // Clear entire cart
    clearCart: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()

          let deleteQuery = supabase.from('cart_items').delete()

          if (user) {
            deleteQuery = deleteQuery.eq('user_id', user.id)
          } else {
            const sessionId = getOrCreateSessionId()
            deleteQuery = deleteQuery.eq('session_id', sessionId)
          }

          const { error } = await deleteQuery

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleError(error),
              },
            }
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
      invalidatesTags: ['Cart'],
    }),

    // Sync guest cart with user account (called after login)
    syncGuestCart: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()

          if (!user) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'User not authenticated',
              },
            }
          }

          const sessionId = localStorage.getItem('guest_session_id')
          if (!sessionId) {
            return { data: undefined } // No guest cart to sync
          }

          // Get guest cart items
          const { data: guestItems, error: fetchError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('session_id', sessionId)

          if (fetchError) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleError(fetchError),
              },
            }
          }

          if (!guestItems || guestItems.length === 0) {
            // Clear session ID since no items to sync
            localStorage.removeItem('guest_session_id')
            return { data: undefined }
          }

          // Get existing user cart items
          const { data: userItems } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)

          // Merge guest items with user items
          for (const guestItem of guestItems) {
            // Check if user already has this product/variant combination
            const existingUserItem = userItems?.find(
              item =>
                item.product_id === guestItem.product_id &&
                item.variant_id === guestItem.variant_id
            )

            if (existingUserItem) {
              // Update existing user item quantity
              await supabase
                .from('cart_items')
                .update({
                  quantity: existingUserItem.quantity + guestItem.quantity
                })
                .eq('id', existingUserItem.id)
            } else {
              // Add guest item to user cart
              await supabase
                .from('cart_items')
                .insert({
                  ...guestItem,
                  id: undefined, // Let database generate new ID
                  user_id: user.id,
                  session_id: null,
                })
            }
          }

          // Remove guest cart items
          await supabase
            .from('cart_items')
            .delete()
            .eq('session_id', sessionId)

          // Clear guest session ID
          localStorage.removeItem('guest_session_id')

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
      invalidatesTags: ['Cart'],
    }),

    // Get cart count (for header badge)
    getCartCount: builder.query<number, void>({
      queryFn: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()

          let query = supabase
            .from('cart_items')
            .select('quantity', { count: 'exact' })

          if (user) {
            query = query.eq('user_id', user.id)
          } else {
            const sessionId = localStorage.getItem('guest_session_id')
            if (!sessionId) {
              return { data: 0 }
            }
            query = query.eq('session_id', sessionId)
          }

          const { data: items, error } = await query

          if (error) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: handleError(error),
              },
            }
          }

          const count = items?.reduce((sum, item) => sum + item.quantity, 0) || 0
          return { data: count }
        } catch (error: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: handleError(error),
            },
          }
        }
      },
      providesTags: ['Cart'],
    }),
  }),
})

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useSyncGuestCartMutation,
  useGetCartCountQuery,
} = cartApi