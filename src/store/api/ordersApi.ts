import { createApi } from '@reduxjs/toolkit/query/react'
import { supabase } from '../../lib/supabase'

// Types
export interface Address {
  full_name: string
  company?: string
  address_line_1: string
  address_line_2?: string
  city: string
  state_province: string
  postal_code: string
  country: string
  phone?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id?: string
  quantity: number
  unit_price: number
  total_price: number
  product?: {
    id: string
    name: string
    images?: string[]
  }
  variant?: {
    id: string
    title: string
  }
}

export interface Order {
  id: string
  order_number: string
  user_id?: string
  email: string
  phone?: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  fulfillment_status: 'unfulfilled' | 'partial' | 'fulfilled'
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'voided'
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number
  billing_address: Address
  shipping_address: Address
  notes?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrdersResponse {
  orders: Order[]
  total: number
  hasMore: boolean
}

export interface CreateOrderRequest {
  email: string
  phone?: string
  billing_address: Address
  shipping_address: Address
  notes?: string
  payment_method: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery'
}

export interface OrderFilters {
  status?: string
  fulfillment_status?: string
  payment_status?: string
  search?: string
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
}

export interface UpdateOrderStatusRequest {
  order_id: string
  status?: Order['status']
  fulfillment_status?: Order['fulfillment_status']
  payment_status?: Order['payment_status']
  notes?: string
}

// Base query function
const fakeBaseQuery = () => ({ data: null })

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fakeBaseQuery,
  tagTypes: ['Order', 'OrderItem', 'OrderStats'],
  endpoints: (builder) => ({
    // Get orders (with filtering and pagination)
    getOrders: builder.query<OrdersResponse, OrderFilters>({
      queryFn: async (filters) => {
        try {
          let query = supabase
            .from('orders')
            .select(`
              *,
              order_items (
                id,
                product_id,
                variant_id,
                quantity,
                unit_price,
                total_price,
                products (
                  id,
                  name,
                  images
                ),
                product_variants (
                  id,
                  title
                )
              )
            `)
            .order('created_at', { ascending: false })

          // Apply filters
          if (filters.status) {
            query = query.eq('status', filters.status)
          }
          if (filters.fulfillment_status) {
            query = query.eq('fulfillment_status', filters.fulfillment_status)
          }
          if (filters.payment_status) {
            query = query.eq('payment_status', filters.payment_status)
          }
          if (filters.search) {
            query = query.or(`order_number.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
          }
          if (filters.date_from) {
            query = query.gte('created_at', filters.date_from)
          }
          if (filters.date_to) {
            query = query.lte('created_at', filters.date_to)
          }

          // Pagination
          const page = filters.page || 1
          const limit = filters.limit || 20
          const offset = (page - 1) * limit

          query = query.range(offset, offset + limit - 1)

          const { data, error, count } = await query

          if (error) throw error

          return {
            data: {
              orders: data || [],
              total: count || 0,
              hasMore: data ? data.length === limit : false
            }
          }
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['Order']
    }),

    // Get single order
    getOrder: builder.query<Order, string>({
      queryFn: async (orderId) => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (
                id,
                product_id,
                variant_id,
                quantity,
                unit_price,
                total_price,
                products (
                  id,
                  name,
                  images
                ),
                product_variants (
                  id,
                  title
                )
              )
            `)
            .eq('id', orderId)
            .single()

          if (error) throw error

          return { data }
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: (result, error, orderId) => [{ type: 'Order', id: orderId }]
    }),

    // Get user's orders
    getUserOrders: builder.query<OrdersResponse, { page?: number; limit?: number }>({
      queryFn: async ({ page = 1, limit = 10 }) => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) throw new Error('User not authenticated')

          const offset = (page - 1) * limit

          const { data, error, count } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (
                id,
                product_id,
                variant_id,
                quantity,
                unit_price,
                total_price,
                products (
                  id,
                  name,
                  images
                ),
                product_variants (
                  id,
                  title
                )
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

          if (error) throw error

          return {
            data: {
              orders: data || [],
              total: count || 0,
              hasMore: data ? data.length === limit : false
            }
          }
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['Order']
    }),

    // Create order from cart
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      queryFn: async (orderData) => {
        try {
          const { data: { user } } = await supabase.auth.getUser()

          // Get current cart items
          const { data: cartData, error: cartError } = await supabase
            .from('cart_items')
            .select(`
              id,
              product_id,
              variant_id,
              quantity,
              products (
                id,
                name,
                price,
                inventory_quantity
              ),
              product_variants (
                id,
                title,
                price,
                inventory_quantity
              )
            `)
            .eq('user_id', user?.id || '')

          if (cartError) throw cartError
          if (!cartData || cartData.length === 0) {
            throw new Error('Cart is empty')
          }

          // Calculate totals
          let subtotal = 0
          const orderItems = cartData.map((item: any) => {
            const product = item.products
            const variant = item.product_variants
            const unitPrice = variant?.price || product.price
            const totalPrice = unitPrice * item.quantity
            subtotal += totalPrice

            return {
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              unit_price: unitPrice,
              total_price: totalPrice
            }
          })

          // Calculate tax and shipping
          const taxRate = 0.17 // 17% VAT in Israel
          const taxAmount = subtotal * taxRate
          const shippingAmount = subtotal >= 200 ? 0 : 15
          const totalAmount = subtotal + taxAmount + shippingAmount

          // Generate order number
          const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

          // Create order
          const { data: orderResult, error: orderError } = await supabase
            .from('orders')
            .insert({
              order_number: orderNumber,
              user_id: user?.id,
              email: orderData.email,
              phone: orderData.phone,
              status: 'pending',
              fulfillment_status: 'unfulfilled',
              payment_status: 'pending',
              subtotal,
              tax_amount: taxAmount,
              shipping_amount: shippingAmount,
              discount_amount: 0,
              total_amount: totalAmount,
              billing_address: orderData.billing_address,
              shipping_address: orderData.shipping_address,
              notes: orderData.notes
            })
            .select()
            .single()

          if (orderError) throw orderError

          // Create order items
          const orderItemsWithOrderId = orderItems.map(item => ({
            ...item,
            order_id: orderResult.id
          }))

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsWithOrderId)

          if (itemsError) throw itemsError

          // Update inventory (deduct stock)
          for (const item of cartData) {
            const product = item.products
            const variant = item.product_variants

            if (variant) {
              // Update variant inventory
              const newQuantity = Math.max(0, variant.inventory_quantity - item.quantity)
              await supabase
                .from('product_variants')
                .update({ inventory_quantity: newQuantity })
                .eq('id', variant.id)
            } else {
              // Update product inventory
              const newQuantity = Math.max(0, product.inventory_quantity - item.quantity)
              await supabase
                .from('products')
                .update({ inventory_quantity: newQuantity })
                .eq('id', product.id)
            }
          }

          // Clear cart after successful order
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user?.id || '')

          return { data: orderResult }
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['Order', 'OrderStats'],
      // Also invalidate cart since it gets cleared
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          // Invalidate cart queries
          dispatch(ordersApi.util.invalidateTags(['Order']))
        } catch {}
      }
    }),

    // Update order status
    updateOrderStatus: builder.mutation<Order, UpdateOrderStatusRequest>({
      queryFn: async ({ order_id, ...updates }) => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', order_id)
            .select()
            .single()

          if (error) throw error

          return { data }
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: (result, error, { order_id }) => [
        { type: 'Order', id: order_id },
        'Order',
        'OrderStats'
      ]
    }),

    // Get order statistics
    getOrderStats: builder.query<{
      total_orders: number
      total_revenue: number
      pending_orders: number
      processing_orders: number
      shipped_orders: number
      delivered_orders: number
    }, void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('status, total_amount')

          if (error) throw error

          const stats = data.reduce((acc: any, order: any) => {
            acc.total_orders++
            acc.total_revenue += parseFloat(order.total_amount)

            switch (order.status) {
              case 'pending':
                acc.pending_orders++
                break
              case 'processing':
                acc.processing_orders++
                break
              case 'shipped':
                acc.shipped_orders++
                break
              case 'delivered':
                acc.delivered_orders++
                break
            }

            return acc
          }, {
            total_orders: 0,
            total_revenue: 0,
            pending_orders: 0,
            processing_orders: 0,
            shipped_orders: 0,
            delivered_orders: 0
          })

          return { data: stats }
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['OrderStats']
    }),

    // Cancel order
    cancelOrder: builder.mutation<Order, string>({
      queryFn: async (orderId) => {
        try {
          // First get the order to check if it can be cancelled
          const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single()

          if (fetchError) throw fetchError

          if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
            throw new Error('Order cannot be cancelled')
          }

          // Update order status
          const { data, error } = await supabase
            .from('orders')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select()
            .single()

          if (error) throw error

          // TODO: Restore inventory quantities

          return { data }
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: (result, error, orderId) => [
        { type: 'Order', id: orderId },
        'Order',
        'OrderStats'
      ]
    })
  })
})

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetUserOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useGetOrderStatsQuery,
  useCancelOrderMutation
} = ordersApi