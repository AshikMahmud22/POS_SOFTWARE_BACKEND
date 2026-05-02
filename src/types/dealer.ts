import { Collection, Db } from "mongodb";

export interface IDealer {
  date: string;
  month: string;
  year: string;
  doDhaka: string;
  doGhat: string;
  bankDeposit: number;
  advDoQty: number;
  doLifting: number;
  excessDoQty: number;
  deliveredPartyName: string;
  deliveredQty: number;
  adminName: string;
  adminEmail: string;
  createdAt: Date;
}

export const getDealerCollection = (db: Db): Collection<IDealer> => {
  return db.collection<IDealer>("dealers");
};