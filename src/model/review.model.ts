export type Review = {
  id?: number;
  itemId?: number;
  stall_item_id?: number;
  userId?: number;
  users_id?: number;
  user?: {
    clientName: string;
    avatar: string;
    role?: string;
  };
  star: number;
  comment: string;
  image?: string;
  createdAt?: string;
  createAt?: string;
  create_at?: string;
  updatedAt?: string;
};



export type ReviewRequest = {
  itemId: number;
  stallId: number;
  star: number;
  comment?: string;
  image?: string | File;
}

export const initReview: Review = {
  star: 0,
  comment: ""
};
