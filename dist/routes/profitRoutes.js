"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profitController_1 = require("../controllers/profitController");
const router = express_1.default.Router();
router.post("/add", profitController_1.addProfitEntry);
router.get("/entries", profitController_1.getProfitEntries);
router.put("/update/:id", profitController_1.updateProfitEntry);
router.delete("/delete/:id", profitController_1.deleteProfitEntry);
exports.default = router;
