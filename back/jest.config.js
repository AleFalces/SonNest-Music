/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // reflect-metadata must be loaded before any TypeORM entity is imported
  // (in the app this happens in src/index.ts, which tests don't go through).
  setupFiles: ["reflect-metadata"],
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/docs/**",
    "!src/config/**",
  ],
};
