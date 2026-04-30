"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = exports.deleteAdmin = exports.makeSuperAdmin = exports.getAllAdmins = exports.loginAdmin = exports.createAdminAccount = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
const createAdminAccount = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        if (!phone || String(phone).length !== 11) {
            return res.status(400).json({ message: "Phone number must be exactly 11 digits" });
        }
        const existingAdmin = await db_1.db.collection('admins').findOne({ email });
        if (existingAdmin)
            return res.status(400).json({ message: "Email already registered" });
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const newAdmin = {
            firstName,
            lastName,
            email,
            phone: String(phone),
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date()
        };
        await db_1.db.collection('admins').insertOne(newAdmin);
        res.status(201).json({ message: "Admin created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.createAdminAccount = createAdminAccount;
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await db_1.db.collection('admins').findOne({ email });
        if (!admin)
            return res.status(404).json({ message: "User not found" });
        const isMatch = await bcryptjs_1.default.compare(password, admin.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            token,
            user: { firstName: admin.firstName, email: admin.email, role: admin.role }
        });
    }
    catch (error) {
        res.status(500).json({ message: "Login error" });
    }
};
exports.loginAdmin = loginAdmin;
const getAllAdmins = async (req, res) => {
    try {
        const admins = await db_1.db.collection('admins').find({}, { projection: { password: 0 } }).toArray();
        res.status(200).json(admins);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching admins" });
    }
};
exports.getAllAdmins = getAllAdmins;
const makeSuperAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string' || !mongodb_1.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        await db_1.db.collection('admins').updateOne({ _id: new mongodb_1.ObjectId(id) }, { $set: { role: 'superadmin' } });
        res.status(200).json({ message: "Promoted to Super Admin" });
    }
    catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};
exports.makeSuperAdmin = makeSuperAdmin;
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string' || !mongodb_1.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        const result = await db_1.db.collection('admins').deleteOne({
            _id: new mongodb_1.ObjectId(id)
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json({ message: "Admin removed successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting admin" });
    }
};
exports.deleteAdmin = deleteAdmin;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await db_1.db.collection('admins').findOne({ email });
        if (!admin)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "Password reset link sent to your email" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.forgotPassword = forgotPassword;
