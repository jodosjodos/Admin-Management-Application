import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAdminTable1698700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "admin",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "email",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          {
            name: "password",
            type: "varchar",
            length: "255",
          },
          {
            name: "firstName",
            type: "varchar",
            length: "100",
          },
          {
            name: "lastName",
            type: "varchar",
            length: "100",
          },
          {
            name: "phone",
            type: "varchar",
            length: "20",
            isNullable: true,
          },
          {
            name: "role",
            type: "enum",
            enum: ["SUPER_ADMIN", "ADMIN", "SUPPORT"],
            default: "'ADMIN'",
          },
          {
            name: "status",
            type: "enum",
            enum: ["ACTIVE", "SUSPENDED", "INACTIVE"],
            default: "'ACTIVE'",
          },
          {
            name: "loginAttempts",
            type: "int",
            default: 0,
          },
          {
            name: "lockedUntil",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "lastLoginAt",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "lastLoginIp",
            type: "varchar",
            length: "45",
            isNullable: true,
          },
          {
            name: "refreshToken",
            type: "text",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true
    );

    // Create extension for UUID generation
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("admin");
  }
}
