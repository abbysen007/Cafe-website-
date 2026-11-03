export type DishCategory = 'Coffee' | 'Cold Drinks' | 'Bakery' | 'Breakfast' | 'Desserts' | 'Snacks';

export interface Dish {
  id: string;
  name: string;
  category: DishCategory;
  price: number;
  rating: number;
  reviewsCount: number;
  shortTagline: string;
  heroTitle: {
    line1: string;
    line2: string;
  };
  description: string;
  origin: string; // origin / ingredients line
  tastingNotes: string[];
  tag?: 'Bestseller' | 'New' | "Chef's Special" | 'Seasonal';
  image: string;
  modelSrc: string; // .glb file URL
  iosSrc?: string; // .usdz file URL
  poster?: string;
  calories?: number;
  prepTime?: string;
  temperature?: 'Hot' | 'Iced' | 'Warm';
  roastOrigin?: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  temperature?: 'Hot' | 'Iced' | 'Warm';
  notes?: string;
}

export interface CategoryInfo {
  id: DishCategory;
  name: string;
  description: string;
  icon: string;
  count: number;
  image: string;
}

export interface ReservationData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  seating: 'Barista Counter' | 'Sunlit Garden' | 'Library Nook' | 'Main Roastery Hall';
  specialRequests?: string;
}

export type OrderType = 'delivery' | 'dine-in';

export type DeliveryStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type DineInStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready_to_serve'
  | 'served'
  | 'cancelled';

export type OrderStatus = DeliveryStatus | DineInStatus;

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: number;
  title: string;
  description: string;
}

export interface OrderCustomer {
  name: string;
  phone: string;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  grandTotal: number;
}

export interface OrderCoordinates {
  lat: number;
  lng: number;
  accuracy?: number | 'manual';
}

export interface OrderRating {
  stars: number;
  comment?: string;
  createdAt: number;
}

export interface OrderRider {
  name: string;
  phone: string;
  rating: number;
  avatar: string;
  vehicle: string;
}

export interface Order {
  id: string; // e.g. "BRW-7977"
  createdAt: number;
  orderType: OrderType;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  customer: OrderCustomer;
  destination: string; // address or table number
  landmark?: string; // e.g. "2nd floor, near the blue gate"
  distanceKm?: number; // straight-line distance from roastery
  accuracy?: number | 'manual'; // accuracy in metres or "manual"
  googleMapsUrl?: string; // https://www.google.com/maps?q=lat,lng
  coordinates?: OrderCoordinates; // for live map (delivery only)
  items: CartItem[];
  totals: OrderTotals;
  paymentMode: 'upi' | 'card' | 'counter';
  estimatedMinutes: number;
  rider?: OrderRider;
  rating?: OrderRating;
}

