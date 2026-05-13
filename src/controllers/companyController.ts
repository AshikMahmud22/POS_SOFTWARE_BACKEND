import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getCompanyCollection } from "../types/company";

const computeEntry = (data: Record<string, any>) => {
  const dhakaBag = Number(data.dhakaDo?.bag || 0);
  const dhakaRate = Number(data.dhakaDo?.rate || 0);
  const ghatBag = Number(data.ghatDo?.bag || 0);
  const ghatRate = Number(data.ghatDo?.rate || 0);
  const cash = Number(data.bankDeposit?.cash || 0);
  const commission = Number(data.bankDeposit?.commission || 0);
  const doLifting = Number(data.doLifting || 0);
  const doSource: "factory" | "ghat" = data.doSource === "ghat" ? "ghat" : "factory";
  const previousDue = Number(data.previousDue || 0);
  const previousDo = Number(data.previousDo || 0);
  const previousDoRate = Number(data.previousDoRate || 0);
  const previousDoAmount = previousDo * previousDoRate;

  const advDoQty = dhakaBag + ghatBag + previousDo;
  const advDoAmount = dhakaBag * dhakaRate + ghatBag * ghatRate + previousDoAmount;
  const totalDeposit = cash + commission;
  const excessDoQty = advDoQty - doLifting;
  const rawDue = advDoAmount - totalDeposit + previousDue;
  const dueAmount = rawDue < 0 ? 0 : rawDue;

  return {
    doSource,
    dhakaDo: { bag: dhakaBag, rate: dhakaRate, amount: dhakaBag * dhakaRate },
    ghatDo: { bag: ghatBag, rate: ghatRate, amount: ghatBag * ghatRate },
    bankDeposit: {
      commissionReason: data.bankDeposit?.commissionReason || "",
      cash,
      commission,
      totalDeposit,
    },
    advDoQty,
    advDoAmount,
    doLifting,
    excessDoQty,
    previousDo,
    previousDoRate,
    previousDoAmount,
    previousDue,
    dueAmount,
  };
};

export const addCompanyEntry = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    const collection = getCompanyCollection(db);
    const data = req.body;
    const computed = computeEntry(data);

    const newEntry = {
      ...data,
      ...computed,
      year: String(data.year),
      createdAt: data.createdAt ? new Date(data.createdAt as string) : new Date(),
    };

    delete newEntry.doLiftingSource;

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

    const query: Record<string, unknown> = {};
    if (month) query.month = month;
    if (year) query.year = year;

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { subcategory: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const entries = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .toArray();

    const totalCount = await collection.countDocuments(query);
    const availableYears = await collection.distinct("year");

    let availableMonths: string[] = [];
    if (year) {
      const monthOrder = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      const distinctMonths = await collection.distinct("month", { year });
      availableMonths = distinctMonths.sort(
        (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
      );
    }

    res.status(200).json({
      success: true,
      data: entries,
      totalPages: Math.ceil(totalCount / Number(limit)),
      currentPage: Number(page),
      totalCount,
      availableYears: availableYears.sort().reverse(),
      availableMonths,
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
    const computed = computeEntry(data);

    const updateData = {
      ...data,
      ...computed,
      year: String(data.year),
      createdAt: data.createdAt ? new Date(data.createdAt as string) : new Date(),
      updatedAt: new Date(),
    };

    delete updateData._id;
    delete updateData.doLiftingSource;

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

export const getPreviousDue = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    const collection = getCompanyCollection(db);

    const companyName = req.query.companyName ? String(req.query.companyName) : "";
    const excludeId = req.query.excludeId ? String(req.query.excludeId) : "";

    if (!companyName) {
      res.status(400).json({ success: false, message: "companyName is required" });
      return;
    }

    const query: Record<string, unknown> = {
      companyName: { $regex: `^${companyName}$`, $options: "i" },
    };

    if (excludeId) {
      query._id = { $ne: new ObjectId(excludeId) };
    }

    const result = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    const previousDue = result.length > 0 ? result[0].dueAmount : 0;
    const previousDoBags = result.length > 0 ? result[0].excessDoQty : 0;

    res.status(200).json({ success: true, previousDue, previousDoBags });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getCompanyEntry = async (req: Request, res: Response) => {
  try {
    const db = req.app.locals.db;
    const collection = getCompanyCollection(db);
    const id = req.params.id as string;
    const entry = await collection.findOne({ _id: new ObjectId(id) });
    if (!entry) {
      res.status(404).json({ success: false, message: "Entry not found" });
      return;
    }
    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};