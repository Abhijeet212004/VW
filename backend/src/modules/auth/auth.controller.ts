import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserInput, UpdateUserInput } from './auth.validation';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

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
