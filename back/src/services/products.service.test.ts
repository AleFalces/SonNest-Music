import { updateProductService } from "./products.service";
import { ClientError } from "../utils/errors";
import { ProductRepository } from "../repositories/product.repository";

jest.mock("../repositories/product.repository", () => ({
  ProductRepository: { findOneBy: jest.fn(), save: jest.fn() },
}));

const findOneBy = ProductRepository.findOneBy as jest.Mock;
const save = ProductRepository.save as jest.Mock;

describe("updateProductService", () => {
  beforeEach(() => {
    findOneBy.mockReset();
    save.mockReset();
  });

  it("updates stock and price of an existing product", async () => {
    findOneBy.mockResolvedValue({ id: 1, stock: 10, price: 100 });
    save.mockImplementation(async (p) => p);

    const result = await updateProductService(1, { stock: 25, price: 120 });

    expect(result.stock).toBe(25);
    expect(result.price).toBe(120);
    expect(save).toHaveBeenCalled();
  });

  it("only updates the provided fields", async () => {
    findOneBy.mockResolvedValue({ id: 1, stock: 10, price: 100 });
    save.mockImplementation(async (p) => p);

    const result = await updateProductService(1, { stock: 5 });

    expect(result.stock).toBe(5);
    expect(result.price).toBe(100);
  });

  it("throws a 404 ClientError when the product is missing", async () => {
    findOneBy.mockResolvedValue(null);
    await expect(updateProductService(99, { stock: 1 })).rejects.toMatchObject({
      statusCode: 404,
    });
    await expect(updateProductService(99, { stock: 1 })).rejects.toBeInstanceOf(
      ClientError
    );
  });
});
