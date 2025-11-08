import { TransactionType } from '@prisma/client';
import * as walletRepository from './wallet.repository';

export const getWalletBalance = async (userId: string) => {
  const wallet = await walletRepository.findWalletByUserIdOrCreate(userId);
  
  return {
    balance: wallet.balance,
    lockedBalance: wallet.lockedBalance,
    availableBalance: wallet.balance - wallet.lockedBalance,
    minBalance: wallet.minBalance,
    maxBalance: wallet.maxBalance,
  };
};

export const addMoney = async (userId: string, amount: number, description = 'Money added to wallet') => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  if (amount > 5000) {
    throw new Error('Maximum amount per transaction is ₹5000');
  }

  const wallet = await walletRepository.findWalletByUserIdOrCreate(userId);
  
  // Check if adding this amount would exceed max balance
  const newBalance = wallet.balance + amount;
  if (newBalance > wallet.maxBalance) {
    throw new Error(`Maximum wallet balance is ₹${wallet.maxBalance}`);
  }

  // Update wallet balance
  const updatedWallet = await walletRepository.updateWalletBalance(wallet.id, newBalance);

  // Create transaction record
  const transaction = await walletRepository.createTransaction(
    wallet.id,
    TransactionType.CREDIT,
    amount,
    wallet.balance,
    newBalance,
    description
  );

  return {
    wallet: updatedWallet,
    transaction,
    message: `₹${amount} added successfully`,
  };
};

export const deductMoney = async (
  userId: string,
  amount: number,
  description: string,
  bookingId?: string
) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const wallet = await walletRepository.findWalletByUserIdOrCreate(userId);
  
  // Check if user has sufficient balance
  const availableBalance = wallet.balance - wallet.lockedBalance;
  if (availableBalance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  const newBalance = wallet.balance - amount;

  // Update wallet balance
  const updatedWallet = await walletRepository.updateWalletBalance(wallet.id, newBalance);

  // Create transaction record
  const transaction = await walletRepository.createTransaction(
    wallet.id,
    TransactionType.DEBIT,
    amount,
    wallet.balance,
    newBalance,
    description,
    bookingId
  );

  return {
    wallet: updatedWallet,
    transaction,
    message: `₹${amount} deducted successfully`,
  };
};

export const getTransactionHistory = async (userId: string, page = 1, limit = 20) => {
  const wallet = await walletRepository.findWalletByUserIdOrCreate(userId);
  const offset = (page - 1) * limit;
  
  const transactions = await walletRepository.getTransactionHistory(wallet.id, limit, offset);
  
  return {
    transactions,
    pagination: {
      page,
      limit,
      total: transactions.length,
    },
  };
};

export const createWalletForUser = async (userId: string) => {
  try {
    // Check if wallet already exists
    const existingWallet = await walletRepository.findWalletByUserId(userId);
    if (existingWallet) {
      return existingWallet;
    }

    // Create new wallet with default balance of 0
    const wallet = await walletRepository.createWallet({ userId, balance: 0 });
    return wallet;
  } catch (error) {
    throw new Error('Failed to create wallet');
  }
};