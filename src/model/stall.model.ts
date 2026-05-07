import { Item } from "./item.model";
import { Review } from "./review.model";

export type StallItems = {
  id: number;
  name: string;
  description: string;
  image: string | null;
  openAt: string;
  closeAt: string;
  role: string;
  status: boolean;
  reviews: Review[];
  items: Item[];
  createdAt: string;
};
