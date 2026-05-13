import { Collection, Db, ObjectId } from "mongodb";

export interface ICompanyEntry {
  _id?: ObjectId;
  companyName: string;
  year: string;
  month: string;
  category: string;
  subcategory: string;
  doSource: "factory" | "ghat";
  dhakaDo: { bag: number; rate: number; amount: number };
  ghatDo: { bag: number; rate: number; amount: number };
  bankDeposit: {
    totalDeposit: number;
    cash: number;
    commission: number;
    commissionReason: string;
  };
  advDoQty: number;
  advDoAmount: number;
  doLifting: number;
  excessDoQty: number;
  previousDo: number;
  previousDoRate: number;
  previousDoAmount: number;
  previousDue: number;
  dueAmount: number;
  adminName: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const getCompanyCollection = (db: Db): Collection<ICompanyEntry> => {
  return db.collection<ICompanyEntry>("company");
};