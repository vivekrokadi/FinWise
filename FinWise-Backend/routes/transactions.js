import express from 'express';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
  getTransactionStats,
  getCategoryBreakdown
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';
import { validateTransaction } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// IMPORTANT: specific routes MUST come before /:id routes
// otherwise Express matches /stats and /bulk-delete as an :id param
router.get('/stats', getTransactionStats);
router.get('/category-breakdown', getCategoryBreakdown);
router.delete('/bulk-delete', bulkDeleteTransactions);

router.get('/', getTransactions);
router.post('/', validateTransaction, createTransaction);
router.get('/:id', getTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;