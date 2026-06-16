import {
  createProductService,
  deleteProductService,
  getProductsService,
  updateProductService,
} from "./products.service";
import { ClientError } from "../utils/errors";
import { ProductRepository } from "../repositories/product.repository";
import { CategoryRepository } from "../repositories/category.repository";

jest.mock("../repositories/product.repository", () => ({
  ProductRepository: {
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  },
}));

jest.mock("../repositories/category.repository", () => ({
  CategoryRepository: {
    findOneBy: jest.fn(),
  },
}));

const findOneBy = ProductRepository.findOneBy as jest.Mock;
const save = ProductRepository.save as jest.Mock;
const create = ProductRepository.create as jest.Mock;
const remove = ProductRepository.remove as jest.Mock;
const createQueryBuilder = ProductRepository.createQueryBuilder as jest.Mock;
const categoryFindOneBy = CategoryRepository.findOneBy as jest.Mock;

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

  it("updates the descriptive fields too (name, description, image, category)", async () => {
    findOneBy.mockResolvedValue({
      id: 1,
      name: "Old",
      description: "Old desc",
      image: "old.jpg",
      categoryId: 1,
      stock: 10,
      price: 100,
    });
    save.mockImplementation(async (p) => p);

    const result = await updateProductService(1, {
      name: "New",
      description: "New desc",
      image: "new.jpg",
      categoryId: 3,
    });

    expect(result.name).toBe("New");
    expect(result.description).toBe("New desc");
    expect(result.image).toBe("new.jpg");
    expect(result.categoryId).toBe(3);
    // untouched fields stay
    expect(result.stock).toBe(10);
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

describe("createProductService", () => {
  const validData = {
    name: "Fender Stratocaster",
    description: "Classic electric guitar",
    price: 1200,
    stock: 10,
    image: "https://example.com/strat.jpg",
    categoryId: 2,
  };

  beforeEach(() => {
    categoryFindOneBy.mockReset();
    create.mockReset();
    save.mockReset();
  });

  it("creates and saves a product when the category exists", async () => {
    categoryFindOneBy.mockResolvedValue({ id: 2, name: "Guitars" });
    create.mockImplementation((data) => ({ id: 1, ...data }));
    save.mockImplementation(async (p) => p);

    const result = await createProductService(validData);

    expect(categoryFindOneBy).toHaveBeenCalledWith({ id: 2 });
    expect(create).toHaveBeenCalledWith(validData);
    expect(save).toHaveBeenCalled();
    expect(result).toMatchObject({ id: 1, name: "Fender Stratocaster" });
  });

  it("throws a 404 ClientError when the category does not exist", async () => {
    categoryFindOneBy.mockResolvedValue(null);

    await expect(createProductService(validData)).rejects.toMatchObject({
      statusCode: 404,
    });
    await expect(createProductService(validData)).rejects.toBeInstanceOf(
      ClientError
    );
    expect(create).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
});

describe("deleteProductService", () => {
  beforeEach(() => {
    findOneBy.mockReset();
    remove.mockReset();
  });

  it("removes an existing product", async () => {
    const product = { id: 1, name: "Fender Stratocaster" };
    findOneBy.mockResolvedValue(product);
    remove.mockResolvedValue(product);

    await deleteProductService(1);

    expect(findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(remove).toHaveBeenCalledWith(product);
  });

  it("throws a 404 ClientError when the product is missing", async () => {
    findOneBy.mockResolvedValue(null);

    await expect(deleteProductService(99)).rejects.toMatchObject({
      statusCode: 404,
    });
    await expect(deleteProductService(99)).rejects.toBeInstanceOf(ClientError);
    expect(remove).not.toHaveBeenCalled();
  });
});
