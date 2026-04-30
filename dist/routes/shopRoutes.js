"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/all-entries', authMiddleware_1.protect, async (req, res) => {
    try {
        const year = req.query.year;
        const month = req.query.month;
        const query = { status: { $ne: 'trashed' } };
        if (year)
            query.year = year;
        if (month)
            query.month = month;
        const entries = await db_1.db.collection('entries')
            .find(query)
            .sort({ date: -1, createdAt: -1 })
            .toArray();
        res.status(200).json(entries);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching entries" });
    }
});
router.get('/available-years', authMiddleware_1.protect, async (req, res) => {
    try {
        const filter = { status: { $ne: 'trashed' } };
        const years = await db_1.db.collection('entries').distinct("year", filter);
        const sortedYears = years.sort((a, b) => Number(b) - Number(a));
        res.status(200).json(sortedYears.length > 0 ? sortedYears : ["2026"]);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching years" });
    }
});
router.get('/available-months', authMiddleware_1.protect, async (req, res) => {
    try {
        const year = req.query.year;
        if (!year) {
            return res.status(400).json({ message: "Year is required" });
        }
        const filter = {
            year: year,
            status: { $ne: 'trashed' }
        };
        const months = await db_1.db.collection('entries').distinct("month", filter);
        const monthOrder = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const sortedMonths = months.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
        res.status(200).json(sortedMonths);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching months" });
    }
});
router.post('/add-entry', authMiddleware_1.protect, async (req, res) => {
    try {
        const newEntry = {
            ...req.body,
            createdAt: new Date(),
            status: 'active'
        };
        const result = await db_1.db.collection('entries').insertOne(newEntry);
        res.status(201).json({ _id: result.insertedId, ...newEntry });
    }
    catch (error) {
        res.status(500).json({ message: "Error saving entry" });
    }
});
router.put('/update-entry/:id', authMiddleware_1.protect, async (req, res) => {
    try {
        const id = req.params.id; // ✅ fix here
        if (!mongodb_1.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid ID" });
        const { _id, ...updateData } = req.body;
        await db_1.db.collection('entries').updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: updateData });
        res.status(200).json({ message: "Updated" });
    }
    catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
});
router.post('/move-to-trash/:id', authMiddleware_1.protect, async (req, res) => {
    try {
        const id = req.params.id; // ✅ fix here
        if (!mongodb_1.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid ID" });
        await db_1.db.collection('entries').updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { status: 'trashed', deletedAt: new Date() } });
        res.status(200).json({ message: "Moved to trash" });
    }
    catch (error) {
        res.status(500).json({ message: "Action failed" });
    }
});
exports.default = router;
