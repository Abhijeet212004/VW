import { PrismaClient, User, VerificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthRepository {
  async createUser(data: {
    clerkId: string;
    email: string;
    name: string;
    phone?: string;
    profilePhoto?: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        verificationStatus: VerificationStatus.PENDING,
        wallet: {
          create: {
            balance: 0,
            lockedBalance: 0,
          },
        },
      },
      include: {
        wallet: true,
      },
    });
  }

  async findUserByClerkId(clerkId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { clerkId },
      include: {
        wallet: true,
        vehicles: true,
      },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        vehicles: {
          where: { isActive: true },
        },
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      phone?: string;
      profilePhoto?: string;
      verificationStatus?: VerificationStatus;
    }
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { wallet: { update: { isActive: false } } },
    });
  }

  // Custom auth method for users without Clerk
  async createCustomUser(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        clerkId: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
        verificationStatus: VerificationStatus.PENDING,
        wallet: {
          create: {
            balance: 0,
            lockedBalance: 0,
          },
        },
      },
      include: {
        wallet: true,
      },
    });
  }
}
