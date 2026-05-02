
import dotenv from "dotenv";
import { Db, MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.MONGO_URI || "";
const client = new MongoClient(uri);

let db: Db;

export const connectDB = async () => {
  try {
    await client.connect();
    db = client.db("shop_pos");
    console.log("✅ MongoDB Connected!");
  } catch (err) {
    console.error("❌ Connection Error:", err);
    process.exit(1);
  }
};

export const getDb = (): Db => {
  if (!db) throw new Error("Database not connected yet!");
  return db;
};

export { db };