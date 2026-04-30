import { Router } from 'express';
import { createAdminAccount, deleteAdmin, forgotPassword, getAllAdmins, loginAdmin, makeSuperAdmin } from '../controllers/AdminController';
const router = Router();

router.post('/login', loginAdmin);
router.post('/create', createAdminAccount);
router.get('/all', getAllAdmins);
router.patch('/make-super/:id', makeSuperAdmin);
router.delete('/delete/:id', deleteAdmin);
router.post('/forgot-password', forgotPassword);

export default router;