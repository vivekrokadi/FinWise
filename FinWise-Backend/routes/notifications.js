import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  checkBudgets,
  sendWeeklyReport,
  updateNotificationPrefs,
  getNotificationPrefs,
  testEmail
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);

router.get('/preferences',       getNotificationPrefs);
router.put('/preferences',       updateNotificationPrefs);
router.post('/check-budgets',    checkBudgets);
router.post('/send-report',      sendWeeklyReport);
router.get('/test-email',        testEmail);

export default router;