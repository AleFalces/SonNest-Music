import { bulkUpsertProductsService } from "./bulkImport.service";
import { ProductRepository } from "../repositories/product.repository";
import { CategoryRepository } from "../repositories/category.repository";

jest.mock("../repositories/product.repository", () => ({
  ProductRepository: {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock("../repositories/category.repository", () => ({
  CategoryRepository: {
    findOneBy: jest.fn(),
  },
}));

const findOneBy = ProductRepository.findOneBy as jest.Mock;
const create = ProductRepository.create as jest.Mock;
const save = ProductRepository.save as jest.Mock;
const categoryFindOneBy = CategoryRepository.findOneBy as jest.Mock;

describe("bulkUpsertProductsService", () => {
  beforeEach(() => {
    findOneBy.mockReset();
    create.mockReset();
    save.mockReset();
    categoryFindOneBy.mockReset();
    save.mockImplementation(async (p) => p);
    create.mockImplementation((data) => data);
  });

  it("updates an existing sku and adds to its stock in 'sum' mode", async () => {
    findOneBy.mockResolvedValue({ id: 1, sku: "SN-STR-001", stock: 10 });

    const result = await bulkUpsertProductsService({
      mode: "sum",
      items: [{ sku: "SN-STR-001", stock: 5 }],
    });

    expect(findOneBy).toHaveBeenCalledWith({ sku: "SN-STR-001" });
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ sku: "SN-STR-001", stock: 15 })
    );
    expect(result).toMatchObject({ updated: 1, created: 0, failed: 0 });
    expect(result.results[0]).toMatchObject({
      sku: "SN-STR-001",
      status: "updated",
    });
  });

  it("overwrites the stock of an existing sku in 'set' mode", async () => {
    findOneBy.mockResolvedValue({ id: 1, sku: "SN-STR-001", stock: 10 });

    const result = await bulkUpsertProductsService({
      mode: "set",
      items: [{ sku: "SN-STR-001", stock: 5 }],
    });

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ sku: "SN-STR-001", stock: 5 })
    );
    expect(result).toMatchObject({ updated: 1, created: 0, failed: 0 });
  });

  it("creates a new product when the sku does not exist", async () => {
    findOneBy.mockResolvedValue(null);
    categoryFindOneBy.mockResolvedValue({ id: 2, name: "Guitars" });

    const newLine = {
      sku: "SN-NEW-001",
      stock: 7,
      name: "New Guitar",
      description: "Fresh stock",
      price: 999,
      image: "https://example.com/new.jpg",
      categoryId: 2,
    };

    const result = await bulkUpsertProductsService({
      mode: "sum",
      items: [newLine],
    });

    expect(categoryFindOneBy).toHaveBeenCalledWith({ id: 2 });
    expect(create).toHaveBeenCalledWith(expect.objectContaining(newLine));
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ sku: "SN-NEW-001" }));
    expect(result).toMatchObject({ created: 1, updated: 0, failed: 0 });
    expect(result.results[0]).toMatchObject({
      sku: "SN-NEW-001",
      status: "created",
    });
  });

  it("fails a new sku whose categoryId does not exist, without aborting", async () => {
    findOneBy.mockResolvedValue(null);
    categoryFindOneBy.mockResolvedValue(null);

    const result = await bulkUpsertProductsService({
      mode: "sum",
      items: [
        {
          sku: "SN-BAD-CAT",
          stock: 3,
          name: "Orphan",
          description: "No category",
          price: 100,
          image: "https://example.com/x.jpg",
          categoryId: 999,
        },
      ],
    });

    expect(create).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
    expect(result).toMatchObject({ created: 0, updated: 0, failed: 1 });
    expect(result.results[0]).toMatchObject({
      sku: "SN-BAD-CAT",
      status: "failed",
    });
    expect(result.results[0].reason).toBeDefined();
  });

  it("fails a new sku that is missing required create fields, without aborting", async () => {
    findOneBy.mockResolvedValue(null);

    const result = await bulkUpsertProductsService({
      mode: "sum",
      items: [{ sku: "SN-INCOMPLETE", stock: 4 }],
    });

    expect(create).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
    expect(result).toMatchObject({ created: 0, updated: 0, failed: 1 });
    expect(result.results[0]).toMatchObject({
      sku: "SN-INCOMPLETE",
      status: "failed",
    });
    // must fail for the missing fields, not incidentally via the category lookup
    expect(result.results[0].reason).toMatch(/required|missing/i);
  });
});
