import "reflect-metadata";
import { AppDataSource } from "../config/database";
import { Admin, AdminRole, AdminStatus } from "../modules/auth/admin.entity";

async function seed() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("✅ Database connected");

    const adminRepository = AppDataSource.getRepository(Admin);

    // Check if super admin already exists
    const existingSuperAdmin = await adminRepository.findOne({
      where: { email: "admin@creditjambo.com" },
    });

    if (existingSuperAdmin) {
      console.log("⚠️  Super admin already exists");
      await AppDataSource.destroy();
      return;
    }

    // Create super admin
    const superAdmin = adminRepository.create({
      email: "admin@creditjambo.com",
      password: "Admin@123", // Will be hashed by entity hook
      firstName: "Super",
      lastName: "Admin",
      phone: "+250788000000",
      role: AdminRole.SUPER_ADMIN,
      status: AdminStatus.ACTIVE,
    });

    await adminRepository.save(superAdmin);
    console.log("✅ Super admin created successfully");
    console.log("📧 Email: admin@creditjambo.com");
    console.log("🔑 Password: Admin@123");
    console.log("⚠️  Please change the password after first login!");

    // Create additional test admins
    const testAdmin = adminRepository.create({
      email: "testadmin@creditjambo.com",
      password: "Test@123",
      firstName: "Test",
      lastName: "Admin",
      phone: "+250788111111",
      role: AdminRole.ADMIN,
      status: AdminStatus.ACTIVE,
    });

    await adminRepository.save(testAdmin);
    console.log("✅ Test admin created successfully");
    console.log("📧 Email: testadmin@creditjambo.com");
    console.log("🔑 Password: Test@123");

    const supportAdmin = adminRepository.create({
      email: "support@creditjambo.com",
      password: "Support@123",
      firstName: "Support",
      lastName: "User",
      phone: "+250788222222",
      role: AdminRole.SUPPORT,
      status: AdminStatus.ACTIVE,
    });

    await adminRepository.save(supportAdmin);
    console.log("✅ Support admin created successfully");
    console.log("📧 Email: support@creditjambo.com");
    console.log("🔑 Password: Support@123");

    await AppDataSource.destroy();
    console.log("\n🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
