import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserInput, UpdateUserInput } from './auth.validation';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as walletService from '../wallet/wallet.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Custom registration endpoint without Clerk
  customRegister = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Name, email, and password are required',
        });
        return;
      }

      // Check if user already exists
      const existingUser = await this.authService.findUserByEmail(email);
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
        return;
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await this.authService.createCustomUser({
        name,
        email,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      // Get wallet balance
      let walletBalance = 0;
      try {
        const walletData = await walletService.getWalletBalance(user.id);
        walletBalance = walletData.balance;
      } catch (error) {
        console.error('Failed to get wallet balance:', error);
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            walletBalance,
          },
          token,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  // Custom login endpoint
  customLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      // Find user
      const user = await this.authService.findUserByEmail(email);
      if (!user || !user.password) {
        res.status(400).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      // Get wallet balance
      let walletBalance = 0;
      try {
        const walletData = await walletService.getWalletBalance(user.id);
        walletBalance = walletData.balance;
      } catch (error) {
        console.error('Failed to get wallet balance:', error);
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            walletBalance,
          },
          token,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data: RegisterUserInput = req.body;
      const user = await this.authService.registerUser(data);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            clerkId: user.clerkId,
            email: user.email,
            name: user.name,
            phone: user.phone,
            profilePhoto: user.profilePhoto,
            verificationStatus: user.verificationStatus,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { clerkId } = req.auth!;
      const user = await this.authService.getUserByClerkId(clerkId);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      next(error);
    }
  };

  getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.authService.getUserById(id);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      next(error);
    }
  };

  updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { clerkId } = req.auth!;
      const data: UpdateUserInput = req.body;

      const currentUser = await this.authService.getUserByClerkId(clerkId);
      const updatedUser = await this.authService.updateUser(currentUser.id, data);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
      });
    } catch (error: any) {
      next(error);
    }
  };

  deleteAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { clerkId } = req.auth!;
      const user = await this.authService.getUserByClerkId(clerkId);

      await this.authService.deleteUser(user.id);

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };
}
