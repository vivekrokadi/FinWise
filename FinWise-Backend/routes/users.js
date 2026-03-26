import express from 'express';
import multer from 'multer';
import { getDashboardStats, deleteAccount, uploadAvatar } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Multer config for avatar uploads (memory storage, images only, max 2MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.delete('/account', deleteAccount);
router.post('/avatar', upload.single('avatar'), uploadAvatar);

export default router;