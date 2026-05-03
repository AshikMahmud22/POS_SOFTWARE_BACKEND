import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getDeliveryCostCollection } from "../types/delivery";

export const addDeliveryCostEntry = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    if (!db) throw new Error("Database connection not established");

    const collection = getDeliveryCostCollection(db);
    const { date } = req.body;
    const year = date.split("-")[0];

    const newEntry = {
      ...req.body,
      year,
      bag: Number(req.body.bag || 0),
      carCost: Number(req.body.carCost || 0),
      doGive: Number(req.body.doGive || 0),
      doTake: Number(req.body.doTake || 0),
      gift: Number(req.body.gift || 0),
      createdAt: new Date(),
    };

    await collection.insertOne(newEntry);
    res.status(201).json({ success: true, message: "Entry added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getDeliveryCostEntries = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    if (!db) throw new Error("Database connection not established");

    const collection = getDeliveryCostCollection(db);
    const { page = 1, limit = 10, search = "", month = "", year = "" } = req.query;

    const query: any = {};
    if (month) query.month = month;
    if (year) query.year = year;
    if (search) {
      query.$or = [
        { retailSite: { $regex: search, $options: "i" } },
        { serialNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const entries = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .toArray();

    const total = await collection.countDocuments(query);

    const distinctYears = await collection.distinct("year");
    const availableYears = (Array.isArray(distinctYears) ? distinctYears : [])
      .sort((a: string, b: string) => Number(b) - Number(a));

    let availableMonths: string[] = [];
    if (year) {
      const monthOrder = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      const distinctMonths = await collection.distinct("month", { year });
      availableMonths = (Array.isArray(distinctMonths) ? distinctMonths : [])
        .sort((a: string, b: string) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    }

    res.status(200).json({
      success: true,
      data: entries,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      availableYears,
      availableMonths,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateDeliveryCostEntry = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    if (!db) throw new Error("Database connection not established");

    const collection = getDeliveryCostCollection(db);
    const id = req.params.id as string;
    const updateData = { ...req.body };
    delete updateData._id;
    if (updateData.date) updateData.year = updateData.date.split("-")[0];

    updateData.bag = Number(updateData.bag || 0);
    updateData.carCost = Number(updateData.carCost || 0);
    updateData.doGive = Number(updateData.doGive || 0);
    updateData.doTake = Number(updateData.doTake || 0);
    updateData.gift = Number(updateData.gift || 0);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.status(200).json({ success: true, message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteDeliveryCostEntry = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    if (!db) throw new Error("Database connection not established");

    const collection = getDeliveryCostCollection(db);
    const id = req.params.id as string;
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};