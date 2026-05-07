import { Request, Response } from "express";
import { getDb } from "../config/db";
import { ObjectId } from "mongodb";
import { ICollection } from "../types/collection";

export const getCollections = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const collections = await db.collection("collection").find({}).toArray();
    res.status(200).json({ success: true, data: collections });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch entries" });
  }
};

export const addCollection = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const body: ICollection = req.body;
    if (!body.partyId || !body.partyName || !body.date) {
      res.status(400).json({ success: false, message: "Required fields missing" });
      return;
    }
    const newEntry: ICollection = {
      ...body,
      bag: Number(body.bag),
      rate: Number(body.rate),
      totalCost: Number(body.totalCost),
      truckFair: Number(body.truckFair),
      previousDue: Number(body.previousDue),
      partyBalance: Number(body.partyBalance),
      createdAt: new Date(),
    };
    const result = await db.collection("collection").insertOne(newEntry);
    res.status(201).json({ success: true, message: "Entry added successfully", insertedId: result.insertedId });
  } catch {
    res.status(500).json({ success: false, message: "Failed to add entry" });
  }
};

export const updateCollection = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const id = req.params.id as string;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid ID" });
      return;
    }
    const body: Partial<ICollection> = req.body;
    const { _id, createdAt, ...rest } = body;
    const updateData = {
      ...rest,
      bag: Number(body.bag),
      rate: Number(body.rate),
      totalCost: Number(body.totalCost),
      truckFair: Number(body.truckFair),
      previousDue: Number(body.previousDue),
      partyBalance: Number(body.partyBalance),
    };
    const result = await db.collection("collection").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    if (result.modifiedCount === 0) {
      res.status(404).json({ success: false, message: "Entry not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Entry updated successfully", modifiedCount: result.modifiedCount });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update entry" });
  }
};

export const deleteCollection = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const id = req.params.id as string;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid ID" });
      return;
    }
    const result = await db.collection("collection").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: "Entry not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Entry deleted successfully", deletedCount: result.deletedCount });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete entry" });
  }
};