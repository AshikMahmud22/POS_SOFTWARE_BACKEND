import { Request, Response } from "express";
import { getDb } from "../config/db";
import { ObjectId } from "mongodb";
import { IParty } from "../types/party";

export const getParties = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const parties = await db.collection("parties").find({}).toArray();
    res.status(200).json({ success: true, data: parties });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch parties" });
  }
};

export const addParty = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { name, location, retailerName, proprietorName, address, mobile }: IParty = req.body;
    if (!name || !location) {
      res.status(400).json({ success: false, message: "Name and location are required" });
      return;
    }
    const newParty: IParty = {
      name,
      location,
      retailerName: retailerName || "",
      proprietorName: proprietorName || "",
      address: address || "",
      mobile: mobile || "",
      createdAt: new Date(),
    };
    const result = await db.collection("parties").insertOne(newParty);
    res.status(201).json({ success: true, message: "Party added successfully", insertedId: result.insertedId });
  } catch {
    res.status(500).json({ success: false, message: "Failed to add party" });
  }
};

export const updateParty = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const id = req.params.id as string;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid ID" });
      return;
    }
    const { name, location, retailerName, proprietorName, address, mobile }: Partial<IParty> = req.body;
    const result = await db.collection("parties").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          location,
          retailerName: retailerName || "",
          proprietorName: proprietorName || "",
          address: address || "",
          mobile: mobile || "",
        },
      }
    );
    if (result.modifiedCount === 0) {
      res.status(404).json({ success: false, message: "Party not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Party updated successfully", modifiedCount: result.modifiedCount });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update party" });
  }
};

export const deleteParty = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const id = req.params.id as string;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid ID" });
      return;
    }
    const result = await db.collection("parties").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: "Party not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Party deleted successfully", deletedCount: result.deletedCount });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete party" });
  }
};