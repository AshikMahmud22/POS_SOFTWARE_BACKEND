import { Router } from "express";
import {
  getParties,
  addParty,
  updateParty,
  deleteParty,
} from "../controllers/partyController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/get-parties",protect, getParties);
router.post("/add-party", protect, addParty);
router.put("/update-party/:id", protect, updateParty);
router.delete("/delete-party/:id", protect, deleteParty);

export default router;