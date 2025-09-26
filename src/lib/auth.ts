import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'agency_owner' | 'agency_staff' | 'admin';
  agencyId?: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'customer' | 'agency_owner';
}

// Generate JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      agencyId: user.agencyId 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): { userId: string; email: string; role: string; agencyId?: string } | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
  } catch {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Register user
export async function registerUser(data: RegisterData): Promise<{ user: User; token: string } | null> {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        fullName: data.name,
        phone: data.phone,
        role: data.role || 'customer',
        isActive: true
      }
    });

    // Generate token
    const userObj: User = {
      id: user.id,
      email: user.email,
      name: user.fullName,
      phone: user.phone || undefined,
      role: user.role as 'customer' | 'agency_owner' | 'agency_staff' | 'admin',
      agencyId: user.agencyId || undefined,
      createdAt: user.createdAt
    };

    const token = generateToken(userObj);

    return { user: userObj, token };
  } catch (error) {
    console.error('Register error:', error);
    return null;
  }
}

// Login user
export async function loginUser(credentials: LoginCredentials): Promise<{ user: User; token: string } | null> {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: { agency: true }
    });

    if (!user || !user.isActive) {
      return null;
    }

    // Check password
    if (!user.passwordHash) {
      return null;
    }
    const isValidPassword = await comparePassword(credentials.password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    // Create user object
    const userObj: User = {
      id: user.id,
      email: user.email,
      name: user.fullName,
      phone: user.phone || undefined,
      role: user.role as 'customer' | 'agency_owner' | 'agency_staff' | 'admin',
      agencyId: user.agencyId || undefined,
      createdAt: user.createdAt
    };

    // Generate token
    const token = generateToken(userObj);

    return { user: userObj, token };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      include: { agency: true }
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      phone: user.phone || undefined,
      role: user.role as 'customer' | 'agency_owner' | 'agency_staff' | 'admin',
      agencyId: user.agencyId || undefined,
      createdAt: user.createdAt
    };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string, 
  data: Partial<{ name: string; phone: string; email: string }>
): Promise<User | null> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.name,
        phone: data.phone,
        email: data.email,
        updatedAt: new Date()
      }
    });

    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      phone: user.phone || undefined,
      role: user.role as 'customer' | 'agency_owner' | 'agency_staff' | 'admin',
      agencyId: user.agencyId || undefined,
      createdAt: user.createdAt
    };
  } catch (error) {
    console.error('Update user error:', error);
    return null;
  }
}

// Change password
export async function changePassword(
  userId: string, 
  currentPassword: string, 
  newPassword: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return false;

    // Verify current password
    if (!user.passwordHash) return false;
    const isValidPassword = await comparePassword(currentPassword, user.passwordHash);
    if (!isValidPassword) return false;

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { 
        passwordHash: hashedPassword,
        updatedAt: new Date()
      }
    });

    return true;
  } catch (error) {
    console.error('Change password error:', error);
    return false;
  }
}
