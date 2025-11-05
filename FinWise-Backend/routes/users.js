import express from 'express';
import {
  getDashboardStats,
  deleteAccount,
  uploadAvatar
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/dashboard', getDashboardStats);
router.delete('/account', deleteAccount);
router.post('/avatar', uploadAvatar); // Would need multer middleware

export default router;