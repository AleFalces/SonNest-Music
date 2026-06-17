import { Cart } from "../entities/Cart";
import { User } from "../entities/User";
import {
  CartRepository,
  CartItemRepository,
} from "../repositories/cart.repository";
import { ProductRepository } from "../repositories/product.repository";
import { ClientError } from "../utils/errors";

// Returns the user's cart, creating an empty one the first time it is accessed.
export const getCartService = async (userId: number): Promise<Cart> => {
  let cart = await CartRepository.findOne({
    where: { user: { id: userId } },
  });

  if (!cart) {
    cart = CartRepository.create({
      user: { id: userId } as User,
      items: [],
    });
    await CartRepository.save(cart);
  }

  return cart;
};

// Adds one unit of a product to the cart, respecting the product's stock.
export const addItemService = async (
  userId: number,
  productId: number
): Promise<Cart> => {
  const cart = await getCartService(userId);

  const product = await ProductRepository.findOneBy({ id: productId });
  if (!product) throw new ClientError("Product not found", 404);

  const existing = cart.items.find((item) => item.product.id === productId);
  const currentQty = existing ? existing.quantity : 0;

  if (currentQty >= product.stock)
    throw new ClientError("Not enough stock available", 400);

  if (existing) {
    existing.quantity += 1;
    await CartItemRepository.save(existing);
  } else {
    const item = CartItemRepository.create({ cart, product, quantity: 1 });
    await CartItemRepository.save(item);
  }

  return getCartService(userId);
};

// Removes one unit of a product; drops the line when it reaches zero.
export const removeItemService = async (
  userId: number,
  productId: number
): Promise<Cart> => {
  const cart = await getCartService(userId);
  const existing = cart.items.find((item) => item.product.id === productId);

  if (existing) {
    if (existing.quantity > 1) {
      existing.quantity -= 1;
      await CartItemRepository.save(existing);
    } else {
      await CartItemRepository.remove(existing);
    }
  }

  return getCartService(userId);
};

// Removes a product from the cart entirely, regardless of its quantity.
export const removeProductService = async (
  userId: number,
  productId: number
): Promise<Cart> => {
  const cart = await getCartService(userId);
  const existing = cart.items.find((item) => item.product.id === productId);

  if (existing) await CartItemRepository.remove(existing);

  return getCartService(userId);
};

// Empties the cart, removing every line.
export const clearCartService = async (userId: number): Promise<Cart> => {
  const cart = await getCartService(userId);

  if (cart.items.length) await CartItemRepository.remove(cart.items);

  return getCartService(userId);
};
