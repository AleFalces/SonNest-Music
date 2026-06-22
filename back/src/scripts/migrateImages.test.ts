import { migrateProductImages } from "./migrateImages";
import { Product } from "../entities/Product";

const makeProduct = (image: string): Product =>
  ({ id: 1, name: "Bass", image } as Product);

describe("migrateProductImages", () => {
  it("skips products already hosted on Cloudinary (no upload, no save)", async () => {
    const product = makeProduct(
      "https://res.cloudinary.com/demo/image/upload/v1/soundnest/products/bass.webp"
    );
    const uploadRemoteImage = jest.fn();
    const saveProduct = jest.fn();

    const result = await migrateProductImages({
      fetchProducts: async () => [product],
      uploadRemoteImage,
      saveProduct,
    });

    expect(uploadRemoteImage).not.toHaveBeenCalled();
    expect(saveProduct).not.toHaveBeenCalled();
    expect(result).toEqual({ migrated: 0, skipped: 1, failed: 0 });
  });

  it("uploads external images and saves the product with the secure_url", async () => {
    const product = makeProduct("https://external.example.com/bass.jpg");
    const secureUrl =
      "https://res.cloudinary.com/demo/image/upload/v1/soundnest/products/bass.webp";
    const uploadRemoteImage = jest.fn().mockResolvedValue(secureUrl);
    const saveProduct = jest.fn();

    const result = await migrateProductImages({
      fetchProducts: async () => [product],
      uploadRemoteImage,
      saveProduct,
    });

    expect(uploadRemoteImage).toHaveBeenCalledWith(
      "https://external.example.com/bass.jpg"
    );
    expect(product.image).toBe(secureUrl);
    expect(saveProduct).toHaveBeenCalledWith(product);
    expect(result).toEqual({ migrated: 1, skipped: 0, failed: 0 });
  });

  it("logs and skips a failed upload, then keeps going with the rest", async () => {
    const broken = makeProduct("https://broken.example.com/dead.jpg");
    const ok = { ...makeProduct("https://external.example.com/ok.jpg"), id: 2 };
    const secureUrl =
      "https://res.cloudinary.com/demo/image/upload/v1/soundnest/products/ok.webp";
    const uploadRemoteImage = jest
      .fn()
      .mockRejectedValueOnce(new Error("Invalid image"))
      .mockResolvedValueOnce(secureUrl);
    const saveProduct = jest.fn();
    const log = jest.fn();

    const result = await migrateProductImages({
      fetchProducts: async () => [broken, ok],
      uploadRemoteImage,
      saveProduct,
      log,
    });

    expect(saveProduct).toHaveBeenCalledTimes(1);
    expect(saveProduct).toHaveBeenCalledWith(ok);
    expect(log).toHaveBeenCalled();
    expect(result).toEqual({ migrated: 1, skipped: 0, failed: 1 });
  });

  it("dry-run reports what would migrate without uploading or saving", async () => {
    const product = makeProduct("https://external.example.com/bass.jpg");
    const uploadRemoteImage = jest.fn();
    const saveProduct = jest.fn();

    const result = await migrateProductImages(
      {
        fetchProducts: async () => [product],
        uploadRemoteImage,
        saveProduct,
      },
      { dryRun: true }
    );

    expect(uploadRemoteImage).not.toHaveBeenCalled();
    expect(saveProduct).not.toHaveBeenCalled();
    expect(product.image).toBe("https://external.example.com/bass.jpg");
    expect(result).toEqual({ migrated: 1, skipped: 0, failed: 0 });
  });
});
