import { DataSource } from "typeorm";
import { AuthService } from "../modules/auth/auth.service";
import { Admin, AdminRole, AdminStatus } from "../modules/auth/admin.entity";
import {
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  ValidationError,
} from "../common/exceptions";
import * as bcrypt from "bcryptjs";

describe("AdminAuthService", () => {
  let service: AuthService;
  let dataSource: DataSource;
  let testAdmin: Admin;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5433"),
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_DATABASE || "credit_jambo_admin_test",
      entities: [Admin],
      synchronize: true,
    });

    await dataSource.initialize();
    service = new AuthService();

    // Create test admin
    const adminRepo = dataSource.getRepository(Admin);
    const hashedPassword = await bcrypt.hash("Test@123", 10);
    testAdmin = adminRepo.create({
      firstName: "Test",
      lastName: "Admin",
      email: "testadmin@creditjambo.com",
      password: hashedPassword,
      role: AdminRole.ADMIN,
      status: AdminStatus.ACTIVE,
    });
    await adminRepo.save(testAdmin);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe("login", () => {
    it("should login successfully with correct credentials", async () => {
      const result = await service.login(
        {
          email: "testadmin@creditjambo.com",
          password: "Test@123",
        },
        "127.0.0.1"
      );

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.admin).toBeDefined();
      expect(result.admin.email).toBe("testadmin@creditjambo.com");
    });

    it("should throw error for invalid email", async () => {
      await expect(
        service.login(
          {
            email: "nonexistent@creditjambo.com",
            password: "Test@123",
          },
          "127.0.0.1"
        )
      ).rejects.toThrow(AuthenticationError);
    });

    it("should throw error for invalid password", async () => {
      await expect(
        service.login(
          {
            email: "testadmin@creditjambo.com",
            password: "WrongPassword",
          },
          "127.0.0.1"
        )
      ).rejects.toThrow(AuthenticationError);
    });

    it("should increment failed login attempts on wrong password", async () => {
      const adminRepo = dataSource.getRepository(Admin);
      const admin = await adminRepo.findOne({
        where: { email: testAdmin.email },
      });
      const initialAttempts = admin?.loginAttempts || 0;

      try {
        await service.login(
          {
            email: "testadmin@creditjambo.com",
            password: "WrongPassword",
          },
          "127.0.0.1"
        );
      } catch (error) {
        // Expected to throw
      }

      const updatedAdmin = await adminRepo.findOne({
        where: { email: testAdmin.email },
      });
      expect(updatedAdmin?.loginAttempts).toBeGreaterThan(initialAttempts);
    });

    it("should lock account after 5 failed attempts", async () => {
      // Create a new admin for this test
      const adminRepo = dataSource.getRepository(Admin);
      const hashedPassword = await bcrypt.hash("Test@123", 10);
      const lockTestAdmin = adminRepo.create({
        firstName: "Lock",
        lastName: "Test",
        email: "locktest@creditjambo.com",
        password: hashedPassword,
        role: AdminRole.ADMIN,
        status: AdminStatus.ACTIVE,
      });
      await adminRepo.save(lockTestAdmin);

      // Attempt 5 failed logins
      for (let i = 0; i < 5; i++) {
        try {
          await service.login(
            {
              email: "locktest@creditjambo.com",
              password: "WrongPassword",
            },
            "127.0.0.1"
          );
        } catch (error) {
          // Expected to throw
        }
      }

      // Check if account is locked
      const lockedAdmin = await adminRepo.findOne({
        where: { email: "locktest@creditjambo.com" },
      });
      expect(lockedAdmin?.lockedUntil).toBeDefined();
      expect(lockedAdmin?.lockedUntil).toBeInstanceOf(Date);
    });

    it("should not allow login for suspended admin", async () => {
      const adminRepo = dataSource.getRepository(Admin);
      const suspendedAdmin = adminRepo.create({
        firstName: "Suspended",
        lastName: "Admin",
        email: "suspended@creditjambo.com",
        password: await bcrypt.hash("Test@123", 10),
        role: AdminRole.ADMIN,
        status: AdminStatus.SUSPENDED,
      });
      await adminRepo.save(suspendedAdmin);

      await expect(
        service.login(
          {
            email: "suspended@creditjambo.com",
            password: "Test@123",
          },
          "127.0.0.1"
        )
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe("register", () => {
    it("should register new admin successfully (SUPER_ADMIN only)", async () => {
      const result = await service.register({
        firstName: "New",
        lastName: "Admin",
        email: "newadmin@creditjambo.com",
        password: "NewAdmin@123",
        role: AdminRole.ADMIN,
      });

      expect(result).toBeDefined();
      expect(result.email).toBe("newadmin@creditjambo.com");
      expect(result.role).toBe(AdminRole.ADMIN);
      expect(result.password).not.toBe("NewAdmin@123"); // Should be hashed
    });

    it("should throw error for duplicate email", async () => {
      await expect(
        service.register({
          firstName: "Duplicate",
          lastName: "Admin",
          email: "testadmin@creditjambo.com",
          password: "Test@123",
          role: AdminRole.ADMIN,
        })
      ).rejects.toThrow(ConflictError);
    });

    it("should validate password strength", async () => {
      await expect(
        service.register({
          firstName: "Weak",
          lastName: "Password",
          email: "weakpass@creditjambo.com",
          password: "123",
          role: AdminRole.ADMIN,
        })
      ).rejects.toThrow();
    });
  });

  describe("getProfile", () => {
    it("should return admin profile", async () => {
      const profile = await service.getProfile(testAdmin.id);

      expect(profile).toBeDefined();
      expect(profile.email).toBe("testadmin@creditjambo.com");
      expect(profile.role).toBe(AdminRole.ADMIN);
      expect(profile).not.toHaveProperty("password");
    });

    it("should throw error for non-existent admin", async () => {
      await expect(service.getProfile("non-existent-id")).rejects.toThrow();
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      await expect(
        service.changePassword(testAdmin.id, {
          currentPassword: "Test@123",
          newPassword: "NewTest@456",
        })
      ).resolves.not.toThrow();

      // Verify can login with new password
      const result = await service.login(
        {
          email: "testadmin@creditjambo.com",
          password: "NewTest@456",
        },
        "127.0.0.1"
      );
      expect(result.accessToken).toBeDefined();

      // Change back for other tests
      await service.changePassword(testAdmin.id, {
        currentPassword: "NewTest@456",
        newPassword: "Test@123",
      });
    });

    it("should throw error for incorrect current password", async () => {
      await expect(
        service.changePassword(testAdmin.id, {
          currentPassword: "WrongPassword",
          newPassword: "NewTest@456",
        })
      ).rejects.toThrow(ValidationError);
    });
  });
});
