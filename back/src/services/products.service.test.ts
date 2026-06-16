import { getProductsService, updateProductService } from "./products.service";
import { ClientError } from "../utils/errors";
import { ProductRepository } from "../repositories/product.repository";

jest.mock("../repositories/product.repository", () => ({
  ProductRepository: {
    findOneBy: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  },
}));

const findOneBy = ProductRepository.findOneBy as jest.Mock;
const save = ProductRepository.save as jest.Mock;
const createQueryBuilder = ProductRepository.createQueryBuilder as jest.Mock;

describe("getProductsService (pagination)", () => {
  const makeQb = (rows: any[], total: number) => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([rows, total]),
  });

  beforeEach(() => createQueryBuilder.mockReset());

  it("returns a paginated envelope with computed totalPages", async () => {
    createQueryBuilder.mockReturnValue(makeQb([{ id: 1 }], 21));
    const res = await getProductsService({ page: 1, limit: 9 });
    expect(res.total).toBe(21);
    expect(res.totalPages).toBe(3);
    expect(res.page).toBe(1);
    expect(res.limit).toBe(9);
  });

  it("offsets by (page - 1) * limit", async () => {
    const qb = makeQb([], 0);
    createQueryBuilder.mockReturnValue(qb);
    await getProductsService({ page: 3, limit: 9 });
    expect(qb.skip).toHaveBeenCalledWith(18);
    expect(qb.take).toHaveBeenCalledWith(9);
  });

  it("adds search and category filters when provided", async () => {
    const qb = makeQb([], 0);
    createQueryBuilder.mockReturnValue(qb);
    await getProductsService({ search: "fender", category: "Basses" });
    expect(qb.andWhere).toHaveBeenCalledTimes(2);
  });

  it("does not filter when category is 'all'", async () => {
    const qb = makeQb([], 0);
    createQueryBuilder.mockReturnValue(qb);
    await getProductsService({ category: "all" });
    expect(qb.andWhere).not.toHaveBeenCalled();
  });
});

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
