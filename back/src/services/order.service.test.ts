import { createOrderService } from "./order.service";
import { ProductRepository } from "../repositories/product.repository";
import { UserRepository } from "../repositories/user.repository";
import { OrderRepository } from "../repositories/order.repository";

jest.mock("../repositories/product.repository", () => ({
  ProductRepository: { findOneBy: jest.fn() },
}));
jest.mock("../repositories/user.repository", () => ({
  UserRepository: { findOneBy: jest.fn() },
}));
jest.mock("../repositories/order.repository", () => ({
  OrderRepository: { create: jest.fn(), save: jest.fn() },
}));

const productFindOneBy = ProductRepository.findOneBy as jest.Mock;
const userFindOneBy = UserRepository.findOneBy as jest.Mock;
const orderCreate = OrderRepository.create as jest.Mock;
const orderSave = OrderRepository.save as jest.Mock;

describe("createOrderService", () => {
  beforeEach(() => {
    productFindOneBy.mockReset();
    userFindOneBy.mockReset();
    orderCreate.mockReset();
    orderSave.mockReset();
    orderCreate.mockReturnValue({});
    orderSave.mockImplementation(async (o) => o);
  });

  it("creates an approved order with the user and deduped products", async () => {
    const user = { id: 7, name: "Jane" };
    productFindOneBy.mockImplementation(async ({ id }) => ({ id }));
    userFindOneBy.mockResolvedValue(user);

    const order = await createOrderService({ userId: 7, products: [1, 1, 2] });

    expect(order.status).toBe("approved");
    expect(order.date).toBeInstanceOf(Date);
    expect(order.user).toBe(user);
    // duplicate product id collapsed to a single lookup / item
    expect(order.products).toEqual([{ id: 1 }, { id: 2 }]);
    expect(productFindOneBy).toHaveBeenCalledTimes(2);
    expect(orderSave).toHaveBeenCalled();
  });

  it("throws when a product does not exist", async () => {
    productFindOneBy.mockResolvedValue(null);

    await expect(
      createOrderService({ userId: 7, products: [99] })
    ).rejects.toThrow("Product not found");
  });

  it("throws when the user does not exist", async () => {
    productFindOneBy.mockImplementation(async ({ id }) => ({ id }));
    userFindOneBy.mockResolvedValue(null);

    await expect(
      createOrderService({ userId: 404, products: [1] })
    ).rejects.toThrow("User not found");
  });
});
