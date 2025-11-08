import { Router } from 'express';
import { requireCustomAuth } from '../../middlewares/customAuth.middleware';
import * as walletController from './wallet.controller';

const router = Router();

// Get wallet balance
router.get('/balance', requireCustomAuth, walletController.getBalance);

// Add money to wallet
router.post('/add-money', requireCustomAuth, walletController.addMoney);

// Deduct money from wallet (for internal use)
router.post('/deduct-money', requireCustomAuth, walletController.deductMoney);

// Get transaction history
router.get('/transactions', requireCustomAuth, walletController.getTransactionHistory);

export default router;