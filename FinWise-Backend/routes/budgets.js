import express from 'express';
import {
  getBudgets,
  getCurrentBudget,
  createOrUpdateBudget,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
  getBudgetStats
} from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getBudgets);
router.get('/current', getCurrentBudget);
router.post('/', createOrUpdateBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);
router.get('/alerts', getBudgetAlerts);
router.get('/stats', getBudgetStats);

export default router;