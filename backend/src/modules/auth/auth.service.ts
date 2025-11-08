import { User } from '@prisma/client';
import { AuthRepository } from './auth.repository';
import * as walletService from '../wallet/wallet.service';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async registerUser(data: {
    clerkId: string;
    email: string;
    name: string;
    phone?: string;
    profilePhoto?: string;
  }): Promise<User> {
    // Check if user exists with this Clerk ID
    const existingUser = await this.authRepository.findUserByClerkId(
      data.clerkId
    );

    if (existingUser) {
      // User already exists, update their info and return
      console.log('User already registered, updating info...');
      return this.authRepository.updateUser(existingUser.id, {
        name: data.name,
        phone: data.phone,
        profilePhoto: data.profilePhoto,
      });
    }

    // Check if email is already used by a different user
    const existingEmail = await this.authRepository.findUserByEmail(data.email);
    if (existingEmail && existingEmail.clerkId !== data.clerkId) {
      throw new Error('Email already registered with a different account');
    }

    // Create new user
    return this.authRepository.createUser(data);
  }

  async getUserByClerkId(clerkId: string): Promise<User> {
    const user = await this.authRepository.findUserByClerkId(clerkId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Custom auth methods
  async findUserByEmail(email: string): Promise<User | null> {
    return this.authRepository.findUserByEmail(email);
  }

  async createCustomUser(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    // Create user
    const user = await this.authRepository.createCustomUser(data);
    
    // Create wallet for the user
    try {
      await walletService.createWalletForUser(user.id);
      console.log(`💰 Wallet created for user: ${user.email}`);
    } catch (error) {
      console.error('Failed to create wallet for user:', error);
      // Don't fail user creation if wallet creation fails
    }
    
    return user;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.authRepository.findUserById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      phone?: string;
      profilePhoto?: string;
    }
  ): Promise<User> {
    const user = await this.authRepository.findUserById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return this.authRepository.updateUser(id, data);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.authRepository.findUserById(id);

    if (!user) {
      throw new Error('User not found');
    }

    await this.authRepository.deleteUser(id);
  }
}
