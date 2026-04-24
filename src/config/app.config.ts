// ─── App Configuration ─────────────────────────────────────────────────────

export const APP_NAME = "CISM";
export const APP_DESCRIPTION = "Campus Information and Student Management";

// ─── Routes ────────────────────────────────────────────────────────────────

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  ACCOUNT: "/account",
  SEARCH: "/search",
} as const;

export const PUBLIC_ROUTES: string[] = [ROUTES.LOGIN, ROUTES.REGISTER];

// ─── OTP Configuration ─────────────────────────────────────────────────────

export const OTP = {
  EXPIRY_SECONDS: 300,
  STORAGE_KEYS: {
    IS_SENT: "isOtpSent",
    EXPIRY: "otpExpiry",
  },
} as const;

// ─── API ────────────────────────────────────────────────────────────────────

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REGISTER: "/api/auth/register",
    VALIDATE_COOKIE: "/api/auth/validate-cookie",
    REFRESH: "/api/auth/refresh",
    DELETE_ACCOUNT: "/api/auth/delete-account",
    UPLOAD_AVATAR: "/api/auth/avatar",
  },
  OTP: {
    SEND: "/api/resend/send-otp",
  },
} as const;
