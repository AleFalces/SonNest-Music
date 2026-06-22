import { Product } from "../entities/Product";

// One-off migration: rehost each product's catalog image on Cloudinary so the
// delivery URL can be transformed (c_pad framing + f_auto/q_auto). Dependencies
// are injected so the orchestration is unit-testable without a DB or network.
export interface MigrationDeps {
  fetchProducts: () => Promise<Product[]>;
  uploadRemoteImage: (url: string) => Promise<string>; // returns the secure_url
  saveProduct: (product: Product) => Promise<unknown>;
  log?: (message: string) => void;
}

export interface MigrationResult {
  migrated: number;
  skipped: number;
  failed: number;
}

export interface MigrationOptions {
  dryRun?: boolean;
}

const isCloudinaryUrl = (url: string): boolean =>
  url.includes("res.cloudinary.com");

export const migrateProductImages = async (
  deps: MigrationDeps,
  options: MigrationOptions = {}
): Promise<MigrationResult> => {
  const result: MigrationResult = { migrated: 0, skipped: 0, failed: 0 };

  for (const product of await deps.fetchProducts()) {
    if (isCloudinaryUrl(product.image)) {
      result.skipped++;
      continue;
    }

    if (options.dryRun) {
      // Preview only: report what would migrate without touching Cloudinary or
      // the DB. Broken URLs surface on the real run.
      result.migrated++;
      deps.log?.(`Would migrate product ${product.id} (${product.image})`);
      continue;
    }

    try {
      const secureUrl = await deps.uploadRemoteImage(product.image);
      product.image = secureUrl;
      await deps.saveProduct(product);
      result.migrated++;
    } catch (error) {
      // A broken/unreachable source image must not abort the whole run; log it
      // and fix those few by hand via the admin panel. Cloudinary rejects with a
      // plain object, so reach for its message before falling back to JSON.
      const reason =
        (error as { message?: string })?.message ?? JSON.stringify(error);
      result.failed++;
      deps.log?.(`Failed to migrate product ${product.id} (${product.image}): ${reason}`);
    }
  }

  return result;
};
