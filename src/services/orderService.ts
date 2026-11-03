import { Order, OrderStatus, OrderType, OrderStatusHistoryItem } from '../types/cafe';
import { ORDER_TRACKING_CONFIG, DISHES } from '../config/cafeConfig';

const STORAGE_KEY = 'brew_luxe_orders_v1';
const CHANNEL_NAME = 'brew_order_channel';


// Safe localStorage access
const safeGetStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Storage read failed:', err);
    return fallback;
  }
};

const safeSetStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Storage write failed:', err);
  }
};

// Safe BroadcastChannel initialization
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  broadcastChannel = null;
}

const notifyBroadcast = (type: string, orderId: string, order?: Order) => {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type, orderId, order });
    }
  } catch (e) {
    // ignore
  }
};

// Clean Order ID helper (handles "#BRW-7977", "BRW-7977", "7977")
export const normalizeOrderId = (id: string): string => {
  const clean = id.trim().replace(/^#/, '').toUpperCase();
  if (!clean.startsWith('BRW-') && /^\d+$/.test(clean)) {
    return `BRW-${clean}`;
  }
  return clean;
};

// Helper for stage titles & copy
export const getStageDetails = (status: OrderStatus, orderType: OrderType) => {
  const isDelivery = orderType === 'delivery';

  switch (status) {
    case 'placed':
      return {
        title: 'Order Placed',
        description: isDelivery
          ? 'Your order has been received by our roastery'
          : 'Your table order has been received',
        headline: isDelivery
          ? 'Order Placed & Awaiting Confirmation'
          : 'Table Order Placed',
      };
    case 'confirmed':
      return {
        title: isDelivery ? 'Confirmed by Cafe' : 'Confirmed',
        description: isDelivery
          ? 'The cafe roastery has accepted your order'
          : 'Order accepted by our head barista',
        headline: 'Confirmed by Our Roastery',
      };
    case 'preparing':
      return {
        title: 'Being Prepared',
        description: isDelivery
          ? 'Your barista is pouring your cappuccino & packing freshly baked pastries'
          : 'Crafting your single-origin extraction & plating warm pastries',
        headline: 'Your Brew is Being Prepared',
      };
    case 'out_for_delivery':
      return {
        title: 'Out for Delivery',
        description: 'Your rider is on the way with your warm brew',
        headline: 'Rider is Out for Delivery',
      };
    case 'ready_to_serve':
      return {
        title: 'Ready to Serve',
        description: 'Plated and heading to your table',
        headline: 'Your Order is Being Brought to Your Table',
      };
    case 'delivered':
      return {
        title: 'Delivered',
        description: 'Delivered! Savor every sip of your specialty roast',
        headline: 'Order Delivered • Enjoy Your Brew!',
      };
    case 'served':
      return {
        title: 'Served',
        description: 'Served! Enjoy your time at BREW.',
        headline: 'Served • Enjoy Your Time at BREW!',
      };
    case 'cancelled':
      return {
        title: 'Order Cancelled',
        description: 'This order was cancelled and refunded.',
        headline: 'Order Cancelled',
      };
    default:
      return {
        title: 'Processing',
        description: 'Updating status...',
        headline: 'Updating Order Status',
      };
  }
};

/**
 * Save an order to localStorage
 */
export const saveOrder = (order: Order): void => {
  const orders = getAllOrders();
  const existingIdx = orders.findIndex(
    (o) => normalizeOrderId(o.id) === normalizeOrderId(order.id)
  );

  let updatedList: Order[];
  if (existingIdx >= 0) {
    updatedList = [...orders];
    updatedList[existingIdx] = order;
  } else {
    updatedList = [order, ...orders];
  }

  safeSetStorage(STORAGE_KEY, updatedList);
  notifyBroadcast('ORDER_SAVED', order.id, order);
};

/**
 * Get all orders (includes seed order BRW-7977 for instant demo testing if storage is empty)
 */
export const getAllOrders = (): Order[] => {
  const orders = safeGetStorage<Order[]>(STORAGE_KEY, []);
  if (orders.length === 0) {
    const seedOrder: Order = {
      id: 'BRW-7977',
      createdAt: Date.now() - 32000, // 32 seconds ago -> currently in 'preparing'
      orderType: 'delivery',
      status: 'preparing',
      statusHistory: [
        {
          status: 'placed',
          timestamp: Date.now() - 32000,
          title: 'Order Placed',
          description: 'Your order has been received by our roastery',
        },
        {
          status: 'confirmed',
          timestamp: Date.now() - 24000,
          title: 'Confirmed by Cafe',
          description: 'The cafe roastery has accepted your order',
        },
        {
          status: 'preparing',
          timestamp: Date.now() - 7000,
          title: 'Being Prepared',
          description: 'Your barista is pouring your cappuccino & packing freshly baked pastries',
        },
      ],
      customer: {
        name: 'Aarav Mehta',
        phone: '9876543210',
      },
      destination: '402 Palm Heights, 12th Main Road, Indiranagar',
      landmark: 'Flat 402, 4th Floor (Near Defence Colony Park)',
      distanceKm: 2.1,
      accuracy: 18,
      googleMapsUrl: 'https://www.google.com/maps?q=12.9805,77.6535',
      coordinates: ORDER_TRACKING_CONFIG.defaultCustomerCoords,
      items: [
        {
          dish: DISHES[0],
          quantity: 2,
        },
        {
          dish: DISHES[2],
          quantity: 1,
        },
      ],
      totals: {
        subtotal: 780,
        discount: 156,
        deliveryFee: 0,
        tax: 31,
        grandTotal: 655,
      },
      paymentMode: 'upi',
      estimatedMinutes: 12,
      rider: ORDER_TRACKING_CONFIG.defaultRider,
    };
    safeSetStorage(STORAGE_KEY, [seedOrder]);
    return [seedOrder];
  }
  return orders;
};

/**
 * Get order by ID
 */
export const getOrderById = (orderId: string): Order | null => {
  const cleanId = normalizeOrderId(orderId);
  const orders = getAllOrders();
  const found = orders.find((o) => normalizeOrderId(o.id) === cleanId);
  return found || null;
};

/**
 * Lookup order by Order ID and Customer Phone number
 */
export const findOrderByPhoneAndId = (orderId: string, phone: string): Order | null => {
  const cleanId = normalizeOrderId(orderId);
  const cleanPhone = phone.replace(/\D/g, '');
  const orders = getAllOrders();

  const found = orders.find((o) => {
    const oId = normalizeOrderId(o.id);
    const oPhone = o.customer.phone.replace(/\D/g, '');
    return oId === cleanId && oPhone === cleanPhone;
  });

  return found || null;
};

/**
 * Update Order Status
 */
export const updateOrderStatus = (
  orderId: string,
  newStatus: OrderStatus,
  overrideTimestamp?: number
): Order | null => {
  const cleanId = normalizeOrderId(orderId);
  const order = getOrderById(cleanId);
  if (!order) return null;

  if (order.status === newStatus) return order;

  const stage = getStageDetails(newStatus, order.orderType);
  const historyItem: OrderStatusHistoryItem = {
    status: newStatus,
    timestamp: overrideTimestamp || Date.now(),
    title: stage.title,
    description: stage.description,
  };

  // Assign default rider if transitioning to out_for_delivery
  let rider = order.rider;
  if (newStatus === 'out_for_delivery' && !rider) {
    rider = ORDER_TRACKING_CONFIG.defaultRider;
  }

  const updatedOrder: Order = {
    ...order,
    status: newStatus,
    rider,
    statusHistory: [...order.statusHistory, historyItem],
  };

  saveOrder(updatedOrder);
  notifyBroadcast('ORDER_UPDATED', cleanId, updatedOrder);
  return updatedOrder;
};

/**
 * Cancel an order
 * Only allowed within the cancellation window (default 60s) and before preparation.
 */
export const cancelOrder = (orderId: string): { success: boolean; message: string } => {
  const order = getOrderById(orderId);
  if (!order) {
    return { success: false, message: 'Order not found.' };
  }

  if (order.status === 'cancelled') {
    return { success: false, message: 'Order is already cancelled.' };
  }

  if (['preparing', 'out_for_delivery', 'ready_to_serve', 'delivered', 'served'].includes(order.status)) {
    return {
      success: false,
      message: 'Cannot cancel an order that is already being prepared or out for delivery.',
    };
  }

  const elapsedSeconds = (Date.now() - order.createdAt) / 1000;
  if (elapsedSeconds > ORDER_TRACKING_CONFIG.cancellationWindowSeconds) {
    return {
      success: false,
      message: 'Cancellation window (60s) has expired.',
    };
  }

  updateOrderStatus(orderId, 'cancelled');
  return { success: true, message: 'Your order was successfully cancelled.' };
};

/**
 * Save patron rating and review for an order
 */
export const saveOrderRating = (
  orderId: string,
  stars: number,
  comment?: string
): boolean => {
  const order = getOrderById(orderId);
  if (!order) return false;

  const updated: Order = {
    ...order,
    rating: {
      stars,
      comment: comment?.trim() || undefined,
      createdAt: Date.now(),
    },
  };

  saveOrder(updated);
  notifyBroadcast('ORDER_RATED', order.id, updated);
  return true;
};

/**
 * Calculate expected stage from elapsed simulation time
 */
const getExpectedSimulatedStatus = (order: Order): OrderStatus => {
  if (order.status === 'cancelled') return 'cancelled';

  const elapsedSec = (Date.now() - order.createdAt) / 1000;
  const delays = ORDER_TRACKING_CONFIG.simulationDelaysSeconds;

  if (order.orderType === 'delivery') {
    if (elapsedSec >= delays.deliveredOrServed) return 'delivered';
    if (elapsedSec >= delays.outForDeliveryOrReady) return 'out_for_delivery';
    if (elapsedSec >= delays.preparing) return 'preparing';
    if (elapsedSec >= delays.confirmed) return 'confirmed';
    return 'placed';
  } else {
    // dine-in
    if (elapsedSec >= delays.deliveredOrServed) return 'served';
    if (elapsedSec >= delays.outForDeliveryOrReady) return 'ready_to_serve';
    if (elapsedSec >= delays.preparing) return 'preparing';
    if (elapsedSec >= delays.confirmed) return 'confirmed';
    return 'placed';
  }
};

/**
 * Status priority helper to prevent backwards step during simulation
 */
const STATUS_PRECEDENCE: Record<OrderStatus, number> = {
  placed: 1,
  confirmed: 2,
  preparing: 3,
  out_for_delivery: 4,
  ready_to_serve: 4,
  delivered: 5,
  served: 5,
  cancelled: 99,
};

/**
 * =========================================================================
 * SINGLE ENTRY POINT FOR ORDER STATUS UPDATES (Requirement 6)
 * `subscribeToOrder(orderId, callback)`
 * - Simulates real-time order progression via configurable timers
 * - Listens to cross-tab BroadcastChannel updates from the Admin dashboard
 * - Listens to storage events as a fallback
 * - Returns an unsubscribe cleanup function
 * =========================================================================
 */
export const subscribeToOrder = (
  orderId: string,
  callback: (order: Order) => void
): (() => void) => {
  const cleanId = normalizeOrderId(orderId);

  // Send current state immediately
  let currentOrder = getOrderById(cleanId);
  if (currentOrder) {
    callback(currentOrder);
  }

  // Cross-tab BroadcastChannel listener
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.orderId && normalizeOrderId(event.data.orderId) === cleanId) {
      const refreshed = getOrderById(cleanId);
      if (refreshed) {
        currentOrder = refreshed;
        callback(refreshed);
      }
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  // Window storage event fallback
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      const refreshed = getOrderById(cleanId);
      if (refreshed) {
        currentOrder = refreshed;
        callback(refreshed);
      }
    }
  };
  window.addEventListener('storage', handleStorage);

  // Simulation timer check
  const checkSimulation = () => {
    const latest = getOrderById(cleanId);
    if (!latest) return;
    if (latest.status === 'cancelled' || latest.status === 'delivered' || latest.status === 'served') {
      return;
    }

    const expected = getExpectedSimulatedStatus(latest);
    const currentWeight = STATUS_PRECEDENCE[latest.status] || 0;
    const expectedWeight = STATUS_PRECEDENCE[expected] || 0;

    // Advance if expected has moved forward
    if (expectedWeight > currentWeight && expected !== latest.status) {
      const updated = updateOrderStatus(cleanId, expected);
      if (updated) {
        currentOrder = updated;
        callback(updated);
      }
    }
  };

  // Run initial check and set interval
  checkSimulation();
  const intervalId = setInterval(checkSimulation, 1000);

  // Return unsubscribe
  return () => {
    clearInterval(intervalId);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
};
