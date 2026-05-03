"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const deliveryController_1 = require("../controllers/deliveryController");
const router = express_1.default.Router();
router.post("/add", deliveryController_1.addDeliveryCostEntry);
router.get("/entries", deliveryController_1.getDeliveryCostEntries);
router.put("/update/:id", deliveryController_1.updateDeliveryCostEntry);
router.delete("/delete/:id", deliveryController_1.deleteDeliveryCostEntry);
exports.default = router;
