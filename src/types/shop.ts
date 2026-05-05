export interface IShopEntry {
  _id?: string;
  date: string;
  month: string;
  year: string;
  // productDetails: string;
  category: string;
  subcategory: string;
  quantity: number;
  productValue: number;
  totalCost: number;
  previousDue: number;
  deposit: number;
  truckFair: number;
  restTotalAmount: number;
  sign: string;
  adminEmail: string;
  adminName: string;
  status?: "active" | "trashed";
  createdAt?: Date;
  deletedAt?: Date;
}

export const monthOrder = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];