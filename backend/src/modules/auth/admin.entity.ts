import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import bcrypt from "bcryptjs";

export enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  SUPPORT = "SUPPORT",
}

export enum AdminStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  INACTIVE = "INACTIVE",
}

@Entity("admins")
export class Admin {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({
    type: "enum",
    enum: AdminRole,
    default: AdminRole.ADMIN,
  })
  role!: AdminRole;

  @Column({
    type: "enum",
    enum: AdminStatus,
    default: AdminStatus.ACTIVE,
  })
  status!: AdminStatus;

  @Column({ type: "jsonb", nullable: true })
  permissions?: string[];

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  lastLoginIp?: string;

  @Column({ type: "int", default: 0 })
  loginAttempts!: number;

  @Column({ nullable: true })
  lockedUntil?: Date;

  @Column({ nullable: true })
  refreshToken?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password && !this.password.startsWith("$2a$")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isAccountLocked(): boolean {
    return !!(this.lockedUntil && this.lockedUntil > new Date());
  }

  canAccessResource(resource: string): boolean {
    if (this.role === AdminRole.SUPER_ADMIN) {
      return true;
    }
    return this.permissions ? this.permissions.includes(resource) : false;
  }
}
