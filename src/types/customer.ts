export type Customer = {
  id: number;
  name: string;
  phone: string;
  address: string | null;
  isActive: boolean;
  membership: {
    id: number;
    memberCode: string;
    discountPercent: number;
    isActive: boolean;
  } | null;
};