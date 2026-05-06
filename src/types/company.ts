import { Collection, Db, ObjectId } from "mongodb";

export interface ICompanyEntry {
  _id?: ObjectId;
  companyName: string;
  year: string;
  month: string;
  category: string;
  subcategory: string;
  dhakaDo: { bag: number; rate: number; amount: number };
  ghatDo: { bag: number; rate: number; amount: number };
  bankDeposit: {
    totalDeposit: number;
    cash: number;
    commission: number;
    commissionReason: string;
  };
  advDoQty: number;
  doLifting: number;
  doLiftingSource: "dhaka" | "ghat";
  excessDoQty: number;
  previousDo: number;
  adminName: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const getCompanyCollection = (db: Db): Collection<ICompanyEntry> => {
  return db.collection<ICompanyEntry>("company_entries");
};
