import { AppDataSource } from "../config/dataSource";
import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItem";

export const CartRepository = AppDataSource.getRepository(Cart);
export const CartItemRepository = AppDataSource.getRepository(CartItem);
