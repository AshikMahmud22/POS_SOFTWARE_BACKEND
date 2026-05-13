import express from "express";
import { protect } from "../middleware/authMiddleware";
import { 
  addCompanyEntry, 
  deleteCompanyEntry, 
  getCompanyEntries, 
  getCompanyEntry, 
  getPreviousDue, 
  updateCompanyEntry
} from "../controllers/companyController";

const router = express.Router();

router.get("/entries", protect, getCompanyEntries);
router.post("/add", protect, addCompanyEntry);
router.put("/update/:id", protect, updateCompanyEntry);
router.delete("/delete/:id", protect, deleteCompanyEntry);
router.get("/previous-due", protect, getPreviousDue);
router.get("/entry/:id",protect, getCompanyEntry);

export default router;