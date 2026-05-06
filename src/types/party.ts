import { ObjectId } from "mongodb";

export interface IParty {
  _id?: ObjectId;
  name: string;
  location: string;
  createdAt?: Date;
}