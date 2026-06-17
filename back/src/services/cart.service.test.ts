import {
  getCartService,
  addItemService,
  removeItemService,
  removeProductService,
  clearCartService,
} from "./cart.service";
import { ClientError } from "../utils/errors";
import {
  CartRepository,
  CartItemRepository,
} from "../repositories/cart.repository";
import { ProductRepository } from "../repositories/product.repository";

jest.mock("../repositories/cart.repository", () => ({
  CartRepository: {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
  CartItemRepository: {
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock("../repositories/product.repository", () => ({
  ProductRepository: { findOneBy: jest.fn() },
}));

const cartFindOne = CartRepository.findOne as jest.Mock;
const cartCreate = CartRepository.create as jest.Mock;
const cartSave = CartRepository.save as jest.Mock;
const itemCreate = CartItemRepository.create as jest.Mock;
const itemSave = CartItemRepository.save as jest.Mock;
const itemRemove = CartItemRepository.remove as jest.Mock;
const productFindOneBy = ProductRepository.findOneBy as jest.Mock;

// helpers to build fixtures quickly
const product = (over = {}) => ({ id: 1, stock: 5, ...over });
const cartWith = (items: any[] = []) => ({ id: 10, user: { id: 7 }, items });

beforeEach(() => jest.clearAllMocks());

describe("getCartService", () => {
  it("returns the existing cart for the user", async () => {
    const cart = cartWith([]);
    cartFindOne.mockResolvedValue(cart);

    const result = await getCartService(7);

    expect(result).toBe(cart);
    expect(cartCreate).not.toHaveBeenCalled();
  });

  it("lazily creates an empty cart on first access", async () => {
    cartFindOne.mockResolvedValueOnce(null);
    const created = cartWith([]);
    cartCreate.mockReturnValue(created);
    cartSave.mockResolvedValue(created);

    const result = await getCartService(7);

    expect(cartCreate).toHaveBeenCalled();
    expect(cartSave).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });
});

describe("addItemService", () => {
  it("creates a new line when the product is not in the cart yet", async () => {
    cartFindOne.mockResolvedValue(cartWith([]));
    productFindOneBy.mockResolvedValue(product({ stock: 5 }));
    itemCreate.mockImplementation((data) => data);

    await addItemService(7, 1);

    expect(itemCreate).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 1 })
    );
    expect(itemSave).toHaveBeenCalled();
  });

  it("increments the quantity when the product is already in the cart", async () => {
    const existing = { id: 99, product: product(), quantity: 2 };
    cartFindOne.mockResolvedValue(cartWith([existing]));
    productFindOneBy.mockResolvedValue(product({ stock: 5 }));

    await addItemService(7, 1);

    expect(existing.quantity).toBe(3);
    expect(itemSave).toHaveBeenCalledWith(existing);
    expect(itemCreate).not.toHaveBeenCalled();
  });

  it("throws a 400 ClientError when adding beyond available stock", async () => {
    const existing = { id: 99, product: product(), quantity: 5 };
    cartFindOne.mockResolvedValue(cartWith([existing]));
    productFindOneBy.mockResolvedValue(product({ stock: 5 }));

    await expect(addItemService(7, 1)).rejects.toBeInstanceOf(ClientError);
    await expect(addItemService(7, 1)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(itemSave).not.toHaveBeenCalled();
  });

  it("throws a 404 ClientError when the product does not exist", async () => {
    cartFindOne.mockResolvedValue(cartWith([]));
    productFindOneBy.mockResolvedValue(null);

    await expect(addItemService(7, 999)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("removeItemService", () => {
  it("decrements the quantity when more than one", async () => {
    const existing = { id: 99, product: product(), quantity: 3 };
    cartFindOne.mockResolvedValue(cartWith([existing]));

    await removeItemService(7, 1);

    expect(existing.quantity).toBe(2);
    expect(itemSave).toHaveBeenCalledWith(existing);
    expect(itemRemove).not.toHaveBeenCalled();
  });

  it("removes the line when the quantity reaches zero", async () => {
    const existing = { id: 99, product: product(), quantity: 1 };
    cartFindOne.mockResolvedValue(cartWith([existing]));

    await removeItemService(7, 1);

    expect(itemRemove).toHaveBeenCalledWith(existing);
    expect(itemSave).not.toHaveBeenCalled();
  });
});

describe("removeProductService", () => {
  it("removes the whole line regardless of quantity", async () => {
    const existing = { id: 99, product: product(), quantity: 4 };
    cartFindOne.mockResolvedValue(cartWith([existing]));

    await removeProductService(7, 1);

    expect(itemRemove).toHaveBeenCalledWith(existing);
  });
});

describe("clearCartService", () => {
  it("removes every line in the cart", async () => {
    const items = [
      { id: 1, product: product({ id: 1 }), quantity: 1 },
      { id: 2, product: product({ id: 2 }), quantity: 2 },
    ];
    cartFindOne.mockResolvedValue(cartWith(items));

    await clearCartService(7);

    expect(itemRemove).toHaveBeenCalledWith(items);
  });

  it("does nothing when the cart is already empty", async () => {
    cartFindOne.mockResolvedValue(cartWith([]));

    await clearCartService(7);

    expect(itemRemove).not.toHaveBeenCalled();
  });
});
