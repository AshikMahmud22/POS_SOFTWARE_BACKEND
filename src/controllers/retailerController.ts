import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/db";
import { monthOrder } from "../types/retailer";

const toId = (param: unknown): string => String(param);

export const getEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    const year = String(req.query.year || "");
    const month = String(req.query.month || "");
    const category = String(req.query.category || "");

    const query: Record<string, unknown> = { status: { $ne: "trashed" } };
    if (year) query.year = year;
    if (month) query.month = month;
    if (category) query.category = category;

    const entries = await db
      .collection("retailer")
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    const distinctYears = await db
      .collection("retailer")
      .distinct("year", { status: { $ne: "trashed" } });
    const availableYears = distinctYears.sort((a, b) => Number(b) - Number(a));

    let availableMonths: string[] = [];
    if (year) {
      const distinctMonths = await db
        .collection("retailer")
        .distinct("month", { year, status: { $ne: "trashed" } });
      availableMonths = distinctMonths.sort(
        (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
      );
    }

    const distinctCategories = await db
      .collection("retailer")
      .distinct("category", { status: { $ne: "trashed" } });

    res.status(200).json({
      success: true,
      data: entries,
      availableYears,
      availableMonths,
      availableCategories: distinctCategories.filter(Boolean),
    });
  } catch {
    res.status(500).json({ success: false, message: "Error fetching entries" });
  }
};

export const getTrashedEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    const entries = await db
      .collection("retailer")
      .find({ status: "trashed" })
      .sort({ deletedAt: -1 })
      .toArray();
    res.status(200).json({ success: true, data: entries });
  } catch {
    res.status(500).json({ success: false, message: "Error fetching trash" });
  }
};

export const addEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const newEntry = {
      ...req.body,
      createdAt: new Date(),
      status: "active",
    };
    const result = await db.collection("retailer").insertOne(newEntry);
    res.status(201).json({ success: true, _id: result.insertedId, ...newEntry });
  } catch {
    res.status(500).json({ success: false, message: "Error saving entry" });
  }
};

export const updateEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = toId(req.params.id);
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid ID" });
      return;
    }
    const { _id, ...updateData } = req.body;
    await db
      .collection("retailer")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    res.status(200).json({ success: true, message: "Updated successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

export const moveToTrash = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = toId(req.params.id);
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid ID" });
      return;
    }
    await db
      .collection("retailer")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "trashed", deletedAt: new Date() } }
      );
    res.status(200).json({ success: true, message: "Moved to trash" });
  } catch {
    res.status(500).json({ success: false, message: "Action failed" });
  }
};

export const restoreEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = toId(req.params.id);
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid ID" });
      return;
    }
    await db
      .collection("retailer")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "active" }, $unset: { deletedAt: "" } }
      );
    res.status(200).json({ success: true, message: "Restored successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Restore failed" });
  }
};

export const permanentDelete = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = toId(req.params.id);
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid ID" });
      return;
    }
    await db.collection("retailer").deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true, message: "Permanently deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

export const getEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = toId(req.params.id);
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid ID" });
      return;
    }
    const entry = await db.collection("retailer").findOne({ _id: new ObjectId(id) });
    if (!entry) {
      res.status(404).json({ success: false, message: "Entry not found" });
      return;
    }
    res.status(200).json({ success: true, data: entry });
  } catch {
    res.status(500).json({ success: false, message: "Error fetching entry" });
  }
};