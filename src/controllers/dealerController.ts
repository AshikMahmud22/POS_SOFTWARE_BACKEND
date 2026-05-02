import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getDealerCollection } from "../types/dealer";

export const addDealerEntry = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    if (!db) throw new Error("Database connection not established");

    const collection = getDealerCollection(db);
    const { date } = req.body;
    const year = date.split("-")[0];
    const newEntry = {
      ...req.body,
      year,
      bankDeposit: Number(req.body.bankDeposit || 0),
      advDoQty: Number(req.body.advDoQty || 0),
      doLifting: Number(req.body.doLifting || 0),
      excessDoQty: Number(req.body.excessDoQty || 0),
      deliveredQty: Number(req.body.deliveredQty || 0),
      createdAt: new Date(),
    };
    await collection.insertOne(newEntry);
    res.status(201).json({ success: true, message: "Entry added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getDealerEntries = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    if (!db) throw new Error("Database connection not established");

    const collection = getDealerCollection(db);
    const { page = 1, limit = 10, search = "", month = "", year = "" } = req.query;

    const query: any = {};
    if (month) query.month = month;
    if (year) query.year = year;
    if (search) {
      query.$or = [
        { deliveredPartyName: { $regex: search, $options: "i" } },
        { doDhaka: { $regex: search, $options: "i" } },
        { doGhat: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const entries = await collection
      .find(query)
      .sort({ date: -1 })
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

export const updateDealerEntry = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    if (!db) throw new Error("Database connection not established");

    const collection = getDealerCollection(db);
    const id = req.params.id as string;
    const { date } = req.body;
    const updateData = { ...req.body };
    delete updateData._id;
    if (date) updateData.year = date.split("-")[0];

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

export const deleteDealerEntry = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    if (!db) throw new Error("Database connection not established");

    const collection = getDealerCollection(db);
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