
import { FirebaseError } from "firebase/app";

/**
 * Error types for app-wide error handling
 */
export enum ErrorType {
  AUTHENTICATION = "authentication",
  DATABASE = "database",
  NETWORK = "network",
  VALIDATION = "validation",
  UNKNOWN = "unknown"
}

/**
 * Standard error structure for app
 */
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  originalError?: unknown;
}

/**
 * Maps Firebase auth error codes to user-friendly messages
 */
const authErrorMessages: Record<string, string> = {
  "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
  "auth/invalid-email": "Invalid email format. Please check your email address.",
  "auth/weak-password": "Password is too weak. Please use a stronger password.",
  "auth/user-not-found": "Invalid email or password. Please try again.",
  "auth/wrong-password": "Invalid email or password. Please try again.",
  "auth/user-disabled": "This account has been disabled. Please contact support.",
  "auth/too-many-requests": "Too many failed login attempts. Please try again later.",
  "auth/network-request-failed": "Network error. Please check your internet connection.",
  "auth/popup-closed-by-user": "Sign-in popup was closed before completing the sign-in process.",
  "auth/cancelled-popup-request": "The sign-in popup request was cancelled."
};

/**
 * Maps Firestore error codes to user-friendly messages
 */
const firestoreErrorMessages: Record<string, string> = {
  "permission-denied": "You don't have permission to access this data.",
  "not-found": "The requested data does not exist.",
  "already-exists": "This data already exists.",
  "resource-exhausted": "Too many requests. Please try again later.",
  "failed-precondition": "Operation cannot be executed in the current state."
};

/**
 * Handles Firebase errors and returns standardized app errors
 */
export function handleFirebaseError(error: unknown): AppError {
  if (error instanceof FirebaseError) {
    // Handle authentication errors
    if (error.code.startsWith("auth/")) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: authErrorMessages[error.code] || "Authentication failed. Please try again.",
        code: error.code,
        originalError: error
      };
    }
    
    // Handle Firestore errors
    const firestoreCode = error.code.split("/")[1];
    if (firestoreErrorMessages[firestoreCode]) {
      return {
        type: ErrorType.DATABASE,
        message: firestoreErrorMessages[firestoreCode],
        code: error.code,
        originalError: error
      };
    }
    
    // Handle other Firebase errors
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || "An unexpected error occurred. Please try again.",
      code: error.code,
      originalError: error
    };
  }
  
  // Handle network errors
  if (error instanceof Error && error.message.includes("network")) {
    return {
      type: ErrorType.NETWORK,
      message: "Network error. Please check your internet connection.",
      originalError: error
    };
  }
  
  // Handle unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
    originalError: error
  };
}

/**
 * Creates a validation error
 */
export function createValidationError(message: string): AppError {
  return {
    type: ErrorType.VALIDATION,
    message
  };
}

/**
 * Formats error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return "An unexpected error occurred. Please try again.";
}
