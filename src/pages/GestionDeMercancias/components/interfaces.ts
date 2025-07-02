export interface Quote {
  id: string;
  user: User;
  status: "pending" | "responded" | "partial";
  productQuantity: number;
  respondedProducts: number;
  products: Product[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}
export interface Product {
  id: string;
  name: string;
  quantity: number;
  size: string;
  color: string;
  url: string;
  comment: string;
  weight: number;
  volume: number;
  number_of_boxes: number;
  statusResponseProduct: string,
  sendResponse: boolean,
  attachments:string[]
}

