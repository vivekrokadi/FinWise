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

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getTransactions);
router.get('/stats', getTransactionStats);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/:id', getTransaction);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.delete('/bulk-delete', bulkDeleteTransactions);

export default router;