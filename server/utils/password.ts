import bcrypt from "bcryptjs";
import crypto from "crypto";
import { log } from "./logger";

/**
 * Password utility functions for HRMS Elite
 * Handles password hashing, verification, and token generation
 */

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    log.error(
      "Error hashing password:",
      error instanceof Error ? error : new Error(String(error)),
      "AUTH",
    );
    throw new Error("Failed to hash password");
  }
};

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Hashed password to compare against
 * @returns True if password matches hash
 */
export const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    log.error(
      "Error verifying password:",
      error instanceof Error ? error : new Error(String(error)),
      "AUTH",
    );
    return false;
  }
};

/**
 * Generate a random token for password reset or email verification
 * @param length - Length of token (default: 32)
 * @returns Random token string
 */
export const generateToken = (length = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate a secure random string for tokens
 * @param length - Length of string (default: 64)
 * @returns Random string
 */
export const generateSecureToken = (length = 64): string => {
  return crypto.randomBytes(length).toString("base64url");
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid and message
 */
export const validatePasswordStrength = (
  password: string,
): {
  isValid: boolean;
  message: string;
} => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character",
    };
  }

  return { isValid: true, message: "Password meets strength requirements" };
};

/**
 * Check if password has been used recently
 * @param newPassword - New password to check
 * @param oldPassword - Old password hash to compare against
 * @returns True if password is different from old password
 */
export const isPasswordDifferent = async (
  newPassword: string,
  oldPasswordHash: string,
): Promise<boolean> => {
  return !(await verifyPassword(newPassword, oldPasswordHash));
};
