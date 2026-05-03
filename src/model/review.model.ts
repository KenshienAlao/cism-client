export type Review = {
  id?: number;
  itemId?: number;
  userId?: number;
  user?: {
    clientName: string;
    avatar: string;
    role?: string;
  };
  star: number;
  comment: string;
  createdAt?: string;
  createAt?: string;
  updatedAt?: string;
};



export type ReviewRequest = {
  itemId: number;
  stallId: number;
  star: number;
  comment?: string;
}

export const initReview: Review = {
  star: 0,
  comment: ""
};
