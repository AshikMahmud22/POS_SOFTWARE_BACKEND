export interface IShopEntry {
  _id?: string;
  date: string;
  month: string;
  year: string;
  cementDetails: string;
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
}