import "reflect-metadata";
import { AppDataSource } from "../config/dataSource";
import { ProductRepository } from "../repositories/product.repository";
import { cloudinary } from "../config/cloudinary";
import { migrateProductImages } from "./migrateImages";

// Runner glue for the one-off image migration. Wires the real DB + Cloudinary
// dependencies into the tested orchestration. Run with `ts-node` against the
// target database; pass `--dry-run` to preview without writing anything:
//   npx ts-node src/scripts/migrateImages.run.ts --dry-run
const run = async () => {
  const dryRun = process.argv.includes("--dry-run");

  await AppDataSource.initialize();
  try {
    const result = await migrateProductImages(
      {
        fetchProducts: () => ProductRepository.find(),
        uploadRemoteImage: async (url) => {
          const { secure_url } = await cloudinary.uploader.upload(url, {
            folder: "soundnest/products",
          });
          return secure_url;
        },
        saveProduct: (product) => ProductRepository.save(product),
        log: console.log,
      },
      { dryRun }
    );
    console.log(
      `\n${dryRun ? "[dry-run] " : ""}Done — migrated: ${result.migrated}, ` +
        `skipped: ${result.skipped}, failed: ${result.failed}`
    );
  } finally {
    await AppDataSource.destroy();
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
