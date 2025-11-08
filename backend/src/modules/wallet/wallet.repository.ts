import { PrismaClient, Wallet, Transaction, TransactionType, TransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateWalletData {
  userId: string;
  balance?: number;
  minBalance?: number;
  maxBalance?: number;
}

interface AddMoneyData {
  walletId: string;
  amount: number;
  description: string;
}

export const findWalletByUserId = async (userId: string): Promise<Wallet | null> => {
  return await prisma.wallet.findUnique({
    where: { userId },
    include: {
      user: true,
    },
  });
};

export const createWallet = async (data: CreateWalletData): Promise<Wallet> => {
  return await prisma.wallet.create({
    data: {
      userId: data.userId,
      balance: data.balance || 0,
      minBalance: data.minBalance || 50,
      maxBalance: data.maxBalance || 10000,
    },
  });
};

export const updateWalletBalance = async (
  walletId: string,
  newBalance: number
): Promise<Wallet> => {
  return await prisma.wallet.update({
    where: { id: walletId },
    data: { balance: newBalance },
  });
};

export const createTransaction = async (
  walletId: string,
  type: TransactionType,
  amount: number,
  balanceBefore: number,
  balanceAfter: number,
  description: string,
  bookingId?: string
): Promise<Transaction> => {
  return await prisma.transaction.create({
    data: {
      walletId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      description,
      status: TransactionStatus.COMPLETED,
      bookingId,
    },
  });
};

export const getTransactionHistory = async (
  walletId: string,
  limit = 50,
  offset = 0
): Promise<Transaction[]> => {
  return await prisma.transaction.findMany({
    where: { walletId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
};

export const findWalletByUserIdOrCreate = async (userId: string): Promise<Wallet> => {
  let wallet = await findWalletByUserId(userId);
  
  if (!wallet) {
    wallet = await createWallet({ userId });
  }
  
  return wallet;
};