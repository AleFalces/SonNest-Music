import { getCategoriesService } from "./category.service";
import { CategoryRepository } from "../repositories/category.repository";

jest.mock("../repositories/category.repository", () => ({
  CategoryRepository: {
    find: jest.fn(),
  },
}));

const find = CategoryRepository.find as jest.Mock;

describe("getCategoriesService", () => {
  beforeEach(() => find.mockReset());

  it("returns the categories from the repository", async () => {
    const rows = [{ id: 1, name: "Guitars" }, { id: 2, name: "Basses" }];
    find.mockResolvedValue(rows);

    const result = await getCategoriesService();

    expect(result).toBe(rows);
  });

  it("asks the repository for categories ordered by id ascending", async () => {
    find.mockResolvedValue([]);

    await getCategoriesService();

    expect(find).toHaveBeenCalledWith({ order: { id: "ASC" } });
  });
});
