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
  } |null;
}