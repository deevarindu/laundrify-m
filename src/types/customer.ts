export type Customer = {
  id: number;
  name: string;
  phone: string;
  address: string | null;
  isActive: string;
  membership: {
    id: number;
    memberCode: string;
    isActive: string;
  } |null;
}