import type { Config } from "jest";
import nextJest from "next/jest.js";

// next/jest が TypeScript / JSX の変換(SWC)と "@/" エイリアスの解決を設定する。
const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/app/**/layout.tsx"],
};

export default createJestConfig(config);
