import express from "express";
import {
  addProfitEntry,
  deleteProfitEntry,
  getProfitEntries,
  updateProfitEntry,
} from "../controllers/profitController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/add",protect, addProfitEntry);
router.get("/entries", protect, getProfitEntries);
router.put("/update/:id", protect, updateProfitEntry);
router.delete("/delete/:id", protect, deleteProfitEntry);

export default router;