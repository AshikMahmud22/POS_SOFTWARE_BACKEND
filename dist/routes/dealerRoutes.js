"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dealerController_1 = require("../controllers/dealerController");
const router = express_1.default.Router();
router.post("/add", dealerController_1.addDealerEntry);
router.get("/entries", dealerController_1.getDealerEntries);
router.put("/update/:id", dealerController_1.updateDealerEntry);
router.delete("/delete/:id", dealerController_1.deleteDealerEntry);
exports.default = router;
