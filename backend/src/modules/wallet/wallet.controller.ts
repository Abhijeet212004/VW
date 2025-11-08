import { Request, Response, NextFunction } from 'express';
import * as walletService from './wallet.service';

export const getBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId!;
    
    const walletData = await walletService.getWalletBalance(userId);
    
    res.status(200).json({
      success: true,
      message: 'Wallet balance retrieved successfully',
      data: walletData,
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get wallet balance',
    });
  }
};

export const addMoney = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId!;
    const { amount, description } = req.body;
    
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }
    
    const result = await walletService.addMoney(userId, amount, description);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        balance: result.wallet.balance,
        transaction: result.transaction,
      },
    });
  } catch (error) {
    console.error('Add money error:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add money',
    });
  }
};

export const getTransactionHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await walletService.getTransactionHistory(userId, page, limit);
    
    res.status(200).json({
      success: true,
      message: 'Transaction history retrieved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get transaction history',
    });
  }
};

export const deductMoney = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId!;
    const { amount, description, bookingId } = req.body;
    
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }
    
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required',
      });
    }
    
    const result = await walletService.deductMoney(userId, amount, description, bookingId);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        balance: result.wallet.balance,
        transaction: result.transaction,
      },
    });
  } catch (error) {
    console.error('Deduct money error:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to deduct money',
    });
  }
};