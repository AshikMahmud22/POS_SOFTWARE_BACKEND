import express from "express";
import {
  addDeliveryCostEntry,
  deleteDeliveryCostEntry,
  getDeliveryCostEntries,
  updateDeliveryCostEntry,
} from "../controllers/deliveryController";

const router = express.Router();

router.post("/add", addDeliveryCostEntry);
router.get("/entries", getDeliveryCostEntries);
router.put("/update/:id", updateDeliveryCostEntry);
router.delete("/delete/:id", deleteDeliveryCostEntry);

export default router;