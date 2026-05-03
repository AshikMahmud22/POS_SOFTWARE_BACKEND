import { Collection, Db } from "mongodb";

export interface IDeliveryCost {
  date: string;
  month: string;
  year: string;
  serialNumber: string;
  retailSite: string;
  bag: number;
  carCost: number;
  doGive: number;
  doTake: number;
  gift: number;
  createdAt: Date;
}

export const getDeliveryCostCollection = (db: Db): Collection<IDeliveryCost> => {
  return db.collection<IDeliveryCost>("deliveryCosts");
};