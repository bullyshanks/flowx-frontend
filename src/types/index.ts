// ═══════════════════════════════════════════════════════════
//  Type definitions matching backend Prisma models
// ═══════════════════════════════════════════════════════════

export type Role = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'COD'
  | 'JAZZCASH'
  | 'EASYPAISA'
  | 'BANK_TRANSFER'
  | 'CARD';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type SubscriptionFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

// ─── Models ──

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  isVerified: boolean;
  vendorStatus?: VendorStatus;
  defaultAddress?: string;
  zone?: { id: string; name: string };
}

export interface Zone {
  id: string;
  name: string;
  city: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  unit: string;
  minQuantity: number;
  imageUrl?: string;
  isActive: boolean;
  commissionPct?: number | string | null;
  riderEarningPerUnit?: number | string;
  hasRiderDelivery?: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderStatusLog {
  id: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  guestName?: string;
  guestPhone?: string;
  zone: Zone;
  deliveryAddress: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  vendor?: { name: string; phone: string };
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  items: OrderItem[];
  statusHistory: OrderStatusLog[];
  createdAt: string;
}

// ─── API request/response shapes ──

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface PlaceOrderInput {
  items: Array<{ productId: string; quantity: number }>;
  zoneId: string;
  deliveryAddress: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  paymentMethod: PaymentMethod;
  guestName?: string;
  guestPhone?: string;
}

export interface VendorRegisterInput {
  name: string;
  phone: string;
  password: string;
  cnic?: string;
  zoneId: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}
