export type PaymentMethod =
  | "CASH"
  | "TRANSFER"
  | "QRIS";

export type Payment = {
  id: number;
  orderId: number;
  amount: string;
  method: PaymentMethod;
  paidAt: string;
};