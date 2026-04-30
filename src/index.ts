import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import shopRoutes from "./routes/shopRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/shop", shopRoutes);
app.use("/api/admin", adminRoutes); 

app.get("/", (req, res) => {
  res.send("Server is running!");
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
  });
});