import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/db";
import { monthOrder } from "../types/retailer";
import { getCompanyCollection } from "../types/company";

const toId = (param: unknown): string => String(param);

const deductBags = async (
  companyId: string,
  rateType: "factory" | "ghat",
  quantity: number,
) => {
  const company = await db
    .collection("company")
    .findOne({ _id: new ObjectId(companyId) });
  if (!company) return;

  const dhakaBag = Number(company.dhakaDo?.bag || 0);
  const ghatBag = Number(company.ghatDo?.bag || 0);
  const previousDo = Number(company.previousDo || 0);

  let newDhakaBag = dhakaBag;
  let newGhatBag = ghatBag;

  if (rateType === "factory") {
    newDhakaBag = dhakaBag - quantity;
  } else {
    newGhatBag = ghatBag - quantity;
  }

  const newAdvancedDo = previousDo + newDhakaBag + newGhatBag;

  await db.collection("company").updateOne(
    { _id: new ObjectId(companyId) },
    {
      $set: {
        "dhakaDo.bag": newDhakaBag,
        "ghatDo.bag": newGhatBag,
        advancedDo: newAdvancedDo,
      },
    },
  );
};

const restoreBags = async (
  companyId: string,
  rateType: "factory" | "ghat",
  quantity: number,
) => {
  const company = await db
    .collection("company")
    .findOne({ _id: new ObjectId(companyId) });
  if (!company) return;

  const dhakaBag = Number(company.dhakaDo?.bag || 0);
  const ghatBag = Number(company.ghatDo?.bag || 0);
  const previousDo = Number(company.previousDo || 0);

  let newDhakaBag = dhakaBag;
  let newGhatBag = ghatBag;

  if (rateType === "factory") {
    newDhakaBag = dhakaBag + quantity;
  } else {
    newGhatBag = ghatBag + quantity;
  }

  const newAdvancedDo = previousDo + newDhakaBag + newGhatBag;

  await db.collection("company").updateOne(
    { _id: new ObjectId(companyId) },
    {
      $set: {
        "dhakaDo.bag": newDhakaBag,
        "ghatDo.bag": newGhatBag,
        advancedDo: newAdvancedDo,
      },
    },
  );
};

export const getEntries = async (
  req: Request,
  res: Response,
): Promise<void> => {
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
        (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b),
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

export const getTrashedEntries = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

export const getEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = toId(req.params.id);
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid ID" });
      return;
    }
    const entry = await db
      .collection("retailer")
      .findOne({ _id: new ObjectId(id) });
    if (!entry) {
      res.status(404).json({ success: false, message: "Entry not found" });
      return;
    }
    res.status(200).json({ success: true, data: entry });
  } catch {
    res.status(500).json({ success: false, message: "Error fetching entry" });
  }
};

export const addEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const companyId = body.companyId;
    const rateType: "factory" | "ghat" =
      body.rateType === "ghat" ? "ghat" : "factory";
    const quantity = Number(body.quantity) || 0;

    if (!companyId || !ObjectId.isValid(companyId)) {
      res.status(400).json({ success: false, message: "Invalid companyId" });
      return;
    }

    const company = await db
      .collection("company")
      .findOne({ _id: new ObjectId(companyId) });
    if (!company) {
      res.status(404).json({ success: false, message: "Company not found" });
      return;
    }

    const availableBag =
      rateType === "factory"
        ? Number(company.dhakaDo?.bag || 0)
        : Number(company.ghatDo?.bag || 0);

    if (quantity > availableBag) {
      res.status(400).json({
        success: false,
        message: `Only ${availableBag} bags available for ${rateType}`,
      });
      return;
    }

    const newEntry = {
      ...body,
      quantity,
      createdAt: new Date(),
      status: "active",
    };

    const result = await db.collection("retailer").insertOne(newEntry);
    await deductBags(companyId, rateType, quantity);

    res.status(201).json({ success: true, _id: result.insertedId });
  } catch {
    res.status(500).json({ success: false, message: "Error saving entry" });
  }
};

export const updateEntry = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = toId(req.params.id);
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid ID" });
      return;
    }

    const existing = await db
      .collection("retailer")
      .findOne({ _id: new ObjectId(id) });
    if (!existing) {
      res.status(404).json({ success: false, message: "Entry not found" });
      return;
    }

    const body = req.body;
    const newQuantity = Number(body.quantity) || 0;
    const newRateType: "factory" | "ghat" =
      body.rateType === "ghat" ? "ghat" : "factory";
    const newCompanyId = body.companyId;

    const oldQuantity = Number(existing.quantity) || 0;
    const oldRateType: "factory" | "ghat" =
      existing.rateType === "ghat" ? "ghat" : "factory";
    const oldCompanyId = String(existing.companyId);

    await restoreBags(oldCompanyId, oldRateType, oldQuantity);

    const company = await db
      .collection("company")
      .findOne({ _id: new ObjectId(newCompanyId) });
    if (!company) {
      await deductBags(oldCompanyId, oldRateType, oldQuantity);
      res.status(404).json({ success: false, message: "Company not found" });
      return;
    }

    const availableBag =
      newRateType === "factory"
        ? Number(company.dhakaDo?.bag || 0)
        : Number(company.ghatDo?.bag || 0);

    if (newQuantity > availableBag) {
      await deductBags(oldCompanyId, oldRateType, oldQuantity);
      res.status(400).json({
        success: false,
        message: `Only ${availableBag} bags available for ${newRateType}`,
      });
      return;
    }

    const { _id, ...updateData } = body;
    await db
      .collection("retailer")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } },
      );

    await deductBags(newCompanyId, newRateType, newQuantity);

    res.status(200).json({ success: true, message: "Updated successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

export const moveToTrash = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = toId(req.params.id);
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid ID" });
      return;
    }

    const existing = await db
      .collection("retailer")
      .findOne({ _id: new ObjectId(id) });
    if (!existing) {
      res.status(404).json({ success: false, message: "Entry not found" });
      return;
    }

    const quantity = Number(existing.quantity) || 0;
    const rateType: "factory" | "ghat" =
      existing.rateType === "ghat" ? "ghat" : "factory";
    const companyId = String(existing.companyId);

    await db
      .collection("retailer")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "trashed", deletedAt: new Date() } },
      );

    if (companyId && ObjectId.isValid(companyId)) {
      await restoreBags(companyId, rateType, quantity);
    }

    res.status(200).json({ success: true, message: "Moved to trash" });
  } catch {
    res.status(500).json({ success: false, message: "Action failed" });
  }
};

export const restoreEntry = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = toId(req.params.id);
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid ID" });
      return;
    }

    const existing = await db
      .collection("retailer")
      .findOne({ _id: new ObjectId(id) });
    if (!existing) {
      res.status(404).json({ success: false, message: "Entry not found" });
      return;
    }

    const quantity = Number(existing.quantity) || 0;
    const rateType: "factory" | "ghat" =
      existing.rateType === "ghat" ? "ghat" : "factory";
    const companyId = String(existing.companyId);

    const company = await db
      .collection("company")
      .findOne({ _id: new ObjectId(companyId) });
    if (!company) {
      res.status(404).json({ success: false, message: "Company not found" });
      return;
    }

    const availableBag =
      rateType === "factory"
        ? Number(company.dhakaDo?.bag || 0)
        : Number(company.ghatDo?.bag || 0);

    if (quantity > availableBag) {
      res.status(400).json({
        success: false,
        message: `Cannot restore. Only ${availableBag} bags available for ${rateType}`,
      });
      return;
    }

    await db
      .collection("retailer")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "active" }, $unset: { deletedAt: "" } },
      );

    await deductBags(companyId, rateType, quantity);

    res.status(200).json({ success: true, message: "Restored successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Restore failed" });
  }
};

export const permanentDelete = async (
  req: Request,
  res: Response,
): Promise<void> => {
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
      .sort({ createdAt: -1, _id: -1 })
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
      .sort({ createdAt: -1, _id: -1 })
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