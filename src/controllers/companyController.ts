import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getCompanyCollection } from "../types/company";

export const addCompanyEntry = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    const collection = getCompanyCollection(db);
    const data = req.body;

    const dhakaBag = Number(data.dhakaDo?.bag || 0);
    const dhakaRate = Number(data.dhakaDo?.rate || 0);
    const ghatBag = Number(data.ghatDo?.bag || 0);
    const ghatRate = Number(data.ghatDo?.rate || 0);
    const cash = Number(data.bankDeposit?.cash || 0);
    const commission = Number(data.bankDeposit?.commission || 0);

    const newEntry = {
      ...data,
      year: String(data.year),
      dhakaDo: {
        bag: dhakaBag,
        rate: dhakaRate,
        amount: dhakaBag * dhakaRate
      },
      ghatDo: {
        bag: ghatBag,
        rate: ghatRate,
        amount: ghatBag * ghatRate
      },
      bankDeposit: {
        ...data.bankDeposit,
        cash: cash,
        commission: commission,
        totalDeposit: cash + commission
      },
      advDoQty: Number(data.advDoQty || 0),
      doLifting: Number(data.doLifting || 0),
      excessDoQty: Number(data.excessDoQty || 0),
      previousDo: Number(data.previousDo || 0),
      createdAt: data.createdAt ? new Date(data.createdAt as string) : new Date()
    };

    await collection.insertOne(newEntry);
    res.status(201).json({ success: true, message: "Entry added" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getCompanyEntries = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    const collection = getCompanyCollection(db);
    
    const page = req.query.page ? String(req.query.page) : "1";
    const limit = req.query.limit ? String(req.query.limit) : "10";
    const search = req.query.search ? String(req.query.search) : "";
    const month = req.query.month ? String(req.query.month) : "";
    const year = req.query.year ? String(req.query.year) : "";

    const query: any = {};
    if (month) query.month = month;
    if (year) query.year = year;
    
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { subcategory: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const entries = await collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).toArray();
    const totalCount = await collection.countDocuments(query);
    const availableYears = await collection.distinct("year");
    
    let availableMonths: string[] = [];
    if (year) {
      const distinctMonths = await collection.distinct("month", { year: year });
      const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      availableMonths = distinctMonths.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    }

    res.status(200).json({
      success: true,
      data: entries,
      totalPages: Math.ceil(totalCount / Number(limit)),
      currentPage: Number(page),
      totalCount,
      availableYears: availableYears.sort().reverse(),
      availableMonths
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateCompanyEntry = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    const collection = getCompanyCollection(db);
    const id = req.params.id as string;
    const data = req.body;

    const dhakaBag = Number(data.dhakaDo?.bag || 0);
    const dhakaRate = Number(data.dhakaDo?.rate || 0);
    const ghatBag = Number(data.ghatDo?.bag || 0);
    const ghatRate = Number(data.ghatDo?.rate || 0);
    const cash = Number(data.bankDeposit?.cash || 0);
    const commission = Number(data.bankDeposit?.commission || 0);

    const updateData = {
      ...data,
      year: String(data.year),
      dhakaDo: {
        bag: dhakaBag,
        rate: dhakaRate,
        amount: dhakaBag * dhakaRate
      },
      ghatDo: {
        bag: ghatBag,
        rate: ghatRate,
        amount: ghatBag * ghatRate
      },
      bankDeposit: {
        ...data.bankDeposit,
        cash: cash,
        commission: commission,
        totalDeposit: cash + commission
      },
      createdAt: data.createdAt ? new Date(data.createdAt as string) : new Date(),
      updatedAt: new Date()
    };

    delete updateData._id;

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    res.status(200).json({ success: true, message: "Entry updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteCompanyEntry = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    const collection = getCompanyCollection(db);
    const id = req.params.id as string;
    await collection.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true, message: "Entry deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};