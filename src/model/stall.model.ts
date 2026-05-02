import { Item } from "./item.model";
import { Review } from "./review.model";

export type StallItems = {
  id: number;
  meals: Item[];
  snacks: Item[];
  drinks: Item[];
  reviews: Review[];
};
