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
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/shop", shopRoutes_1.default);
app.use("/api/dealer", dealerRoutes_1.default);
app.use("/api/profit", profitRoutes_1.default);
app.use("/api/delivery-cost", deliveryRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.get("/", (req, res) => {
    res.send("Server is running!");
});
(0, db_1.connectDB)().then(() => {
    app.locals.db = db_1.db;
    app.listen(PORT, () => {
        console.log(`🚀 Server: http://localhost:${PORT}`);
    });
});
