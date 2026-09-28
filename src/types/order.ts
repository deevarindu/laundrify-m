export type Order = {
  id: number;
  orderCode: string;
  orderStatus: string;
  paymentStatus: string;
  subtotal: string;
  discount: string;
  total: string;
  dueAt: string | null;
  createdAt: string;
  customer: {
    id: number;
    name: string;
    phone: string;
    address: string | null;
  };
  user: {
    id: number;
    name: string;
  };
  payment: {
    id: number;
    amount: string;
    method: string;
    paidAt: string;
    receivedBy?: {
      id: number;
      name: string;
    } | null;
  } | null;
  orderItems: OrderItem[];
  orderStatusHistories: OrderStatusHistory[];
};

export type OrderItem = {
  id: number;
  orderId: number;
  serviceId: number;
  quantity: number;
  priceSnapshot: string;
  subtotal: string;
  service: {
    id: number;
    name: string;
    category: string;
  };
};

export type OrderStatusHistory = {
  id: number;
  orderId: number;
  orderStatus: string;
  note: string | null;
  changedAt: string;
  user: {
    id: number;
    name: string;
  };
};