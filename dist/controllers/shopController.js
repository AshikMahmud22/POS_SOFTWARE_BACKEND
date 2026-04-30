"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEntries = void 0;
const db_1 = require("../config/db");
const getAllEntries = async (req, res) => {
    try {
        const entries = await db_1.db.collection('entries')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        res.status(200).json(entries);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching entries" });
    }
};
exports.getAllEntries = getAllEntries;
