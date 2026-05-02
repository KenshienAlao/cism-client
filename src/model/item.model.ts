export type Item = {
  id?: number;
  stallId?: number;
  name: string;
  price: number;
  image?: string | File;
  stocks: number;
  sold: number;
  previousSold?: number;
  createdAt?: string;
  updatedAt?: string;
};

export const initItem: Item = {
  name: "",
  price: 0,
  image: "",
  stocks: 0,
  sold: 0,
  previousSold: 0,
};

export type ItemRequest = {
  name: string;
  price: number;
  image?: string | File;
  stocks: number;
};

export const initItemRequest: ItemRequest = {
  name: "",
  price: 0,
  image: "",
  stocks: 0,
};


