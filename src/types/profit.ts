import { Collection, Db } from "mongodb";

export interface IProfit {
  date: string;
  month: string;
  year: string;
  retailSite: string;
  qty: number;
  doRate: number;
  truckFair: number;
  total: number;
  landingRate: number;
  com: number;
  afterComRate: number;
  profitLoss: number;
  netProfit: number;
  remarks: string;
  createdAt: Date;
}

export const getProfitCollection = (db: Db): Collection<IProfit> => {
  return db.collection<IProfit>("profits");
};