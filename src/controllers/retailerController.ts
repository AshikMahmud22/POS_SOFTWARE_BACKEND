import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/db";
import { monthOrder } from "../types/retailer";

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
