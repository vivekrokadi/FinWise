import express from 'express';
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  setDefaultAccount,
  getAccountStats
} from '../controllers/accountController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getAccounts);
router.get('/:id', getAccount);
router.get('/:id/stats', getAccountStats);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);
router.put('/:id/set-default', setDefaultAccount);

export default router;