"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/get-entries', authMiddleware_1.protect, async (req, res) => {
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
        res.status(200).json({ success: true, data: entries });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching entries" });
    }
});
router.get('/trashed-entries', authMiddleware_1.protect, async (req, res) => {
    try {
        const entries = await db_1.db.collection('entries')
            .find({ status: 'trashed' })
            .sort({ deletedAt: -1 })
            .toArray();
        res.status(200).json({ success: true, data: entries });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error fetching trash" });
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
        res.status(201).json({ success: true, _id: result.insertedId, ...newEntry });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error saving entry" });
    }
});
router.put('/update-entry/:id', authMiddleware_1.protect, async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongodb_1.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid ID" });
        const { _id, ...updateData } = req.body;
        await db_1.db.collection('entries').updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: updateData });
        res.status(200).json({ success: true, message: "Updated" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Update failed" });
    }
});
router.post('/move-to-trash/:id', authMiddleware_1.protect, async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongodb_1.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid ID" });
        await db_1.db.collection('entries').updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { status: 'trashed', deletedAt: new Date() } });
        res.status(200).json({ success: true, message: "Moved to trash" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Action failed" });
    }
});
router.post('/restore-entry/:id', authMiddleware_1.protect, async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongodb_1.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid ID" });
        await db_1.db.collection('entries').updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { status: 'active' }, $unset: { deletedAt: "" } });
        res.status(200).json({ success: true, message: "Restored" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Restore failed" });
    }
});
router.delete('/permanent-delete/:id', authMiddleware_1.protect, async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongodb_1.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid ID" });
        await db_1.db.collection('entries').deleteOne({ _id: new mongodb_1.ObjectId(id) });
        res.status(200).json({ success: true, message: "Permanently deleted" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Delete failed" });
    }
});
exports.default = router;
