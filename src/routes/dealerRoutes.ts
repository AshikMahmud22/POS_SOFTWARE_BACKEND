import express from "express";
import {
  addDealerEntry,
  deleteDealerEntry,
  getDealerEntries,
  updateDealerEntry,
} from "../controllers/dealerController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/add", protect, addDealerEntry);
router.get("/entries", protect, getDealerEntries);
router.put("/update/:id", protect, updateDealerEntry);
router.delete("/delete/:id", protect, deleteDealerEntry);

export default router;
