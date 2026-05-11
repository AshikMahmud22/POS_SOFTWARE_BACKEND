export interface IRetailerEntry {
  _id?: string;
  date: string;
  month: string;
  year: string;
  retailerName: string;
  proprietorName: string;
  address: string;
  mobile: string;
  companyId: string;
  companyName: string;
  category: string;
  subcategory: string;
  rateType: "factory" | "ghat";
  doFactory: number;
  doGhat: number;
  quantity: number;
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