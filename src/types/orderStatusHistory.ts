export type OrderStatusHistory = {
  id: number;
  order: {
    id: number;
    customer: {
      id: number;
      name: string;
    }
  };
  user: {
    id: number;
    name: string;
  };
  note: string | null;
}