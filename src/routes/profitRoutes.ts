import express from "express";
import {
  addProfitEntry,
  deleteProfitEntry,
  getProfitEntries,
  updateProfitEntry,
} from "../controllers/profitController";

const router = express.Router();

router.post("/add", addProfitEntry);
router.get("/entries", getProfitEntries);
router.put("/update/:id", updateProfitEntry);
router.delete("/delete/:id", deleteProfitEntry);

export default router;