import { ObjectId } from "mongodb";

export interface IParty {
  _id?: ObjectId;
  name: string;
  location: string;
  retailerName?: string;
  proprietorName?: string;
  address?: string;
  mobile?: string;
  createdAt?: Date;
}