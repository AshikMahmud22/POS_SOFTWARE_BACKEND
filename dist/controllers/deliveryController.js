"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDeliveryCostEntry = exports.updateDeliveryCostEntry = exports.getDeliveryCostEntries = exports.addDeliveryCostEntry = void 0;
const mongodb_1 = require("mongodb");
const delivery_1 = require("../types/delivery");
const addDeliveryCostEntry = async (req, res) => {
    try {
        const db = req.app.locals.db;
        if (!db)
            throw new Error("Database connection not established");
        const collection = (0, delivery_1.getDeliveryCostCollection)(db);
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.addDeliveryCostEntry = addDeliveryCostEntry;
const getDeliveryCostEntries = async (req, res) => {
    try {
        const db = req.app.locals.db;
        if (!db)
            throw new Error("Database connection not established");
        const collection = (0, delivery_1.getDeliveryCostCollection)(db);
        const { page = 1, limit = 10, search = "", month = "", year = "" } = req.query;
        const query = {};
        if (month)
            query.month = month;
        if (year)
            query.year = year;
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
            .sort((a, b) => Number(b) - Number(a));
        let availableMonths = [];
        if (year) {
            const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const distinctMonths = await collection.distinct("month", { year });
            availableMonths = (Array.isArray(distinctMonths) ? distinctMonths : [])
                .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
        }
        res.status(200).json({
            success: true,
            data: entries,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            availableYears,
            availableMonths,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.getDeliveryCostEntries = getDeliveryCostEntries;
const updateDeliveryCostEntry = async (req, res) => {
    try {
        const db = req.app.locals.db;
        if (!db)
            throw new Error("Database connection not established");
        const collection = (0, delivery_1.getDeliveryCostCollection)(db);
        const id = req.params.id;
        const updateData = { ...req.body };
        delete updateData._id;
        if (updateData.date)
            updateData.year = updateData.date.split("-")[0];
        updateData.bag = Number(updateData.bag || 0);
        updateData.carCost = Number(updateData.carCost || 0);
        updateData.doGive = Number(updateData.doGive || 0);
        updateData.doTake = Number(updateData.doTake || 0);
        updateData.gift = Number(updateData.gift || 0);
        const result = await collection.updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: updateData });
        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "Not found" });
        }
        res.status(200).json({ success: true, message: "Updated successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.updateDeliveryCostEntry = updateDeliveryCostEntry;
const deleteDeliveryCostEntry = async (req, res) => {
    try {
        const db = req.app.locals.db;
        if (!db)
            throw new Error("Database connection not established");
        const collection = (0, delivery_1.getDeliveryCostCollection)(db);
        const id = req.params.id;
        const result = await collection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Not found" });
        }
        res.status(200).json({ success: true, message: "Deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
exports.deleteDeliveryCostEntry = deleteDeliveryCostEntry;
