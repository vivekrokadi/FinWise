import express from 'express';
import multer from 'multer';
import {
  scanReceipt,
  generateInsights,
  getInvestmentSuggestions,
  getTaxTips,
  testAIConnection
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// All routes are protected
router.use(protect);

router.post('/scan-receipt', upload.single('receipt'), scanReceipt);
router.post('/insights', generateInsights);
router.post('/investment-suggestions', getInvestmentSuggestions);
router.post('/tax-tips', getTaxTips);
router.get('/test-connection', testAIConnection); // Add test route

export default router;