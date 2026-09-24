export type Membership = {
 id: number;
 customer: {
  id: number;
  name: string;
  phone: string;
  address: string |null;
 };
 memberCode: string;
 discountPercent: string;
 isActive: string;
}