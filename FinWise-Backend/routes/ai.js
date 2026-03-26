import express from 'express';
import multer from 'multer';
import {
  scanReceipt,
  generateInsights,
  getInvestmentSuggestions,
  getTaxTips,
  checkAIStatus
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

router.use(protect);

router.get('/status', checkAIStatus);
router.post('/scan-receipt', upload.single('receipt'), scanReceipt);
router.post('/insights', generateInsights);
router.post('/investment-suggestions', getInvestmentSuggestions);
router.post('/tax-tips', getTaxTips);

export default router;