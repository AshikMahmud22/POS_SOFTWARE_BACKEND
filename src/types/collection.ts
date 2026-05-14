import { ObjectId } from "mongodb";

export interface ICollection {
  _id?: ObjectId;
  date: string;
  month: string;
  year: string;
  partyId: string;
  partyName: string;
  bag: number;
  rate: number;
  rateType?: "factory" | "ghat";
  totalCost: number;
  truckFairType: "dealer" | "retailer";
  truckFair: number;
  previousDue: number;
  cashCollection: number;
  totalDeposit: number;
  partyBalance: number;
  adminName?: string;
  adminEmail?: string;
  createdAt?: Date;
}