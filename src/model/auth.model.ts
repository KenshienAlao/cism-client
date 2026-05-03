export type RegisterRequest = {
  username: string;
  studentId: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  message: string;
};

export const initRegisterForm: RegisterRequest = {
  username: "",
  studentId: "",
  email: "",
  password: "",
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
    clientName: string;
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
