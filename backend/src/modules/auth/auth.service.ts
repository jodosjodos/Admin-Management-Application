import { Repository } from "typeorm";
import jwt from "jsonwebtoken";
import { Admin, AdminStatus } from "./admin.entity";
import { AppDataSource } from "../../config/database";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
  AuthorizationError,
} from "../../common/exceptions";
import {
  LoginDto,
  CreateAdminDto,
  ChangePasswordDto,
  RefreshTokenDto,
} from "./auth.dto";

export class AuthService {
  private adminRepository: Repository<Admin>;

  constructor() {
    this.adminRepository = AppDataSource.getRepository(Admin);
  }

  async register(createAdminDto: CreateAdminDto): Promise<Admin> {
    const existingAdmin = await this.adminRepository.findOne({
      where: { email: createAdminDto.email },
    });

    if (existingAdmin) {
      throw new ConflictError("Admin with this email already exists");
    }

    const admin = this.adminRepository.create(createAdminDto);
    return await this.adminRepository.save(admin);
  }

  async login(
    loginDto: LoginDto,
    ipAddress: string
  ): Promise<{ admin: Admin; accessToken: string; refreshToken: string }> {
    const admin = await this.adminRepository
      .createQueryBuilder("admin")
      .where("admin.email = :email", { email: loginDto.email })
      .addSelect("admin.password")
      .getOne();

    if (!admin) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Check if account is locked
    if (admin.isAccountLocked()) {
      throw new AuthorizationError(
        "Account is temporarily locked. Please try again later."
      );
    }

    // Check if account is suspended
    if (admin.status === AdminStatus.SUSPENDED) {
      throw new AuthorizationError(
        "Your account has been suspended. Please contact support."
      );
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(loginDto.password);

    if (!isPasswordValid) {
      // Increment login attempts
      admin.loginAttempts += 1;

      // Lock account after 5 failed attempts for 15 minutes
      if (admin.loginAttempts >= 5) {
        admin.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      await this.adminRepository.save(admin);
      throw new AuthenticationError("Invalid credentials");
    }

    // Reset login attempts on successful login
    admin.loginAttempts = 0;
    admin.lockedUntil = undefined;
    admin.lastLoginAt = new Date();
    admin.lastLoginIp = ipAddress;

    // Generate tokens
    const accessToken = this.generateAccessToken(admin);
    const refreshToken = this.generateRefreshToken(admin);

    // Save refresh token
    admin.refreshToken = refreshToken;
    await this.adminRepository.save(admin);

    // Remove sensitive fields
    delete (admin as Partial<Admin>).password;
    delete (admin as Partial<Admin>).refreshToken;

    return { admin, accessToken, refreshToken };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const jwtRefreshSecret =
        process.env.JWT_REFRESH_SECRET || "default_refresh_secret";
      const decoded = jwt.verify(
        refreshTokenDto.refreshToken,
        jwtRefreshSecret
      ) as {
        id: string;
      };

      const admin = await this.adminRepository.findOne({
        where: { id: decoded.id },
      });

      if (!admin || admin.refreshToken !== refreshTokenDto.refreshToken) {
        throw new AuthenticationError("Invalid refresh token");
      }

      if (admin.status !== AdminStatus.ACTIVE) {
        throw new AuthorizationError("Account is not active");
      }

      const accessToken = this.generateAccessToken(admin);
      const newRefreshToken = this.generateRefreshToken(admin);

      admin.refreshToken = newRefreshToken;
      await this.adminRepository.save(admin);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new AuthenticationError("Invalid or expired refresh token");
    }
  }

  async logout(adminId: string): Promise<void> {
    await this.adminRepository.update(adminId, { refreshToken: undefined });
  }

  async getProfile(adminId: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    return admin;
  }

  async changePassword(
    adminId: string,
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    const admin = await this.adminRepository
      .createQueryBuilder("admin")
      .where("admin.id = :id", { id: adminId })
      .addSelect("admin.password")
      .getOne();

    if (!admin) {
      throw new NotFoundError("Admin not found");
    }

    const isPasswordValid = await admin.comparePassword(
      changePasswordDto.currentPassword
    );

    if (!isPasswordValid) {
      throw new ValidationError("Current password is incorrect");
    }

    admin.password = changePasswordDto.newPassword;
    await this.adminRepository.save(admin);
  }

  private generateAccessToken(admin: Admin): string {
    const jwtSecret = process.env.JWT_SECRET || "default_secret";
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";

    return jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );
  }

  private generateRefreshToken(admin: Admin): string {
    const jwtRefreshSecret =
      process.env.JWT_REFRESH_SECRET || "default_refresh_secret";
    const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

    return jwt.sign({ id: admin.id }, jwtRefreshSecret, {
      expiresIn: jwtRefreshExpiresIn,
    });
  }
}
