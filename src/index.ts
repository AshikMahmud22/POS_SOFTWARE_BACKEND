import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, db } from "./config/db";
import shopRoutes from "./routes/shopRoutes";
import adminRoutes from "./routes/adminRoutes";
import dealerRoutes from "./routes/dealerRoutes";
import profitRoutes from "./routes/profitRoutes";
import deliveryCostRoutes from "./routes/deliveryRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
}));

app.use(express.json());

app.use("/api/shop", shopRoutes);
app.use("/api/dealer", dealerRoutes);
app.use("/api/profit", profitRoutes);
app.use("/api/delivery-cost", deliveryCostRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.locals.db = db;
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();