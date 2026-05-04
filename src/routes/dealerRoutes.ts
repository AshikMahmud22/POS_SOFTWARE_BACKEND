import express from "express";
import {
  addDealerEntry,
  deleteDealerEntry,
  getDealerEntries,
  updateDealerEntry,
} from "../controllers/dealerController";

const router = express.Router();

router.post("/add", addDealerEntry);
router.get("/entries", getDealerEntries);
router.put("/update/:id", updateDealerEntry);
router.delete("/delete/:id", deleteDealerEntry);

export default router;
