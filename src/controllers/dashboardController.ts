import { Request, Response } from "express";
import { getDb } from "../config/db";

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const currentMonth = new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date());
    const currentYear = new Date().getFullYear().toString();

    const [
      shopEntries,
      companyEntries,
      collectionEntries,
      parties,
    ] = await Promise.all([
      db.collection("shop").find({ status: { $ne: "trashed" } }).toArray(),
      db.collection("company").find({}).toArray(),
      db.collection("collection").find({}).toArray(),
      db.collection("parties").find({}).toArray(),
    ]);

    const shopTotalRestAmount = shopEntries.reduce(
      (sum, e) => sum + (Number(e.restTotalAmount) || 0), 0
    );
    const shopThisMonth = shopEntries.filter(
      (e) => e.month === currentMonth && e.year === currentYear
    ).length;

    const companyTotalExcessDo = companyEntries.reduce(
      (sum, e) => sum + (Number(e.excessDoQty) || 0), 0
    );
    const companyThisMonth = companyEntries.filter((e) => {
      const d = new Date(e.createdAt);
      return (
        d.getMonth() === new Date().getMonth() &&
        d.getFullYear() === new Date().getFullYear()
      );
    }).length;

    const collectionTotalBalance = collectionEntries.reduce(
      (sum, e) => sum + (Number(e.partyBalance) || 0), 0
    );
    const collectionThisMonth = collectionEntries.filter((e) => {
      const d = new Date(e.date);
      return (
        d.getMonth() === new Date().getMonth() &&
        d.getFullYear() === new Date().getFullYear()
      );
    }).length;

    const partiesThisMonth = parties.filter((e) => {
      const d = new Date(e.createdAt);
      return (
        d.getMonth() === new Date().getMonth() &&
        d.getFullYear() === new Date().getFullYear()
      );
    }).length;

    res.status(200).json({
      success: true,
      data: {
        shop: {
          totalEntries: shopEntries.length,
          totalRestAmount: shopTotalRestAmount,
          thisMonthEntries: shopThisMonth,
        },
        company: {
          totalEntries: companyEntries.length,
          totalExcessDo: companyTotalExcessDo,
          thisMonthEntries: companyThisMonth,
        },
        collection: {
          totalEntries: collectionEntries.length,
          totalPartyBalance: collectionTotalBalance,
          thisMonthEntries: collectionThisMonth,
        },
        party: {
          totalParties: parties.length,
          thisMonthNewParties: partiesThisMonth,
        },
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch dashboard summary" });
  }
};