import { Router } from "express";
import {
  getCollections,
  addCollection,
  updateCollection,
  deleteCollection,
} from "../controllers/collectionController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/get-entries", protect, getCollections);
router.post("/add-entry", protect, addCollection);
router.put("/update-entry/:id", protect, updateCollection);
router.delete("/delete-entry/:id", protect, deleteCollection);

export default router;