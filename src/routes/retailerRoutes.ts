import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  getEntries,
  getTrashedEntries,
  addEntry,
  updateEntry,
  moveToTrash,
  restoreEntry,
  permanentDelete,
} from "../controllers/retailerController";

const router = Router();

router.get("/get-entries", protect, getEntries);
router.get("/trashed-entries", protect, getTrashedEntries);
router.post("/add-entry", protect, addEntry);
router.put("/update-entry/:id", protect, updateEntry);
router.post("/move-to-trash/:id", protect, moveToTrash);
router.post("/restore-entry/:id", protect, restoreEntry);
router.delete("/permanent-delete/:id", protect, permanentDelete);

export default router;