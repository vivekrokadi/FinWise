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
import { validateBudget } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// IMPORTANT: specific named routes MUST come before /:id routes
// otherwise /current, /alerts, /stats are matched as an :id param
router.get('/current', getCurrentBudget);
router.get('/alerts', getBudgetAlerts);
router.get('/stats', getBudgetStats);

router.get('/', getBudgets);
router.post('/', validateBudget, createOrUpdateBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;