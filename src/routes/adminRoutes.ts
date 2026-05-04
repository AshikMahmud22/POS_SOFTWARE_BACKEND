import { Router } from 'express';
import { createAdminAccount, deleteAdmin, forgotPassword, getAllAdmins, loginAdmin, makeSuperAdmin } from '../controllers/AdminController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', loginAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/create', protect, createAdminAccount);
router.get('/all', protect, getAllAdmins);
router.patch('/make-super/:id', protect, makeSuperAdmin);
router.delete('/delete/:id', protect, deleteAdmin);

export default router;