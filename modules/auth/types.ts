/**
 * Auth Module
 *
 * Handles user authentication, login, signup, and session management
 * - Login/Signup pages
 * - Password reset
 * - Email verification
 * - Social auth providers (future)
 */

export interface User {
  id: string;
  email: string;
  role: 'buyer' | 'dealer' | 'inspector' | 'admin';
  createdAt: string;
}

export interface AuthError {
  code: string;
  message: string;
}
