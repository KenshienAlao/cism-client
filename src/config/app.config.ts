export const APP_NAME = "CISM";
export const APP_DESCRIPTION = "Campus Information and Student Management";


export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  ACCOUNT: "/account",
  SEARCH: "/search",
} as const;

export const PUBLIC_ROUTES: string[] = [ROUTES.LOGIN, ROUTES.REGISTER];


export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REGISTER: "/api/auth/register",
    VALIDATE_COOKIE: "/api/auth/validate-cookie",
    REFRESH: "/api/auth/refresh",
    DELETE_ACCOUNT: "/api/auth/delete-account",
    UPLOAD_AVATAR: "/api/auth/avatar",
    UPDATE_PROFILE: "/api/auth/update-profile",
  },
  ITEM: {
    GET_ALL: "/api/user/stall/get-all-item",
  },
  REVIEW: {
    CREATE: "/api/client/review/review-item"
  },
  CART: {
    GET_ALL: "/api/customer/cart/get-cart",
    ADD: "/api/customer/cart/add-item-to-cart",
    UPDATE: "/api/customer/cart/update-cart-item",
    DELETE: "/api/customer/cart/delete-cart-item",
    DELETE_ALL: "/api/customer/cart/delete-all-cart",
  }
} as const;


export const VIEW_TYPE = {
  FEED: "feed",
  TRACKING: "tracking",
  ORDERS: "orders",
} as const;

export const ROLES = {
  STUDENT: "STUDENT",
  TEACHER: "FACULTY",
  STAFF: "STAFF",
} as const;

export const CATEGORY_MAP: Record<string, string> = {
  meals: 'MEAL',
  drinks: 'DRINK',
  snacks: 'SNACK',
  business: 'SCHOOL_ITEM',
};