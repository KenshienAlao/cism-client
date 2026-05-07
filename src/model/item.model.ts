export type ItemVariation = {
  id: number;
  name: string;
  stock: number;
  price: number;
  image: string | null;
};

export type Item = {
  stallImage?: string | null;
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
  category?: string;
  variations?: ItemVariation[];
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


