import { createProductSchema, updateProductSchema } from "./product.schema";

const validProduct = {
  name: "Fender Stratocaster",
  description: "Classic electric guitar",
  price: 1200,
  stock: 10,
  image: "https://example.com/strat.jpg",
  categoryId: 2,
};

describe("createProductSchema", () => {
  it("accepts a fully valid product", () => {
    const result = createProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("rejects a product missing the name", () => {
    const { name, ...incomplete } = validProduct;
    const result = createProductSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });
});

describe("updateProductSchema", () => {
  it("accepts a partial update with a single field", () => {
    const result = updateProductSchema.safeParse({ price: 999 });
    expect(result.success).toBe(true);
  });
});
