export type RegisterRequest = {
  username: string;
  studentId: string;
  email: string;
  password: string;
  otp: string;
};

export type RegisterResponse = {
  message: string;
};

export const initRegisterForm: RegisterRequest = {
  username: "",
  studentId: "",
  email: "",
  password: "",
  otp: "",
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    avatar: string;
    username: string;
    email: string;
    studentId: string;
    role: string | null;
    enabled: boolean;
  };
};

export const initLoginForm: LoginRequest = {
  email: "",
  password: "",
};

export type OtpRequest = {
  email: string;
  otp: string;
};

export type OtpResponse = {
  message: string;
};

export const initOtpForm: OtpRequest = {
  email: "",
  otp: "",
};
