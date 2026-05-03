"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const shopRoutes_1 = __importDefault(require("./routes/shopRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const dealerRoutes_1 = __importDefault(require("./routes/dealerRoutes"));
const profitRoutes_1 = __importDefault(require("./routes/profitRoutes"));
const deliveryRoutes_1 = __importDefault(require("./routes/deliveryRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const corsOptions = {
    origin: ["https://pos-software-plum.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions));
app.options("/{*path}", (0, cors_1.default)(corsOptions));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://pos-software-plum.vercel.app");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
    }
    next();
});
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Server is running!");
});
app.use("/api/shop", shopRoutes_1.default);
app.use("/api/dealer", dealerRoutes_1.default);
app.use("/api/profit", profitRoutes_1.default);
app.use("/api/delivery-cost", deliveryRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
(0, db_1.connectDB)()
    .then(() => {
    app.locals.db = db_1.db;
    if (process.env.NODE_ENV !== "production") {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server active on port: ${PORT}`));
    }
})
    .catch((err) => {
    console.error("DB connection failed:", err);
});
exports.default = app;
