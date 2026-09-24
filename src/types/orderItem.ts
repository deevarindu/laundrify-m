export type OrderItem = {
  id: number;
  order: {
    id: number;
    orderCode: string;
  };
  service: {
    id: number;
    category: string;
    unit: string;
    price: string;
  };
  quantity: string;
  priceSnapshot: string;
}