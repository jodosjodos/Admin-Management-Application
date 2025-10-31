import { Request, Response, NextFunction, Router } from "express";
import { AuthService } from "./auth.service";
import {
  LoginDto,
  CreateAdminDto,
  ChangePasswordDto,
  RefreshTokenDto,
} from "./auth.dto";
import {
  authenticate,
  AuthRequest,
  superAdminOnly,
} from "../../middleware/auth.middleware";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { ValidationError } from "../../common/exceptions";

export class AuthController {
  public router: Router;
  private authService: AuthService;

  constructor() {
    this.router = Router();
    this.authService = new AuthService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: Register new admin (Super Admin only)
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *               firstName:
     *                 type: string
     *               lastName:
     *                 type: string
     *     responses:
     *       201:
     *         description: Admin registered successfully
     */
    this.router.post(
      "/register",
      authenticate,
      superAdminOnly,
      this.register.bind(this)
    );

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Admin login
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login successful
     */
    this.router.post("/login", this.login.bind(this));

    /**
     * @swagger
     * /api/auth/refresh-token:
     *   post:
     *     summary: Refresh access token
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               refreshToken:
     *                 type: string
     *     responses:
     *       200:
     *         description: Token refreshed successfully
     */
    this.router.post("/refresh-token", this.refreshToken.bind(this));

    /**
     * @swagger
     * /api/auth/logout:
     *   post:
     *     summary: Logout admin
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Logged out successfully
     */
    this.router.post("/logout", authenticate, this.logout.bind(this));

    /**
     * @swagger
     * /api/auth/me:
     *   get:
     *     summary: Get current admin profile
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Admin profile retrieved successfully
     */
    this.router.get("/me", authenticate, this.getProfile.bind(this));

    /**
     * @swagger
     * /api/auth/change-password:
     *   put:
     *     summary: Change admin password
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               currentPassword:
     *                 type: string
     *               newPassword:
     *                 type: string
     *     responses:
     *       200:
     *         description: Password changed successfully
     */
    this.router.put(
      "/change-password",
      authenticate,
      this.changePassword.bind(this)
    );
  }

  private async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = plainToClass(CreateAdminDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        throw new ValidationError(
          "Validation failed: " + JSON.stringify(errors)
        );
      }

      const admin = await this.authService.register(dto);

      res.status(201).json({
        success: true,
        message: "Admin registered successfully",
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  }

  private async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = plainToClass(LoginDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        throw new ValidationError(
          "Validation failed: " + JSON.stringify(errors)
        );
      }

      const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
      const result = await this.authService.login(dto, ipAddress);

      res.json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  private async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = plainToClass(RefreshTokenDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        throw new ValidationError(
          "Validation failed: " + JSON.stringify(errors)
        );
      }

      const result = await this.authService.refreshToken(dto);

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  private async logout(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.authService.logout(req.user!.id);

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  private async getProfile(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const admin = await this.authService.getProfile(req.user!.id);

      res.json({
        success: true,
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  }

  private async changePassword(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto = plainToClass(ChangePasswordDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        throw new ValidationError(
          "Validation failed: " + JSON.stringify(errors)
        );
      }

      await this.authService.changePassword(req.user!.id, dto);

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
