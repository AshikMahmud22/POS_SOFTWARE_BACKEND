"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.getDb = exports.connectDB = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("mongodb");
dotenv_1.default.config();
const uri = process.env.MONGO_URI || "";
const client = new mongodb_1.MongoClient(uri);
let db;
const connectDB = async () => {
    try {
        await client.connect();
        exports.db = db = client.db("shop_pos");
        console.log("✅ MongoDB Connected!");
    }
    catch (err) {
        console.error("❌ Connection Error:", err);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const getDb = () => {
    if (!db)
        throw new Error("Database not connected yet!");
    return db;
};
exports.getDb = getDb;
