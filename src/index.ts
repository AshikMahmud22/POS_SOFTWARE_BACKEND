import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, db } from "./config/db";
import shopRoutes from "./routes/shopRoutes";
import adminRoutes from "./routes/adminRoutes";
import companyRoutes from "./routes/companyRoutes";
import partyRoutes from "./routes/partyRoutes";
import collectionRoutes from "./routes/collectionRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/shop", shopRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/party", partyRoutes);
app.use("/api/collection", collectionRoutes);
app.use("/api/dashboard", dashboardRoutes);

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
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();
