import express from "express";
import { protect } from "../middleware/authMiddleware";
import { 
  addCompanyEntry, 
  deleteCompanyEntry, 
  getCompanyEntries, 
  updateCompanyEntry
} from "../controllers/companyController";

const router = express.Router();

router.get("/entries", protect, getCompanyEntries);
router.post("/add", protect, addCompanyEntry);
router.put("/update/:id", protect, updateCompanyEntry);
router.delete("/delete/:id", protect, deleteCompanyEntry);

export default router;