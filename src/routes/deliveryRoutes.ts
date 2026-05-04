import express from "express";
import {
  addDeliveryCostEntry,
  deleteDeliveryCostEntry,
  getDeliveryCostEntries,
  updateDeliveryCostEntry,
} from "../controllers/deliveryController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/add",protect, addDeliveryCostEntry);
router.get("/entries", protect, getDeliveryCostEntries);
router.put("/update/:id", protect, updateDeliveryCostEntry);
router.delete("/delete/:id", protect, deleteDeliveryCostEntry);

export default router;