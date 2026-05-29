export type ProductType = 't-shirt' | 'hoodie' | 'mug' | 'phone-case' | 'poster'

export type DesignStatus = 'generated' | 'paid' | 'ordered' | 'shipped'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered'

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Design {
  id: string
  user_id: string
  prompt: string
  image_url: string
  product_type: ProductType
  product_variant_id: string | null
  status: DesignStatus
  created_at: string
}

export interface Order {
  id: string
  design_id: string
  user_id: string
  stripe_session_id: string | null
  printify_order_id: string | null
  shipping_address: Record<string, unknown> | null
  total_paid: number
  status: OrderStatus
  tracking_number: string | null
  created_at: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
